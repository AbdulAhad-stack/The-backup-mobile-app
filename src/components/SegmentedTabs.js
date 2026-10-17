import React, { useEffect } from 'react';
import { ScrollView } from './Themed';
import { Text } from './AppText';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import AnimatedTouchable from './animated/AnimatedTouchable';
import { C, RADIUS, SPACE, createStyles, mapColor, useScheme } from '../theme';

function Chip({ opt, active, onChange }) {
  useScheme();
  const idleBg = mapColor('#f6f7fe', 'backgroundColor');
  const idleBorder = mapColor(C.border, 'borderColor');
  const idleText = mapColor(C.text, 'color');
  const t = useSharedValue(active ? 1 : 0);
  useEffect(() => { t.value = withTiming(active ? 1 : 0, { duration: 180 }); }, [active]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(t.value, [0, 1], [idleBg, C.navyMid]),
    borderColor: interpolateColor(t.value, [0, 1], [idleBorder, C.navyMid]),
  }), [idleBg, idleBorder]);
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(t.value, [0, 1], [idleText, '#ffffff']),
  }), [idleText]);

  return (
    <AnimatedTouchable onPress={() => onChange(opt.key)} style={[styles.chip, chipStyle]} scaleTo={0.94}>
      <Animated.Text style={[styles.text, textStyle]}>{opt.label}</Animated.Text>
      {typeof opt.badge === 'number' && opt.badge > 0 && (
        <Text style={[styles.badge, active && styles.badgeActive]}>{opt.badge}</Text>
      )}
    </AnimatedTouchable>
  );
}

export default function SegmentedTabs({ options, value, onChange, style }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.wrap, style]} contentContainerStyle={{ gap: 8 }}>
      {options.map((opt) => (
        <Chip key={opt.key} opt={opt} active={opt.key === value} onChange={onChange} />
      ))}
    </ScrollView>
  );
}

const styles = createStyles({
  wrap: { flexGrow: 0, marginBottom: SPACE.lg },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: RADIUS.pill, borderWidth: 1.5,
  },
  text: { fontSize: 12.5, fontWeight: '700' },
  badge: {
    fontSize: 10, fontWeight: '700', color: C.blue, backgroundColor: C.blueSoft,
    borderRadius: RADIUS.pill, paddingHorizontal: 6, overflow: 'hidden',
  },
  badgeActive: { color: C.navyMid, backgroundColor: '#fff' },
});
