import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastHost } from './src/utils/toast';
import BrandIntro from './src/components/BrandIntro';
import LoginScreen from './src/screens/LoginScreen';
import PatientTabs from './src/navigation/PatientTabs';
import DoctorTabs from './src/navigation/DoctorTabs';
import AdminTabs from './src/navigation/AdminTabs';
import ReceptionTabs from './src/navigation/ReceptionTabs';
import PharmacyTabs from './src/navigation/PharmacyTabs';
import LabTabs from './src/navigation/LabTabs';
import UnsupportedRoleScreen from './src/screens/UnsupportedRoleScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

const ROLE_SCREENS = {
  Patient: PatientTabs,
  Doctor: DoctorTabs,
  admin: AdminTabs,
  receptionist: ReceptionTabs,
  staff: ReceptionTabs,
  pharmacist: PharmacyTabs,
  lab_technician: LabTabs,
};

function RootNavigator() {
  const { isAuthenticated, currentUser } = useAuth();
  const RoleScreen = currentUser ? ROLE_SCREENS[currentUser.role] : null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : RoleScreen ? (
          <Stack.Screen name="RoleHome" component={RoleScreen} />
        ) : (
          <Stack.Screen name="Unsupported" component={UnsupportedRoleScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AppShell() {
  const { loading } = useAuth();
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  const finishIntro = useCallback(() => setIntroDone(true), []);

  if (loading) return null;

  return (
    <>
      <RootNavigator />
      {!introDone && <BrandIntro onDone={finishIntro} />}
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" />
        <AppShell />
        <ToastHost />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
