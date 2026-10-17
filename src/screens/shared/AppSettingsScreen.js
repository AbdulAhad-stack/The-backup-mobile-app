import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch, ScrollView, Linking } from 'react-native';
import { Text, TextInput } from '../../components/AppText';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedTouchable from '../../components/animated/AnimatedTouchable';
import BottomSheet from '../../components/BottomSheet';
import { useAuth } from '../../context/AuthContext';
import { PRIVACY, TERMS, FAQS, APP_VERSION, APP_BUILD, COPYRIGHT } from '../../content/settingsContent';
import { C, RADIUS, SPACE, SHADOW } from '../../theme';
import { useAppearance } from '../../context/AppearanceContext';

const ROLE_LABEL = {
  Patient: 'PATIENT', Doctor: 'PHYSICIAN', admin: 'ADMIN', staff: 'STAFF', lab_technician: 'LAB TECHNICIAN',
};

const sessionExpiry = (token) => {
  try {
    const exp = JSON.parse(atob(token.split('.')[1])).exp;
    return exp ? new Date(exp * 1000).toLocaleString() : null;
  } catch { return null; }
};

function Row({ icon, tint, label, sub, value, onPress, danger, last }) {
  return (
    <AnimatedTouchable onPress={onPress} scaleTo={0.98} style={[styles.row, !last && styles.rowDivider]}>
      <View style={[styles.rowIcon, { backgroundColor: tint }]}>
        <Feather name={icon} size={18} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: '#dc2626' }]}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {!danger && <Feather name="chevron-right" size={18} color={C.muted} />}
    </AnimatedTouchable>
  );
}

const Section = ({ title, children }) => (
  <View style={{ marginBottom: SPACE.xl }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.group}>{children}</View>
  </View>
);

function Choice({ label, selected, disabled, note, onPress }) {
  return (
    <AnimatedTouchable onPress={disabled ? undefined : onPress} scaleTo={0.98} style={[styles.choice, selected && styles.choiceOn, disabled && { opacity: 0.5 }]}>
      <Text style={[styles.choiceText, selected && { color: C.navyMid }]}>{label}</Text>
      {note ? <Text style={styles.choiceNote}>{note}</Text> : null}
      {selected && <Feather name="check" size={18} color={C.blue} />}
    </AnimatedTouchable>
  );
}

const TextBlock = ({ items }) => items.length === 0
  ? <Text style={styles.blockBody}>Not available yet.</Text>
  : items.map(([h, b]) => (
  <View key={h} style={{ marginBottom: SPACE.md }}>
    <Text style={styles.blockHead}>{h}</Text>
    <Text style={styles.blockBody}>{b}</Text>
  </View>
));

export default function SettingsScreen({ route, navigation }) {
  const { logout, currentUser } = useAuth();
  const theme = useAppearance();
  const colors = theme?.colors || C;
  styles = makeStyles(colors);
  const portalName = route?.params?.portalName || 'MediCare';
  const userId = currentUser?.user_id || '';
  const role = currentUser?.role || '';

  const [sheet, setSheet] = useState(null);
  const [feedback, setFeedback] = useState('');
  const appearance = theme?.appearance || 'Light';
  const setAppearance = theme?.changeAppearance || (() => {});
  const [language, setLanguage] = useState('English');
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['pref:language', 'pref:notifications']).then((pairs) => {
      const m = Object.fromEntries(pairs);
      if (m['pref:language']) setLanguage(m['pref:language']);
      if (m['pref:notifications']) setNotifications(m['pref:notifications'] === 'on');
    }).catch(() => {});
  }, []);

  const save = (key, value, setter) => { setter(value); AsyncStorage.setItem(key, value).catch(() => {}); };
  const toggleNotifications = (on) => { setNotifications(on); AsyncStorage.setItem('pref:notifications', on ? 'on' : 'off').catch(() => {}); };
  const expiry = sessionExpiry(currentUser?.token || '');
  const close = () => setSheet(null);
  const sections = (navigation?.getState?.().routeNames || []).filter((n) => n !== 'Settings');

  return (
    <View style={styles.flex}>
    <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(portalName[0] || 'M').toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroName} numberOfLines={1}>{portalName}</Text>
          <Text style={styles.heroId}>ID: {userId}</Text>
          <View style={styles.chip}><Text style={styles.chipText}>{ROLE_LABEL[role] || String(role).toUpperCase()}</Text></View>
        </View>
      </View>

      <Section title="PREFERENCES">
        <Row icon="moon" tint="#6366f1" label="Appearance" value={appearance} onPress={() => setSheet('appearance')} />
        <Row icon="globe" tint="#0ea5e9" label="Language" value={language} onPress={() => setSheet('language')} />
        <Row icon="bell" tint="#f59e0b" label="Notification preference" sub="Local preference only; push delivery is not configured" value={notifications ? 'On' : 'Off'} onPress={() => setSheet('notifications')} last />
      </Section>

      <Section title="ACCOUNT">
        <Row icon="user" tint="#5b5fc7" label="Account & access" sub="Profile, session and what you can do" onPress={() => setSheet('account')} last />
      </Section>

      <Section title="SUPPORT">
        <Row icon="help-circle" tint="#16a34a" label="Help & Support" sub="FAQs and contact options" onPress={() => setSheet('help')} />
        <Row icon="message-square" tint="#7c3aed" label="Send feedback" sub="Tell us how we can improve" onPress={() => setSheet('feedback')} last />
      </Section>

      <Section title="ABOUT & LEGAL">
        <Row icon="shield" tint="#0f766e" label="Privacy Policy" onPress={() => setSheet('privacy')} />
        <Row icon="file-text" tint="#64748b" label="Terms of Use" onPress={() => setSheet('terms')} />
        <Row icon="info" tint="#5b5fc7" label="About MediCare" onPress={() => setSheet('about')} last />
      </Section>

      <View style={styles.group}>
        <Row icon="log-out" tint="#dc2626" label="Sign out" onPress={logout} danger last />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerName}>MediCare</Text>
        <Text style={styles.footerLine}>Version {APP_VERSION} (build {APP_BUILD})</Text>
        <Text style={styles.footerSmall}>{COPYRIGHT}</Text>
      </View>
    </ScrollView>

      <BottomSheet visible={sheet === 'appearance'} onClose={close} title="Appearance" icon="moon">
        <Text style={styles.sectionTitle}>THEME</Text>
        <View style={styles.themeRow}>
          {[['Light', false, false], ['Dark', true, false], ['System', false, false]].map(([name, dark, soon]) => {
            const selected = appearance === name;
            return (
              <AnimatedTouchable
                key={name}
                scaleTo={0.97}
                disabled={soon}
                onPress={() => { setAppearance(name); close(); }}
                style={[styles.themeCard, selected && styles.themeCardOn, soon && { opacity: 0.55 }]}
              >
                {name === 'System' ? (
                  <View style={styles.systemPreview}>
                    <View style={[styles.systemHalf, { backgroundColor: '#f4f5fd' }]}>
                      <View style={[styles.systemBar, { backgroundColor: '#4b4e96' }]} />
                      <View style={[styles.systemLine, { backgroundColor: '#cbd5e1', width: '85%' }]} />
                      <View style={[styles.systemLine, { backgroundColor: '#cbd5e1', width: '60%' }]} />
                    </View>
                    <View style={[styles.systemHalf, { backgroundColor: '#101426' }]}>
                      <View style={[styles.systemBar, { backgroundColor: '#242b57' }]} />
                      <View style={[styles.systemLine, { backgroundColor: '#3b4360', width: '85%' }]} />
                      <View style={[styles.systemLine, { backgroundColor: '#3b4360', width: '60%' }]} />
                    </View>
                  </View>
                ) : (
                  <View style={[styles.themePreview, dark && { backgroundColor: '#0b1020' }]}>
                    <View style={[styles.themeBar, dark && { backgroundColor: '#1b2340' }]} />
                    <View style={[styles.themeLine, dark && { backgroundColor: '#2a3355' }]} />
                    <View style={[styles.themeLine, { width: '55%' }, dark && { backgroundColor: '#2a3355' }]} />
                  </View>
                )}
                <View style={styles.themeLabelRow}>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected && <Feather name="check" size={11} color="#fff" />}
                  </View>
                  <Text style={[styles.themeLabel, selected && { color: C.blue }]}>{name}</Text>
                </View>
                {soon ? <Text style={styles.choiceNote}>Coming soon</Text> : null}
              </AnimatedTouchable>
            );
          })}
        </View>
        <Text style={[styles.blockBody, { marginTop: SPACE.md }]}>
          {appearance === 'System' ? 'Follows your device theme automatically.' : `${appearance} mode selected.`} Your choice is saved on this device.
        </Text>
      </BottomSheet>

      <BottomSheet visible={sheet === 'language'} onClose={close} title="Language" icon="globe">
        <Choice label="English" selected={language === 'English'} onPress={() => { save('pref:language', 'English', setLanguage); close(); }} />
        <Choice label="اردو (Urdu)" note="Coming soon" disabled />
      </BottomSheet>

      <BottomSheet visible={sheet === 'notifications'} onClose={close} title="Notifications" icon="bell">
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.blockHead}>Push notifications</Text>
            <Text style={styles.blockBody}>Save your alert preference. Push delivery requires a notification service.</Text>
          </View>
          <Switch value={notifications} onValueChange={toggleNotifications} trackColor={{ true: C.blue }} />
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'account'} onClose={close} title="Account & access" icon="user">
        <Text style={styles.blockHead}>Profile</Text>
        <View style={styles.kv}><Text style={styles.k}>User ID</Text><Text style={styles.v}>{userId}</Text></View>
        <View style={styles.kv}><Text style={styles.k}>Role</Text><Text style={styles.v}>{ROLE_LABEL[role] || role}</Text></View>
        <View style={styles.kv}><Text style={styles.k}>Portal</Text><Text style={styles.v}>{portalName}</Text></View>
        <Text style={[styles.blockHead, { marginTop: SPACE.lg }]}>Session</Text>
        <View style={styles.kv}><Text style={styles.k}>Status</Text><Text style={[styles.v, { color: C.green }]}>Signed in</Text></View>
        {expiry ? <View style={styles.kv}><Text style={styles.k}>Expires</Text><Text style={styles.v}>{expiry}</Text></View> : null}
        <Text style={[styles.blockHead, { marginTop: SPACE.lg }]}>Sections you can open</Text>
        {sections.map((t) => (
          <View key={t} style={styles.bullet}><Feather name="check-circle" size={15} color={C.green} /><Text style={styles.blockBody}>{t}</Text></View>
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === 'help'} onClose={close} title="Help & Support" icon="help-circle">
        <TextBlock items={FAQS} />
      </BottomSheet>

      <BottomSheet visible={sheet === 'feedback'} onClose={close} title="Send feedback" icon="message-square">
        <Text style={[styles.blockBody, { marginBottom: SPACE.md }]}>Tell us what works and what doesn't.</Text>
        <TextInput
          value={feedback}
          onChangeText={setFeedback}
          placeholder="Write your feedback here"
          placeholderTextColor={C.muted}
          multiline
          style={styles.feedbackInput}
        />
        <AnimatedTouchable
          onPress={() => {
            Linking.openURL(`mailto:?subject=${encodeURIComponent('MediCare feedback')}&body=${encodeURIComponent(feedback)}`).then(() => { setFeedback(''); close(); }).catch(() => {});
          }}
          disabled={!feedback.trim()}
          style={[styles.sendBtn, !feedback.trim() && { opacity: 0.5 }]}
        >
          <Feather name="send" size={16} color="#fff" />
          <Text style={styles.sendText}>Send feedback</Text>
        </AnimatedTouchable>
      </BottomSheet>

      <BottomSheet visible={sheet === 'privacy'} onClose={close} title="Privacy Policy" icon="shield"><TextBlock items={PRIVACY} /></BottomSheet>
      <BottomSheet visible={sheet === 'terms'} onClose={close} title="Terms of Use" icon="file-text"><TextBlock items={TERMS} /></BottomSheet>
      <BottomSheet visible={sheet === 'about'} onClose={close} title="About MediCare" icon="info">
        <Text style={styles.blockHead}>MediCare</Text>
        <Text style={styles.blockBody}>Version {APP_VERSION} (build {APP_BUILD})</Text>
        <Text style={[styles.blockBody, { marginTop: SPACE.sm }]}>{COPYRIGHT}</Text>
      </BottomSheet>
    </View>
  );
}

let styles;
const makeStyles = (C) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.navyMid,
    borderRadius: RADIUS.xl, padding: SPACE.xl, marginBottom: SPACE.xl,
  },
  avatar: {
    width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  heroName: { color: '#fff', fontWeight: '800', fontSize: 19 },
  heroId: { color: 'rgba(255,255,255,0.7)', fontSize: 13.5, marginTop: 2 },
  chip: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: RADIUS.pill, paddingVertical: 4, paddingHorizontal: 12, marginTop: 8 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  sectionTitle: { color: C.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: SPACE.sm, marginLeft: 4 },
  group: { backgroundColor: C.white, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border, overflow: 'hidden', ...SHADOW.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: SPACE.lg },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: C.faint },
  rowIcon: { width: 42, height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '700', color: C.text },
  rowSub: { fontSize: 13, color: C.textMuted, marginTop: 2 },
  rowValue: { fontSize: 14, color: C.textMuted },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, marginBottom: SPACE.sm },
  choiceOn: { backgroundColor: C.blueSoft, borderColor: C.blue },
  choiceText: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  choiceNote: { fontSize: 12, color: C.muted },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  blockHead: { fontSize: 14.5, fontWeight: '700', color: C.navyMid, marginBottom: 4 },
  blockBody: { fontSize: 13.5, color: C.textMuted, lineHeight: 20, flexShrink: 1 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.faint },
  k: { fontSize: 13, color: C.textMuted },
  v: { fontSize: 13, fontWeight: '700', color: C.text, flexShrink: 1, textAlign: 'right' },
  footer: { alignItems: 'center', marginTop: SPACE.xl, gap: 3 },
  footerName: { fontWeight: '800', fontSize: 14, color: C.text },
  footerLine: { fontSize: 12.5, color: C.textMuted },
  footerSmall: { fontSize: 11.5, color: C.muted, textAlign: 'center' },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeCard: { flex: 1, alignItems: 'center', gap: 8, padding: 6, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: C.border },
  themeCardOn: { borderColor: C.blue, backgroundColor: C.blueSoft },
  themePreview: { width: '100%', height: 78, borderRadius: RADIUS.sm, backgroundColor: '#f4f5fd', overflow: 'hidden', padding: 6, gap: 6 },
  systemPreview: { width: '100%', height: 78, borderRadius: RADIUS.sm, overflow: 'hidden', flexDirection: 'row' },
  systemHalf: { flex: 1, padding: 5, gap: 6 },
  systemBar: { height: 12, borderRadius: 3, marginHorizontal: -5, marginTop: -5, marginBottom: 2 },
  systemLine: { height: 5, borderRadius: 3 },
  themeBar: { height: 14, borderRadius: 4, backgroundColor: C.navyMid, marginHorizontal: -6, marginTop: -6, marginBottom: 2 },
  themeLine: { height: 8, borderRadius: 4, backgroundColor: '#dcdff3', width: '85%' },
  themeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  themeLabel: { fontSize: 13, fontWeight: '700', color: C.text },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: C.muted, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: C.blue, borderColor: C.blue },
  feedbackInput: {
    minHeight: 110, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.md, padding: 12,
    textAlignVertical: 'top', color: C.text, fontSize: 14, backgroundColor: C.bg,
  },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: SPACE.md,
    backgroundColor: C.blue, borderRadius: RADIUS.md, paddingVertical: 13,
  },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14.5 },
  bullet: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 8 },
});
