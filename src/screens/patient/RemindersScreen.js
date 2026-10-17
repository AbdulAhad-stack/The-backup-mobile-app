import React, { useState } from 'react';
import { Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { View, ScrollView, TouchableOpacity, RefreshControl, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePatientData } from '../../context/PatientDataContext';
import { Card, EmptyState, Input, FieldLabel, PrimaryButton, SecondaryButton } from '../../components/ui';
import FAB from '../../components/animated/FAB';
import { getTimeSlot, SLOT_CONFIG } from '../../utils/reminderSlots';
import { showError } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const REPEAT_OPTIONS = ['Once', 'Daily', 'Weekly', 'Every Morning', 'Every Night'];

function AddReminderModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState({ task: '', time: '', date: '', repeat: 'Once', notes: '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.task.trim()) { showError('Task name required'); return; }
    setSaving(true);
    try {
      await onSave(form);
      setForm({ task: '', time: '', date: '', repeat: 'Once', notes: '' });
      onClose();
    } catch {
      showError('Failed to save reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}><Feather name="bell" size={16} color="#fff" />  New Reminder</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color="#fff" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: SPACE.lg }}>
            <FieldLabel>Task / Medicine Name *</FieldLabel>
            <Input value={form.task} onChangeText={set('task')} placeholder="e.g. Take Paracetamol 500mg after breakfast" style={{ marginBottom: SPACE.md }} />

            <FieldLabel>Time (HH:MM, 24-hour)</FieldLabel>
            <Input value={form.time} onChangeText={set('time')} placeholder="e.g. 08:00" style={{ marginBottom: SPACE.md }} />

            <FieldLabel>Date (optional, YYYY-MM-DD)</FieldLabel>
            <Input value={form.date} onChangeText={set('date')} placeholder="e.g. 2026-08-15" style={{ marginBottom: SPACE.md }} />

            <FieldLabel>Repeat</FieldLabel>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.md }}>
              {REPEAT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => set('repeat')(opt)}
                  style={[styles.repeatChip, form.repeat === opt && styles.repeatChipActive]}
                >
                  <Text style={[styles.repeatChipText, form.repeat === opt && styles.repeatChipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FieldLabel>Notes (optional)</FieldLabel>
            <Input value={form.notes} onChangeText={set('notes')} placeholder="After meal, with water…" style={{ marginBottom: SPACE.lg }} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <SecondaryButton label="Cancel" onPress={onClose} style={{ flex: 1 }} />
              <PrimaryButton label="Save Reminder" onPress={submit} loading={saving} style={{ flex: 2 }} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function RemindersScreen() {
  const { reminders, saveReminder, deleteReminder, refreshing, refresh } = usePatientData();
  const [showAdd, setShowAdd] = useState(false);

  const confirmDelete = (id) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReminder(id).catch(() => showError('Failed to delete reminder.')) },
    ]);
  };

  const slots = { Morning: [], Afternoon: [], Night: [], Unscheduled: [] };
  reminders.forEach((r) => slots[getTimeSlot(r.time)].push(r));

  return (
    <View style={styles.flex}>
      <AnimatedScreen
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}
      >
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.h1}>Daily Schedule</Text>
            <Text style={styles.sub}>{reminders.length} active reminder{reminders.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {reminders.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Feather name="bell-off" size={44} color={C.faint} />}
              title="No Reminders Set"
              subtitle="Add reminders for medicines, checkups, or health tasks"
            />
          </Card>
        ) : (
          SLOT_CONFIG.map((slot) => {
            const items = slots[slot.key];
            if (items.length === 0) return null;
            return (
              <View key={slot.key} style={{ marginBottom: SPACE.lg }}>
                <View style={styles.slotHead}>
                  <View style={[styles.slotIcon, { backgroundColor: slot.bg, borderColor: slot.border }]}>
                    <Feather name={slot.icon} size={16} color={slot.color} />
                  </View>
                  <Text style={styles.slotLabel}>{slot.label}</Text>
                  <View style={[styles.slotCount, { backgroundColor: slot.bg, borderColor: slot.border }]}>
                    <Text style={[styles.slotCountText, { color: slot.color }]}>{items.length}</Text>
                  </View>
                </View>
                {items.map((r) => (
                  <View key={r.id} style={styles.remCard}>
                    <View style={styles.rowBetween}>
                      <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
                        <View style={[styles.slotIcon, { backgroundColor: slot.bg, width: 34, height: 34 }]}>
                          <Feather name={slot.icon} size={15} color={slot.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.remTask}>{r.task}</Text>
                          {r.notes ? <Text style={styles.remNotes}>{r.notes}</Text> : null}
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => confirmDelete(r.id)}>
                        <Feather name="trash-2" size={16} color={C.red} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.remFooter}>
                      {r.time ? <Text style={styles.remFooterText}><Feather name="clock" size={11} /> {r.time}</Text> : null}
                      {r.date ? <Text style={styles.remFooterText}><Feather name="calendar" size={11} /> {r.date}</Text> : null}
                      {r.repeat && r.repeat !== 'Once' ? (
                        <View style={styles.repeatPill}><Text style={styles.repeatPillText}>{r.repeat}</Text></View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </AnimatedScreen>

      <FAB onPress={() => setShowAdd(true)} />

      <AddReminderModal visible={showAdd} onClose={() => setShowAdd(false)} onSave={saveReminder} />
    </View>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 90 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACE.lg },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2 },
  slotHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 10 },
  slotIcon: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  slotLabel: { fontWeight: '700', fontSize: 14.5, color: C.text },
  slotCount: { borderWidth: 1, borderRadius: RADIUS.pill, paddingVertical: 1, paddingHorizontal: 8 },
  slotCountText: { fontSize: 11, fontWeight: '700' },
  remCard: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md,
    padding: SPACE.md, marginBottom: 10,
  },
  remTask: { fontWeight: '700', fontSize: 13.5, color: C.text },
  remNotes: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  remFooter: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  remFooterText: { fontSize: 11.5, color: C.textMuted },
  repeatPill: { backgroundColor: C.blueSoft, borderRadius: RADIUS.pill, paddingVertical: 2, paddingHorizontal: 8 },
  repeatPillText: { fontSize: 11, color: C.blue, fontWeight: '600' },
  fab: {
    position: 'absolute', right: SPACE.lg, bottom: SPACE.lg, width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, maxHeight: '88%' },
  sheetHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.navyMid, padding: SPACE.lg, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
  },
  sheetTitle: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
  repeatChip: { borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.pill, paddingVertical: 7, paddingHorizontal: 12 },
  repeatChipActive: { backgroundColor: C.blueSoft, borderColor: C.blue },
  repeatChipText: { fontSize: 12, fontWeight: '600', color: C.text },
  repeatChipTextActive: { color: C.blue },
});
