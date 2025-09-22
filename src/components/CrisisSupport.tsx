import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Heart, 
  AlertTriangle,
  ExternalLink,
  User,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CrisisSupport = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleCrisisCall = (number: string, service: string) => {
    setIsConnecting(true);
    toast({
      title: `Connecting to ${service}`,
      description: "Hold on, we're connecting you to professional support.",
    });
    
    // In a real app, this would initiate the call
    setTimeout(() => {
      setIsConnecting(false);
      // window.location.href = `tel:${number}`;
    }, 1000);
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
            <div>
              <CardTitle className="text-destructive font-caslon">
                Immediate Crisis Support
              </CardTitle>
              <CardDescription>
                If you're having thoughts of suicide or self-harm, please reach out now
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => handleCrisisCall("911", "Emergency Services")}
              variant="destructive"
              size="lg"
              className="font-semibold"
              disabled={isConnecting}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 911 - Emergency
            </Button>
            <Button 
              onClick={() => handleCrisisCall("988", "988 Lifeline")}
              variant="destructive"
              size="lg"
              className="font-semibold"
              disabled={isConnecting}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 988 - Crisis Line
            </Button>
          </div>
        </CardContent>
      </Card>

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