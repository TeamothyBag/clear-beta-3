import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import heroForest from "@/assets/hero-forest.jpg";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleGetStarted = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onGetStarted();
    }, 300);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroForest})` }}
    >
      {/* Healing overlay */}
      <div className="absolute inset-0 healing-overlay" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 pt-12 pb-8">
          <div className="text-center">
            <h1 className="font-caslon text-4xl md:text-6xl font-medium text-white mb-2 text-shadow-soft">
              CLEARED MIND
            </h1>
            <div className="w-24 h-1 bg-white/60 mx-auto rounded-full" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Mission Statement */}
            <Card className="therapeutic-card gentle-fade-in bg-white/95 backdrop-blur-sm">
              <CardContent className="p-8">
                <h2 className="font-caslon text-2xl md:text-3xl text-foreground mb-4 leading-relaxed">
                  Comprehensive Health and Wellness, Mental Health, Mindfulness, and Productivity Program
                </h2>
                <p className="text-lg text-muted-foreground font-medium">
                  To help you lead a healthier, happier, and more fulfilling life.
                </p>
              </CardContent>
            </Card>

            {/* Welcome Message */}
            <div className="gentle-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-caslon text-5xl md:text-6xl text-white mb-8 text-shadow-soft">
                WELCOME!
              </h3>
            </div>

            {/* Trust Indicators */}
            <div className="gentle-fade-in grid grid-cols-1 md:grid-cols-3 gap-4" style={{ animationDelay: '0.4s' }}>
              <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">HIPAA Compliant</p>
                  <p className="text-white/80 text-sm">Your privacy protected</p>
                </CardContent>
              </Card>
              <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">Professional Support</p>
                  <p className="text-white/80 text-sm">Licensed therapists available</p>
                </CardContent>
              </Card>
              <Card className="bg-white/20 backdrop-blur-sm border-white/30">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-white mx-auto mb-2 breathing-animation" />
                  <p className="text-white font-medium">Evidence-Based</p>
                  <p className="text-white/80 text-sm">Clinically proven methods</p>
                </CardContent>
              </Card>
            </div>

            {/* Get Started Button */}
            <div className="gentle-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className={`
                  calming-button text-xl px-12 py-6 font-semibold
                  ${isAnimating ? 'scale-95' : ''}
                  transition-all duration-300
                `}
              >
                Get Started
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 pb-8 text-center">
          <p className="text-white/80 text-sm">
            Take the first step towards your mental wellness journey
          </p>
        </footer>
      </div>
    </div>
  );
};