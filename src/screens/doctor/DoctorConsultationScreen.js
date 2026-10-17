import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useDoctorData } from '../../context/DoctorDataContext';
import { Card, Input, FieldLabel, PrimaryButton, EmptyState } from '../../components/ui';
import SelectField from '../../components/SelectField';
import { showError, showSuccess } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const EMPTY_LINE = { name: '', qty_suggested: '', source: 'store', schedule: [], meal_relation: '', duration_days: '' };
const TIME_SLOTS = ['Morning', 'Afternoon', 'Night'];
const MEAL_OPTIONS = [{ value: '', label: 'Not specified' }, { value: 'Before Meal', label: 'Before Meal' }, { value: 'After Meal', label: 'After Meal' }, { value: 'With Meal', label: 'With Meal' }];

function MedicineLine({ line, index, onUpdate, onRemove, onToggleSlot, canRemove, medicines }) {
  const stock = medicines.find((m) => m.name === line.name);
  return (
    <View style={styles.lineWrap}>
      <FieldLabel>Medicine</FieldLabel>
      <Input value={line.name} onChangeText={(v) => onUpdate(index, 'name', v)} placeholder="Type medicine name" style={{ marginBottom: 4 }} />
      {stock && (
        <Text style={[styles.stockHint, { color: stock.current_stock > 0 ? '#15803d' : C.red }]}>
          In stock: {stock.current_stock} {stock.unit}{stock.is_low_stock ? ' (low stock)' : ''}
        </Text>
      )}
      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <FieldLabel>Qty</FieldLabel>
          <Input value={line.qty_suggested} onChangeText={(v) => onUpdate(index, 'qty_suggested', v)} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <SelectField label="Source" value={line.source} onChange={(v) => onUpdate(index, 'source', v)} options={[{ value: 'store', label: 'Store' }, { value: 'outside', label: 'Outside Pharmacy' }]} />
        </View>
      </View>

      <FieldLabel>Daily Timing</FieldLabel>
      <View style={styles.slotsRow}>
        {TIME_SLOTS.map((slot) => {
          const active = line.schedule.includes(slot);
          return (
            <TouchableOpacity key={slot} onPress={() => onToggleSlot(index, slot)} style={[styles.slotChip, active && styles.slotChipActive]}>
              {active && <Feather name="check" size={12} color={C.blue} />}
              <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>{slot}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}>
          <SelectField label="Meal Relation" value={line.meal_relation} onChange={(v) => onUpdate(index, 'meal_relation', v)} options={MEAL_OPTIONS} placeholder="Not specified" />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>Duration (days)</FieldLabel>
          <Input value={line.duration_days} onChangeText={(v) => onUpdate(index, 'duration_days', v)} keyboardType="numeric" placeholder="e.g. 7" />
        </View>
      </View>

      {canRemove && (
        <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeLineBtn}>
          <Feather name="trash-2" size={13} color={C.red} />
          <Text style={styles.removeLineText}>Remove Medicine</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DoctorConsultationScreen({ route }) {
  const { medicines, tests, submitPrescription, suggestLabTest, fetchPrescriptionHistory, fetchLabSuggestionHistory } = useDoctorData();
  const [patientId, setPatientId] = useState(route.params?.presetPatientId || '');
  const [lines, setLines] = useState([{ ...EMPTY_LINE }]);
  const [testId, setTestId] = useState('');
  const [labNotes, setLabNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (route.params?.presetPatientId) setPatientId(route.params.presetPatientId);
  }, [route.params?.presetPatientId]);

  const updateLine = (i, field, v) => setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)));
  const toggleSlot = (i, slot) => setLines((ls) => ls.map((l, idx) => {
    if (idx !== i) return l;
    const has = l.schedule.includes(slot);
    return { ...l, schedule: has ? l.schedule.filter((s) => s !== slot) : [...l.schedule, slot] };
  }));
  const addLine = () => setLines((ls) => [...ls, { ...EMPTY_LINE }]);
  const removeLine = (i) => setLines((ls) => ls.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!patientId) { showError('Select a patient first.'); return; }
    const anyLineStarted = lines.some((l) => l.name.trim() || l.qty_suggested);
    const validLines = lines.filter((l) => l.name.trim() && parseFloat(l.qty_suggested) > 0);
    const hasRx = anyLineStarted;
    const hasLab = !!testId;

    if (!hasRx && !hasLab) { showError('Add at least one medicine or select a lab test.'); return; }
    if (hasRx && validLines.length === 0) { showError('Add at least one medicine with a quantity.'); return; }

    setSaving(true);
    const messages = [];
    try {
      if (hasRx) {
        const payload = validLines.map((l) => ({
          name: l.name.trim(), qty_suggested: parseFloat(l.qty_suggested), source: l.source,
          schedule: l.schedule.length > 0 ? l.schedule : null,
          meal_relation: l.meal_relation || null,
          duration_days: l.duration_days ? parseInt(l.duration_days, 10) : null,
        }));
        await submitPrescription(patientId, payload);
        messages.push('Prescription submitted.');
        setLines([{ ...EMPTY_LINE }]);
      }
      if (hasLab) {
        await suggestLabTest(patientId, testId, labNotes);
        messages.push('Lab test suggested.');
        setTestId(''); setLabNotes('');
      }
      showSuccess(messages.join(' '));
    } catch (err) {
      showError(err.response?.data?.detail || 'Failed to save consultation.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Consultation</Text>

      <Card>
        <FieldLabel>Patient ID</FieldLabel>
        <Input value={patientId} onChangeText={setPatientId} placeholder="Enter or paste assigned patient ID" autoCapitalize="characters" />
      </Card>

      {patientId ? (
        <>
          <Text style={styles.sectionLabel}>Prescription</Text>
          <Card>
            {lines.map((line, i) => (
              <MedicineLine
                key={i} line={line} index={i} medicines={medicines}
                onUpdate={updateLine} onRemove={removeLine} onToggleSlot={toggleSlot}
                canRemove={lines.length > 1}
              />
            ))}
            <TouchableOpacity onPress={addLine} style={styles.addLineBtn}>
              <Feather name="plus" size={14} color={C.blue} />
              <Text style={styles.addLineText}>Add Another Medicine</Text>
            </TouchableOpacity>
          </Card>

          <Text style={styles.sectionLabel}>Lab Tests</Text>
          <Card>
            <Text style={styles.note}>This is only a suggestion — the patient decides whether to get it done.</Text>
            <SelectField
              label="Test"
              value={testId}
              onChange={setTestId}
              options={tests.map((t) => ({ value: t.id, label: `${t.test_name} (${t.price})` }))}
              placeholder="Search a test…"
            />
            <View style={{ height: SPACE.md }} />
            <FieldLabel>Notes (optional)</FieldLabel>
            <Input value={labNotes} onChangeText={setLabNotes} multiline numberOfLines={3} placeholder="Why this test is being suggested" style={{ minHeight: 70, textAlignVertical: 'top' }} />
          </Card>

          <PrimaryButton label="Save Consultation" loading={saving} onPress={handleSave} />
        </>
      ) : (
        <Card>
          <EmptyState icon={<Feather name="file-plus" size={40} color={C.faint} />} title="Select a patient above" subtitle="Enter a patient ID to write a prescription and/or suggest a lab test." />
        </Card>
      )}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: C.textMuted, marginBottom: 10 },
  note: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
  lineWrap: { marginBottom: SPACE.lg, paddingBottom: SPACE.lg, borderBottomWidth: 1, borderBottomColor: C.border },
  stockHint: { fontSize: 11, marginBottom: SPACE.md },
  row2: { flexDirection: 'row', gap: 12, marginBottom: SPACE.md },
  slotsRow: { flexDirection: 'row', gap: 8, marginBottom: SPACE.md },
  slotChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.pill, paddingVertical: 6, paddingHorizontal: 12 },
  slotChipActive: { backgroundColor: C.blueSoft, borderColor: C.blue },
  slotChipText: { fontSize: 12, fontWeight: '600', color: C.text },
  slotChipTextActive: { color: C.blue },
  removeLineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  removeLineText: { color: C.red, fontSize: 12.5, fontWeight: '600' },
  addLineBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, borderStyle: 'dashed' },
  addLineText: { color: C.blue, fontWeight: '600', fontSize: 13 },
});
