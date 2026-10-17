import React from 'react';
import { Switch, Modal } from 'react-native';
import { View, Text, TouchableOpacity, ScrollView, Feather } from '../Themed';
import { APP } from '../../config/appInfo';
import { C, RADIUS, SPACE, SHADOW, createStyles, isDark } from '../../theme';

// Building blocks for the Settings area: grouped lists, rows, switches,
// profile header and the version footer. Colours go through the theme engine,
// so everything here works in light and dark.

export function SettingsPage({ children, contentStyle }) {
  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[styles.pageContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Section({ title, footer, children }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={child.key ?? i}>
            {child}
            {i < items.length - 1 ? <View style={[styles.sep, !child.props?.icon && { marginLeft: 14 }]} /> : null}
          </View>
        ))}
      </View>
      {footer ? <Text style={styles.sectionFooter}>{footer}</Text> : null}
    </View>
  );
}

export function Row({ icon, tint = C.blue, title, subtitle, value, badge, onPress, right, danger, disabled, chevron = true }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      style={[styles.row, disabled && { opacity: 0.55 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      {icon ? (
        <View style={[styles.iconBox, { backgroundColor: danger ? C.red : tint }]}>
          <Feather name={icon} size={16} color="#fff" />
        </View>
      ) : null}
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, danger && { color: C.red }]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {badge ? <View style={styles.pill}><Text style={styles.pillText}>{badge}</Text></View> : null}
      {value ? <Text style={styles.rowValue} numberOfLines={1}>{value}</Text> : null}
      {right}
      {onPress && chevron && !right ? <Feather name="chevron-right" size={18} color={C.muted} /> : null}
    </Wrap>
  );
}

export function SwitchRow({ icon, tint, title, subtitle, value, onValueChange, disabled }) {
  return (
    <Row
      icon={icon}
      tint={tint}
      title={title}
      subtitle={subtitle}
      disabled={disabled}
      right={(
        <Switch
          value={!!value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ false: isDark() ? '#3a4660' : '#cbd5e1', true: C.blue }}
          thumbColor="#ffffff"
          activeThumbColor="#ffffff"
          ios_backgroundColor={isDark() ? '#3a4660' : '#cbd5e1'}
        />
      )}
    />
  );
}

export function CheckRow({ title, subtitle, selected, onPress, disabled, badge, trailing }) {
  return (
    <Row
      title={title}
      subtitle={subtitle}
      badge={badge}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      chevron={false}
      right={selected ? <Feather name="check" size={19} color={C.blue} /> : trailing || <View style={{ width: 19 }} />}
    />
  );
}

export function ProfileCard({ initial, title, subtitle, chip }) {
  return (
    <View style={styles.profile}>
      <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.profileTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.profileSub} numberOfLines={1}>{subtitle}</Text>
        {chip ? <View style={styles.chip}><Text style={styles.chipText}>{chip}</Text></View> : null}
      </View>
    </View>
  );
}

export function InfoBanner({ icon = 'info', tone = 'info', children }) {
  const tones = {
    info: { bg: C.blueSoft, bd: '#bfdbfe', fg: '#1e40af' },
    success: { bg: C.greenBg, bd: C.greenBorder, fg: '#166534' },
    warn: { bg: C.amberBg, bd: C.amberBorder, fg: '#92400e' },
  };
  const t = tones[tone] || tones.info;
  return (
    <View style={[styles.banner, { backgroundColor: t.bg, borderColor: t.bd }]}>
      <Feather name={icon} size={16} color={t.fg} style={{ marginTop: 1 }} />
      <Text style={[styles.bannerText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

// Cross-platform confirm dialog (Alert.alert is a no-op on web).
export function ConfirmModal({ visible, title, message, confirmLabel = 'Confirm', destructive, onConfirm, onCancel }) {
  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>{title}</Text>
          {message ? <Text style={styles.dialogMsg}>{message}</Text> : null}
          <View style={styles.dialogBtns}>
            <TouchableOpacity style={[styles.dBtn, styles.dBtnGhost]} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.dBtnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dBtn, { backgroundColor: destructive ? C.red : C.blue }]} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={styles.dBtnText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function VersionFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerName}>{APP.name}</Text>
      <Text style={styles.footerVersion}>Version {APP.version} (build {APP.build})</Text>
      <Text style={styles.footerCopy}>© {APP.year} {APP.developer}. All rights reserved.</Text>
    </View>
  );
}

const styles = createStyles({
  page: { flex: 1, backgroundColor: C.bg },
  pageContent: { padding: SPACE.lg, paddingBottom: 40 },
  section: { marginBottom: SPACE.xl },
  sectionTitle: {
    fontSize: 11.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase',
    color: C.textMuted, marginBottom: 8, marginLeft: 6,
  },
  sectionFooter: { fontSize: 12, color: C.textMuted, marginTop: 8, marginHorizontal: 6, lineHeight: 17 },
  group: {
    backgroundColor: C.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', ...SHADOW.card,
  },
  sep: { height: 1, backgroundColor: C.faint, marginLeft: 58 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, minHeight: 54 },
  iconBox: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, minWidth: 0 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: C.text },
  rowSub: { fontSize: 12.5, color: C.textMuted, marginTop: 2, lineHeight: 17 },
  rowValue: { fontSize: 14, color: C.textMuted, maxWidth: '45%' },
  pill: { backgroundColor: C.faint, borderRadius: RADIUS.pill, paddingHorizontal: 9, paddingVertical: 3 },
  pillText: { fontSize: 10.5, fontWeight: '700', color: C.textMuted, letterSpacing: 0.3 },
  profile: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.navyMid,
    borderRadius: RADIUS.xl, padding: SPACE.lg, marginBottom: SPACE.xl, ...SHADOW.card,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  profileTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  profileSub: { color: '#a9c4f2', fontSize: 12.5, marginTop: 2 },
  chip: {
    alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 3,
  },
  chipText: { color: '#dbe8ff', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  banner: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: 12, marginBottom: SPACE.xl },
  bannerText: { flex: 1, fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', alignItems: 'center', justifyContent: 'center', padding: SPACE.xl },
  dialog: { width: '100%', maxWidth: 340, backgroundColor: C.white, borderRadius: RADIUS.xl, padding: SPACE.xl, borderWidth: 1, borderColor: C.border },
  dialogTitle: { fontSize: 17, fontWeight: '800', color: C.text },
  dialogMsg: { fontSize: 13.5, color: C.textMuted, marginTop: 8, lineHeight: 20 },
  dialogBtns: { flexDirection: 'row', gap: 10, marginTop: SPACE.xl },
  dBtn: { flex: 1, borderRadius: RADIUS.md, paddingVertical: 12, alignItems: 'center' },
  dBtnGhost: { backgroundColor: C.faint },
  dBtnGhostText: { color: C.text, fontWeight: '700', fontSize: 14 },
  dBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  footer: { alignItems: 'center', paddingVertical: SPACE.xl, gap: 3 },
  footerName: { fontSize: 14, fontWeight: '800', color: C.text },
  footerVersion: { fontSize: 12.5, color: C.textMuted, fontWeight: '600' },
  footerCopy: { fontSize: 11.5, color: C.muted, marginTop: 4, textAlign: 'center' },
});
