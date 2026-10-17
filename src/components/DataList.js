import React from 'react';
import { View, Feather } from './Themed';
import { Text } from './AppText';
import { Badge, EmptyState } from './ui';
import Reveal from './animated/Reveal';
import AnimatedTouchable from './animated/AnimatedTouchable';
import { C, RADIUS, SPACE, SHADOW, createStyles } from '../theme';

// Renders a "table" as a stack of record cards — mobile-native replacement
// for the web app's wide <table>. Each item shows a title/subtitle line,
// a list of {label, value} fields, an optional status badge, and actions.
export function RecordCard({ title, subtitle, fields = [], badge, actions = [] }) {
  return (
    <Reveal style={styles.card}>
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {badge ? <Badge label={badge.label} color={badge.color} bg={badge.bg} border={badge.border} /> : null}
      </View>
      {fields.length > 0 && (
        <View style={styles.fields}>
          {fields.filter(f => f.value !== undefined && f.value !== null && f.value !== '').map((f, i) => (
            <View key={i} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={styles.fieldValue} numberOfLines={2}>{String(f.value)}</Text>
            </View>
          ))}
        </View>
      )}
      {actions.length > 0 && (
        <View style={styles.actions}>
          {actions.map((a, i) => (
            <AnimatedTouchable
              key={i}
              onPress={a.onPress}
              style={[styles.actionBtn, { backgroundColor: a.bg || C.blueSoft, borderColor: a.border || '#e0e3fb' }]}
            >
              {a.icon ? <Feather name={a.icon} size={12} color={a.color || C.blue} /> : null}
              <Text style={[styles.actionText, { color: a.color || C.blue }]}>{a.label}</Text>
            </AnimatedTouchable>
          ))}
        </View>
      )}
    </Reveal>
  );
}

export function RecordList({ data, renderItem, emptyIcon = 'inbox', emptyTitle = 'No records found' }) {
  if (!data || data.length === 0) {
    return <EmptyState icon={<Feather name={emptyIcon} size={40} color={C.faint} />} title={emptyTitle} />;
  }
  return <View>{data.map((item, i) => <View key={item.id || item.key || i}>{renderItem(item, i)}</View>)}</View>;
}

const styles = createStyles({
  card: {
    backgroundColor: C.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border,
    padding: SPACE.md, marginBottom: SPACE.sm, ...SHADOW.card,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontWeight: '700', fontSize: 14, color: C.text },
  subtitle: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  fields: { marginTop: 8, gap: 4 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  fieldLabel: { fontSize: 11.5, color: C.textMuted, fontWeight: '600' },
  fieldValue: { fontSize: 12.5, color: C.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: RADIUS.sm, paddingVertical: 6, paddingHorizontal: 10 },
  actionText: { fontSize: 11.5, fontWeight: '700' },
});
