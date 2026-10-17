import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AnimatedScreen from './animated/AnimatedScreen';
import AnimatedTouchable from './animated/AnimatedTouchable';
import { useAuth } from '../context/AuthContext';
import { C, SPACE, RADIUS } from '../theme';

// Shared left sidebar for every role's dashboard — mirrors the web app's
// fixed navy sidebar (logo, section nav, "logged in as" + logout footer)
// instead of a bottom tab bar, so a role with many sections (Admin,
// Reception) never has to be squeezed into a 5-item limit.
//
// `sections`, if passed, groups the drawer's routes under the same section
// headers the web sidebar uses (e.g. "MANAGEMENT", "HR & PAYROLL") instead
// of one flat list — pass [{ title, routes: [routeName, ...] }, ...]
// covering every route name in the navigator, in display order.
export default function Sidebar({ navigation, state, portalName, icons, accent = C.blue, sections }) {
  const { logout, currentUser } = useAuth();

  const renderItem = (route) => {
    const i = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === i;
    const icon = icons[route.name] || 'circle';
    return (
      <AnimatedTouchable
        key={route.key}
        onPress={() => navigation.navigate(route.name)}
        style={[styles.navItem, focused && { backgroundColor: 'rgba(255,255,255,0.08)', borderLeftColor: accent }]}
        scaleTo={0.98}
      >
        <Feather name={icon} size={17} color={focused ? '#fff' : 'rgba(255,255,255,0.55)'} style={{ width: 22 }} />
        <Text style={[styles.navLabel, focused && styles.navLabelActive]}>{route.name}</Text>
        {focused && <View style={[styles.activeDot, { backgroundColor: accent }]} />}
      </AnimatedTouchable>
    );
  };

  return (
    <View style={styles.wrap}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Image source={require('../../assets/medicare-logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={{ minWidth: 0 }}>
            <Text style={styles.brand}>MediCare</Text>
            <Text style={styles.portal}>{portalName}</Text>
          </View>
        </View>

        <AnimatedScreen style={styles.nav} contentContainerStyle={{ paddingVertical: SPACE.sm }} showsVerticalScrollIndicator={false}>
          {sections
            ? sections.map((sec) => (
              <View key={sec.title}>
                <Text style={styles.sectionLabel}>{sec.title}</Text>
                {sec.routes.map((routeName) => {
                  const route = state.routes.find((r) => r.name === routeName);
                  return route ? renderItem(route) : null;
                })}
              </View>
            ))
            : state.routes.map(renderItem)}
        </AnimatedScreen>

        <View style={styles.footer}>
          <View style={{ minWidth: 0, flex: 1 }}>
            <View style={styles.loggedRow}>
              <Feather name="user" size={11} color="rgba(255,255,255,0.4)" />
              <Text style={styles.loggedLabel}>Logged in as</Text>
            </View>
            <Text style={styles.loggedValue} numberOfLines={1}>{currentUser?.user_id}</Text>
          </View>
          <AnimatedTouchable onPress={logout} style={styles.logoutBtn} scaleTo={0.9}>
            <Feather name="log-out" size={15} color="#fca5a5" />
          </AnimatedTouchable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.navyMid },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: SPACE.lg,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logo: { width: 40, height: 40 },
  brand: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  portal: { color: '#8db2f0', fontSize: 11.5, marginTop: 2 },
  nav: { flex: 1 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', paddingHorizontal: 18, marginTop: 14, marginBottom: 4,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 18,
    borderLeftWidth: 3, borderLeftColor: 'transparent', marginBottom: 2,
  },
  navLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600', flex: 1 },
  navLabelActive: { color: '#fff', fontWeight: '700' },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: SPACE.lg,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
  },
  loggedRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  loggedLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10.5 },
  loggedValue: { color: '#fff', fontSize: 13.5, fontWeight: '700', marginTop: 2 },
  logoutBtn: {
    width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', alignItems: 'center', justifyContent: 'center',
  },
});
