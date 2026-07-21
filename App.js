import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ProjectProvider } from './src/context/ProjectContext';
import { TaskProvider } from './src/context/TaskContext';
import { WorkerProvider } from './src/context/WorkerContext';
import { AttendanceProvider } from './src/context/AttendanceContext';
import { AnalyticsProvider } from './src/context/AnalyticsContext';
import { DashboardProvider } from './src/context/DashboardContext';
import { MaterialProvider } from './src/context/MaterialContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProjectProvider>
          <TaskProvider>
            <WorkerProvider>
              <AttendanceProvider>
                <DashboardProvider autoLoad={false}>
                  <AnalyticsProvider autoLoad={false}>
                    <MaterialProvider>
                      <NavigationContainer>
                        <AppNavigator />
                      </NavigationContainer>
                    </MaterialProvider>
                  </AnalyticsProvider>
                </DashboardProvider>
              </AttendanceProvider>
            </WorkerProvider>
          </TaskProvider>
        </ProjectProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
