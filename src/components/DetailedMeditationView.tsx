import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Brain, Heart, Leaf,
  Clock, Trophy, Star, Flame, Calendar, Download, Settings,
  Wind, Waves, Mountain, TreePine, Sun, Moon
} from "lucide-react";
import meditationZen from "@/assets/meditation-zen.jpg";

const meditationTypes = [
  {
    id: "breathing",
    name: "Deep Breathing",
    description: "Focus on breath to reduce anxiety and stress",
    icon: Leaf,
    color: "primary",
    difficulty: "Beginner",
    duration: [3, 5, 10, 15, 20],
    benefits: ["Reduces anxiety", "Improves focus", "Calms nervous system"]
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Present moment awareness and acceptance",
    icon: Brain,
    color: "accent",
    difficulty: "Intermediate",
    duration: [5, 10, 15, 20, 30],
    benefits: ["Increases awareness", "Reduces rumination", "Improves emotional regulation"]
  },
  {
    id: "loving-kindness",
    name: "Loving Kindness",
    description: "Cultivate compassion for self and others",
    icon: Heart,
    color: "success",
    difficulty: "Beginner",
    duration: [5, 10, 15, 20],
    benefits: ["Increases empathy", "Reduces self-criticism", "Improves relationships"]
  },
  {
    id: "body-scan",
    name: "Body Scan",
    description: "Progressive relaxation and body awareness",
    icon: Wind,
    color: "secondary",
    difficulty: "Beginner",
    duration: [10, 15, 20, 30, 45],
    benefits: ["Releases tension", "Improves sleep", "Increases body awareness"]
  }
];

const ambientSounds = [
  { id: "rain", name: "Rain", icon: Waves },
  { id: "forest", name: "Forest", icon: TreePine },
  { id: "ocean", name: "Ocean", icon: Waves },
  { id: "birds", name: "Birds", icon: Sun },
  { id: "silence", name: "Silence", icon: Moon }
];

const guidedSessions = [
  {
    id: "anxiety-relief",
    title: "Anxiety Relief",
    instructor: "Dr. Sarah Chen",
    duration: 12,
    type: "breathing",
    rating: 4.8,
    downloads: 1200
  },
  {
    id: "sleep-meditation",
    title: "Deep Sleep",
    instructor: "Marcus Williams",
    duration: 20,
    type: "body-scan",
    rating: 4.9,
    downloads: 2100
  },
  {
    id: "morning-mindfulness",
    title: "Morning Mindfulness",
    instructor: "Lisa Johnson",
    duration: 8,
    type: "mindfulness",
    rating: 4.7,
    downloads: 980
  }
];

export const DetailedMeditationView = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedType, setSelectedType] = useState("breathing");
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSound, setSelectedSound] = useState("silence");
  const [volume, setVolume] = useState([50]);
  const [activeTab, setActiveTab] = useState("practice");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsPlaying(false);
            return duration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft, duration]);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const selectedMeditation = meditationTypes.find(type => type.id === selectedType)!;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(duration * 60);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div 
          className="relative h-40 bg-cover bg-center rounded-2xl overflow-hidden"
          style={{ backgroundImage: `url(${meditationZen})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h1 className="font-caslon text-2xl mb-1">Meditation Center</h1>
            <p className="text-white/80">Your journey to inner peace</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="guided">Guided</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Practice Tab */}
          <TabsContent value="practice" className="space-y-6">
            {/* Meditation Type Selection */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle>Choose Your Practice</CardTitle>
                <CardDescription>Select a meditation style that resonates with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {meditationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-xl transition-all duration-200 text-left ${
                          selectedType === type.id 
                            ? 'bg-primary/20 border-2 border-primary' 
                            : 'bg-muted/30 border border-border hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-primary/20 rounded-full">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-foreground">{type.name}</h4>
                              <Badge variant="outline" className="text-xs">{type.difficulty}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {type.benefits.slice(0, 2).map((benefit, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Duration & Sound Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="therapeutic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMeditation.duration.map((dur) => (
                      <Button
                        key={dur}
                        variant={duration === dur ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDuration(dur)}
                        className="text-xs"
                      >
                        {dur}m
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="therapeutic-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {ambientSounds.slice(0, 4).map((sound) => {
                      const Icon = sound.icon;
                      return (
                        <Button
                          key={sound.id}
                          variant={selectedSound === sound.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedSound(sound.id)}
                          className="text-xs flex items-center"
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {sound.name}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timer Interface */}
            <Card className="therapeutic-card">
              <CardContent className="text-center space-y-6 pt-6">
                {/* Timer Display */}
                <div className="space-y-4">
                  <div className="text-4xl font-light text-foreground font-mono">
                    {formatTime(timeLeft)}
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    disabled={timeLeft === duration * 60}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={handlePlayPause}
                    size="lg"
                    className="calming-button w-16 h-16 rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Session Status */}
                {isPlaying && (
                  <div className="breathing-animation">
                    <p className="text-muted-foreground text-sm">
                      {selectedType === "breathing" && "Breathe in... breathe out..."}
                      {selectedType === "mindfulness" && "Notice this moment..."}
                      {selectedType === "loving-kindness" && "Send love to yourself..."}
                      {selectedType === "body-scan" && "Feel your body relaxing..."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guided Sessions Tab */}
          <TabsContent value="guided" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle>Featured Guided Sessions</CardTitle>
                <CardDescription>Expert-led meditations for specific needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {guidedSessions.map((session) => (
                    <div key={session.id} className="p-4 bg-muted/30 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{session.title}</h4>
                          <p className="text-sm text-muted-foreground">by {session.instructor}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="w-3 h-3 text-warning fill-current" />
                            <span className="text-sm font-medium">{session.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Download className="w-3 h-3" />
                            <span>{session.downloads}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{session.duration}m</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {meditationTypes.find(t => t.id === session.type)?.name}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="therapeutic-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    <Flame className="w-6 h-6 mx-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">Streak</p>
                  <p className="text-lg font-semibold">7 days</p>
                </CardContent>
              </Card>
              
              <Card className="therapeutic-card">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    <Clock className="w-6 h-6 mx-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="text-lg font-semibold">12.5h</p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{day}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={Math.random() * 100} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground w-8">
                          {index < 5 ? `${Math.floor(Math.random() * 20 + 5)}m` : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "First Step", desc: "Complete first meditation", earned: true },
                    { name: "Week Strong", desc: "7-day streak", earned: true },
                    { name: "Mindful Master", desc: "50 sessions", earned: false },
                  ].map((achievement, index) => (
                    <div key={index} className={`p-3 rounded-xl text-center ${
                      achievement.earned ? 'bg-primary/20' : 'bg-muted/30'
                    }`}>
                      <Trophy className={`w-6 h-6 mx-auto mb-1 ${
                        achievement.earned ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className="text-xs font-medium">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="therapeutic-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-primary" />
                  Meditation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Volume Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Volume</label>
                  <div className="flex items-center space-x-3">
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">{volume[0]}%</p>
                </div>

                {/* Notification Settings */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Reminders</label>
                  <div className="space-y-2">
                    {[
                      { label: "Daily meditation reminder", enabled: true },
                      { label: "End of session chime", enabled: true },
                      { label: "Progress notifications", enabled: false },
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{setting.label}</span>
                        <Button variant="outline" size="sm">
                          {setting.enabled ? "On" : "Off"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Times */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preferred Practice Times</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                      <Button key={time} variant="outline" size="sm" className="text-xs">
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};