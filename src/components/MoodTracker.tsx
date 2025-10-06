import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smile,
  Meh,
  Frown,
  Heart,
  Loader2
} from "lucide-react";
import { useMood } from "../contexts/MoodContext";
import { useMoodSocket } from "../services/socket";
import { useToast } from "../hooks/use-toast";
import { useNotifications } from "../contexts/NotificationContext";
import { useErrorHandler } from "../utils/errorHandling";
import { wellnessUtils } from "../utils";

const moodOptions = [
  { icon: Frown, label: "Very Low", emoji: "😢", value: 2 },
  { icon: Frown, label: "Low", emoji: "😔", value: 4 },
  { icon: Meh, label: "Okay", emoji: "😐", value: 5 },
  { icon: Smile, label: "Good", emoji: "🙂", value: 7 },
  { icon: Smile, label: "Great", emoji: "😊", value: 9 },
];

interface MoodTrackerProps {
  onNavigateToDetailed?: () => void;
}

export const MoodTracker = ({ onNavigateToDetailed }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createMoodEntry, state: moodState } = useMood();
  const { sendMoodUpdate, onMoodUpdate } = useMoodSocket();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { handleError } = useErrorHandler();

  // Listen for real-time mood updates
  React.useEffect(() => {
    const cleanup = onMoodUpdate((mood) => {
      toast({
        title: "Mood Updated",
        description: `Your mood has been recorded: ${wellnessUtils.getMoodLabel(mood.moodData.primaryMood)}`,
      });
    });

    return cleanup;
  }, [onMoodUpdate, toast]);

  const handleMoodSelect = async (value: number) => {
    if (isSubmitting) return;
    
    setSelectedMood(value);
    setIsSubmitting(true);

    try {
      const moodEntry = await createMoodEntry({
        moodData: {
          primaryMood: value, // Keep using the 1-10 scale values
          emotions: [wellnessUtils.getMoodLabel(value).toLowerCase()],
          energyLevel: value <= 4 ? 3 : value <= 7 ? 6 : 8,
          stressLevel: value <= 4 ? 8 : value <= 7 ? 5 : 2,
          anxietyLevel: value <= 4 ? 7 : value <= 7 ? 4 : 2,
        },
        context: {
          activities: ['quick-check'],
        },
        notes: {
          userNotes: `Quick mood check: ${wellnessUtils.getMoodLabel(value)}`,
        }
      });

      // Send real-time update
      sendMoodUpdate(moodEntry);

      addNotification({
        type: 'success',
        title: "Mood Recorded",
        message: `Thanks for checking in! ${wellnessUtils.getMoodEmoji(value)}`,
        priority: 'low',
        autoHideDelay: 3000,
      });

      // Reset after success
      setTimeout(() => {
        setSelectedMood(null);
        setIsSubmitting(false);
      }, 2000);

    } catch (error) {
      handleError(error, 'MoodTracker.handleMoodSelect');
      setSelectedMood(null);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-caslon text-xl text-foreground mb-2">Quick Mood Check</h2>
        <p className="text-muted-foreground text-sm">How are you feeling right now?</p>
      </div>

      {/* Simple Mood Selection */}
      <Card className="therapeutic-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-3">
            {moodOptions.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  disabled={isSubmitting}
                  className={`relative p-4 rounded-3xl transition-all duration-300 ${
                    selectedMood === mood.value
                      ? 'bg-primary/20 scale-110 shadow-lg'
                      : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting && selectedMood === mood.value ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                  ) : (
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                  )}
                  <p className="text-xs font-medium text-foreground">{mood.label}</p>
                  
                  {selectedMood === mood.value && !isSubmitting && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedMood && !isSubmitting && (
        <div className="text-center p-4 bg-success/10 rounded-2xl">
          <Heart className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-sm text-success font-medium">Thanks for checking in! 💚</p>
        </div>
      )}

      {moodState.isLoading && (
        <div className="text-center p-4 bg-muted/10 rounded-2xl">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Saving your mood...</p>
        </div>
      )}

      {/* Show recent mood trend */}
      {moodState.entries.length > 0 && (
        <div className="text-center p-3 bg-primary/5 rounded-xl">
          <p className="text-xs text-muted-foreground mb-1">Recent average:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">
              {wellnessUtils.getMoodEmoji(
                Math.round(moodState.entries.slice(0, 7).reduce((sum, entry) => sum + entry.moodData.primaryMood, 0) / Math.min(moodState.entries.length, 7))
              )}
            </span>
            <span className="text-sm font-medium">
              {wellnessUtils.getMoodLabel(
                Math.round(moodState.entries.slice(0, 7).reduce((sum, entry) => sum + entry.moodData.primaryMood, 0) / Math.min(moodState.entries.length, 7))
              )}
            </span>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
          onClick={onNavigateToDetailed}
        >
          View Detailed Tracking
        </Button>
      </div>
    </div>
  );
};