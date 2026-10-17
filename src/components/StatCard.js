import React from 'react';
import { View, TouchableOpacity, Feather } from './Themed';
import { Text } from './AppText';
import Reveal from './animated/Reveal';
import { C, RADIUS, SPACE, SHADOW, createStyles } from '../theme';

export function StatGrid({ children }) {
  return <View style={styles.grid}>{children}</View>;
}

export default function StatCard({ label, value, icon, color = C.blue, bg = C.blueSoft, onPress }) {
  const Inner = onPress ? TouchableOpacity : View;
  return (
    <Reveal style={styles.card} variant="scale">
      <Inner style={styles.inner} onPress={onPress} activeOpacity={onPress ? 0.65 : undefined}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>
            <Feather name={icon} size={16} color={color} />
          </View>
          {onPress && <Feather name="chevron-right" size={16} color={C.textMuted} />}
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Inner>
    </Reveal>
  );
}

const styles = createStyles({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACE.md, marginBottom: SPACE.lg },
  card: {
    flexGrow: 1, flexBasis: '46%', backgroundColor: C.white, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: C.border, ...SHADOW.card, overflow: 'hidden',
  },
  inner: { padding: SPACE.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 22, fontWeight: '800', color: C.text },
  label: { fontSize: 11.5, color: C.textMuted, fontWeight: '600', marginTop: 2 },
});
