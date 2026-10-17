import React, { useState, useEffect, useCallback } from 'react';
import { View, RefreshControl, TouchableOpacity } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';
import { RecordCard, RecordList } from '../../components/DataList';
import BottomSheet from '../../components/BottomSheet';
import SelectField from '../../components/SelectField';
import { Input, FieldLabel, PrimaryButton, SecondaryButton } from '../../components/ui';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { formatRange12, generateSlots } from '../../utils/timeSlots';
import { C, SPACE, createStyles } from '../../theme';

const REASONS = ['Doctor unavailable', 'Fully booked', 'Patient request', 'Emergency', 'Other'].map((r) => ({ value: r, label: r }));

const STATUS_META = {
  Pending: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Confirmed: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  Completed: { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' },
  'Reschedule-Proposed': { bg: '#e0e3fb', color: '#3a3d86', border: '#cfd2f4' },
};

function CancelSheet({ target, onClose, onConfirm }) {
  const [type, setType] = useState('Doctor unavailable');
  const [text, setText] = useState('');
  return (
    <BottomSheet visible={!!target} onClose={onClose} title="Cancel Appointment" icon="x-circle">
      <SelectField label="Reason" value={type} onChange={setType} options={REASONS} />
      {type === 'Other' && <Input value={text} onChangeText={setText} placeholder="Type the reason…" style={{ marginTop: SPACE.md }} />}
      <View style={{ height: SPACE.lg }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton label="Back" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label="Cancel Appointment"
          style={{ flex: 1, backgroundColor: C.red }}
          onPress={() => {
            if (type === 'Other' && !text.trim()) { showError('Enter a reason.'); return; }
            onConfirm(type === 'Other' ? text : type, type);
          }}
        />
      </View>
    </BottomSheet>
  );
}

function RescheduleSheet({ target, onClose, onConfirm }) {
  const [availability, setAvailability] = useState([]);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(null);
  const [type, setType] = useState('Doctor unavailable');
  const [text, setText] = useState('');

  useEffect(() => {
    if (!target) return;
    setDate(''); setSlot(null); setType('Doctor unavailable'); setText('');
    api.get(`/api/doctors/${target.doctor_id}/availability`).then((res) => setAvailability(res.data.weekly_slots || [])).catch(() => setAvailability([]));
  }, [target]);

  const dayName = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const todaysSlot = availability.find((s) => s.day === dayName);
  const slots = todaysSlot ? generateSlots(todaysSlot.start, todaysSlot.end) : [];

  return (
    <BottomSheet visible={!!target} onClose={onClose} title="Propose New Time" icon="calendar">
      <FieldLabel>Date (YYYY-MM-DD)</FieldLabel>
      <Input value={date} onChangeText={(v) => { setDate(v); setSlot(null); }} placeholder="2026-08-20" style={{ marginBottom: SPACE.md }} />
      {date && (
        <>
          <FieldLabel>Time Slot</FieldLabel>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.md }}>
            {slots.length > 0 ? slots.map((s) => (
              <TouchableOpacity key={s.start} onPress={() => setSlot(s)} style={[styles.slotChip, slot?.start === s.start && styles.slotChipActive]}>
                <Text style={[styles.slotChipText, slot?.start === s.start && styles.slotChipTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            )) : <Text style={styles.hint}>Doctor has no fixed hours on this day.</Text>}
          </View>
        </>
      )}
      <SelectField label="Reason" value={type} onChange={setType} options={REASONS} />
      {type === 'Other' && <Input value={text} onChangeText={setText} placeholder="Type the reason…" style={{ marginTop: SPACE.md }} />}
      <View style={{ height: SPACE.lg }} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton label="Cancel" onPress={onClose} style={{ flex: 1 }} />
        <PrimaryButton
          label="Send to Patient"
          style={{ flex: 1 }}
          onPress={() => {
            if (!date || !slot) { showError('Pick a date and a time slot.'); return; }
            onConfirm({ date, time: slot.start, time_end: slot.end, reason: type === 'Other' ? text : type, reason_type: type });
          }}
        />
      </View>
    </BottomSheet>
  );
}

export default function ReceptionAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const load = useCallback(async () => {
    try { const res = await api.get('/api/appointments'); setAppointments(res.data.appointments || []); }
    catch { showError('Failed to load appointments.'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useLiveNotifications(useCallback((notif) => { if (notif.type === 'appointment-request' || notif.type === 'appointment-reschedule-response') load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const setStatus = async (id, status, extra = {}) => {
    try { await api.patch(`/api/appointments/${id}/status`, { status, ...extra }); showSuccess(`Appointment marked ${status}.`); load(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to update appointment.'); }
  };

  return (
    <View style={styles.flex}>
      <AnimatedScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}>
        <Text style={styles.h1}>Appointment Requests</Text>
        <RecordList
          data={appointments}
          emptyIcon="calendar"
          emptyTitle="No appointment requests yet"
          renderItem={(a) => {
            const meta = STATUS_META[a.status] || { bg: '#eceefb', color: '#3b3e66', border: '#dcdff3' };
            const actions = [];
            if (a.status === 'Pending') {
              actions.push({ label: 'Confirm', icon: 'check', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', onPress: () => setStatus(a.id, 'Confirmed') });
              actions.push({ label: 'Propose Time', icon: 'clock', onPress: () => setRescheduleTarget(a) });
              actions.push({ label: 'Cancel', icon: 'x', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => setCancelTarget(a) });
            } else if (a.status === 'Confirmed') {
              actions.push({ label: 'Mark Completed', icon: 'check-circle', onPress: () => setStatus(a.id, 'Completed') });
            }
            return (
              <RecordCard
                title={`${a.patient_name} → ${a.doctor_name}`}
                subtitle={`${a.date}  ·  ${formatRange12(a.time, a.time_end)}`}
                fields={[{ label: 'Reason', value: a.reason || (a.status === 'Reschedule-Proposed' ? a.proposed_reason : '') || '—' }]}
                badge={{ label: a.status, ...meta }}
                actions={actions}
              />
            );
          }}
        />
      </AnimatedScreen>

      <CancelSheet
        target={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason, reason_type) => { setStatus(cancelTarget.id, 'Cancelled', { reason, reason_type }); setCancelTarget(null); }}
      />
      <RescheduleSheet
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={async (body) => {
          try {
            await api.post(`/api/appointments/${rescheduleTarget.id}/propose-reschedule`, body);
            showSuccess('New time proposed to the patient.');
            setRescheduleTarget(null); load();
          } catch (err) { showError(err.response?.data?.detail || 'Failed to propose a new time.'); }
        }}
      />
    </View>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  hint: { fontSize: 12, color: C.textMuted },
  slotChip: { borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' },
  slotChipActive: { borderWidth: 2, borderColor: C.blueDark, backgroundColor: C.blueSoft },
  slotChipText: { fontSize: 12.5, fontWeight: '600', color: C.text },
  slotChipTextActive: { color: C.blueDark },
});
