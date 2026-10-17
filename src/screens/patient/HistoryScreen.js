import React from 'react';
import { View, RefreshControl, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePatientData } from '../../context/PatientDataContext';
import { Card, EmptyState } from '../../components/ui';
import { C, SPACE, createStyles } from '../../theme';

export default function HistoryScreen() {
  const { prescriptions, doctorMap, refreshing, refresh } = usePatientData();

  return (
    <AnimatedScreen
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}
    >
      <Text style={styles.h1}>Medical History</Text>
      <Text style={styles.sub}>Your consultation and prescription record</Text>

      {prescriptions.length === 0 ? (
        <Card>
          <EmptyState icon={<Feather name="clipboard" size={44} color={C.faint} />} title="No consultations recorded yet" />
        </Card>
      ) : (
        prescriptions.map((presc) => (
          <Card key={presc.id}>
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="user-check" size={14} color={C.blue} />
                <Text style={styles.doctorName}>{doctorMap[presc.doctor_id] ? `Dr. ${doctorMap[presc.doctor_id].replace(/^Dr\.?\s+/i, '')}` : `Doctor ${presc.doctor_id}`}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="calendar" size={12} color={C.textMuted} />
                <Text style={styles.date}>{presc.created_at}</Text>
              </View>
            </View>
            {(presc.medicines || []).map((m, i) => (
              <View key={i} style={styles.medLine}>
                <Feather name="circle" size={7} color={C.blue} />
                <Text style={styles.medText}>
                  <Text style={{ fontWeight: '700' }}>{m.name}</Text> × {m.qty_suggested}
                  {m.schedule?.length > 0 ? `  —  ${m.schedule.join('/')}${m.meal_relation ? `, ${m.meal_relation}` : ''}` : ''}
                </Text>
              </View>
            ))}
            {presc.addendums?.length > 0 && (
              <Text style={styles.addendum}>+{presc.addendums.length} note{presc.addendums.length > 1 ? 's' : ''} added</Text>
            )}
          </Card>
        ))
      )}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  doctorName: { fontWeight: '700', fontSize: 14, color: C.navyMid },
  date: { fontSize: 12, color: C.textMuted },
  medLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  medText: { fontSize: 13.5, color: C.text, flex: 1 },
  addendum: { marginTop: 8, fontSize: 12, color: C.purple },
});
