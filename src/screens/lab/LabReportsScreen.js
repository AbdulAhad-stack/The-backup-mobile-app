import React from 'react';
import { View, RefreshControl } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useLabData } from '../../context/LabDataContext';
import { RecordCard, RecordList } from '../../components/DataList';
import { C, SPACE, createStyles } from '../../theme';

export default function LabReportsScreen() {
  const { reports, refreshing, refresh } = useLabData();

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
      <Text style={styles.h1}>Reports</Text>
      <RecordList
        data={reports}
        emptyIcon="file-text"
        emptyTitle="No reports generated yet"
        renderItem={(r) => (
          <RecordCard title={r.patient_name} subtitle={r.test_name} fields={[{ label: 'Generated', value: r.generated_at }]} />
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
