import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 relative overflow-hidden">
      {/* Subtle botanical background elements inspired by PDF */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-accent/30 rounded-full blur-2xl" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-success/25 rounded-full blur-xl" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with CLEARED MIND branding - matching PDF style */}
        <header className="px-6 pt-16 pb-8">
          <div className="text-center">
            {/* Logo inspired by the geometric design in PDF */}
            <div className="inline-flex flex-col items-center space-y-4 mb-8">
              <div className="w-20 h-20 relative">
                {/* Geometric logo design */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full" />
                <div className="absolute inset-2 border-2 border-primary/60 rounded-full" />
                <div className="absolute inset-6 bg-primary rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                </div>
              </div>
              <h1 className="font-caslon text-3xl md:text-4xl font-medium text-foreground tracking-wider">
                CLEARED MIND
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-center px-6">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {/* Mission Statement - keeping original content but updating style */}
            <Card className="therapeutic-card gentle-fade-in bg-card/95 backdrop-blur-sm border-border/30">
              <CardContent className="p-8">
                <h2 className="font-caslon text-xl md:text-2xl text-foreground mb-4 leading-relaxed">
                  Comprehensive Health and Wellness, Mental Health, Mindfulness, and Productivity Program
                </h2>
                <p className="text-base text-muted-foreground font-medium">
                  to help you lead a healthier, happier, and more fulfilling life.
                </p>
              </CardContent>
            </Card>

            {/* Large Welcome Message - matching PDF typography */}
            <div className="gentle-fade-in py-12" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-caslon text-6xl md:text-8xl font-medium text-foreground text-shadow-soft">
                WELCOME!
              </h3>
            </div>

            {/* Trust Indicators - simplified design inspired by PDF */}
            <div className="gentle-fade-in grid grid-cols-1 md:grid-cols-3 gap-4" style={{ animationDelay: '0.4s' }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/20 hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-foreground font-medium">HIPAA Compliant</p>
                  <p className="text-muted-foreground text-sm">Your privacy protected</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/20 hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-foreground font-medium">Professional Support</p>
                  <p className="text-muted-foreground text-sm">Licensed therapists available</p>
                </CardContent>
              </Card>
              <Card className="bg-card/60 backdrop-blur-sm border-border/20 hover:bg-card/80 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-2 breathing-animation" />
                  <p className="text-foreground font-medium">Evidence-Based</p>
                  <p className="text-muted-foreground text-sm">Clinically proven methods</p>
                </CardContent>
              </Card>
            </div>

            {/* Get Started Button - matching PDF style */}
            <div className="gentle-fade-in pt-8" style={{ animationDelay: '0.6s' }}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className={`
                  bg-gradient-to-r from-primary to-accent text-primary-foreground
                  rounded-full px-16 py-4 text-lg font-semibold
                  shadow-soft hover:shadow-floating transition-all duration-300
                  ${isAnimating ? 'scale-95' : 'hover:scale-105'}
                `}
              >
                Get Started
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </div>
          </div>
        </main>

        {/* Footer - simplified */}
        <footer className="px-6 pb-8 text-center">
          <p className="text-muted-foreground text-sm">
            Take the first step towards your mental wellness journey
          </p>
        </footer>
      </div>
    </div>
  );
};