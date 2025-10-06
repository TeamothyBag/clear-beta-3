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
    card: "border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 hover:from-primary/20 hover:to-primary/10",
    icon: "bg-primary/25 text-primary shadow-lg shadow-primary/20",
    button: "calming-button",
    glow: "group-hover:shadow-primary/20"
  },
  secondary: {
    card: "border-secondary/30 bg-gradient-to-br from-secondary/15 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10",
    icon: "bg-secondary/25 text-secondary-foreground shadow-lg shadow-secondary/20",
    button: "bg-secondary hover:bg-secondary/90 text-secondary-foreground",
    glow: "group-hover:shadow-secondary/20"
  },
  destructive: {
    card: "border-destructive/30 bg-gradient-to-br from-destructive/15 to-destructive/5 hover:from-destructive/20 hover:to-destructive/10",
    icon: "bg-destructive/25 text-destructive shadow-lg shadow-destructive/20",
    button: "crisis-button",
    glow: "group-hover:shadow-destructive/20"
  },
  warning: {
    card: "border-warning/30 bg-gradient-to-br from-warning/15 to-warning/5 hover:from-warning/20 hover:to-warning/10",
    icon: "bg-warning/25 text-warning-foreground shadow-lg shadow-warning/20",
    button: "bg-warning hover:bg-warning/90 text-warning-foreground",
    glow: "group-hover:shadow-warning/20"
  },
  success: {
    card: "border-success/30 bg-gradient-to-br from-success/15 to-success/5 hover:from-success/20 hover:to-success/10",
    icon: "bg-success/25 text-success shadow-lg shadow-success/20",
    button: "bg-success hover:bg-success/90 text-success-foreground",
    glow: "group-hover:shadow-success/20"
  },
  accent: {
    card: "border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5 hover:from-accent/20 hover:to-accent/10",
    icon: "bg-accent/25 text-accent-foreground shadow-lg shadow-accent/20",
    button: "bg-accent hover:bg-accent/90 text-accent-foreground",
    glow: "group-hover:shadow-accent/20"
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
    }
    // Default action handled by onClick prop or component prop
  };

  return (
    <>
      <div 
        onClick={handleAction}
        className={cn(
          "relative overflow-hidden rounded-3xl p-6 cursor-pointer group",
          "transition-all duration-500 hover:scale-[1.02] active:scale-95",
          "bg-gradient-to-br shadow-lg hover:shadow-2xl border backdrop-blur-sm",
          "hover:-translate-y-1",
          variant.card,
          variant.glow
        )}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700" />
        
        {/* Priority indicator with enhanced design */}
        {priority <= 2 && (
          <div className="absolute top-4 right-4 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/30" />
            <div className="absolute w-6 h-6 border-2 border-primary/30 rounded-full animate-ping" />
          </div>
        )}
        
        {/* Icon with enhanced styling */}
        <div className={cn(
          "flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
          "transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
          "backdrop-blur-sm border border-white/20",
          variant.icon
        )}>
          <Icon className="w-7 h-7" />
        </div>
        
        {/* Content with better typography */}
        <div className="space-y-2">
          <h3 className="font-caslon text-lg font-semibold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            {description}
          </p>
        </div>

        {/* Interactive arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <ArrowRight className="w-5 h-5 text-primary" />
        </div>

        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 group-hover:animate-shimmer" />
      </div>

      {/* Enhanced Modal for component content */}
      {component && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-border/50">
            <DialogHeader className="border-b border-border/20 pb-4">
              <DialogTitle className="font-caslon text-2xl flex items-center space-x-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-2xl",
                  variant.icon
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span>{title}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              {component}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};