import React from 'react';
import { Linking } from 'react-native';
import { View, Text } from '../../components/Themed';
import { SettingsPage, Section, Row } from '../../components/settings/SettingsUI';
import { PRIVACY_POLICY, TERMS } from '../../config/legalContent';
import { APP } from '../../config/appInfo';
import { C, RADIUS, SPACE, createStyles } from '../../theme';

function Document({ doc }) {
  return (
    <>
      <View style={styles.head}>
        <Text style={styles.title}>{doc.title}</Text>
        <View style={styles.updated}><Text style={styles.updatedText}>Last updated {doc.updated}</Text></View>
        <Text style={styles.intro}>{doc.intro}</Text>
      </View>

      {doc.sections.map((s) => (
        <View key={s.h} style={styles.block}>
          <Text style={styles.h}>{s.h}</Text>
          {(s.p || []).map((para, i) => <Text key={i} style={styles.p}>{para}</Text>)}
          {(s.bullets || []).map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.dot} />
              <Text style={styles.bullet}>{b}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function makeScreen(doc) {
  return function LegalScreen() {
    return (
      <SettingsPage>
        <Document doc={doc} />
        <Section>
          <Row icon="mail" tint={C.blue} title="Questions? Contact us" subtitle={APP.supportEmail} onPress={() => Linking.openURL(`mailto:${APP.supportEmail}`).catch(() => {})} />
        </Section>
      </SettingsPage>
    );
  };
}

export const PrivacyPolicyScreen = makeScreen(PRIVACY_POLICY);
export const TermsScreen = makeScreen(TERMS);

const styles = createStyles({
  head: { marginBottom: SPACE.xl },
  title: { fontSize: 24, fontWeight: '800', color: C.navyMid },
  updated: { alignSelf: 'flex-start', backgroundColor: C.faint, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 },
  updatedText: { fontSize: 11.5, fontWeight: '600', color: C.textMuted },
  intro: { fontSize: 14, color: C.textMuted, lineHeight: 21, marginTop: SPACE.md },
  block: { marginBottom: SPACE.xl },
  h: { fontSize: 15.5, fontWeight: '800', color: C.text, marginBottom: 8 },
  p: { fontSize: 13.5, color: C.textMuted, lineHeight: 21, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 7, paddingRight: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.blue, marginTop: 8 },
  bullet: { flex: 1, fontSize: 13.5, color: C.textMuted, lineHeight: 21 },
});
