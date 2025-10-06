import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Brain, 
  Moon, 
  Phone, 
  Play, 
  TrendingUp,
  BookOpen,
  Shield,
  Users,
  Zap,
  Calendar,
  MessageCircle,
  Home,
  Activity,
  User,
  Settings,
  Stethoscope,
  Component,
  AlertTriangle
} from "lucide-react";
import { WellnessCard } from "./WellnessCard";
import { CrisisSupport } from "./CrisisSupport";
import { MeditationSession } from "./MeditationSession";
import { MoodTracker } from "./MoodTracker";
import { HealthRings } from "./HealthRings";
import { FloatingDock } from "./FloatingDock";
import { useAuth } from "../contexts/AuthContext";
import { useAnalytics } from "../contexts/AnalyticsContext";
import { useMood } from "../contexts/MoodContext";
import { useMeditation } from "../contexts/MeditationContext";
import { useHabits } from "../contexts/HabitContext";
import { useWellnessInsights, useMoodTracker, useMeditationTracker, useHabitTracker } from "../hooks/wellness";
import { dateUtils } from "../utils";

interface DashboardProps {
  userName?: string;
  onCrisisSupport?: () => void;
  onNavigate?: (route: string) => void;
}

export const Dashboard = ({ onCrisisSupport, onNavigate }: Omit<DashboardProps, 'userName'>) => {
  const [activeTab, setActiveTab] = useState("all");
  const { state: authState } = useAuth();
  const { state: analyticsState } = useAnalytics();
  const { state: moodState } = useMood();
  const { state: meditationState } = useMeditation();
  const { state: habitState } = useHabits();
  
  // Wellness insights and tracking hooks
  const { insights, wellnessScore } = useWellnessInsights();
  const { moodStats } = useMoodTracker();
  const { meditationStats } = useMeditationTracker();
  const { habitStats } = useHabitTracker();

  const userName = authState.user?.profile.firstName || "Friend";
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  // Calculate user's journey day
  const userJourneyDay = authState.user?.metadata?.joinedAt 
    ? Math.floor((Date.now() - new Date(authState.user.metadata.joinedAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  // Determine if user needs attention based on data
  const needsAttention = useMemo(() => {
    const recentMoodEntries = moodState.entries?.slice(0, 3) || [];
    console.log("Recent Mood Entries:", recentMoodEntries);
    const averageRecentMood = recentMoodEntries.length > 0 
      ? recentMoodEntries.reduce((sum, entry) => sum + entry?.moodData?.primaryMood, 0) / recentMoodEntries.length
      : 5;
    
    const hasRecentMeditation = meditationState.sessions?.some(session => 
      new Date(session.metadata.startedAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || false;
    
    return averageRecentMood < 4 || !hasRecentMeditation;
  }, [moodState.entries, meditationState.sessions]);

  // Dynamic wellness action priorities based on user data
  const getDynamicPriority = (actionId: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if user has meditated today
    const hasMeditatedToday = meditationState.sessions?.some(session => {
      const sessionDate = new Date(session.metadata.startedAt);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    }) || false;
    
    // Check if user has logged mood today
    const hasLoggedMoodToday = moodState.entries?.some(entry => {
      const entryDate = new Date(entry.metadata.loggedAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    }) || false;

    switch (actionId) {
      case "crisis":
        return needsAttention && moodStats.averageMood < 3 ? 1 : 8;
      case "meditation":
        return !hasMeditatedToday ? 2 : 5;
      case "tracking":
        return !hasLoggedMoodToday ? 3 : 6;
      case "schedule":
        return habitStats.averageCompletionRate < 50 ? 4 : 7;
      default:
        return 5;
    }
  };

  const wellnessActions = [
    {
      id: "crisis",
      title: "Crisis Support",
      description: "Speak to a professional now",
      icon: Phone,
      color: "destructive" as const,
      category: "emergency",
      priority: 1,
      onClick: onCrisisSupport
    },
    {
      id: "meditation",
      title: "Mindfulness",
      description: "Guided meditation & breathing",
      icon: Brain,
      color: "primary" as const,
      category: "learning",
      priority: 2,
      onClick: () => onNavigate?.("/meditation")
    },
    {
      id: "tracking",
      title: "Mood Check",
      description: "Track your emotional wellbeing",
      icon: Heart,
      color: "success" as const,
      category: "assessments",
      priority: 3,
      Component: <MoodTracker onNavigateToDetailed={() => onNavigate?.("/mood")} />,
   
    },
    {
      id: "schedule",
      title: "My Schedule",
      description: "Appointments & habits",
      icon: Calendar,
      color: "accent" as const,
      category: "assessments",
      priority: 4,
      onClick: () => onNavigate?.("/schedule")
    },
    // {
    //   id: "physio",
    //   title: "Book Physio",
    //   description: "Schedule physical therapy",
    //   icon: Stethoscope,
    //   color: "primary" as const,
    //   category: "professional",
    //   priority: 4,
    // },
    // {
    //   id: "assessment",
    //   title: "Health Check",
    //   description: "Mental health screening",
    //   icon: Shield,
    //   color: "warning" as const,
    //   category: "assessment",
    //   priority: 5,
    // },
    // {
    //   id: "sleep",
    //   title: "Sleep Guide",
    //   description: "Better rest tonight",
    //   icon: Moon,
    //   color: "accent" as const,
    //   category: "learning",
    //   priority: 6,
    // },
    // {
    //   id: "therapy",
    //   title: "Find Therapist",
    //   description: "Connect with professionals",
    //   icon: Users,
    //   color: "primary" as const,
    //   category: "professional",
    //   priority: 7,
    // },
    // {
    //   id: "learning",
    //   title: "Learn & Grow",
    //   description: "Wellness resources",
    //   icon: BookOpen,
    //   color: "secondary" as const,
    //   category: "learning",
    //   priority: 8,
    // }
  ];

  // Apply dynamic priorities and sort actions
  const prioritizedActions = useMemo(() => {
    return wellnessActions
      .map(action => ({
        ...action,
        priority: getDynamicPriority(action.id)
      }))
      .sort((a, b) => a.priority - b.priority);
  }, [wellnessActions, getDynamicPriority]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 pb-24">
      {/* Header */}
      <header className="px-6 pt-8">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar with Crisis Support */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground tracking-wide">Cleared Mind</span>
            </div>
            {/* <Button 
              onClick={onCrisisSupport}
              variant="destructive" 
              size="sm"
              className="rounded-full px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Phone className="w-4 h-4 mr-2" />
              Crisis Support
            </Button> */}
          </div>

          {/* Welcome Section */}
          <div className="mb-10">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <h1 className="font-caslon text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                  {greeting}, {userName}
                  {/* <span className="inline-block ml-3 breathing-animation">💚</span> */}
                </h1>
                <div className="flex items-center space-x-4">
                  <p className="text-muted-foreground text-base md:text-lg">
                    Day {userJourneyDay} of your wellness journey
                  </p>
                  {/* {needsAttention && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Needs attention
                    </Badge>
                  )} */}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="bg-success/10 text-success border-success/20 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Day 7
              </Badge>
            </div>
          </div>

          {/* Health Rings with enhanced spacing */}
          <div className="mb-12">
            <HealthRings />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Navigation Tabs */}
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 bg-card/80 backdrop-blur-md rounded-2xl h-12 p-1 shadow-lg border border-border/20">
                <TabsTrigger 
                  value="all" 
                  className="font-medium text-sm rounded-xl transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="assessments" 
                  className="font-medium text-sm rounded-xl transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Check
                </TabsTrigger>
                <TabsTrigger 
                  value="learning" 
                  className="font-medium text-sm rounded-xl transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Learn
                </TabsTrigger>
                <TabsTrigger 
                  value="emergency" 
                  className="font-medium text-sm rounded-xl transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                >
                  Help
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content Grid with enhanced spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {prioritizedActions
              .filter((action) => {
                if (activeTab === "all") return true;
                return action.category === activeTab;
              })
              .map((action, index) => (
                <div 
                  key={action.id}
                  className={`animate-gentle-fade-in`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <WellnessCard
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    color={action.color}
                    category={action.category}
                    priority={action.priority}
                    component={action.Component}
                    onClick={action.onClick}
                  />
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};