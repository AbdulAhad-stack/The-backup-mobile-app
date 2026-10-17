import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { hasFeedbackAndHelp } from '../config/roleInfo';
import { themed } from '../theme';
import { useAppearance } from '../context/AppearanceContext';
import SettingsHomeScreen from '../screens/settings/SettingsHomeScreen';
import AppearanceScreen from '../screens/settings/AppearanceScreen';
import LanguageScreen from '../screens/settings/LanguageScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import AccountScreen from '../screens/settings/AccountScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import { PrivacyPolicyScreen, TermsScreen } from '../screens/settings/LegalScreen';

const Stack = createNativeStackNavigator();

// One Settings area shared by every role. Role-specific pieces (feedback and
// help & support are patient-only) are decided here and in SettingsHomeScreen.
export default function SettingsNavigator() {
  const { currentUser } = useAuth();
  const patient = hasFeedbackAndHelp(currentUser?.role);
  const { colors } = useAppearance();

  return (
    <ErrorBoundary>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: '#fff',
          headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontWeight: 'normal' },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: themed().bg },
        }}
      >
        <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="Appearance" component={AppearanceScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account & access' }} />
        {patient ? <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Send feedback' }} /> : null}
        {patient ? <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} /> : null}
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Use' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      </Stack.Navigator>
    </ErrorBoundary>
  );
}
