import React, { useState, useMemo } from 'react';
import { Modal, FlatList } from 'react-native';
import { View, TouchableOpacity, Feather } from './Themed';
import { Text, TextInput } from './AppText';
import { FieldLabel } from './ui';
import { C, RADIUS, SPACE, createStyles } from '../theme';

// Modal action-sheet picker — the mobile-native replacement for <select>.
// Pass `searchable` for long lists (patients, doctors, medicines…) to add a
// filter box at the top of the sheet.
export default function SelectField({ label, value, options, onChange, placeholder = 'Select…', searchable = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const close = () => { setOpen(false); setQuery(''); };

  return (
    <View>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerText, !current && { color: C.muted }]} numberOfLines={1}>{current ? current.label : placeholder}</Text>
        <Feather name="chevron-down" size={16} color={C.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {searchable && (
              <View style={styles.searchWrap}>
                <Feather name="search" size={14} color={C.muted} />
                <TextInput value={query} onChangeText={setQuery} placeholder="Search…" placeholderTextColor={C.muted} style={styles.searchInput} autoFocus />
              </View>
            )}
            <FlatList
              data={filtered}
              keyExtractor={(o) => String(o.value)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.empty}>No matches.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => { onChange(item.value); close(); }}
                >
                  <Text style={[styles.optionText, item.value === value && styles.optionTextActive]}>{item.label}</Text>
                  {item.value === value && <Feather name="check" size={16} color={C.blue} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = createStyles({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.md, paddingVertical: 11,
    paddingHorizontal: 14, backgroundColor: '#f6f7fe',
  },
  triggerText: { fontSize: 14.5, color: C.text, fontWeight: '500', flex: 1, marginRight: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: SPACE.xl },
  sheet: { backgroundColor: C.white, borderRadius: RADIUS.lg, maxHeight: '65%', paddingVertical: 6 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 6, marginBottom: 4,
    borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingHorizontal: 10, backgroundColor: '#f6f7fe',
  },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: 13.5, color: C.text },
  empty: { textAlign: 'center', padding: 20, color: C.muted, fontSize: 13 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 18 },
  optionActive: { backgroundColor: C.blueSoft },
  optionText: { fontSize: 14, color: C.text, fontWeight: '500', flex: 1, marginRight: 8 },
  optionTextActive: { color: C.blue, fontWeight: '700' },
});
