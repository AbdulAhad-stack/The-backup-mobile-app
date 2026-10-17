import React from 'react';
import { View, TouchableOpacity, Feather } from '../components/Themed';
import { Text } from '../components/AppText';
import { useAuth } from '../context/AuthContext';
import { C, SPACE, RADIUS, createStyles } from '../theme';

export default function UnsupportedRoleScreen() {
  const { currentUser, logout } = useAuth();
  return (
    <View style={styles.wrap}>
      <Feather name="smartphone" size={48} color={C.muted} />
      <Text style={styles.title}>Mobile dashboard coming soon</Text>
      <Text style={styles.sub}>
        The "{currentUser?.role}" portal hasn't been built for mobile yet — this pilot currently
        covers the Patient experience only. Use the web portal for this role in the meantime.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = createStyles({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACE.xxl, gap: 12, backgroundColor: C.bg },
  title: { fontWeight: '700', fontSize: 18, color: C.text, textAlign: 'center' },
  sub: { fontSize: 13.5, color: C.textMuted, textAlign: 'center', lineHeight: 20 },
  btn: { marginTop: 10, backgroundColor: C.blue, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: 24 },
  btnText: { color: '#fff', fontWeight: '700' },
});
