import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { View, TouchableOpacity, ActivityIndicator, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useDoctorData } from '../../context/DoctorDataContext';
import { Card, EmptyState, PrimaryButton } from '../../components/ui';
import { showError, showSuccess } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function PrescriptionCard({ presc }) {
  return (
    <View style={styles.prescCard}>
      <View style={styles.prescHead}>
        <Text style={styles.prescDate}><Feather name="package" size={12} color={C.blue} /> {presc.created_at}</Text>
        <View style={styles.prescStatus}><Text style={styles.prescStatusText}>{presc.status}</Text></View>
      </View>
      {(presc.medicines || []).map((m, i) => (
        <Text key={i} style={styles.medLine}>
          <Text style={{ fontWeight: '700' }}>{m.name}</Text> × {m.qty_suggested}
          {m.schedule?.length > 0 ? `  —  ${m.schedule.join('/')}${m.meal_relation ? `, ${m.meal_relation}` : ''}` : ''}
          {m.duration_days ? `  ·  ${m.duration_days} days` : ''}
        </Text>
      ))}
    </View>
  );
}

export default function DoctorPatientDetailScreen({ route, navigation }) {
  const { patient } = route.params;
  const { fetchPrescriptionHistory, deletePatient } = useDoctorData();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const pid = patient.id || patient.p_id;

  const load = useCallback(async () => {
    setLoading(true);
    try { setHistory(await fetchPrescriptionHistory(pid)); }
    catch { showError('Failed to load prescription history.'); }
    finally { setLoading(false); }
  }, [pid, fetchPrescriptionHistory]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = () => {
    Alert.alert('Delete Patient', `Permanently delete all records for patient "${pid}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await deletePatient(pid); navigation.goBack(); }
          catch { showError('Delete failed. Please try again.'); }
        },
      },
    ]);
  };

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <View style={styles.actionsRow}>
        <PrimaryButton
          label="Consultation"
          icon={<Feather name="edit-3" size={14} color="#fff" />}
          onPress={() => navigation.navigate('Consultation', { presetPatientId: pid })}
          style={{ flex: 1 }}
        />
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={16} color={C.red} />
        </TouchableOpacity>
      </View>

      <Card>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(patient.name || 'P')[0].toUpperCase()}</Text></View>
          <View>
            <Text style={styles.name}>{patient.name || patient.full_name}</Text>
            <Text style={styles.sub}>ID: {pid}</Text>
          </View>
        </View>
        <InfoRow label="Age" value={patient.age && `${patient.age} years`} />
        <InfoRow label="Gender" value={patient.gender} />
        <InfoRow label="CNIC" value={patient.cnic} />
        <InfoRow label="Mobile" value={patient.mobile} />
        <InfoRow label="Email" value={patient.email} />
        <InfoRow label="Attending Doctor" value={patient.attending_doctor} />
      </Card>

      <Text style={styles.sectionTitle}>Prescription History ({history.length})</Text>
      {loading ? (
        <ActivityIndicator color={C.blue} style={{ marginTop: 20 }} />
      ) : history.length === 0 ? (
        <Card><EmptyState icon={<Feather name="package" size={40} color={C.faint} />} title="No prescriptions yet" /></Card>
      ) : history.map((presc) => <PrescriptionCard key={presc.id} presc={presc} />)}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACE.lg },
  deleteBtn: { width: 46, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fff1f2', borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: SPACE.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#cfd2f4' },
  avatarText: { fontWeight: '800', fontSize: 18, color: C.blue },
  name: { fontWeight: '800', fontSize: 16, color: C.text },
  sub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 8 },
  infoLabel: { fontSize: 11.5, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase' },
  infoValue: { fontSize: 13, fontWeight: '700', color: C.text },
  sectionTitle: { fontWeight: '800', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  prescCard: { backgroundColor: C.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, marginBottom: SPACE.sm, overflow: 'hidden' },
  prescHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.blueSoft, padding: SPACE.md, borderBottomWidth: 1, borderBottomColor: '#cfd2f4' },
  prescDate: { fontSize: 12, fontWeight: '700', color: C.blueDark },
  prescStatus: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: RADIUS.pill, paddingVertical: 2, paddingHorizontal: 10 },
  prescStatusText: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  medLine: { fontSize: 13, color: C.text, padding: SPACE.md, paddingTop: 8, paddingBottom: 0 },
});
