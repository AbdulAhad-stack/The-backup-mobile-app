import React from 'react';
import { View, RefreshControl, ActivityIndicator } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useDoctorData } from '../../context/DoctorDataContext';
import StatCard, { StatGrid } from '../../components/StatCard';
import { C, SPACE, createStyles } from '../../theme';

export default function DoctorOverviewScreen({ navigation }) {
  const { docId, stats, activeAssigned, completedAssigned, loading, refreshing, refresh } = useDoctorData();

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.blue} /></View>;

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}>
      <Text style={styles.h1}>Overview</Text>
      <Text style={styles.sub}>Dr. {docId}  ·  {stats.today_date}</Text>

      <StatGrid>
        <StatCard label="Total Patients" value={stats.total} icon="users" color={C.blue} bg={C.blueSoft} onPress={() => navigation.navigate('Patient Records')} />
        <StatCard label="Pending Consultations" value={activeAssigned.length} icon="clock" color="#c2410c" bg="#fff7ed" onPress={() => navigation.navigate('Assigned to Me')} />
        <StatCard label="Completed Today" value={completedAssigned.length} icon="check-circle" color="#15803d" bg="#f0fdf4" onPress={() => navigation.navigate('Assigned to Me')} />
      </StatGrid>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
});
