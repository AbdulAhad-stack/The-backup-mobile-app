import React from 'react';
import { View, RefreshControl, ActivityIndicator, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePatientData } from '../../context/PatientDataContext';
import { Card } from '../../components/ui';
import { getTimeSlot, SLOT_CONFIG } from '../../utils/reminderSlots';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

function InfoRow({ label, value, highlight, icon }) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon && <Feather name={icon} size={13} color={C.textMuted} />}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, highlight && { color: C.blue }]}>{value || '—'}</Text>
    </View>
  );
}

export default function OverviewScreen({ navigation }) {
  const { patient, reminders, patientId, loading, refreshing, refresh } = usePatientData();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.blue} />
        <Text style={styles.muted}>Loading your health dashboard…</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.center}>
        <Feather name="user-x" size={48} color={C.muted} />
        <Text style={styles.emptyTitle}>Record Not Found</Text>
        <Text style={styles.muted}>Your medical record has not been completed by a doctor yet.{'\n'}Please ask the reception desk to assign you a doctor.</Text>
      </View>
    );
  }

  const isDoctorAssigned = patient.attending_doctor && patient.attending_doctor !== 'Not Assigned';

  return (
    <AnimatedScreen
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}
    >
      <Text style={styles.h1}>Welcome, {patient.name || 'Patient'}</Text>
      <Text style={styles.dateText}>
        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </Text>

      {!isDoctorAssigned && (
        <View style={styles.noticeBox}>
          <Feather name="info" size={18} color={C.amber} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Doctor Assignment Pending</Text>
            <Text style={styles.noticeSub}>Please ask the reception desk to assign you a doctor.</Text>
          </View>
        </View>
      )}

      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(patient.name || 'P')[0].toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroName}>{patient.name}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            {patient.age ? <Text style={styles.heroMeta}>{patient.age} yrs</Text> : null}
            {patient.gender ? <Text style={styles.heroMeta}>{patient.gender}</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.docCard}>
        <Text style={styles.docLabel}>LAST ATTENDED DOCTOR</Text>
        <Text style={[styles.docValue, !isDoctorAssigned && { color: C.muted }]}>
          {isDoctorAssigned ? patient.attending_doctor : 'Pending Assignment'}
        </Text>
      </View>

      <Card>
        <Text style={styles.cardHead}><Feather name="user" size={15} color={C.blue} />  Patient Information</Text>
        <InfoRow label="Full Name" icon="user" value={patient.name} />
        <InfoRow label="Patient ID" icon="hash" value={patient.p_id || patientId} />
        <InfoRow label="Age" icon="clock" value={patient.age && `${patient.age} years`} />
        <InfoRow label="Gender" icon="layers" value={patient.gender} />
        <InfoRow label="Last Attended Doctor" icon="user-check" value={isDoctorAssigned ? patient.attending_doctor : '— (Not Assigned)'} highlight={isDoctorAssigned} />
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHead}><Feather name="bell" size={15} color={C.blue} />  Today's Reminders</Text>
        </View>
        {reminders.length > 0 ? reminders.slice(0, 4).map((r) => {
          const slot = SLOT_CONFIG.find((s) => s.key === getTimeSlot(r.time)) || SLOT_CONFIG[3];
          return (
            <View key={r.id} style={[styles.remRow, { backgroundColor: slot.bg, borderColor: slot.border }]}>
              <Feather name={slot.icon} size={15} color={slot.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.remTask}>{r.task}</Text>
                <Text style={styles.remTime}>{r.time || 'Anytime'}</Text>
              </View>
            </View>
          );
        }) : (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Feather name="bell-off" size={32} color={C.faint} />
            <Text style={styles.muted}>No reminders yet</Text>
          </View>
        )}
        {reminders.length > 4 && (
          <TouchableOpacity style={styles.viewAll} onPress={() => navigation.navigate('Daily Schedule')}>
            <Text style={styles.viewAllText}>View all {reminders.length}</Text>
            <Feather name="chevron-right" size={14} color={C.blue} />
          </TouchableOpacity>
        )}
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: C.bg, padding: SPACE.xl },
  muted: { color: C.textMuted, fontSize: 13, textAlign: 'center' },
  emptyTitle: { fontWeight: '700', fontSize: 18, color: C.text },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  dateText: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
  noticeBox: {
    flexDirection: 'row', gap: 10, backgroundColor: C.amberBg, borderWidth: 1, borderColor: C.amberBorder,
    borderRadius: RADIUS.md, padding: SPACE.md, marginBottom: SPACE.lg,
  },
  noticeTitle: { fontWeight: '700', color: '#92400e', fontSize: 13.5 },
  noticeSub: { color: '#78350f', fontSize: 12.5, marginTop: 2 },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: C.navyMid, borderRadius: RADIUS.lg,
    padding: SPACE.lg, marginBottom: 2,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  heroName: { color: '#fff', fontWeight: '800', fontSize: 18 },
  heroMeta: { color: 'rgba(255,255,255,0.75)', fontSize: 12.5 },
  docCard: {
    backgroundColor: '#4a4fb5', borderRadius: RADIUS.lg, padding: SPACE.md, marginBottom: SPACE.lg,
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
  },
  docLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  docValue: { color: '#fff', fontWeight: '700', fontSize: 14, marginTop: 3 },
  cardHead: { fontWeight: '700', fontSize: 15, color: C.navyMid, marginBottom: SPACE.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 10, marginBottom: 10,
  },
  infoLabel: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700', color: C.text },
  remRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: RADIUS.md,
    borderWidth: 1, marginBottom: 8,
  },
  remTask: { fontWeight: '600', fontSize: 13, color: C.text },
  remTime: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  viewAll: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6 },
  viewAllText: { color: C.blue, fontWeight: '600', fontSize: 13 },
});
