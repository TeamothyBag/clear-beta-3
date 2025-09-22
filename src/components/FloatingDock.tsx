import { Home, Heart, Brain, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const dockItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Heart, label: "Mood", active: false },
  { icon: Brain, label: "Mindfulness", active: false },
  { icon: Calendar, label: "Schedule", active: false },
  { icon: User, label: "Profile", active: false },
];

export const FloatingDock = () => {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/90 backdrop-blur-lg border border-border/50 rounded-full px-2 py-2 shadow-2xl">
        <div className="flex items-center space-x-1">
          {dockItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={cn(
                  "relative p-3 rounded-full transition-all duration-300 hover:scale-110",
                  "hover:bg-primary/10 active:scale-95",
                  item.active 
                    ? "bg-primary/20 text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.active && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
                
                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-card/90 backdrop-blur-sm border border-border/50 rounded-md text-xs text-foreground opacity-0 pointer-events-none transition-opacity duration-200 hover:opacity-100 whitespace-nowrap">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};