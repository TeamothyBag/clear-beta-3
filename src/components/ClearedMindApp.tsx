import React, { useState, useEffect } from "react";
import { WelcomeScreen } from "./WelcomeScreen";
import { AuthScreen } from "./AuthScreen";
import { WellnessApp } from "./WellnessApp";
import { useAuth } from "../contexts/AuthContext";

type AppState = "welcome" | "auth" | "dashboard";

export const ClearedMindApp = () => {
  const [currentState, setCurrentState] = useState<AppState>("welcome");
  const { state: authState, checkAuthStatus } = useAuth();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Update app state based on authentication
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      setCurrentState("dashboard");
    } else if (currentState === "dashboard") {
      setCurrentState("welcome");
    }
  }, [authState.isAuthenticated, authState.user, currentState]);

  // Auto-advance welcome screen after 3 seconds for demo purposes
  useEffect(() => {
    if (currentState === "welcome" && !authState.isAuthenticated) {
      const timer = setTimeout(() => {
        // Uncomment to auto-advance for demo
        // setCurrentState("auth");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentState, authState.isAuthenticated]);

  const handleGetStarted = () => {
    setCurrentState("auth");
  };

  const handleAuthComplete = () => {
    // Authentication is handled by the AuthContext
    // The useEffect above will automatically update the state
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