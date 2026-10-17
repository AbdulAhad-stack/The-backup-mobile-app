import React, { useState } from 'react';
import { View, Text, Feather } from '../../components/Themed';
import { SettingsPage, Section, Row, ProfileCard, InfoBanner, ConfirmModal } from '../../components/settings/SettingsUI';
import { useAuth } from '../../context/AuthContext';
import { usePrefs } from '../../context/PreferencesContext';
import { roleInfo } from '../../config/roleInfo';
import { showSuccess } from '../../utils/toast';
import { C, RADIUS, SPACE, createStyles } from '../../theme';

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Reads the expiry out of the JWT so the user can see when they will be signed out.
function sessionExpiry(token) {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    if (!exp) return null;
    const d = new Date(exp * 1000);
    if (Number.isNaN(d.getTime())) return null;
    return { text: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`, expired: d.getTime() < Date.now() };
  } catch {
    return null;
  }
}

export default function AccountScreen() {
  const { currentUser, logout } = useAuth();
  const { resetPrefs } = usePrefs();
  const [confirm, setConfirm] = useState(null); // 'signout' | 'reset'
  const info = roleInfo(currentUser?.role);
  const expiry = sessionExpiry(currentUser?.token || '');

  return (
    <SettingsPage>
      <ProfileCard
        initial={(info.label[0] || 'U').toUpperCase()}
        title={info.label}
        subtitle={info.portal}
        chip={`ID ${currentUser?.user_id ?? ''}`}
      />

      <Section title="Account details">
        <Row icon="hash" tint={C.blue} title="User ID" value={String(currentUser?.user_id ?? '—')} />
        <Row icon="briefcase" tint="#6366f1" title="Role" value={info.label} />
        <Row icon="layout" tint="#0ea5e9" title="Portal" value={info.portal} />
      </Section>

      <Section title="Session">
        <Row icon="smartphone" tint="#16a34a" title="This device" value="Signed in" />
        {expiry ? (
          <Row icon="clock" tint="#f59e0b" title="Session expires" value={expiry.text} />
        ) : null}
      </Section>

      <Section title="What you can access" footer="Access is controlled by your role. Contact an administrator if something is missing.">
        <View style={styles.accessCard}>
          {info.blurb ? <Text style={styles.blurb}>{info.blurb}</Text> : null}
          <View style={styles.chips}>
            {info.modules.map((m) => (
              <View key={m} style={styles.moduleChip}>
                <Feather name="check" size={11} color={C.blue} />
                <Text style={styles.moduleText}>{m}</Text>
              </View>
            ))}
          </View>
        </View>
      </Section>

      <Section title="Security">
        <Row icon="lock" tint="#64748b" title="Change password" subtitle="Ask reception or an administrator to reset it" badge="SOON" disabled />
      </Section>

      <Section title="Device" footer="Resetting restores theme, language and alert choices to their defaults. You stay signed in.">
        <Row icon="rotate-ccw" tint="#f59e0b" title="Reset preferences" chevron={false} onPress={() => setConfirm('reset')} />
      </Section>

      <Section>
        <Row icon="log-out" danger title="Sign out" chevron={false} onPress={() => setConfirm('signout')} />
      </Section>

      <ConfirmModal
        visible={confirm === 'signout'}
        title="Sign out?"
        message="You will need to sign in again to access your account on this device."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); logout(); }}
      />
      <ConfirmModal
        visible={confirm === 'reset'}
        title="Reset preferences?"
        message="Theme, language, real-time updates and alert choices will return to their defaults."
        confirmLabel="Reset"
        onCancel={() => setConfirm(null)}
        onConfirm={() => { setConfirm(null); resetPrefs(); showSuccess('Preferences reset'); }}
      />
    </SettingsPage>
  );
}

const styles = createStyles({
  accessCard: { padding: SPACE.lg, gap: SPACE.md },
  blurb: { fontSize: 13.5, color: C.textMuted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moduleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.blueSoft,
    borderWidth: 1, borderColor: '#dbeafe', borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 5,
  },
  moduleText: { fontSize: 12, fontWeight: '600', color: '#1e40af' },
});
