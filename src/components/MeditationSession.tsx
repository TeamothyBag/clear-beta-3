import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Brain,
  Heart,
  Leaf
} from "lucide-react";
import meditationZen from "@/assets/meditation-zen.jpg";

export const MeditationSession = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(5); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60); // seconds
  const [isMuted, setIsMuted] = useState(false);
  const [selectedType, setSelectedType] = useState("breathing");

  const meditationTypes = [
    {
      id: "breathing",
      name: "Deep Breathing",
      description: "Focus on your breath to calm anxiety and stress",
      icon: Leaf,
      color: "primary"
    },
    {
      id: "mindfulness",
      name: "Mindfulness",
      description: "Present moment awareness and acceptance",
      icon: Brain,
      color: "accent"
    },
    {
      id: "loving-kindness",
      name: "Loving Kindness",
      description: "Cultivate compassion for yourself and others",
      icon: Heart,
      color: "success"
    }
  ];

  const durations = [3, 5, 10, 15, 20];

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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(duration * 60);
  };

  const selectedMeditation = meditationTypes.find(type => type.id === selectedType)!;

  return (
    <div className="space-y-6">
      {/* Header Image */}
      <div 
        className="relative h-48 bg-cover bg-center rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${meditationZen})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="font-caslon text-2xl mb-1">Meditation Session</h2>
          <p className="text-white/80">Find peace in the present moment</p>
        </div>
      </div>

      {/* Meditation Type Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Choose Your Practice</h3>
        <div className="grid grid-cols-1 gap-3">
          {meditationTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedType === type.id 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    type.color === 'primary' ? 'bg-primary/20' :
                    type.color === 'accent' ? 'bg-accent/20' :
                    'bg-success/20'
                  }`}>
                    <type.icon className={`w-5 h-5 ${
                      type.color === 'primary' ? 'text-primary' :
                      type.color === 'accent' ? 'text-accent-foreground' :
                      'text-success'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{type.name}</h4>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  {selectedType === type.id && (
                    <Badge variant="default" className="bg-primary">Selected</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Session Length</h3>
        <div className="flex flex-wrap gap-2">
          {durations.map((dur) => (
            <Button
              key={dur}
              variant={duration === dur ? "default" : "outline"}
              size="sm"
              onClick={() => setDuration(dur)}
              className={duration === dur ? "calming-button" : ""}
            >
              {dur} min
            </Button>
          ))}
        </div>
      </div>

      {/* Meditation Timer */}
      <Card className="therapeutic-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="font-caslon text-xl flex items-center justify-center">
            <selectedMeditation.icon className="w-6 h-6 mr-3 text-primary" />
            {selectedMeditation.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {/* Timer Display */}
          <div className="space-y-4">
            <div className="text-5xl font-light text-foreground font-mono">
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
              <p className="text-muted-foreground">
                Breathe deeply and focus on the present moment
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guided Instructions */}
      <Card className="therapeutic-card bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="font-caslon text-lg">Session Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-foreground">
              <strong>{selectedMeditation.name} Instructions:</strong>
            </p>
            {selectedType === "breathing" && (
              <ul className="space-y-2 text-muted-foreground">
                <li>• Find a comfortable seated position</li>
                <li>• Close your eyes or soften your gaze</li>
                <li>• Breathe naturally through your nose</li>
                <li>• Count each breath: in for 4, hold for 4, out for 6</li>
                <li>• If your mind wanders, gently return to your breath</li>
              </ul>
            )}
            {selectedType === "mindfulness" && (
              <ul className="space-y-2 text-muted-foreground">
                <li>• Notice thoughts without judgment</li>
                <li>• Observe physical sensations in your body</li>
                <li>• Acknowledge emotions as they arise</li>
                <li>• Return attention to the present moment</li>
                <li>• Practice accepting what is, without resistance</li>
              </ul>
            )}
            {selectedType === "loving-kindness" && (
              <ul className="space-y-2 text-muted-foreground">
                <li>• Start by sending love to yourself</li>
                <li>• Extend compassion to loved ones</li>
                <li>• Include neutral people in your thoughts</li>
                <li>• Send kindness to difficult relationships</li>
                <li>• Embrace all beings with loving awareness</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};