import React, { useState } from 'react';
import { View, TouchableOpacity, RefreshControl, Feather, MaterialCommunityIcons } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePatientData } from '../../context/PatientDataContext';
import { Card, EmptyState } from '../../components/ui';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

function Chip({ label, icon, bg, color }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      {icon === 'pill' ? <MaterialCommunityIcons name="pill" size={13} color={color} /> : <Feather name={icon} size={13} color={color} />}
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

export default function MedicationsScreen() {
  const { prescriptions, doctorMap, loading, refreshing, refresh } = usePatientData();
  const [medStatus, setMedStatus] = useState({});
  const allMeds = prescriptions.flatMap((p) => p.medicines || []);
  const takenCount = Object.values(medStatus).filter(Boolean).length;

  const toggle = (key) => setMedStatus((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <AnimatedScreen
      style={styles.flex}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}
    >
      <Text style={styles.h1}>Prescribed Medications</Text>
      <Text style={styles.sub}>Every prescription you've been given, most recent first.</Text>

      <View style={styles.chipRow}>
        <Chip label={`${allMeds.length} Medicines`} icon="pill" bg={C.blueSoft} color={C.blue} />
        <Chip label={`${takenCount} Taken`} icon="check-circle" bg={C.greenBg} color={C.green} />
        <Chip label={`${allMeds.length - takenCount} Pending`} icon="alert-circle" bg={C.amberBg} color={C.amber} />
      </View>

      {!loading && prescriptions.length === 0 && (
        <Card>
          <EmptyState icon={<MaterialCommunityIcons name="pill" size={44} color={C.faint} />} title="No medications prescribed yet" />
        </Card>
      )}

      {prescriptions.map((presc) => (
        <View key={presc.id} style={{ marginBottom: SPACE.lg }}>
          <Text style={styles.byLine}>
            As prescribed by {doctorMap[presc.doctor_id] ? `Dr. ${doctorMap[presc.doctor_id]}` : `Dr. ${presc.doctor_id}`}
            <Text style={styles.byLineDate}>  —  {presc.created_at}</Text>
          </Text>
          <Card style={{ marginBottom: 0 }}>
            {(presc.medicines || []).map((m, i) => {
              const key = `${presc.id}-${i}`;
              const taken = medStatus[key];
              return (
                <View key={key} style={[styles.medRow, taken && { backgroundColor: C.greenBg }]}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Feather name="circle" size={8} color={C.blue} />
                      <Text style={styles.medName}>{m.name}</Text>
                      <View style={styles.qtyPill}><Text style={styles.qtyPillText}>{m.qty_suggested}</Text></View>
                    </View>
                    <Text style={styles.medMeta}>
                      {m.schedule?.length ? `${m.schedule.join('/')}${m.meal_relation ? `, ${m.meal_relation}` : ''}` : 'No fixed schedule'}
                      {m.duration_days ? `  ·  ${m.duration_days} days` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggle(key)}
                    style={[styles.statusBtn, { backgroundColor: taken ? C.amberBg : C.greenBg, borderColor: taken ? C.amberBorder : C.greenBorder }]}
                  >
                    <Feather name={taken ? 'alert-circle' : 'check-circle'} size={12} color={taken ? C.amber : C.green} />
                    <Text style={[styles.statusBtnText, { color: taken ? C.amber : C.green }]}>{taken ? 'Pending' : 'Taken'}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </Card>
        </View>
      ))}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACE.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, borderRadius: RADIUS.pill },
  chipText: { fontSize: 12.5, fontWeight: '700' },
  byLine: { fontSize: 13, fontWeight: '700', color: C.navyMid, marginBottom: 8 },
  byLineDate: { color: C.textMuted, fontWeight: '500' },
  medRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  medName: { fontWeight: '700', fontSize: 14, color: C.text },
  qtyPill: { backgroundColor: C.blueSoft, borderRadius: RADIUS.pill, paddingVertical: 2, paddingHorizontal: 8, marginLeft: 4 },
  qtyPillText: { color: C.blue, fontSize: 11, fontWeight: '600' },
  medMeta: { fontSize: 12, color: C.textMuted, marginTop: 3 },
  statusBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: RADIUS.sm,
    paddingVertical: 6, paddingHorizontal: 10,
  },
  statusBtnText: { fontSize: 11.5, fontWeight: '700' },
});
