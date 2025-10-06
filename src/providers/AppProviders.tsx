import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { MoodProvider } from '../contexts/MoodContext';
import { MeditationProvider } from '../contexts/MeditationContext';
import { HabitProvider } from '../contexts/HabitContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Toaster } from '../components/ui/toaster';

interface ProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MoodProvider>
          <MeditationProvider>
            <HabitProvider>
              <AnalyticsProvider>
                {children}
                <Toaster />
              </AnalyticsProvider>
            </HabitProvider>
          </MeditationProvider>
        </MoodProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppProviders;