import { useState, useEffect, useRef } from "react";
import { Heart, Zap, Shield, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { useMood } from "@/contexts/MoodContext";
import { useMeditation } from "@/contexts/MeditationContext";
import { useHabits } from "@/contexts/HabitContext";
import { cn } from "@/lib/utils";
import apiService from "@/services/api";

interface HealthMetrics {
  mood: number;
  energy: number;
  wellness: number;
  progress: number;
}

interface RingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  animationDelay?: number;
  icon?: React.ReactNode;
  isLoading?: boolean;
  glowEffect?: boolean;
}

const Ring = ({ 
  percentage, 
  color, 
  size = 60, 
  strokeWidth = 4, 
  animationDelay = 0,
  icon,
  isLoading = false,
  glowEffect = false
}: RingProps) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (isLoading) {
      setAnimatedPercentage(0);
      return;
    }

    const timer = setTimeout(() => {
      // Smooth animation to target percentage
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();
      const startPercentage = animatedPercentage;
      const targetPercentage = percentage;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage = startPercentage + (targetPercentage - startPercentage) * easeOut;
        
        setAnimatedPercentage(currentPercentage);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animate();
    }, animationDelay);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [percentage, animationDelay, isLoading]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${animatedPercentage * circumference / 100} ${circumference}`;
  
  // Calculate color intensity based on percentage
  const getColorIntensity = (percentage: number) => {
    if (percentage >= 80) return 'brightness-110 saturate-110';
    if (percentage >= 60) return 'brightness-100 saturate-100';
    if (percentage >= 40) return 'brightness-90 saturate-90';
    return 'brightness-75 saturate-75';
  };

  return (
    <div className="relative flex items-center justify-center group">
      {/* Glow effect container */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          glowEffect && animatedPercentage > 0 && "animate-pulse",
          animatedPercentage >= 90 && "shadow-lg shadow-primary/20"
        )}
      />
      
      <svg
        className="transform -rotate-90 absolute transition-transform duration-300 group-hover:scale-105"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/20 transition-colors duration-300"
        />
        
        {/* Loading shimmer effect */}
        {isLoading && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/40 animate-pulse"
            strokeDasharray="10 5"
          />
        )}
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className={cn(
            "transition-all duration-300 ease-out",
            getColorIntensity(animatedPercentage),
            "drop-shadow-sm",
            animatedPercentage >= 90 && "filter drop-shadow-glow"
          )}
        />
      </svg>
      
      {/* Icon container with enhanced animations */}
      <div className={cn(
        "relative z-10 transition-all duration-300 ease-out",
        "group-hover:scale-110 group-hover:rotate-3",
        animatedPercentage >= 90 && "animate-bounce"
      )}>
        {icon}
        {/* Sparkle effect for high percentages */}
        {animatedPercentage >= 95 && (
          <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export const HealthRings = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    mood: 0,
    energy: 0,
    wellness: 0,
    progress: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);

  const { state: authState } = useAuth();
  const { state: analyticsState } = useAnalytics();
  const { state: moodState } = useMood();
  const { state: meditationState } = useMeditation();
  const { state: habitState } = useHabits();

  useEffect(() => {
    calculateHealthMetrics();
  }, [analyticsState.dashboard, moodState.entries, meditationState.sessions, habitState.habits]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setAnimationStarted(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const calculateHealthMetrics = async () => {
    if (!authState.user) return;

    try {
      setIsLoading(true);
      setAnimationStarted(false);

      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Calculate mood percentage from recent mood entries
      const moodPercentage = calculateMoodScore();
      
      // Calculate energy/wellness from meditation and activity
      const energyPercentage = calculateEnergyScore();
      
      // Calculate overall wellness from multiple factors
      const wellnessPercentage = calculateWellnessScore();
      
      // Calculate progress based on goal completion and streaks
      const progressPercentage = calculateProgressScore();

      setHealthMetrics({
        mood: Math.round(moodPercentage),
        energy: Math.round(energyPercentage),
        wellness: Math.round(wellnessPercentage),
        progress: Math.round(progressPercentage)
      });
    } catch (error) {
      console.error('Error calculating health metrics:', error);
      // Fallback to sample data if calculation fails
      setHealthMetrics({
        mood: 50,
        energy: 50,
        wellness: 50,
        progress: 50
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMoodScore = (): number => {
    if (!moodState.entries || moodState.entries.length === 0) return 50;

    // Get last 7 days of mood entries
    const recentEntries = moodState.entries.slice(0, 7);
    const averageMood = recentEntries.reduce((sum, entry) => sum + entry.moodData.primaryMood, 0) / recentEntries.length;
    
    // Convert mood level (1-10) to percentage
    return (averageMood / 10) * 100;
  };

  const calculateEnergyScore = (): number => {
    if (!meditationState.sessions || meditationState.sessions.length === 0) return 40;

    // Calculate energy based on recent meditation activity
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSessions = meditationState.sessions.filter(session => 
      new Date(session.metadata.startedAt) >= lastWeek
    );

    const totalMinutes = recentSessions.reduce((sum, session) => sum + session.session.actualDuration, 0);
    
    // Convert total meditation minutes to energy percentage (target: 70 minutes/week)
    const energyFromMeditation = Math.min((totalMinutes / 70) * 60, 60);
    
    // Add bonus points for consistency
    const consistencyBonus = recentSessions.length >= 3 ? 20 : recentSessions.length * 6;
    
    return Math.min(energyFromMeditation + consistencyBonus, 100);
  };

  const calculateWellnessScore = (): number => {
    const moodScore = calculateMoodScore();
    const energyScore = calculateEnergyScore();
    
    // Calculate habit completion rate
    const habitScore = calculateHabitCompletionScore();
    
    // Weighted average of different wellness factors
    return (moodScore * 0.4 + energyScore * 0.3 + habitScore * 0.3);
  };

  const calculateHabitCompletionScore = (): number => {
    if (!habitState.habits || habitState.habits.length === 0) return 60;

    // Calculate completion rate based on habit statistics
    const totalCompletionRate = habitState.habits.reduce((sum, habit) => {
      return sum + (habit.statistics?.completion_rate || 0);
    }, 0);

    const averageCompletionRate = totalCompletionRate / habitState.habits.length;
    
    return Math.min(averageCompletionRate * 100, 100);
  };

  const calculateProgressScore = (): number => {
    const habitScore = calculateHabitCompletionScore();
    const moodTrend = calculateMoodTrend();
    const consistencyScore = calculateConsistencyScore();
    
    // Weighted average of progress indicators
    return (habitScore * 0.4 + moodTrend * 0.3 + consistencyScore * 0.3);
  };

  const calculateMoodTrend = (): number => {
    if (!moodState.entries || moodState.entries.length < 2) return 50;

    // Compare recent mood trend
    const recentEntries = moodState.entries.slice(0, 7);
    const olderEntries = moodState.entries.slice(7, 14);
    
    if (olderEntries.length === 0) return 50;

    const recentAverage = recentEntries.reduce((sum, entry) => sum + entry.moodData.primaryMood, 0) / recentEntries.length;
    const olderAverage = olderEntries.reduce((sum, entry) => sum + entry.moodData.primaryMood, 0) / olderEntries.length;
    
    const improvement = recentAverage - olderAverage;
    
    // Convert improvement to percentage (positive improvement = higher score)
    return Math.max(0, Math.min(100, 50 + improvement * 10));
  };

  const calculateConsistencyScore = (): number => {
    const meditationConsistency = meditationState.sessions?.length > 0 ? 
      Math.min((meditationState.sessions.filter(s => 
        new Date(s.metadata.startedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length / 7) * 100, 100) : 0;
    
    const moodConsistency = moodState.entries?.length > 0 ?
      Math.min((moodState.entries.filter(m => 
        new Date(m.metadata.loggedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length / 7) * 100, 100) : 0;
    
    return (meditationConsistency + moodConsistency) / 2;
  };

  if (isLoading || analyticsState.isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="space-y-1">
              <div className="w-12 h-3 bg-muted/60 rounded animate-pulse"></div>
              <div className="w-8 h-2 bg-muted/40 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ringData = [
    {
      key: 'mood',
      percentage: healthMetrics.mood,
      color: "hsl(var(--primary))",
      icon: <Heart className="w-5 h-5 text-primary" />,
      label: 'Mood',
      description: 'Daily emotional state',
      animationDelay: 0
    },
    {
      key: 'energy',
      percentage: healthMetrics.energy,
      color: "hsl(var(--success))",
      icon: <Zap className="w-5 h-5 text-emerald-500" />,
      label: 'Energy',
      description: 'Activity & vitality',
      animationDelay: 200
    },
    {
      key: 'wellness',
      percentage: healthMetrics.wellness,
      color: "hsl(var(--accent))",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      label: 'Wellness',
      description: 'Overall health score',
      animationDelay: 400
    },
    {
      key: 'progress',
      percentage: healthMetrics.progress,
      color: "hsl(var(--warning))",
      icon: <TrendingUp className="w-5 h-5 text-amber-500" />,
      label: 'Progress',
      description: 'Goal achievement',
      animationDelay: 600
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {ringData.map((ring, index) => (
        <div 
          key={ring.key}
          className={cn(
            "flex flex-col items-center transition-all duration-500 ease-out",
            "hover:transform hover:scale-105 cursor-pointer group",
            animationStarted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ 
            transitionDelay: animationStarted ? `${ring.animationDelay}ms` : '0ms'
          }}
        >
          <div className="relative mb-3">
            <Ring 
              percentage={animationStarted ? ring.percentage : 0}
              color={ring.color}
              size={56}
              strokeWidth={4}
              animationDelay={ring.animationDelay}
              icon={ring.icon}
              isLoading={isLoading}
              glowEffect={ring.percentage >= 90}
            />
            
            {/* Percentage display on hover */}
            <div className={cn(
              "absolute -bottom-2 left-1/2 transform -translate-x-1/2",
              "text-xs font-bold text-primary px-2 py-1 rounded-full",
              "bg-primary/10 backdrop-blur-sm border border-primary/20",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "pointer-events-none whitespace-nowrap"
            )}>
              {ring.percentage}%
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <p className={cn(
              "text-sm font-semibold text-foreground transition-colors duration-200",
              "group-hover:text-primary"
            )}>
              {ring.label}
            </p>
            <p className={cn(
              "text-xs text-muted-foreground transition-all duration-200",
              "group-hover:text-foreground/80 group-hover:scale-105"
            )}>
              {ring.percentage}%
            </p>
          </div>
          
          {/* Achievement badge for high scores */}
          {ring.percentage >= 90 && (
            <div className={cn(
              "absolute -top-1 -right-1 w-4 h-4",
              "bg-gradient-to-r from-yellow-400 to-orange-400",
              "rounded-full flex items-center justify-center",
              "animate-pulse shadow-lg shadow-yellow-400/50"
            )}>
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};