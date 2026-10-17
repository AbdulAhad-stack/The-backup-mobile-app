import React, { useState } from 'react';
import { Text } from '../../components/Themed';
import { SettingsPage, Section, Row, ProfileCard, ConfirmModal, VersionFooter } from '../../components/settings/SettingsUI';
import { useAuth } from '../../context/AuthContext';
import { useAppearance } from '../../context/AppearanceContext';
import { usePrefs } from '../../context/PreferencesContext';
import { roleInfo, hasFeedbackAndHelp } from '../../config/roleInfo';
import { C } from '../../theme';

export default function SettingsHomeScreen({ navigation }) {
  const { currentUser, logout } = useAuth();
  const { prefs } = usePrefs();
  const { appearance } = useAppearance();
  const [confirmOut, setConfirmOut] = useState(false);
  const info = roleInfo(currentUser?.role);
  const patient = hasFeedbackAndHelp(currentUser?.role);
  const userId = String(currentUser?.user_id ?? '');

  return (
    <SettingsPage>
      <ProfileCard
        initial={(info.label[0] || 'U').toUpperCase()}
        title={info.portal}
        subtitle={`ID: ${userId}`}
        chip={info.label.toUpperCase()}
      />

      <Section title="Preferences">
        <Row icon="moon" tint="#6366f1" title="Appearance" value={appearance} onPress={() => navigation.navigate('Appearance')} />
        <Row icon="globe" tint="#0ea5e9" title="Language" value="English" onPress={() => navigation.navigate('Language')} />
        <Row icon="bell" tint="#f59e0b" title="Notifications" value={prefs.liveUpdates ? 'On' : 'Off'} onPress={() => navigation.navigate('Notifications')} />
      </Section>

      <Section title="Account">
        <Row icon="user" tint={C.blue} title="Account & access" subtitle="Profile, session and what you can do" onPress={() => navigation.navigate('Account')} />
      </Section>

      {patient ? (
        <Section title="Support">
          <Row icon="help-circle" tint="#16a34a" title="Help & Support" subtitle="FAQs and contact options" onPress={() => navigation.navigate('HelpSupport')} />
          <Row icon="message-square" tint="#7c3aed" title="Send feedback" subtitle="Tell us how we can improve" onPress={() => navigation.navigate('Feedback')} />
        </Section>
      ) : null}

      <Section title="About & legal">
        <Row icon="shield" tint="#0f766e" title="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row icon="file-text" tint="#64748b" title="Terms of Use" onPress={() => navigation.navigate('Terms')} />
        <Row icon="info" tint="#2563eb" title="About MediCare" onPress={() => navigation.navigate('About')} />
      </Section>

      <Section>
        <Row icon="log-out" danger title="Sign out" chevron={false} onPress={() => setConfirmOut(true)} />
      </Section>

      <VersionFooter />

      <ConfirmModal
        visible={confirmOut}
        title="Sign out?"
        message="You will need to sign in again to access your account on this device."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirmOut(false)}
        onConfirm={() => { setConfirmOut(false); logout(); }}
      />
    </SettingsPage>
  );
}
