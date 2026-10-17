import React from 'react';
import { View, ActivityIndicator } from './Themed';
import { Text, TextInput } from './AppText';
import Reveal from './animated/Reveal';
import AnimatedTouchable from './animated/AnimatedTouchable';
import { C, RADIUS, SPACE, SHADOW, createStyles } from '../theme';

export function Card({ children, style }) {
  return (
    <Reveal style={[styles.card, style]}>
      {children}
    </Reveal>
  );
}

export function Badge({ label, color, bg, border }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, loading, disabled, style, icon }) {
  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.btn, (disabled || loading) && { opacity: 0.6 }, style]}
    >
      {loading ? <ActivityIndicator color="#fff" size="small" /> : (
        <>
          {icon}
          <Text style={styles.btnText}>{label}</Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

export function SecondaryButton({ label, onPress, style }) {
  return (
    <AnimatedTouchable onPress={onPress} style={[styles.btnSecondary, style]}>
      <Text style={styles.btnSecondaryText}>{label}</Text>
    </AnimatedTouchable>
  );
}

export function FieldLabel({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Input(props) {
  return <TextInput placeholderTextColor={C.muted} {...props} style={[styles.input, props.style]} />;
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={styles.empty}>
      {icon}
      {title ? <Text style={styles.emptyTitle}>{title}</Text> : null}
      {subtitle ? <Text style={styles.emptySub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = createStyles({
  card: {
    backgroundColor: C.white, borderRadius: RADIUS.lg, padding: SPACE.lg,
    borderWidth: 1, borderColor: C.border, marginBottom: SPACE.lg, ...SHADOW.card,
  },
  badge: {
    borderWidth: 1, borderRadius: RADIUS.pill, paddingVertical: 4, paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11.5, fontWeight: '700' },
  btn: {
    backgroundColor: C.blue, borderRadius: RADIUS.md, paddingVertical: 13,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14.5 },
  btnSecondary: {
    borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  btnSecondaryText: { color: C.text, fontWeight: '600', fontSize: 14 },
  label: { fontSize: 12, fontWeight: '700', color: C.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.md, paddingVertical: 11,
    paddingHorizontal: 14, fontSize: 14.5, backgroundColor: '#f6f7fe', color: C.text,
  },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  emptySub: { fontSize: 13, color: C.textMuted, textAlign: 'center', maxWidth: 280 },
});
