import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LucideIcon, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WellnessCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "destructive" | "warning" | "success" | "accent";
  category: string;
  priority: number;
  component?: React.ReactNode;
  onClick?: () => void;
}

const colorVariants = {
  primary: {
    card: "border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10",
    icon: "bg-primary/20 text-primary",
    button: "calming-button"
  },
  secondary: {
    card: "border-secondary/20 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/15 hover:to-secondary/10",
    icon: "bg-secondary/20 text-secondary-foreground",
    button: "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
  },
  destructive: {
    card: "border-destructive/20 bg-gradient-to-br from-destructive/10 to-destructive/5 hover:from-destructive/15 hover:to-destructive/10",
    icon: "bg-destructive/20 text-destructive",
    button: "crisis-button"
  },
  warning: {
    card: "border-warning/20 bg-gradient-to-br from-warning/10 to-warning/5 hover:from-warning/15 hover:to-warning/10",
    icon: "bg-warning/20 text-warning-foreground",
    button: "bg-warning hover:bg-warning/90 text-warning-foreground"
  },
  success: {
    card: "border-success/20 bg-gradient-to-br from-success/10 to-success/5 hover:from-success/15 hover:to-success/10",
    icon: "bg-success/20 text-success",
    button: "bg-success hover:bg-success/90 text-success-foreground"
  },
  accent: {
    card: "border-accent/20 bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/15 hover:to-accent/10",
    icon: "bg-accent/20 text-accent-foreground",
    button: "bg-accent hover:bg-accent/90 text-accent-foreground"
  }
};

export const WellnessCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  category,
  priority,
  component,
  onClick 
}: WellnessCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const variant = colorVariants[color];

  const handleAction = () => {
    if (component) {
      setIsOpen(true);
    } else if (onClick) {
      onClick();
    } else {
      // Default action - could navigate or show content
      console.log(`Opening ${title}`);
    }
  };

  return (
    <>
      <div 
        onClick={handleAction}
        className={cn(
          "relative overflow-hidden rounded-3xl p-4 cursor-pointer group",
          "transition-all duration-300 hover:scale-105 active:scale-95",
          "bg-gradient-to-br shadow-lg hover:shadow-xl",
          variant.card
        )}
      >
        {/* Priority indicator */}
        {priority <= 2 && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
        )}
        
        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-2xl mb-3",
          "transition-all duration-300 group-hover:scale-110 group-hover:rotate-6",
          variant.icon
        )}>
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Content */}
        <div>
          <h3 className="font-caslon text-base font-semibold text-foreground mb-1 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-white" />
      </div>

      {/* Modal for component content */}
      {component && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-caslon text-2xl flex items-center">
                <Icon className="w-6 h-6 mr-3 text-primary" />
                {title}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6">
              {component}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};