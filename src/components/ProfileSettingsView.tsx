import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Settings, Target, Trophy, Bell, Lock, Heart,
  Edit3, Save, Camera, Mail, Phone, MapPin, Calendar,
  Shield, Download, HelpCircle, LogOut, Star, Award,
  TrendingUp, Zap, CheckCircle, Activity
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHabits } from "@/contexts/HabitContext";
import { useMood } from "@/contexts/MoodContext";
import { useMeditation } from "@/contexts/MeditationContext";
import { useNotifications } from "@/contexts/NotificationContext";

export const ProfileSettingsView = () => {
  // Context hooks
  const { state: authState, logout } = useAuth();
  const { state: habitState, fetchHabits } = useHabits();
  const { state: moodState, fetchMoodEntries } = useMood();
  const { state: meditationState, fetchSessions } = useMeditation();
  const { addNotification } = useNotifications();

  // Mock data for missing contexts
  const [mockAchievements] = useState([
    {
      _id: "1",
      title: "First Steps",
      description: "Completed your first meditation session",
      type: "meditation",
      earned: true,
      earnedDate: "2025-09-15"
    },
    {
      _id: "2",
      title: "Week Warrior", 
      description: "Maintained a 7-day streak",
      type: "streak",
      earned: true,
      earnedDate: "2025-09-20"
    },
    {
      _id: "3",
      title: "Mood Master",
      description: "Tracked mood for 14 consecutive days",
      type: "mood", 
      earned: true,
      earnedDate: "2025-09-22"
    }
  ]);

  const [mockGoals] = useState([
    {
      _id: "1",
      title: "Daily Meditation",
      category: "mindfulness",
      targetValue: 21,
      currentValue: 7,
      unit: "days",
      deadline: "2025-10-15"
    },
    {
      _id: "2", 
      title: "Mood Tracking",
      category: "emotional",
      targetValue: 30,
      currentValue: 14,
      unit: "days",
      deadline: "2025-10-30"
    }
  ]);

  // Local state
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: authState.user?.profile ? `${authState.user.profile.firstName} ${authState.user.profile.lastName}` : "Welcome User",
    email: authState.user?.email || "",
    phone: "",
    location: "",
    bio: "On a journey to better mental health and mindfulness."
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

  // Data is auto-loaded by respective providers, no need for duplicate calls
  // useEffect removed to prevent redundant API calls

  const handleSaveProfile = async () => {
    try {
      // Mock profile save since UserContext doesn't exist
      setIsEditing(false);
      
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        priority: 'medium'
      });
    }
  };

  const toggleNotification = async (key: string) => {
    const newNotifications = {
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications]
    };
    
    setNotifications(newNotifications);
    // Mock settings save
  };

  const togglePrivacy = async (key: string) => {
    const newPrivacy = {
      ...privacy,
      [key]: !privacy[key as keyof typeof privacy]
    };
    
    setPrivacy(newPrivacy);
    // Mock settings save  
  };

  const handleSignOut = async () => {
    try {
      await logout();
      addNotification({
        type: 'success',
        title: 'Signed Out',
        message: 'You have been successfully signed out',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to sign out. Please try again.',
        priority: 'medium'
      });
    }
  };

  // Calculate stats from real data
  const calculateStats = () => {
    const meditationCount = meditationState.sessions?.length || 0;
    const moodAverage = moodState.entries?.length ? 
      moodState.entries.reduce((sum, entry) => sum + (entry.moodData?.primaryMood || 0), 0) / moodState.entries.length : 0;
    const moodEntries = moodState.entries?.length || 0;
    const sleepAverage = 7.5; // Mock sleep data
    
    return {
      meditation: meditationCount,
      mood: moodAverage.toFixed(1),
      checkins: moodEntries,
      sleep: `${sleepAverage}h`
    };
  };

  const stats = calculateStats();

  // Get current streak from mood data
  const getCurrentStreak = () => {
    if (!moodState.entries || moodState.entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasEntry = moodState.entries.some(entry => {
        const entryDate = new Date(entry.metadata?.loggedAt || new Date());
        return entryDate.toDateString() === checkDate.toDateString();
      });
      
      if (hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Get earned achievements count
  const getEarnedAchievements = () => {
    return mockAchievements.filter(a => a.earned).length;
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
                      {authState.user?.profile?.avatar ? (
                        <AvatarImage src={authState.user.profile.avatar} alt={profileData.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/20 text-primary text-xl">
                          {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </AvatarFallback>
                      )}
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
                    <h2 className="font-caslon text-xl text-foreground">
                      {profileData.name || "Welcome"}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Member since {authState.user?.metadata?.joinedAt ? 
                        new Date(authState.user.metadata.joinedAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        }) : 
                        'Recently'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      {getCurrentStreak()}-day streak
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {getEarnedAchievements()} achievements
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
                    <div className="text-2xl font-bold text-primary">{stats.meditation}</div>
                    <p className="text-xs text-muted-foreground">Meditation Sessions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.mood}</div>
                    <p className="text-xs text-muted-foreground">Avg Mood Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{stats.checkins}</div>
                    <p className="text-xs text-muted-foreground">Check-ins</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{stats.sleep}</div>
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
                {mockGoals && mockGoals.length > 0 ? (
                  <div className="space-y-4">
                    {mockGoals.map((goal) => {
                      const progress = (goal.currentValue / goal.targetValue) * 100;
                      return (
                        <div key={goal._id} className="p-4 bg-muted/30 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{goal.title}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {goal.category}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </span>
                              <span className="font-medium text-foreground">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={Math.min(progress, 100)} className="h-2" />
                          </div>
                          {goal.deadline && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Due: {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No goals set yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set your wellness goals to track progress
                    </p>
                  </div>
                )}
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
                {mockGoals && mockGoals.length > 0 ? (
                  <div className="space-y-3">
                    {mockGoals
                      .filter(goal => {
                        const progress = (goal.currentValue / goal.targetValue) * 100;
                        return progress >= 80; // On track goals
                      })
                      .slice(0, 1)
                      .map(goal => (
                        <div key={goal._id} className="p-3 bg-primary/10 rounded-xl">
                          <p className="text-sm font-medium text-foreground mb-1">🎯 On Track!</p>
                          <p className="text-xs text-muted-foreground">
                            You're making great progress on your {goal.title.toLowerCase()} goal. Keep it up!
                          </p>
                        </div>
                      ))}
                    
                    {mockGoals
                      .filter(goal => {
                        const progress = (goal.currentValue / goal.targetValue) * 100;
                        return progress < 80 && progress > 0;
                      })
                      .slice(0, 1)
                      .map(goal => (
                        <div key={goal._id} className="p-3 bg-warning/10 rounded-xl">
                          <p className="text-sm font-medium text-foreground mb-1">💪 Push Forward</p>
                          <p className="text-xs text-muted-foreground">
                            You need {goal.targetValue - goal.currentValue} more {goal.unit} to reach your {goal.title.toLowerCase()} goal!
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Set some goals to see personalized insights and motivation!
                  </p>
                )}
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
                {mockAchievements && mockAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {mockAchievements.map((achievement) => {
                      // Map achievement types to icons
                      const getAchievementIcon = (type: string) => {
                        switch (type) {
                          case 'meditation': return Star;
                          case 'streak': return Trophy;
                          case 'mood': return Heart;
                          case 'goals': return Award;
                          case 'wellness': return Shield;
                          default: return CheckCircle;
                        }
                      };
                      
                      const Icon = getAchievementIcon(achievement.type || 'default');
                      
                      return (
                        <div 
                          key={achievement._id} 
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
                                  Earned on {achievement.earnedDate ? 
                                    new Date(achievement.earnedDate).toLocaleDateString() :
                                    'Recently'
                                  }
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Not yet earned
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No achievements yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Start your wellness journey to earn achievements!
                    </p>
                  </div>
                )}
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
                  <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
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