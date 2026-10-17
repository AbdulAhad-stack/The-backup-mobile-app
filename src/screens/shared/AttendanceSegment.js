import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity } from '../../components/Themed';
import { Text } from '../../components/AppText';
import api from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel, PrimaryButton } from '../../components/ui';
import BottomSheet from '../../components/BottomSheet';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

export async function fetchPeople() {
  const [staffRes, docRes] = await Promise.all([api.get('/api/admin/staff'), api.get('/api/users_by_role/Doctor')]);
  const staff = (staffRes.data.staff || []).map((s) => ({ id: s.id, full_name: s.full_name, role: s.role, status: s.status }));
  const doctors = (docRes.data.users || []).map((d) => ({ id: d.id, full_name: d.full_name, role: 'doctor', status: d.status }));
  return [...staff, ...doctors];
}

const ATTENDANCE_SECTIONS = [
  { key: 'Present', label: 'Present', color: '#15803d', bg: '#f0fdf4' },
  { key: 'Absent', label: 'Absent', color: '#b91c1c', bg: '#fef2f2' },
  { key: 'Leave', label: 'On Leave', color: '#92400e', bg: '#fffbeb' },
  { key: 'Unmarked', label: 'Not Marked Yet', color: '#6b7280', bg: '#f6f7fe' },
];

function ReasonSheet({ target, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <BottomSheet visible={!!target} onClose={onClose} title={`Mark ${target?.status || ''}`} icon="edit-3">
      <FieldLabel>Reason</FieldLabel>
      <Input value={reason} onChangeText={setReason} style={{ marginBottom: SPACE.lg }} />
      <PrimaryButton label="Save" onPress={() => { onConfirm(reason); setReason(''); }} />
    </BottomSheet>
  );
}

export default function AttendanceSegment() {
  const [people, setPeople] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [reasonTarget, setReasonTarget] = useState(null);

  const loadPeople = useCallback(async () => { try { setPeople(await fetchPeople()); } catch { showError('Failed to load staff/doctors.'); } }, []);
  const loadRecords = useCallback(async () => {
    try { const res = await api.get('/api/attendance', { params: { date } }); setRecords(res.data.attendance || []); }
    catch { showError('Failed to load attendance.'); }
  }, [date]);

  useEffect(() => { loadPeople(); }, [loadPeople]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const filteredPeople = search.trim()
    ? people.filter((p) => (p.full_name || '').toLowerCase().includes(search.toLowerCase()) || (p.id || '').toLowerCase().includes(search.toLowerCase()))
    : people;

  const recordFor = (id) => records.find((r) => r.staff_id === id);

  const mark = async (personId, status, reason = '') => {
    try {
      await api.post('/api/attendance/mark', { staff_id: personId, date, status, reason });
      showSuccess(`Marked ${status}.`); setReasonTarget(null); loadRecords();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to mark attendance.'); }
  };

  const handleMark = (personId, status) => (status === 'Present' ? mark(personId, 'Present') : setReasonTarget({ personId, status }));

  const sectioned = ATTENDANCE_SECTIONS.map((sec) => ({ ...sec, people: filteredPeople.filter((p) => (recordFor(p.id)?.status || 'Unmarked') === sec.key) }));

  return (
    <>
      <Card>
        <FieldLabel>Date (YYYY-MM-DD)</FieldLabel>
        <Input value={date} onChangeText={setDate} style={{ marginBottom: SPACE.md }} />
        <FieldLabel>Search by name or ID</FieldLabel>
        <Input value={search} onChangeText={setSearch} placeholder="e.g. Ahmed, S-0004" />
      </Card>

      {sectioned.map((sec) => (
        <Card key={sec.key}>
          <View style={styles.secHead}>
            <View style={[styles.dot, { backgroundColor: sec.color }]} />
            <Text style={[styles.secTitle, { color: sec.color }]}>{sec.label} ({sec.people.length})</Text>
          </View>
          {sec.people.length === 0 ? <Text style={styles.note}>No one here.</Text> : sec.people.map((p) => {
            const rec = recordFor(p.id);
            return (
              <View key={p.id} style={[styles.attRow, { backgroundColor: sec.bg }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.attName}>{p.full_name}</Text>
                  <Text style={styles.attMeta}>{p.id}  ·  {p.role}{rec?.reason ? `  ·  ${rec.reason}` : ''}</Text>
                </View>
                <View style={styles.attActions}>
                  <TouchableOpacity style={[styles.attBtn, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]} onPress={() => handleMark(p.id, 'Present')}><Text style={styles.attBtnText}>P</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.attBtn, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]} onPress={() => handleMark(p.id, 'Absent')}><Text style={styles.attBtnText}>A</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.attBtn, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]} onPress={() => handleMark(p.id, 'Leave')}><Text style={styles.attBtnText}>L</Text></TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>
      ))}

      <ReasonSheet target={reasonTarget} onClose={() => setReasonTarget(null)} onConfirm={(reason) => mark(reasonTarget.personId, reasonTarget.status, reason)} />
    </>
  );
}

const styles = createStyles({
  note: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACE.md },
  dot: { width: 8, height: 8, borderRadius: 4 },
  secTitle: { fontWeight: '700', fontSize: 14 },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: SPACE.sm, borderRadius: RADIUS.sm, marginBottom: 6 },
  attName: { fontWeight: '700', fontSize: 13, color: C.text },
  attMeta: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  attActions: { flexDirection: 'row', gap: 6 },
  attBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  attBtnText: { fontWeight: '800', fontSize: 12, color: C.text },
});
