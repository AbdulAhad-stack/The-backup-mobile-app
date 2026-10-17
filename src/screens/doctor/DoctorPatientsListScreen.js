import React, { useState } from 'react';
import { View, RefreshControl } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useDoctorData } from '../../context/DoctorDataContext';
import { Input } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import StatCard, { StatGrid } from '../../components/StatCard';
import { C, SPACE, createStyles } from '../../theme';

const FILTERS = [{ key: 'all', label: 'All' }, { key: 'waiting', label: 'Waiting' }, { key: 'seen', label: 'Seen' }];

export default function DoctorPatientsListScreen({ navigation }) {
  const { patients, stats, refreshing, refresh } = useDoctorData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = patients.filter((p) => {
    if (statusFilter === 'waiting' && p.checked_in === 'True') return false;
    if (statusFilter === 'seen' && p.checked_in !== 'True') return false;
    if (!search) return true;
    return (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.id || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}>
      <Text style={styles.h1}>Patient Records</Text>

      <StatGrid>
        <StatCard label="Total Patients" value={stats.total} icon="users" color={C.blue} bg={C.blueSoft} />
        <StatCard label="Today's Consultations" value={stats.today} icon="calendar" color="#15803d" bg="#f0fdf4" />
      </StatGrid>

      <Input value={search} onChangeText={setSearch} placeholder="Search patients…" style={{ marginBottom: SPACE.md }} />
      <SegmentedTabs options={FILTERS} value={statusFilter} onChange={setStatusFilter} />

      <RecordList
        data={filtered}
        emptyIcon="users"
        emptyTitle={search || statusFilter !== 'all' ? 'No matching patients found' : 'No patient records yet'}
        renderItem={(p) => (
          <RecordCard
            title={p.name || '—'}
            subtitle={`${p.id}${p.age ? `  ·  ${p.age}y` : ''}${p.gender ? `  ·  ${p.gender}` : ''}`}
            badge={p.checked_in === 'True'
              ? { label: 'Seen', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }
              : { label: 'Waiting', bg: '#fefce8', color: '#a16207', border: '#fde68a' }}
            actions={[
              { label: 'View', icon: 'eye', onPress: () => navigation.navigate('PatientDetail', { patient: p }) },
              { label: 'Consultation', icon: 'edit-3', bg: C.blueSoft, border: '#cfd2f4', color: C.blue, onPress: () => navigation.navigate('Consultation', { presetPatientId: p.id || p.p_id }) },
            ]}
          />
        )}
      />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
});
