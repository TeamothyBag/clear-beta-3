import { Home, Heart, Brain, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const dockItems = [
  { icon: Home, label: "Home", route: "/", active: true },
  { icon: Heart, label: "Mood", route: "/mood", active: false },
  { icon: Brain, label: "Mindfulness", route: "/meditation", active: false },
  { icon: Calendar, label: "Schedule", route: "/schedule", active: false },
  { icon: User, label: "Profile", route: "/profile", active: false },
];

interface FloatingDockProps {
  activeRoute?: string;
  onNavigate?: (route: string) => void;
}

export const FloatingDock = ({ activeRoute = "/", onNavigate }: FloatingDockProps) => {
  const handleItemClick = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-lg border border-border/50 rounded-full px-2 py-2 shadow-2xl">
        <div className="flex items-center space-x-1">
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <button
                key={index}
                onClick={() => handleItemClick(item.route)}
                className={cn(
                  "relative p-3 rounded-full transition-all duration-300 hover:scale-110",
                  "hover:bg-primary/10 active:scale-95",
                  isActive 
                    ? "bg-primary/20 text-primary shadow-md" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                )}
                
                {/* Enhanced Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg text-xs text-foreground opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100 whitespace-nowrap shadow-lg">
                  {item.label}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-border/50" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};