import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel, PrimaryButton, EmptyState } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import SelectField from '../../components/SelectField';
import BottomSheet from '../../components/BottomSheet';
import AttendanceSegment, { fetchPeople } from '../shared/AttendanceSegment';
import { downloadAndSharePdf } from '../../utils/pdf';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const AVAIL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function AvailabilitySegment() {
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [enabled, setEnabled] = useState({});
  const [times, setTimes] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/api/users_by_role/Doctor').then((res) => setDoctors(res.data.users || [])).catch(() => showError('Failed to load doctors.')); }, []);

  const selectDoctor = async (id) => {
    setDoctorId(id);
    if (!id) return;
    try {
      const res = await api.get(`/api/doctors/${id}/availability`);
      const slots = res.data.weekly_slots || [];
      const e = {}, t = {};
      AVAIL_DAYS.forEach((d) => { e[d] = false; t[d] = { start: '09:00', end: '17:00' }; });
      slots.forEach((s) => { e[s.day] = true; t[s.day] = { start: s.start, end: s.end }; });
      setEnabled(e); setTimes(t);
    } catch {
      const e = {}, t = {};
      AVAIL_DAYS.forEach((d) => { e[d] = false; t[d] = { start: '09:00', end: '17:00' }; });
      setEnabled(e); setTimes(t);
    }
  };

  const save = async () => {
    if (!doctorId) { showError('Select a doctor first.'); return; }
    setSaving(true);
    try {
      const weekly_slots = AVAIL_DAYS.filter((d) => enabled[d]).map((d) => ({ day: d, start: times[d].start, end: times[d].end }));
      await api.put(`/api/doctor/${doctorId}/availability`, { weekly_slots });
      showSuccess('Availability updated.');
    } catch (err) { showError(err.response?.data?.detail || 'Failed to update availability.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Card>
        <SelectField label="Doctor" value={doctorId} onChange={selectDoctor} options={doctors.map((d) => ({ value: d.id, label: `${d.full_name} (${d.id})` }))} placeholder="Select a doctor…" />
      </Card>
      {doctorId && (
        <Card>
          <Text style={styles.note}>Patients booking an appointment can only pick a date/time within the days and hours set here.</Text>
          {AVAIL_DAYS.map((day) => (
            <View key={day} style={styles.availRow}>
              <TouchableOpacity style={styles.availCheck} onPress={() => setEnabled((en) => ({ ...en, [day]: !en[day] }))}>
                <Feather name={enabled[day] ? 'check-square' : 'square'} size={16} color={enabled[day] ? C.blue : C.muted} />
                <Text style={styles.availDay}>{day}</Text>
              </TouchableOpacity>
              {enabled[day] && (
                <View style={styles.availTimes}>
                  <Input value={times[day]?.start || '09:00'} onChangeText={(v) => setTimes((t) => ({ ...t, [day]: { ...t[day], start: v } }))} style={styles.timeInput} placeholder="09:00" />
                  <Text style={{ color: C.textMuted }}>to</Text>
                  <Input value={times[day]?.end || '17:00'} onChangeText={(v) => setTimes((t) => ({ ...t, [day]: { ...t[day], end: v } }))} style={styles.timeInput} placeholder="17:00" />
                </View>
              )}
            </View>
          ))}
          <View style={{ height: SPACE.md }} />
          <PrimaryButton label="Save Availability" loading={saving} onPress={save} />
        </Card>
      )}
    </>
  );
}

function PayrollSegment() {
  const [people, setPeople] = useState([]);
  const [salaryTarget, setSalaryTarget] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ base_salary: '', allowances: '', deductions: '', bonus: '' });
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [payroll, setPayroll] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadPeople = useCallback(async () => { try { setPeople(await fetchPeople()); } catch { showError('Failed to load staff/doctors.'); } }, []);
  const loadPayroll = useCallback(async () => {
    try { const res = await api.get('/api/admin/payroll', { params: { month } }); setPayroll(res.data.payroll || []); }
    catch { showError('Failed to load payroll.'); }
  }, [month]);

  useEffect(() => { loadPeople(); }, [loadPeople]);
  useEffect(() => { loadPayroll(); }, [loadPayroll]);

  const saveSalary = async () => {
    setSavingSalary(true);
    try {
      const col = salaryTarget.role === 'doctor' ? 'doctor' : 'staff';
      await api.post(`/api/admin/${col}/${salaryTarget.id}/salary`, {
        base_salary: parseFloat(salaryForm.base_salary) || 0, allowances: parseFloat(salaryForm.allowances) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0, bonus: parseFloat(salaryForm.bonus) || 0,
      });
      showSuccess('Salary updated.'); setSalaryTarget(null);
    } catch (err) { showError(err.response?.data?.detail || 'Failed to update salary.'); }
    finally { setSavingSalary(false); }
  };

  const generatePayroll = async () => {
    setGenerating(true);
    try { const res = await api.post('/api/admin/payroll/generate', { month }); showSuccess(`Payroll generated for ${res.data.generated} staff/doctors.`); loadPayroll(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to generate payroll.'); }
    finally { setGenerating(false); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Set Salary</Text>
        <RecordList
          data={people}
          emptyIcon="users"
          emptyTitle="No staff/doctors found"
          renderItem={(p) => <RecordCard title={p.full_name} subtitle={`${p.role}  ·  ${p.status}`} actions={[{ label: 'Set Salary', icon: 'dollar-sign', onPress: () => { setSalaryTarget(p); setSalaryForm({ base_salary: '', allowances: '', deductions: '', bonus: '' }); } }]} />}
        />
      </Card>

      <Card>
        <FieldLabel>Month (YYYY-MM)</FieldLabel>
        <Input value={month} onChangeText={setMonth} style={{ marginBottom: SPACE.md }} />
        <PrimaryButton label="Generate Payroll" loading={generating} onPress={generatePayroll} />
      </Card>
      <Card>
        <RecordList
          data={payroll}
          emptyIcon="file-text"
          emptyTitle="No payroll generated for this month yet"
          renderItem={(p) => (
            <RecordCard
              title={p.staff_name}
              subtitle={p.status}
              fields={[{ label: 'Net Pay', value: p.net_pay?.toLocaleString() }]}
              actions={[{
                label: downloadingId === p.id ? 'Preparing…' : 'Share / Download Payslip',
                icon: 'share-2',
                onPress: () => {
                  setDownloadingId(p.id);
                  downloadAndSharePdf(`/api/admin/payroll/${p.id}/payslip`, `payslip_${p.id}.pdf`, { onEnd: () => setDownloadingId(null) });
                },
              }]}
            />
          )}
        />
      </Card>

      <BottomSheet visible={!!salaryTarget} onClose={() => setSalaryTarget(null)} title={`Set Salary — ${salaryTarget?.full_name || ''}`} icon="dollar-sign">
        <FieldLabel>Base Salary</FieldLabel>
        <Input value={salaryForm.base_salary} onChangeText={(v) => setSalaryForm((f) => ({ ...f, base_salary: v }))} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACE.md }}>
          <View style={{ flex: 1 }}><FieldLabel>Allowances</FieldLabel><Input value={salaryForm.allowances} onChangeText={(v) => setSalaryForm((f) => ({ ...f, allowances: v }))} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><FieldLabel>Deductions</FieldLabel><Input value={salaryForm.deductions} onChangeText={(v) => setSalaryForm((f) => ({ ...f, deductions: v }))} keyboardType="numeric" /></View>
        </View>
        <FieldLabel>Bonus</FieldLabel>
        <Input value={salaryForm.bonus} onChangeText={(v) => setSalaryForm((f) => ({ ...f, bonus: v }))} keyboardType="numeric" style={{ marginBottom: SPACE.lg }} />
        <PrimaryButton label="Save Salary" loading={savingSalary} onPress={saveSalary} />
      </BottomSheet>
    </>
  );
}

export default function AdminHRScreen() {
  const [seg, setSeg] = useState('availability');
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>HR &amp; Payroll</Text>
      <SegmentedTabs options={[{ key: 'availability', label: 'Doctor Availability' }, { key: 'attendance', label: 'Attendance' }, { key: 'payroll', label: 'Payroll' }]} value={seg} onChange={setSeg} />
      {seg === 'availability' && <AvailabilitySegment />}
      {seg === 'attendance' && <AttendanceSegment />}
      {seg === 'payroll' && <PayrollSegment />}
    </AnimatedScreen>
  );
}

// Standalone, single-purpose screens for the flat web-matching sidebar.
export function AdminDoctorAvailabilityScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Doctor Availability</Text>
      <AvailabilitySegment />
    </AnimatedScreen>
  );
}
export function AdminAttendanceScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Attendance</Text>
      <AttendanceSegment />
    </AnimatedScreen>
  );
}
export function AdminPayrollScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Payroll</Text>
      <PayrollSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  note: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
  availRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  availCheck: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  availDay: { fontSize: 13.5, fontWeight: '600', color: C.text },
  availTimes: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeInput: { flex: 1, marginBottom: 0 },
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
