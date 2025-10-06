import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Heart, 
  AlertTriangle,
  ExternalLink,
  User,
  Shield,
  Plus,
  Edit,
  Trash2,
  Navigation,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/services/api";
import { EmergencyContact } from "@/types/api";

interface CrisisReport {
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  triggerWords?: string[];
}

export const CrisisSupport = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isCrisisReportOpen, setIsCrisisReportOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  
  // Form states
  const [contactForm, setContactForm] = useState<EmergencyContact>({
    name: '',
    phoneNumber: '',
    relationship: '',
    isPrimary: false
  });
  
  const [crisisForm, setCrisisForm] = useState<CrisisReport>({
    severity: 'medium',
    details: '',
    triggerWords: []
  });

  const { toast } = useToast();
  const { state } = useAuth();
  const { user } = state;

  // Load emergency contacts on component mount
  useEffect(() => {
    loadEmergencyContacts();
    getCurrentLocation();
  }, []);

  // TODO: Add Socket.IO listeners for real-time crisis alerts when socket context is available

  const loadEmergencyContacts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getEmergencyContacts();
      setEmergencyContacts(response.data || []);
    } catch (error) {
      toast({
        title: "Error Loading Contacts",
        description: "Could not load your emergency contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setLocationError('');
        },
        (error) => {
          setLocationError('Location access denied. Crisis reports will not include location.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const handleCrisisCall = async (number: string, service: string) => {
    setIsConnecting(true);
    
    try {
      // Log the crisis intervention using the correct API method
      await apiService.reportCrisisAlert({
        severity: 'high',
        details: `Emergency call initiated to ${service}`,
        location: location ? {
          type: 'Point',
          coordinates: [location.coords.longitude, location.coords.latitude]
        } : undefined
      });

      toast({
        title: `Connecting to ${service}`,
        description: "Crisis alert has been logged. Hold on, we're connecting you to professional support.",
      });
      
      // Initiate the actual call
      setTimeout(() => {
        setIsConnecting(false);
        window.location.href = `tel:${number}`;
      }, 1000);
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: "Error",
        description: "Could not log the emergency call. Please try calling directly.",
        variant: "destructive",
      });
      // Still allow the call to proceed
      window.location.href = `tel:${number}`;
    }
  };

  const handleSaveContact = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll use the existing updateEmergencyContacts method
      const updatedContacts = editingContact 
        ? emergencyContacts.map(c => c.name === editingContact.name ? contactForm : c)
        : [...emergencyContacts, contactForm];
      
      await apiService.updateEmergencyContacts(updatedContacts);
      
      toast({
        title: editingContact ? "Contact Updated" : "Contact Added",
        description: "Emergency contact has been saved successfully.",
      });
      
      // Reload contacts and close dialog
      await loadEmergencyContacts();
      setIsContactDialogOpen(false);
      setEditingContact(null);
      setContactForm({ name: '', phoneNumber: '', relationship: '', isPrimary: false });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save emergency contact. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (contactName: string) => {
    try {
      const updatedContacts = emergencyContacts.filter(c => c.name !== contactName);
      await apiService.updateEmergencyContacts(updatedContacts);
      toast({
        title: "Contact Deleted",
        description: "Emergency contact has been removed.",
      });
      await loadEmergencyContacts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete emergency contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCrisisReport = async () => {
    try {
      setIsLoading(true);
      
      await apiService.reportCrisisAlert({
        severity: crisisForm.severity,
        details: crisisForm.details,
        location: location ? {
          type: 'Point',
          coordinates: [location.coords.longitude, location.coords.latitude]
        } : undefined
      });

      toast({
        title: "Crisis Report Submitted",
        description: "Your report has been recorded. Support resources are available below.",
      });

      setIsCrisisReportOpen(false);
      setCrisisForm({ severity: 'medium', details: '', triggerWords: [] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not submit crisis report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({ ...contact });
    setIsContactDialogOpen(true);
  };

  const openNewContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', phoneNumber: '', relationship: '', isPrimary: false });
    setIsContactDialogOpen(true);
  };

  const crisisResources = [
    {
      name: "988 Suicide & Crisis Lifeline",
      number: "988",
      description: "Free and confidential emotional support 24/7",
      availability: "24/7",
      type: "phone",
      priority: 1
    },
    {
      name: "Crisis Text Line",
      number: "741741",
      description: "Text HOME for immediate crisis support",
      availability: "24/7",
      type: "text",
      priority: 2
    },
    {
      name: "National Alliance on Mental Illness",
      number: "1-800-950-NAMI",
      description: "Information, support, and referrals",
      availability: "Mon-Fri 10am-10pm ET",
      type: "phone",
      priority: 3
    },
    {
      name: "SAMHSA National Helpline",
      number: "1-800-662-4357",
      description: "Treatment referral and information service",
      availability: "24/7",
      type: "phone",
      priority: 4
    }
  ];

  const emergencySteps = [
    "If you're in immediate danger, call 911",
    "Stay with someone you trust if possible",
    "Remove any means of self-harm from your area",
    "Use the resources below for immediate support",
    "Follow up with your healthcare provider"
  ];

  return (
    <div className="space-y-6">
      {/* Emergency Alert */}
      <Card className="border-destructive bg-destructive/5">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-destructive/20 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-destructive font-caslon">
                Immediate Crisis Support
              </CardTitle>
              <CardDescription>
                If you're having thoughts of suicide or self-harm, please reach out now
              </CardDescription>
            </div>
            {location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Navigation className="w-3 h-3 mr-1" />
                Location enabled
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Button 
              onClick={() => handleCrisisCall("911", "Emergency Services")}
              variant="destructive"
              size="lg"
              className="font-semibold"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              Call 911 - Emergency
            </Button>
            <Button 
              onClick={() => handleCrisisCall("988", "988 Lifeline")}
              variant="destructive"
              size="lg"
              className="font-semibold"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Phone className="w-4 h-4 mr-2" />
              )}
              Call 988 - Crisis Line
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Dialog open={isCrisisReportOpen} onOpenChange={setIsCrisisReportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Crisis Situation
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crisis Report</DialogTitle>
                  <DialogDescription>
                    This will help us understand your situation and provide appropriate support.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity Level</Label>
                    <select
                      id="severity"
                      value={crisisForm.severity}
                      onChange={(e) => setCrisisForm(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full p-2 border rounded-md bg-background"
                      aria-label="Crisis severity level"
                    >
                      <option value="low">Low - General distress</option>
                      <option value="medium">Medium - Significant concern</option>
                      <option value="high">High - Urgent attention needed</option>
                      <option value="critical">Critical - Immediate danger</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your current situation..."
                      value={crisisForm.details}
                      onChange={(e) => setCrisisForm(prev => ({ ...prev, details: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  {locationError && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      {locationError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCrisisReport}
                      disabled={isLoading || !crisisForm.details.trim()}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Submit Report
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCrisisReportOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="justify-start" onClick={getCurrentLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              {location ? 'Update Location' : 'Enable Location'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts Management */}
      {user && (
        <Card className="therapeutic-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center font-caslon">
                  <User className="w-5 h-5 mr-3 text-primary" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription>
                  People who will be notified in case of emergency
                </CardDescription>
              </div>
              <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewContact} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                    </DialogTitle>
                    <DialogDescription>
                      This person will be notified if you report a crisis or emergency.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Name</Label>
                      <Input
                        id="contactName"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Contact name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contactForm.phoneNumber}
                        onChange={(e) => setContactForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactRelationship">Relationship</Label>
                      <Input
                        id="contactRelationship"
                        value={contactForm.relationship}
                        onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                        placeholder="Friend, Family member, Partner, etc."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrimary"
                        checked={contactForm.isPrimary}
                        onChange={(e) => setContactForm(prev => ({ ...prev, isPrimary: e.target.checked }))}
                        className="rounded"
                        aria-labelledby="isPrimary-label"
                        title="Mark as primary emergency contact"
                      />
                      <Label htmlFor="isPrimary" id="isPrimary-label">Primary emergency contact</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveContact}
                        disabled={isLoading || !contactForm.name.trim() || !contactForm.phoneNumber.trim()}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        {editingContact ? 'Update Contact' : 'Add Contact'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsContactDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : emergencyContacts.length > 0 ? (
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={`${contact.name}-${index}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.phoneNumber}</p>
                      <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditContact(contact)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No emergency contacts added yet.</p>
                <p className="text-sm">Add contacts who should be notified in emergencies.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Crisis Resources */}
      <div className="space-y-4">
        <h3 className="font-caslon text-xl text-foreground">Crisis Support Resources</h3>
        {crisisResources.map((resource, index) => (
          <Card key={index} className="therapeutic-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{resource.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{resource.availability}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.type === "phone" ? "Call" : "Text"}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => handleCrisisCall(resource.number, resource.name)}
                  variant={resource.priority <= 2 ? "destructive" : "outline"}
                  size="sm"
                  disabled={isConnecting}
                >
                  {resource.type === "phone" ? (
                    <Phone className="w-4 h-4 mr-1" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-1" />
                  )}
                  {resource.number}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Safety Steps */}
      <Card className="therapeutic-card">
        <CardHeader>
          <CardTitle className="flex items-center font-caslon">
            <Shield className="w-5 h-5 mr-3 text-primary" />
            Immediate Safety Steps
          </CardTitle>
          <CardDescription>
            If you're in crisis, these steps can help keep you safe right now
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {emergencySteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <p className="text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Professional Support */}
      <Card className="therapeutic-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center font-caslon">
            <User className="w-5 h-5 mr-3 text-primary" />
            Find Professional Support
          </CardTitle>
          <CardDescription>
            Connect with licensed mental health professionals in your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Find Local Therapists
            </Button>
            <Button variant="outline" className="justify-start">
              <Heart className="w-4 h-4 mr-2" />
              Peer Support Groups
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            We can help you find qualified mental health professionals who accept your insurance 
            and specialize in your specific needs.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-muted bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong>Important:</strong> This app is not a replacement for professional medical care. 
            If you're experiencing a mental health emergency, please contact emergency services or 
            visit your nearest emergency room immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};