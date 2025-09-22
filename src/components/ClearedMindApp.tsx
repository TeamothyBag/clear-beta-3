import { useState, useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { AuthScreen } from "./AuthScreen";
import { WellnessApp } from "./WellnessApp";

type AppState = "welcome" | "auth" | "dashboard";

export const ClearedMindApp = () => {
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const [userName, setUserName] = useState<string>("Friend");

  // Auto-advance welcome screen after 3 seconds for demo purposes
  useEffect(() => {
    if (currentState === "welcome") {
      const timer = setTimeout(() => {
        // Uncomment to auto-advance for demo
        // setCurrentState("auth");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentState]);

  const handleGetStarted = () => {
    setCurrentState("auth");
  };

  const handleAuthComplete = () => {
    // In a real app, you would get the user's name from authentication
    setUserName("Alex"); // Sample name
    setCurrentState("dashboard");
  };

  const handleBackToWelcome = () => {
    setCurrentState("welcome");
  };

  switch (currentState) {
    case "welcome":
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
    
    case "auth":
      return (
        <AuthScreen 
          onBack={handleBackToWelcome} 
          onComplete={handleAuthComplete} 
        />
      );
    
    case "dashboard":
      return <WellnessApp />;
    
    default:
      return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }
};