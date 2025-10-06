import React, { useState } from "react";
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
import { useMood } from "@/contexts/MoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMoodTracker } from "@/hooks/wellness";

const moodOptions = [
  { icon: Frown, label: "Very Difficult", emoji: "�", value: 1, color: "destructive" },
  { icon: Frown, label: "Difficult", emoji: "�", value: 2, color: "destructive" },
  { icon: Frown, label: "Low", emoji: "�", value: 3, color: "secondary" },
  { icon: Meh, label: "Below Average", emoji: "😐", value: 4, color: "secondary" },
  { icon: Meh, label: "Okay", emoji: "😐", value: 5, color: "warning" },
  { icon: Meh, label: "Slightly Better", emoji: "🙂", value: 6, color: "warning" },
  { icon: Smile, label: "Good", emoji: "�", value: 7, color: "primary" },
  { icon: Smile, label: "Very Good", emoji: "😄", value: 8, color: "primary" },
  { icon: Smile, label: "Great", emoji: "😁", value: 9, color: "success" },
  { icon: Smile, label: "Excellent", emoji: "🤩", value: 10, color: "success" },
];

const moodFactors = [
  { id: "sleep", label: "Sleep Quality", icon: Moon },
  { id: "exercise", label: "Physical Activity", icon: Sun },
  { id: "stress", label: "Stress Level", icon: Cloud },
  { id: "social", label: "Social Connection", icon: Heart },
  { id: "weather", label: "Weather Impact", icon: CloudRain },
];

export const DetailedMoodView = () => {
  // Context hooks
  const { state: authState } = useAuth();
  const { state: moodState, createMoodEntry, fetchMoodEntries, fetchMoodInsights } = useMood();
  const { addNotification } = useNotifications();
  const { moodStats, recentMoods } = useMoodTracker();

  // Local state
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState("");
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("log");

  // Data is auto-loaded by MoodProvider, no need for duplicate calls
  // useEffect removed to prevent redundant API calls

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

  const saveMoodEntry = async () => {
    if (selectedMood) {
      try {
        const moodData = {
          moodData: {
            primaryMood: selectedMood, // Now using 1-10 scale
            emotions: selectedFactors, // Keep as strings for simplicity
            energyLevel: selectedMood, // Map mood to energy level
            stressLevel: Math.max(1, 11 - selectedMood), // Inverse relationship
            anxietyLevel: Math.max(1, 11 - selectedMood) // Inverse relationship
          },
          metadata: {
            loggedAt: selectedDate.toISOString(),
            factors: selectedFactors
          },
          notes: {
            userNotes: moodNote,
            additionalContext: ""
          }
        };

        await createMoodEntry(moodData);
        
        addNotification({
          type: 'success',
          title: 'Mood Logged',
          message: 'Your mood has been successfully recorded'
        });

        // Reset form
        setSelectedMood(null);
        setMoodNote("");
        setSelectedFactors([]);
        setSelectedDate(new Date());
        setIsEditing(false);
        
        // Refresh data
        fetchMoodEntries();
        fetchMoodInsights();
      } catch (error) {
        console.error('Error saving mood entry:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to save mood entry. Please try again.'
        });
      }
    }
  };

  const clearForm = () => {
    setSelectedMood(null);
    setMoodNote("");
    setSelectedFactors([]);
    setSelectedDate(new Date());
    setIsEditing(false);
  };

  const getMoodEmoji = (moodValue: number) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.emoji : "😐";
  };

  const getMoodLabel = (moodValue: number) => {
    const mood = moodOptions.find(m => m.value === moodValue);
    return mood ? mood.label : "Unknown";
  };

  const calculateMoodTrend = () => {
    if (!moodState.entries || moodState.entries.length < 2) return 0;
    
    const sortedEntries = [...moodState.entries]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || new Date()).getTime();
        const dateB = new Date(b.createdAt || new Date()).getTime();
        return dateB - dateA;
      });
    
    const recent = sortedEntries.slice(0, 3);
    const previous = sortedEntries.slice(3, 6);
    
    if (recent.length === 0 || previous.length === 0) return 0;
    
    // Use the actual backend field 'mood' instead of 'moodData.primaryMood'
    const recentAvg = recent.reduce((sum, entry) => sum + (entry.mood || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, entry) => sum + (entry.mood || 0), 0) / previous.length;
    
    return recentAvg - previousAvg;
  };

  const moodTrend = calculateMoodTrend();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mood Tracker</h1>
          <p className="text-muted-foreground">Track and understand your emotional patterns</p>
        </div>
        <div className="flex items-center gap-2">
          {moodTrend > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              Improving
            </Badge>
          )}
          {moodTrend < 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-red-600">
              <TrendingDown className="w-3 h-3" />
              Declining
            </Badge>
          )}
          {moodTrend === 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Stable
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log Mood</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                How are you feeling today?
              </CardTitle>
              <CardDescription>
                Take a moment to reflect on your current emotional state
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mood Selection */}
              <div className="space-y-3">
                <h3 className="font-medium">Your Mood (1-10 scale)</h3>
                <div className="grid grid-cols-5 gap-3">
                  {moodOptions.map((mood) => {
                    const IconComponent = mood.icon;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedMood === mood.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-2xl">{mood.emoji}</div>
                          <IconComponent className="w-4 h-4 mx-auto" />
                          <p className="text-xs font-medium">{mood.value}</p>
                          <p className="text-xs text-muted-foreground">{mood.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-3">
                <h3 className="font-medium">Contributing Factors</h3>
                <p className="text-sm text-muted-foreground">
                  What might be influencing your mood today?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {moodFactors.map((factor) => {
                    const IconComponent = factor.icon;
                    return (
                      <button
                        key={factor.id}
                        onClick={() => toggleFactor(factor.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedFactors.includes(factor.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{factor.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-3">
                <h3 className="font-medium">Additional Notes</h3>
                <Textarea
                  placeholder="Tell us more about how you're feeling today..."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Date Selection */}
              <div className="space-y-3">
                <h3 className="font-medium">Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={saveMoodEntry} 
                  disabled={!selectedMood || moodState.isSubmitting}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {moodState.isSubmitting ? 'Saving...' : 'Save Mood Entry'}
                </Button>
                <Button variant="outline" onClick={clearForm}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
              <CardDescription>Your mood entries over time</CardDescription>
            </CardHeader>
            <CardContent>
              {moodState.isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading mood history...</p>
                </div>
              ) : moodState.entries && moodState.entries.length > 0 ? (
                <div className="space-y-4">
                  {moodState.entries
                    .sort((a, b) => {
                      const dateA = new Date(a.createdAt || new Date()).getTime();
                      const dateB = new Date(b.createdAt || new Date()).getTime();
                      return dateB - dateA;
                    })
                    .map((entry, index) => {
                      // Use backend structure: entry.mood instead of entry.moodData.primaryMood
                      const moodValue = entry.mood || 5;
                      const mood = moodOptions.find(m => m.value === moodValue);
                      
                      return (
                        <div key={entry._id || entry.id || index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{getMoodEmoji(moodValue)}</span>
                              <div>
                                <p className="font-medium">{getMoodLabel(moodValue)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(entry.createdAt || new Date()).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{moodValue}/10</span>
                              <Progress value={moodValue * 10} className="w-16" />
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>
                          )}
                          
                          {entry.emotions && entry.emotions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {entry.emotions.map((emotion, emotionIndex) => {
                                const emotionText = typeof emotion === 'string' 
                                  ? emotion 
                                  : emotion.name || 'Unknown';
                                return (
                                  <Badge key={emotionIndex} variant="outline" className="text-xs">
                                    {emotionText}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No mood entries yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("log")}
                    className="mt-2"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Log Your First Mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Overview</CardTitle>
                <CardDescription>Your emotional patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {moodState.insights || moodState.analytics || moodState.entries?.length > 0 ? (
                  <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Average Mood</span>
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Calculate average from actual entries if insights not available
                            const avgMood = moodState.insights?.averageMood || 
                                          moodState.analytics?.averageMood || 
                                          (moodState.entries?.length > 0 
                                            ? moodState.entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodState.entries.length
                                            : 5);
                            return (
                              <>
                                <span className="text-lg">{getMoodEmoji(Math.round(avgMood))}</span>
                                <span className="font-medium">{avgMood.toFixed(1)}/10</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <Progress value={(() => {
                        const avgMood = moodState.insights?.averageMood || 
                                      moodState.analytics?.averageMood || 
                                      (moodState.entries?.length > 0 
                                        ? moodState.entries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / moodState.entries.length
                                        : 5);
                        return avgMood * 10;
                      })()} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Entries</span>
                      <span className="font-medium">{(moodState.insights?.totalEntries || moodState.analytics?.totalEntries) || moodState.entries?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Streak</span>
                      <span className="font-medium">{(moodState.insights?.currentStreak || moodState.analytics?.currentStreak) || 0} days</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No analytics available yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Trends</CardTitle>
                <CardDescription>How you've been feeling lately</CardDescription>
              </CardHeader>
              <CardContent>
                {moodState.entries && moodState.entries.length >= 2 ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {moodTrend > 0.5 && (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Your mood is improving</span>
                        </>
                      )}
                      {moodTrend < -0.5 && (
                        <>
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600">Your mood has been declining</span>
                        </>
                      )}
                      {Math.abs(moodTrend) <= 0.5 && (
                        <>
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600">Your mood is stable</span>
                        </>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Based on your last {Math.min(moodState.entries.length, 6)} entries
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Add more mood entries to see trends and insights
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};