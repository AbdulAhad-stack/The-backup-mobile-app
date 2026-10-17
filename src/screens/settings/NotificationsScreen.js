import React from 'react';
import { SettingsPage, Section, SwitchRow, InfoBanner } from '../../components/settings/SettingsUI';
import { usePrefs } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { roleInfo } from '../../config/roleInfo';

export default function NotificationsScreen() {
  const { currentUser } = useAuth();
  const { prefs, setLiveUpdates, setNotify } = usePrefs();
  const info = roleInfo(currentUser?.role);

  return (
    <SettingsPage>
      <Section
        title="Real-time"
        footer="When off, screens no longer refresh by themselves — pull down on a screen to refresh manually. Takes effect immediately."
      >
        <SwitchRow
          icon="zap"
          tint="#f59e0b"
          title="Real-time updates"
          subtitle="Keep data in sync the moment something changes"
          value={prefs.liveUpdates}
          onValueChange={setLiveUpdates}
        />
      </Section>

      <Section
        title={`${info.label} alerts`}
        footer="Alert choices are saved on this device and are used when push notifications are enabled for your account."
      >
        {info.notify.map((n) => (
          <SwitchRow
            key={n.key}
            title={n.title}
            subtitle={n.subtitle}
            value={prefs.notify[n.key] !== false}
            onValueChange={(v) => setNotify(n.key, v)}
          />
        ))}
      </Section>

      <InfoBanner icon="info">
        Your device’s system settings control whether MediCare may show alerts outside the app.
      </InfoBanner>
    </SettingsPage>
  );
}
