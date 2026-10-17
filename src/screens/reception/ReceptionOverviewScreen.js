import React from 'react';
import { View, RefreshControl, ActivityIndicator, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useReceptionData } from '../../context/ReceptionDataContext';
import { Card } from '../../components/ui';
import StatCard, { StatGrid } from '../../components/StatCard';
import { RecordCard, RecordList } from '../../components/DataList';
import { C, SPACE, createStyles } from '../../theme';

export default function ReceptionOverviewScreen({ navigation }) {
  const { stats, activeUsers, loading, refreshing, refresh } = useReceptionData();

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={C.blue} /></View>;

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.h1}>Dashboard Overview</Text>
          <Text style={styles.sub}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: C.blue }]} onPress={() => navigation.navigate('Register Patient')}>
          <Feather name="user-plus" size={14} color="#fff" />
          <Text style={styles.quickBtnText}>Register Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.quickBtn, { backgroundColor: '#d97706' }]} onPress={() => navigation.navigate('Assign Doctor')}>
          <Feather name="link" size={14} color="#fff" />
          <Text style={styles.quickBtnText}>Assign Doctor</Text>
        </TouchableOpacity>
      </View>

      <StatGrid>
        <StatCard label="Total Patients" value={stats.total_patients} icon="users" color={C.blue} bg={C.blueSoft} onPress={() => navigation.navigate('All Records')} />
        <StatCard label="Total Doctors" value={stats.total_doctors} icon="user-check" color="#15803d" bg="#f0fdf4" onPress={() => navigation.navigate('Assign Doctor')} />
        <StatCard label="Active Patients" value={stats.active_patients} icon="user-plus" color="#92400e" bg="#fef9c3" onPress={() => navigation.navigate('All Records')} />
        <StatCard label="Active Doctors" value={stats.activ_doctors} icon="activity" color="#9d174d" bg="#fce7f3" onPress={() => navigation.navigate('Assign Doctor')} />
      </StatGrid>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Recent Registrations</Text>
        </View>
        <RecordList
          data={activeUsers.slice(0, 8)}
          emptyIcon="users"
          emptyTitle="No records yet"
          renderItem={(u) => (
            <RecordCard
              title={u.full_name || '—'}
              subtitle={`${u.id}  ·  ${u.role}`}
              fields={[{ label: 'Mobile', value: u.mobile || '—' }, { label: 'Registered', value: u.created_at }]}
              badge={{ label: 'Active', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }}
            />
          )}
        />
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2 },
  quickRow: { flexDirection: 'row', gap: 10, marginTop: SPACE.lg, marginBottom: SPACE.lg },
  quickBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 10, paddingVertical: 11 },
  quickBtnText: { color: '#fff', fontWeight: '700', fontSize: 12.5 },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
});
