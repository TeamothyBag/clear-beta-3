import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smile,
  Meh,
  Frown,
  Heart
} from "lucide-react";

const moodOptions = [
  { icon: Smile, label: "Great", emoji: "😊", value: 5 },
  { icon: Smile, label: "Good", emoji: "🙂", value: 4 },
  { icon: Meh, label: "Okay", emoji: "😐", value: 3 },
  { icon: Frown, label: "Low", emoji: "😔", value: 2 },
  { icon: Frown, label: "Tough", emoji: "😢", value: 1 },
];

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
    // Auto-save the mood
    setTimeout(() => {
      console.log("Mood saved:", value);
      // Reset after a moment to allow for new entries
      setTimeout(() => setSelectedMood(null), 1000);
    }, 300);
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
                  className={`relative p-4 rounded-3xl transition-all duration-300 ${
                    selectedMood === mood.value
                      ? 'bg-primary/20 scale-110 shadow-lg'
                      : 'bg-muted/30 hover:bg-muted/50 hover:scale-105'
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <p className="text-xs font-medium text-foreground">{mood.label}</p>
                  
                  {selectedMood === mood.value && (
                    <div className="absolute inset-0 rounded-3xl border-2 border-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedMood && (
        <div className="text-center p-4 bg-success/10 rounded-2xl">
          <Heart className="w-5 h-5 text-success mx-auto mb-2" />
          <p className="text-sm text-success font-medium">Thanks for checking in! 💚</p>
        </div>
      )}

      <div className="text-center">
        <Button 
          variant="outline" 
          size="sm"
          className="text-xs"
        >
          View Detailed Tracking
        </Button>
      </div>
    </div>
  );
};