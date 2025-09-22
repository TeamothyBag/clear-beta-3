import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smile, Meh, Frown, Heart, Calendar as CalendarIcon, 
  TrendingUp, TrendingDown, BarChart3, PlusCircle,
  Sun, Moon, Cloud, CloudRain, Edit3, Save, X
} from "lucide-react";

const moodOptions = [
  { icon: Smile, label: "Excellent", emoji: "😊", value: 5, color: "success" },
  { icon: Smile, label: "Good", emoji: "🙂", value: 4, color: "primary" },
  { icon: Meh, label: "Okay", emoji: "😐", value: 3, color: "warning" },
  { icon: Frown, label: "Low", emoji: "😔", value: 2, color: "secondary" },
  { icon: Frown, label: "Difficult", emoji: "😢", value: 1, color: "destructive" },
];

const moodFactors = [
  { id: "sleep", label: "Sleep Quality", icon: Moon },
  { id: "exercise", label: "Physical Activity", icon: Sun },
  { id: "stress", label: "Stress Level", icon: Cloud },
  { id: "social", label: "Social Connection", icon: Heart },
  { id: "weather", label: "Weather Impact", icon: CloudRain },
];

const mockMoodHistory = [
  { date: "2025-09-22", mood: 4, note: "Had a good therapy session today", factors: ["sleep", "social"] },
  { date: "2025-09-21", mood: 3, note: "Feeling okay, work was stressful", factors: ["stress"] },
  { date: "2025-09-20", mood: 5, note: "Great day! Went for a walk in the park", factors: ["exercise", "weather"] },
  { date: "2025-09-19", mood: 2, note: "Tough day, feeling overwhelmed", factors: ["stress", "sleep"] },
  { date: "2025-09-18", mood: 4, note: "Better day, met with friends", factors: ["social"] },
];

export const DetailedMoodView = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("log");

  const handleMoodSelect = (value: number) => {
    setSelectedMood(value);
  };

  const toggleFactor = (factorId: string) => {
    setSelectedFactors(prev => 
      prev.includes(factorId) 
        ? prev.filter(id => id !== factorId)
        : [...prev, factorId]
    );
  };

  const saveMoodEntry = () => {
    if (selectedMood) {
      console.log("Saving mood entry:", {
        date: selectedDate,
        mood: selectedMood,
        note: moodNote,
        factors: selectedFactors
      });
      // Reset form
      setSelectedMood(null);
      setMoodNote("");
      setSelectedFactors([]);
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setSelectedMood(null);
    setMoodNote("");
    setSelectedFactors([]);
    setIsEditing(false);
  };

  const averageMood = mockMoodHistory.reduce((sum, entry) => sum + entry.mood, 0) / mockMoodHistory.length;
  const moodTrend = mockMoodHistory[0]?.mood > mockMoodHistory[1]?.mood ? "up" : "down";

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-caslon text-2xl text-foreground">Mood Insights</h1>
          <p className="text-muted-foreground">Track your emotional wellbeing journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="log">Log Mood</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Mood Logging Tab */}
          <TabsContent value="log" className="space-y-6">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-primary" />
                  How are you feeling?
                </CardTitle>
                <CardDescription>
                  Take a moment to check in with yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((mood) => {
                    const Icon = mood.icon;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood.value)}
                        className={`relative p-3 rounded-2xl transition-all duration-300 ${
                          selectedMood === mood.value
                            ? 'bg-primary/20 scale-110 shadow-lg border-2 border-primary'
                            : 'bg-muted/50 hover:bg-muted hover:scale-105'
                        }`}
                      >
                        <div className="text-xl mb-1">{mood.emoji}</div>
                        <p className="text-xs font-medium text-foreground">{mood.label}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedMood && (
                  <>
                    {/* Mood Factors */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">What's influencing your mood?</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {moodFactors.map((factor) => {
                          const Icon = factor.icon;
                          const isSelected = selectedFactors.includes(factor.id);
                          return (
                            <button
                              key={factor.id}
                              onClick={() => toggleFactor(factor.id)}
                              className={`p-3 rounded-xl transition-all duration-200 text-left ${
                                isSelected
                                  ? 'bg-primary/20 border-2 border-primary text-primary'
                                  : 'bg-muted/30 border border-border hover:bg-muted/50'
                              }`}
                            >
                              <Icon className="w-4 h-4 mb-1" />
                              <p className="text-xs font-medium">{factor.label}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mood Note */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">Add a note (optional)</h4>
                      <Textarea
                        placeholder="How was your day? What happened?"
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button onClick={saveMoodEntry} className="calming-button flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save Entry
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-primary" />
                  Mood History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMoodHistory.map((entry, index) => {
                    const mood = moodOptions.find(m => m.value === entry.mood)!;
                    return (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-xl">
                        <div className="text-2xl">{mood.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-foreground">{mood.label}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {entry.factors.map(factorId => {
                              const factor = moodFactors.find(f => f.id === factorId);
                              return (
                                <Badge key={factorId} variant="outline" className="text-xs">
                                  {factor?.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="therapeutic-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {averageMood.toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Mood</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </CardContent>
              </Card>
              
              <Card className="therapeutic-card">
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl mb-1 ${moodTrend === 'up' ? 'text-success' : 'text-warning'}`}>
                    {moodTrend === 'up' ? <TrendingUp className="w-6 h-6 mx-auto" /> : <TrendingDown className="w-6 h-6 mx-auto" />}
                  </div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Patterns & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-1">💡 Pattern Detected</p>
                    <p className="text-xs text-muted-foreground">
                      Your mood tends to be higher on days when you exercise and get good sleep.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <p className="text-sm font-medium text-foreground mb-1">🌱 Growth Opportunity</p>
                    <p className="text-xs text-muted-foreground">
                      Consider adding more social activities on challenging days - they seem to help boost your mood.
                    </p>
                  </div>
                </div>

                {/* Factor Impact */}
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Factor Impact</h4>
                  {moodFactors.slice(0, 3).map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{factor.label}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={Math.random() * 100} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 30 + 60)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};