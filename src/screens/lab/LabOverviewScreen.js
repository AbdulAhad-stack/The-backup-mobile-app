import React from 'react';
import { View, RefreshControl, ActivityIndicator, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useLabData } from '../../context/LabDataContext';
import { Card, EmptyState } from '../../components/ui';
import StatCard, { StatGrid } from '../../components/StatCard';
import { RecordCard, RecordList } from '../../components/DataList';
import { C, SPACE, createStyles } from '../../theme';

const STATUS_META = {
  Collected: { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  Processing: { bg: '#e0e3fb', color: '#3a3d86', border: '#cfd2f4' },
  Verified: { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
};

export default function LabOverviewScreen({ navigation }) {
  const { dash, loading, refreshing, refresh } = useLabData();

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#5b5fc7" /></View>;

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
      <Text style={styles.h1}>Lab Overview</Text>

      <StatGrid>
        <StatCard label="Total Samples" value={dash.total_samples} icon="database" color="#5b5fc7" bg="#ecefff" onPress={() => navigation.navigate('Samples')} />
        <StatCard label="Pending" value={dash.pending_samples} icon="clock" color="#b45309" bg="#fffbeb" onPress={() => navigation.navigate('Samples')} />
        <StatCard label="Completed Today" value={dash.completed_today} icon="check-circle" color="#15803d" bg="#f0fdf4" onPress={() => navigation.navigate('Samples')} />
        <StatCard label="Critical Alerts" value={dash.critical_count} icon="alert-triangle" color="#dc2626" bg="#fef2f2" onPress={() => navigation.navigate('Samples')} />
      </StatGrid>

      <Card>
        <Text style={styles.cardTitle}>Recent Samples</Text>
        <RecordList
          data={dash.recent_samples}
          emptyIcon="inbox"
          emptyTitle="No samples yet"
          renderItem={(s) => {
            const meta = STATUS_META[s.status] || { bg: '#eceefb', color: '#3b3e66', border: '#dcdff3' };
            return (
              <RecordCard
                title={s.patient_name}
                subtitle={s.test_name}
                badge={{ label: s.status, ...meta }}
              />
            );
          }}
        />
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
});
