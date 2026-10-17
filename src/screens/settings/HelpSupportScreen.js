import React, { useState } from 'react';
import { Linking } from 'react-native';
import { View, Text, TouchableOpacity, Feather } from '../../components/Themed';
import { SettingsPage, Section, Row, InfoBanner } from '../../components/settings/SettingsUI';
import { APP } from '../../config/appInfo';
import { FAQS } from '../../config/legalContent';
import { showError } from '../../utils/toast';
import { C, SPACE, createStyles } from '../../theme';

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity style={styles.q} onPress={() => setOpen((o) => !o)} activeOpacity={0.6} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.qText}>{q}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.muted} />
      </TouchableOpacity>
      {open ? <Text style={styles.a}>{a}</Text> : null}
    </View>
  );
}

export default function HelpSupportScreen({ navigation }) {
  const open = async (url) => {
    try { await Linking.openURL(url); } catch { showError('Could not open this on your device.'); }
  };

  return (
    <SettingsPage>
      <InfoBanner icon="alert-triangle" tone="warn">
        For a medical emergency call your local emergency number or go to the nearest hospital. This app is not monitored for emergencies.
      </InfoBanner>

      <Section title="Contact us" footer={`Support hours: ${APP.supportHours}`}>
        <Row icon="phone" tint="#16a34a" title="Call support" subtitle={APP.supportPhone} onPress={() => open(`tel:${APP.supportPhone.replace(/\s/g, '')}`)} />
        <Row icon="mail" tint={C.blue} title="Email support" subtitle={APP.supportEmail} onPress={() => open(`mailto:${APP.supportEmail}?subject=${encodeURIComponent('MediCare support request')}`)} />
        <Row icon="message-square" tint="#7c3aed" title="Report a problem" subtitle="Send us details from inside the app" onPress={() => navigation.navigate('Feedback', { category: 'Bug report' })} />
      </Section>

      <Section title="Frequently asked questions">
        {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
      </Section>

      <Section title="More">
        <Row icon="shield" tint="#0f766e" title="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row icon="file-text" tint="#64748b" title="Terms of Use" onPress={() => navigation.navigate('Terms')} />
      </Section>
    </SettingsPage>
  );
}

const styles = createStyles({
  q: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 14 },
  qText: { flex: 1, fontSize: 14.5, fontWeight: '600', color: C.text, lineHeight: 20 },
  a: { fontSize: 13.5, color: C.textMuted, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14, marginTop: -4 },
});
