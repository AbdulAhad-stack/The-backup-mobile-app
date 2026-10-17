import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, RefreshControl, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { usePatientData } from '../../context/PatientDataContext';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel, PrimaryButton, EmptyState } from '../../components/ui';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { formatRange12, generateSlots } from '../../utils/timeSlots';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const STATUS_COLORS = {
  Pending: { bg: '#fef3c7', color: '#92400e' },
  Confirmed: { bg: '#dcfce7', color: '#166534' },
  Cancelled: { bg: '#fee2e2', color: '#991b1b' },
  Completed: { bg: '#e0e7ff', color: '#3730a3' },
  'Reschedule-Proposed': { bg: '#e0e3fb', color: '#3a3d86' },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#eceefb', color: '#3b3e66' };
  return (
    <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.statusBadgeText, { color: c.color }]}>{status}</Text>
    </View>
  );
}

export default function BookingScreen() {
  const { patientId } = usePatientData();
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const searchDoctors = useCallback(async () => {
    try {
      const res = await api.get('/doctors/search', { params: query ? { q: query } : {} });
      setDoctors(res.data.doctors || []);
    } catch { showError('Failed to search doctors.'); }
  }, [query]);
  useEffect(() => { searchDoctors(); }, [searchDoctors]);

  const loadMyAppointments = useCallback(async () => {
    try {
      const res = await api.get('/api/appointments');
      setMyAppointments(res.data.appointments || []);
    } catch { /* silent — non-critical list */ }
  }, []);
  useEffect(() => { loadMyAppointments(); }, [loadMyAppointments]);
  useLiveNotifications(useCallback((notif) => {
    if (notif.type === 'appointment-status' || notif.type === 'appointment-reschedule-proposed') loadMyAppointments();
  }, [loadMyAppointments]));

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([searchDoctors(), loadMyAppointments()]);
    setRefreshing(false);
  };

  const pickDoctor = async (doc) => {
    setSelectedDoctor(doc);
    setDate(''); setSelectedSlot(null);
    try {
      const res = await api.get(`/api/doctors/${doc.id}/availability`);
      setAvailability(res.data.weekly_slots || []);
    } catch { setAvailability([]); }
  };

  const dayName = date ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) : '';
  const dayIsAvailable = availability.length === 0 || availability.some((s) => s.day === dayName);
  const todaysSlot = availability.find((s) => s.day === dayName);
  const slots = todaysSlot ? generateSlots(todaysSlot.start, todaysSlot.end) : [];

  const handleBook = async () => {
    if (!selectedDoctor || !date || !selectedSlot) { showError('Pick a doctor, date and a time slot.'); return; }
    setSaving(true);
    try {
      const res = await api.post('/appointments/book', {
        patient_id: patientId, doctor_id: selectedDoctor.id, date,
        time: selectedSlot.start, time_end: selectedSlot.end, notes,
      });
      showSuccess(res.data.message || 'Appointment requested — Reception will confirm it.');
      setDate(''); setSelectedSlot(null); setNotes('');
      loadMyAppointments();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to book appointment.'); }
    finally { setSaving(false); }
  };

  const respondReschedule = async (id, accept) => {
    try {
      await api.post(`/api/appointments/${id}/respond-reschedule`, { accept });
      showSuccess(accept ? 'New time accepted.' : 'Proposed time declined.');
      loadMyAppointments();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to respond.'); }
  };

  return (
    <AnimatedScreen
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
    >
      <Text style={styles.h1}>Book Appointment</Text>

      <Card>
        <FieldLabel>Search Doctor (name or specialization)</FieldLabel>
        <Input value={query} onChangeText={setQuery} onSubmitEditing={searchDoctors} placeholder="e.g. Cardiology, Dr. Imran" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: SPACE.md }}>
          {doctors.map((d) => (
            <TouchableOpacity
              key={d.id}
              onPress={() => pickDoctor(d)}
              style={[styles.doctorChip, selectedDoctor?.id === d.id && styles.doctorChipActive]}
            >
              <Text style={styles.doctorChipName}>{d.name}</Text>
              <Text style={styles.doctorChipSpec}>{d.specialization || 'General'}</Text>
            </TouchableOpacity>
          ))}
          {doctors.length === 0 && <Text style={styles.mutedText}>No doctors found.</Text>}
        </View>
      </Card>

      {selectedDoctor && (
        <Card>
          <Text style={styles.cardTitle}>Book with {selectedDoctor.name}</Text>
          {availability.length > 0 ? (
            <Text style={styles.availText}>
              Available: {availability.map((s) => `${s.day} ${formatRange12(s.start, s.end)}`).join(', ')}
            </Text>
          ) : (
            <Text style={styles.availText}>This doctor hasn't set specific hours yet — any date/time will be requested.</Text>
          )}

          <FieldLabel>Date (YYYY-MM-DD)</FieldLabel>
          <Input value={date} onChangeText={(v) => { setDate(v); setSelectedSlot(null); }} placeholder="e.g. 2026-08-15" style={{ marginBottom: SPACE.md }} />

          <FieldLabel>Reason (optional)</FieldLabel>
          <Input value={notes} onChangeText={setNotes} placeholder="Reason for visit" style={{ marginBottom: SPACE.md }} />

          {date && dayIsAvailable && (
            <>
              <FieldLabel>Pick a time slot</FieldLabel>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.md }}>
                {slots.length > 0 ? slots.map((s) => (
                  <TouchableOpacity
                    key={s.start}
                    onPress={() => setSelectedSlot(s)}
                    style={[styles.slotChip, selectedSlot?.start === s.start && styles.slotChipActive]}
                  >
                    <Text style={[styles.slotChipText, selectedSlot?.start === s.start && styles.slotChipTextActive]}>{s.label}</Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={styles.mutedText}>No fixed slots — any time will be requested; add one in Reason above if you have one in mind.</Text>
                )}
              </View>
            </>
          )}

          {date && !dayIsAvailable && (
            <Text style={styles.errorText}>{selectedDoctor.name} is not available on {dayName}s — pick a different date.</Text>
          )}

          <PrimaryButton label="Request Appointment" loading={saving} onPress={handleBook} />
        </Card>
      )}

      <Card>
        <Text style={styles.cardTitle}>My Requests</Text>
        {myAppointments.length === 0 ? (
          <EmptyState icon={<Feather name="calendar" size={40} color={C.faint} />} title="No appointment requests yet" />
        ) : myAppointments.map((a) => (
          <View key={a.id} style={styles.apptRow}>
            <View style={styles.rowBetween}>
              <Text style={styles.apptDoctor}>{a.doctor_name}</Text>
              <StatusBadge status={a.status} />
            </View>
            <Text style={styles.apptMeta}>
              {a.status === 'Reschedule-Proposed' ? a.proposed_date : a.date}
              {'  ·  '}
              {formatRange12(
                a.status === 'Reschedule-Proposed' ? a.proposed_time : a.time,
                a.status === 'Reschedule-Proposed' ? a.proposed_time_end : a.time_end
              )}
            </Text>
            {a.status === 'Reschedule-Proposed' && (
              <View>
                <Text style={styles.mutedText}>
                  Reception proposed this new time{a.proposed_reason ? ` — ${a.proposed_reason}` : ''}.
                </Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => respondReschedule(a.id, true)}>
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => respondReschedule(a.id, false)}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {a.status === 'Cancelled' && a.reason && (
              <Text style={styles.mutedText}>Reason: {a.reason}</Text>
            )}
          </View>
        ))}
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: 8 },
  mutedText: { fontSize: 12.5, color: C.textMuted },
  errorText: { fontSize: 12, color: C.red, marginBottom: SPACE.sm },
  availText: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
  doctorChip: {
    borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.md, padding: 12, minWidth: 150,
    backgroundColor: '#fff',
  },
  doctorChipActive: { borderWidth: 2, borderColor: C.blueDark, backgroundColor: C.blueSoft },
  doctorChipName: { fontWeight: '700', fontSize: 13.5, color: C.text },
  doctorChipSpec: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  slotChip: { borderWidth: 1, borderColor: C.border, borderRadius: RADIUS.sm, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: '#fff' },
  slotChipActive: { borderWidth: 2, borderColor: C.blueDark, backgroundColor: C.blueSoft },
  slotChipText: { fontSize: 12.5, fontWeight: '600', color: C.text },
  slotChipTextActive: { color: C.blueDark },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  apptRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  apptDoctor: { fontWeight: '700', fontSize: 14, color: C.text },
  apptMeta: { fontSize: 12.5, color: C.textMuted, marginTop: 4, marginBottom: 6 },
  statusBadge: { borderRadius: RADIUS.pill, paddingVertical: 3, paddingHorizontal: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  acceptBtn: { backgroundColor: C.blue, borderRadius: RADIUS.sm, paddingVertical: 6, paddingHorizontal: 14 },
  acceptBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  declineBtn: { backgroundColor: C.red, borderRadius: RADIUS.sm, paddingVertical: 6, paddingHorizontal: 14 },
  declineBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
