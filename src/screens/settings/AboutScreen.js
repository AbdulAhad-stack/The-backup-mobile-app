import React, { useState } from 'react';
import { Image, Linking, Platform } from 'react-native';
import { View, Text } from '../../components/Themed';
import { SettingsPage, Section, Row, VersionFooter } from '../../components/settings/SettingsUI';
import { APP } from '../../config/appInfo';
import { API_BASE_URL } from '../../api/client';
import { C, SPACE, createStyles } from '../../theme';

const PLATFORM = { android: 'Android', ios: 'iOS', web: 'Web' }[Platform.OS] || Platform.OS;

export default function AboutScreen({ navigation }) {
  const [conn, setConn] = useState({ state: 'idle', text: 'Tap to test' });

  const checkConnection = async () => {
    if (conn.state === 'checking') return;
    setConn({ state: 'checking', text: 'Checking…' });
    const started = Date.now();
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 7000);
    try {
      // Any HTTP answer (even 404/401) proves the server is reachable.
      await fetch(API_BASE_URL, { method: 'GET', mode: 'no-cors', signal: ctrl ? ctrl.signal : undefined });
      setConn({ state: 'ok', text: `Connected · ${Date.now() - started} ms` });
    } catch {
      setConn({ state: 'fail', text: 'Unreachable' });
    } finally {
      clearTimeout(timer);
    }
  };

  return (
    <SettingsPage>
      <View style={styles.hero}>
        <Image source={require('../../../assets/medicare-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.name}>{APP.name}</Text>
        <Text style={styles.tag}>{APP.tagline}</Text>
      </View>

      <Section title="App">
        <Row icon="tag" tint={C.blue} title="Version" value={APP.version} />
        <Row icon="package" tint="#6366f1" title="Build" value={APP.build} />
        <Row icon="cpu" tint="#0ea5e9" title="Platform" value={`${PLATFORM} ${Platform.Version ?? ''}`.trim()} />
        <Row icon="briefcase" tint="#64748b" title="Developer" value="WellMind" />
      </Section>

      <Section title="Service">
        <Row
          icon="wifi"
          tint={conn.state === 'ok' ? '#16a34a' : conn.state === 'fail' ? C.red : '#f59e0b'}
          title="Server connection"
          value={conn.text}
          onPress={checkConnection}
          chevron={false}
        />
      </Section>

      <Section title="Legal & support">
        <Row icon="shield" tint="#0f766e" title="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row icon="file-text" tint="#64748b" title="Terms of Use" onPress={() => navigation.navigate('Terms')} />
        <Row icon="mail" tint={C.blue} title="Contact" subtitle={APP.supportEmail} onPress={() => Linking.openURL(`mailto:${APP.supportEmail}`).catch(() => {})} />
      </Section>

      <VersionFooter />
    </SettingsPage>
  );
}

const styles = createStyles({
  hero: { alignItems: 'center', paddingVertical: SPACE.xl, marginBottom: SPACE.md },
  logo: { width: 84, height: 84 },
  name: { fontSize: 24, fontWeight: '800', color: C.navyMid, marginTop: SPACE.md },
  tag: { fontSize: 13.5, color: C.textMuted, marginTop: 3 },
});
