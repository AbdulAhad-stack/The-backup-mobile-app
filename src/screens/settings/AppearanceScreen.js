import React from 'react';
import { View, Text, TouchableOpacity, Feather } from '../../components/Themed';
import { SettingsPage, Section } from '../../components/settings/SettingsUI';
import { useAppearance } from '../../context/AppearanceContext';
import { C, RADIUS, SPACE, createStyles } from '../../theme';

// Previews use rgb() on purpose: the theme engine only remaps #hex colours, so
// the Light/Dark swatches keep their true colours in either scheme.
const PAL = {
  light: { bg: 'rgb(248,250,252)', card: 'rgb(255,255,255)', bar: 'rgb(203,213,225)', head: 'rgb(26,54,93)' },
  dark: { bg: 'rgb(11,17,32)', card: 'rgb(20,28,46)', bar: 'rgb(58,70,96)', head: 'rgb(15,37,64)' },
};

function Swatch({ p, style }) {
  return (
    <View style={[styles.swatch, { backgroundColor: p.bg }, style]}>
      <View style={[styles.swHead, { backgroundColor: p.head }]} />
      <View style={[styles.swCard, { backgroundColor: p.card }]}>
        <View style={[styles.swBar, { backgroundColor: p.bar, width: '70%' }]} />
        <View style={[styles.swBar, { backgroundColor: p.bar, width: '45%' }]} />
      </View>
    </View>
  );
}

const OPTIONS = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

const DESC = {
  light: 'Bright surfaces with dark text. Best in well-lit places.',
  dark: 'Dim surfaces that are easier on the eyes at night and can save battery on OLED screens.',
  system: 'Automatically switches between Light and Dark to match your device setting.',
};

export default function AppearanceScreen() {
  const { appearance, changeAppearance, dark, system } = useAppearance();
  const mode = appearance.toLowerCase();
  const scheme = dark ? 'dark' : 'light';

  return (
    <SettingsPage>
      <Section title="Theme" footer={DESC[mode]}>
        <View style={styles.tiles}>
          {OPTIONS.map((o) => {
            const selected = mode === o.key;
            return (
              <TouchableOpacity key={o.key} style={styles.tileWrap} activeOpacity={0.8} onPress={() => changeAppearance(o.label)} accessibilityRole="radio" accessibilityState={{ selected }}>
                <View style={[styles.tile, selected && styles.tileSelected]}>
                  {o.key === 'system' ? (
                    <View style={styles.split}>
                      <Swatch p={PAL.light} style={styles.half} />
                      <Swatch p={PAL.dark} style={styles.half} />
                    </View>
                  ) : (
                    <Swatch p={PAL[o.key]} />
                  )}
                </View>
                <View style={styles.labelRow}>
                  <View style={[styles.radio, selected && styles.radioOn]}>
                    {selected ? <Feather name="check" size={11} color="#fff" /> : null}
                  </View>
                  <Text style={[styles.label, selected && { color: C.blue }]}>{o.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Text style={styles.note}>
        Currently showing the {scheme} theme.{mode === 'system' ? ` Your device is set to ${system}, and the app follows it automatically.` : ''} Your choice is saved on this device and applies to every screen.
      </Text>
    </SettingsPage>
  );
}

const styles = createStyles({
  tiles: { flexDirection: 'row', gap: SPACE.md, padding: SPACE.md },
  tileWrap: { flex: 1, alignItems: 'center' },
  tile: { width: '100%', borderRadius: RADIUS.md, borderWidth: 2, borderColor: C.border, padding: 4 },
  tileSelected: { borderColor: C.blue },
  swatch: { height: 92, borderRadius: 8, overflow: 'hidden' },
  swHead: { height: 16 },
  swCard: { margin: 8, borderRadius: 6, padding: 7, gap: 5 },
  swBar: { height: 6, borderRadius: 3 },
  split: { flexDirection: 'row', height: 92, borderRadius: 8, overflow: 'hidden' },
  half: { flex: 1, borderRadius: 0, height: 92 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: C.blue, borderColor: C.blue },
  label: { fontSize: 14, fontWeight: '700', color: C.text },
  note: { fontSize: 12.5, color: C.textMuted, textAlign: 'center', marginTop: SPACE.sm, lineHeight: 18 },
});
