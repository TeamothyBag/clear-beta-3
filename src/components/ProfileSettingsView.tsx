import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Settings, Target, Trophy, Bell, Lock, Heart,
  Edit3, Save, Camera, Mail, Phone, MapPin, Calendar,
  Shield, Download, HelpCircle, LogOut, Star, Award,
  TrendingUp, Zap, CheckCircle, Activity
} from "lucide-react";

const wellnessGoals = [
  {
    id: 1,
    title: "Daily Meditation",
    target: 21,
    current: 7,
    unit: "days",
    category: "mindfulness",
    color: "primary"
  },
  {
    id: 2,
    title: "Exercise Weekly",
    target: 3,
    current: 2,
    unit: "sessions",
    category: "physical",
    color: "success"
  },
  {
    id: 3,
    title: "Mood Tracking",
    target: 30,
    current: 14,
    unit: "days",
    category: "emotional",
    color: "accent"
  },
  {
    id: 4,
    title: "Sleep Quality",
    target: 8,
    current: 6.5,
    unit: "hours",
    category: "rest",
    color: "secondary"
  }
];

const achievements = [
  {
    id: 1,
    title: "First Steps",
    description: "Completed your first meditation session",
    icon: Star,
    earned: true,
    date: "2025-09-15"
  },
  {
    id: 2,
    title: "Week Warrior",
    description: "Maintained a 7-day streak",
    icon: Trophy,
    earned: true,
    date: "2025-09-20"
  },
  {
    id: 3,
    title: "Mood Master",
    description: "Tracked mood for 14 consecutive days",
    icon: Heart,
    earned: true,
    date: "2025-09-22"
  },
  {
    id: 4,
    title: "Mindful Month",
    description: "Complete 30 meditation sessions",
    icon: Award,
    earned: false,
    progress: 7
  },
  {
    id: 5,
    title: "Wellness Warrior",
    description: "Reach all wellness goals for a month",
    icon: Shield,
    earned: false,
    progress: 0
  }
];

export const ProfileSettingsView = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "September 2025",
    bio: "On a journey to better mental health and mindfulness. Finding peace one breath at a time."
  });

  const [notifications, setNotifications] = useState({
    meditation: true,
    mood: true,
    appointments: true,
    achievements: false,
    updates: false
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    marketing: false
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Save profile data
    console.log("Saving profile:", profileData);
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const togglePrivacy = (key: string) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-caslon text-2xl text-foreground">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your wellness journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Header */}
            <Card className="therapeutic-card">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="bg-primary/20 text-primary text-xl">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-center">
                    <h2 className="font-caslon text-xl text-foreground">{profileData.name}</h2>
                    <p className="text-muted-foreground text-sm">Member since {profileData.joinDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      7-day streak
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      3 achievements
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="therapeutic-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Personal Info
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Full name"
                    />
                    <Input 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="Email address"
                      type="email"
                    />
                    <Input 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                    <Input 
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      placeholder="Location"
                    />
                    <Textarea 
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us about your wellness journey..."
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleSaveProfile} className="w-full calming-button">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{profileData.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{profileData.location}</span>
                    </div>
                    <div className="flex items-start space-x-3 text-sm">
                      <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-foreground">{profileData.bio}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <p className="text-xs text-muted-foreground">Meditation Sessions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">8.2</div>
                    <p className="text-xs text-muted-foreground">Avg Mood Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">18</div>
                    <p className="text-xs text-muted-foreground">Check-ins</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">7.5h</div>
                    <p className="text-xs text-muted-foreground">Avg Sleep</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-primary" />
                  Wellness Goals
                </CardTitle>
                <CardDescription>Track your progress towards better health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wellnessGoals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{goal.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {goal.category}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {goal.current} / {goal.target} {goal.unit}
                            </span>
                            <span className="font-medium text-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Goal Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-1">🎯 On Track!</p>
                    <p className="text-xs text-muted-foreground">
                      You're making great progress on your meditation goal. Keep it up!
                    </p>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-1">💪 Push Forward</p>
                    <p className="text-xs text-muted-foreground">
                      One more exercise session this week to reach your goal!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-primary" />
                  Achievements
                </CardTitle>
                <CardDescription>Celebrate your wellness milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    return (
                      <div 
                        key={achievement.id} 
                        className={`p-4 rounded-xl border transition-all ${
                          achievement.earned 
                            ? 'bg-primary/10 border-primary/20' 
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            achievement.earned ? 'bg-primary/20' : 'bg-muted/50'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              achievement.earned ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground">{achievement.title}</h4>
                              {achievement.earned && (
                                <CheckCircle className="w-4 h-4 text-success" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {achievement.earned ? (
                              <p className="text-xs text-success">
                                Earned on {achievement.date}
                              </p>
                            ) : (
                              achievement.progress !== undefined && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="text-foreground">{achievement.progress}/30</span>
                                  </div>
                                  <Progress value={(achievement.progress / 30) * 100} className="h-1" />
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Notifications */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {key === 'meditation' ? 'Meditation Reminders' :
                           key === 'mood' ? 'Mood Check-ins' :
                           key === 'appointments' ? 'Appointments' :
                           key === 'achievements' ? 'Achievements' : 'App Updates'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'meditation' ? 'Daily meditation session reminders' :
                           key === 'mood' ? 'Gentle prompts to log your mood' :
                           key === 'appointments' ? 'Upcoming appointment alerts' :
                           key === 'achievements' ? 'Celebrate your milestones' : 'News and feature updates'}
                        </p>
                      </div>
                      <Switch 
                        checked={value} 
                        onCheckedChange={() => toggleNotification(key)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-primary" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {key === 'dataSharing' ? 'Anonymous Data Sharing' :
                           key === 'analytics' ? 'Usage Analytics' : 'Marketing Communications'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'dataSharing' ? 'Help improve the app with anonymous usage data' :
                           key === 'analytics' ? 'Allow app usage analytics for improvement' : 'Receive wellness tips and updates'}
                        </p>
                      </div>
                      <Switch 
                        checked={value} 
                        onCheckedChange={() => togglePrivacy(key)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* App Actions */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  App Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-3" />
                    Export My Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="w-4 h-4 mr-3" />
                    Help & Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-3" />
                    Privacy Policy
                  </Button>
                  <Button variant="destructive" className="w-full justify-start">
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};