import React, { useState } from 'react';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useLabData } from '../../context/LabDataContext';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import BottomSheet from '../../components/BottomSheet';
import { Input, PrimaryButton, SecondaryButton, FieldLabel } from '../../components/ui';
import { showError } from '../../utils/toast';
import { C, SPACE, createStyles } from '../../theme';

const STATUS_META = {
  Collected: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Processing: { bg: '#e0e3fb', color: '#3a3d86', border: '#cfd2f4' },
  Verified: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
};

const FILTERS = [{ key: 'All', label: 'All' }, { key: 'Collected', label: 'Collected' }, { key: 'Processing', label: 'Processing' }, { key: 'Verified', label: 'Verified' }];

function ResultsSheet({ sample, onClose, onSubmit }) {
  const [rows, setRows] = useState([{ name: '', value: '' }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const updateRow = (i, field, v) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: v } : row)));
  const addRow = () => setRows((r) => [...r, { name: '', value: '' }]);
  const removeRow = (i) => setRows((r) => r.filter((_, idx) => idx !== i));

  const submit = async () => {
    const valid = rows.filter((r) => r.name.trim() && r.value.trim());
    if (valid.length === 0) { showError('Enter at least one result name and value.'); return; }
    const results = Object.fromEntries(valid.map((r) => [r.name.trim(), r.value.trim()]));
    setSaving(true);
    try {
      await onSubmit(results, notes);
      onClose();
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to submit results.');
    } finally { setSaving(false); }
  };

  return (
    <BottomSheet visible={!!sample} onClose={onClose} title={`Results — ${sample?.test_name || ''}`} icon="clipboard">
      <Text style={styles.sheetSub}>{sample?.patient_name}</Text>
      {rows.map((row, i) => (
        <View key={i} style={styles.resultRow}>
          <Input value={row.name} onChangeText={(v) => updateRow(i, 'name', v)} placeholder="Name (e.g. Hemoglobin)" style={{ flex: 1, marginBottom: 0 }} />
          <Input value={row.value} onChangeText={(v) => updateRow(i, 'value', v)} placeholder="Value (e.g. 13.5 g/dL)" style={{ flex: 1, marginBottom: 0 }} />
          {rows.length > 1 && (
            <TouchableOpacity onPress={() => removeRow(i)} style={styles.removeBtn}>
              <Feather name="x" size={16} color={C.red} />
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity onPress={addRow} style={styles.addRow}>
        <Feather name="plus" size={14} color={C.blue} />
        <Text style={styles.addRowText}>Add More</Text>
      </TouchableOpacity>

      <FieldLabel>Notes (optional)</FieldLabel>
      <Input value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={{ marginBottom: SPACE.lg, minHeight: 70, textAlignVertical: 'top' }} />

      <PrimaryButton label="Submit & Generate Report" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

export default function LabSamplesScreen() {
  const { samples, statusFilter, setStatusFilter, changeStatus, submitResults, refreshing, refresh } = useLabData();
  const [target, setTarget] = useState(null);

  return (
    <View style={styles.flex}>
      <AnimatedScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
        <Text style={styles.h1}>Samples</Text>
        <SegmentedTabs options={FILTERS} value={statusFilter} onChange={setStatusFilter} />

        <RecordList
          data={samples}
          emptyIcon="inbox"
          emptyTitle="No samples found"
          renderItem={(s) => {
            const meta = STATUS_META[s.status] || { bg: '#eceefb', color: '#3b3e66', border: '#dcdff3' };
            const actions = [];
            if (s.status === 'Collected') actions.push({ label: 'Start Processing', icon: 'play', bg: '#ecefff', border: '#cfd2f4', color: '#4548a8', onPress: () => changeStatus(s, 'Processing') });
            if (s.status === 'Processing') actions.push({ label: 'Enter Results', icon: 'edit-3', bg: '#ecefff', border: '#cfd2f4', color: '#4548a8', onPress: () => setTarget(s) });
            return (
              <RecordCard
                title={`${s.patient_name} (${s.patient_id})`}
                subtitle={s.test_name}
                badge={{ label: s.status, ...meta }}
                fields={[{ label: 'Collected', value: s.collected_at }]}
                actions={actions}
              />
            );
          }}
        />
      </AnimatedScreen>

      <ResultsSheet
        sample={target}
        onClose={() => setTarget(null)}
        onSubmit={(results, notes) => submitResults(target, results, notes)}
      />
    </View>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  sheetSub: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
  resultRow: { flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'center' },
  removeBtn: { padding: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACE.lg },
  addRowText: { color: C.blue, fontWeight: '600', fontSize: 13 },
});
