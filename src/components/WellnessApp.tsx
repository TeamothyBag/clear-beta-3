import { useState } from "react";
import { FloatingDock } from "./FloatingDock";
import { Dashboard } from "./Dashboard";
import { DetailedMoodView } from "./DetailedMoodView";
import { DetailedMeditationView } from "./DetailedMeditationView";
import { WellnessScheduleView } from "./WellnessScheduleView";
import { ProfileSettingsView } from "./ProfileSettingsView";
import { CrisisSupport } from "./CrisisSupport";

export const WellnessApp = () => {
  const [currentRoute, setCurrentRoute] = useState("/");
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);

  const handleNavigation = (route: string) => {
    setCurrentRoute(route);
    setShowCrisisSupport(false);
  };

  const handleCrisisSupport = () => {
    setShowCrisisSupport(true);
  };

  const renderCurrentView = () => {
    if (showCrisisSupport) {
      return <CrisisSupport />;
    }

    switch (currentRoute) {
      case "/mood":
        return <DetailedMoodView />;
      case "/meditation":
        return <DetailedMeditationView />;
      case "/schedule":
        return <WellnessScheduleView />;
      case "/profile":
        return <ProfileSettingsView />;
      default:
        return <Dashboard onCrisisSupport={handleCrisisSupport} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {renderCurrentView()}
      
      {/* Crisis Support Quick Access */}
      {/* {!showCrisisSupport && (
        <button
          onClick={handleCrisisSupport}
          className="fixed top-4 right-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40"
        >
          Crisis Support
        </button>
      )} */}

      {/* Back Button for Crisis Support */}
      {showCrisisSupport && (
        <button
          onClick={() => setShowCrisisSupport(false)}
          className="fixed top-4 left-4 bg-card text-foreground px-3 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-40 border border-border"
        >
          ← Back
        </button>
      )}
      
      {/* Floating Dock Navigation */}
      {!showCrisisSupport && (
        <FloatingDock 
          activeRoute={currentRoute} 
          onNavigate={handleNavigation} 
        />
      )}
    </div>
  );
};