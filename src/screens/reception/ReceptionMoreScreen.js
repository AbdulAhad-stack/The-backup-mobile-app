import React, { useState } from 'react';
import { View } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useReceptionData } from '../../context/ReceptionDataContext';
import { Card, Input, PrimaryButton } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SelectField from '../../components/SelectField';
import AttendanceSegment from '../shared/AttendanceSegment';
import { showError } from '../../utils/toast';
import { C, SPACE, createStyles } from '../../theme';

function AssignDoctorSegment() {
  const { patients, doctors, assignments, assignDoctor } = useReceptionData();
  const [assignPatient, setAssignPatient] = useState('');
  const [assignDoc, setAssignDoc] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const patientName = patients.find((p) => p.id === assignPatient)?.full_name;
  const doctorName = doctors.find((d) => d.id === assignDoc)?.full_name;

  const submit = async () => {
    if (!assignPatient || !assignDoc) { showError('Select both a patient and a doctor.'); return; }
    setSaving(true);
    try { await assignDoctor(assignPatient, assignDoc); setAssignPatient(''); setAssignDoc(''); }
    catch (err) { showError(err.response?.data?.detail || 'Assignment failed. Please try again.'); }
    finally { setSaving(false); }
  };

  const filteredAssignments = search.trim()
    ? assignments.filter((a) => (a.patient_name || '').toLowerCase().includes(search.toLowerCase()) || (a.doctor_name || '').toLowerCase().includes(search.toLowerCase()) || (a.patient_id || '').toLowerCase().includes(search.toLowerCase()))
    : assignments;

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>New Assignment</Text>
        <SelectField label="Patient" searchable value={assignPatient} onChange={setAssignPatient} options={patients.map((p) => ({ value: p.id, label: `${p.full_name} (${p.id})` }))} placeholder="Select a patient…" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Doctor" searchable value={assignDoc} onChange={setAssignDoc} options={doctors.map((d) => ({ value: d.id, label: `Dr. ${d.full_name}${d.specialization ? ` — ${d.specialization}` : ''}` }))} placeholder="Select a doctor…" />

        {(assignPatient || assignDoc) && (
          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>ASSIGNMENT PREVIEW</Text>
            <View style={styles.previewRow}>
              <View style={styles.previewChip}><Text style={styles.previewChipText}>{patientName || '—'}</Text></View>
              <Text style={{ color: C.muted }}>→</Text>
              <View style={[styles.previewChip, { backgroundColor: '#dcfce7' }]}><Text style={[styles.previewChipText, { color: '#15803d' }]}>Dr. {doctorName || '—'}</Text></View>
            </View>
          </View>
        )}

        <View style={{ height: SPACE.md }} />
        <PrimaryButton label="Confirm Assignment" loading={saving} onPress={submit} style={{ backgroundColor: '#d97706' }} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Current Assignments ({filteredAssignments.length})</Text>
        <Input value={search} onChangeText={setSearch} placeholder="Search by patient, doctor, or ID…" style={{ marginBottom: SPACE.md }} />
        <RecordList
          data={filteredAssignments}
          emptyIcon="link"
          emptyTitle="No assignments found"
          renderItem={(a) => <RecordCard title={a.patient_name} subtitle={`→ Dr. ${a.doctor_name}`} fields={[{ label: 'Assigned On', value: a.assigned_at }]} badge={{ label: 'Active', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }} />}
        />
      </Card>
    </>
  );
}

export default function ReceptionAssignDoctorScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Assign Doctor</Text>
      <AssignDoctorSegment />
    </AnimatedScreen>
  );
}

export function ReceptionAttendanceScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Attendance</Text>
      <AttendanceSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  previewBox: { backgroundColor: '#f0f9ff', borderWidth: 1, borderColor: '#bae6fd', borderRadius: 10, padding: 14, marginTop: SPACE.md },
  previewLabel: { fontWeight: '700', color: '#0369a1', fontSize: 11, marginBottom: 8, textTransform: 'uppercase' },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  previewChip: { backgroundColor: '#e0e3fb', borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  previewChipText: { color: C.blue, fontSize: 12, fontWeight: '700' },
});
