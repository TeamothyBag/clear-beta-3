import { useState } from "react";
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
  Stethoscope
} from "lucide-react";
import { WellnessCard } from "./WellnessCard";
import { CrisisSupport } from "./CrisisSupport";
import { MeditationSession } from "./MeditationSession";
import { MoodTracker } from "./MoodTracker";
import { HealthRings } from "./HealthRings";
import { FloatingDock } from "./FloatingDock";

interface DashboardProps {
  userName?: string;
}

export const Dashboard = ({ userName = "Friend" }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const wellnessActions = [
    {
      id: "crisis",
      title: "Crisis Support",
      description: "Speak to a professional now",
      icon: Phone,
      color: "destructive" as const,
      category: "emergency",
      priority: 1,
      component: <CrisisSupport />
    },
    {
      id: "meditation",
      title: "Meditation",
      description: "Find your inner peace",
      icon: Brain,
      color: "primary" as const,
      category: "mindfulness",
      priority: 2,
      component: <MeditationSession />
    },
    {
      id: "tracking",
      title: "Mood Check",
      description: "Quick mood tracking",
      icon: Heart,
      color: "success" as const,
      category: "tracking",
      priority: 3,
      component: <MoodTracker />
    },
    {
      id: "physio",
      title: "Book Physio",
      description: "Schedule physical therapy",
      icon: Stethoscope,
      color: "primary" as const,
      category: "professional",
      priority: 4,
    },
    {
      id: "assessment",
      title: "Health Check",
      description: "Mental health screening",
      icon: Shield,
      color: "warning" as const,
      category: "assessment",
      priority: 5,
    },
    {
      id: "sleep",
      title: "Sleep Guide",
      description: "Better rest tonight",
      icon: Moon,
      color: "accent" as const,
      category: "learning",
      priority: 6,
    },
    {
      id: "therapy",
      title: "Find Therapist",
      description: "Connect with professionals",
      icon: Users,
      color: "primary" as const,
      category: "professional",
      priority: 7,
    },
    {
      id: "learning",
      title: "Learn & Grow",
      description: "Wellness resources",
      icon: BookOpen,
      color: "secondary" as const,
      category: "learning",
      priority: 8,
    }
  ];

  const filteredActions = activeTab === "all" 
    ? wellnessActions 
    : wellnessActions.filter(action => {
        switch (activeTab) {
          case "assessments":
            return action.category === "assessment";
          case "learning":
            return action.category === "learning" || action.category === "mindfulness";
          case "emergency":
            return action.category === "emergency" || action.category === "professional";
          default:
            return true;
        }
      });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 pb-24">
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-caslon text-2xl md:text-3xl text-foreground mb-1">
                {greeting}, {userName} 
                <span className="inline-block ml-2 breathing-animation">💚</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                How are you feeling today?
              </p>
            </div>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Day 7
            </Badge>
          </div>

          {/* Health Rings */}
          <HealthRings />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm rounded-full h-10">
              <TabsTrigger value="all" className="font-medium text-xs rounded-full">All</TabsTrigger>
              <TabsTrigger value="assessments" className="font-medium text-xs rounded-full">Check</TabsTrigger>
              <TabsTrigger value="learning" className="font-medium text-xs rounded-full">Learn</TabsTrigger>
              <TabsTrigger value="emergency" className="font-medium text-xs rounded-full">Help</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid grid-cols-2 gap-4">
                {filteredActions
                  .sort((a, b) => a.priority - b.priority)
                  .map((action) => (
                    <WellnessCard
                      key={action.id}
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      color={action.color}
                      category={action.category}
                      priority={action.priority}
                      component={action.component}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Floating Dock Navigation */}
      <FloatingDock />
    </div>
  );
};