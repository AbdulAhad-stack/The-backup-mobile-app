import React from 'react';
import { RefreshControl } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePharmacyData } from '../../context/PharmacyDataContext';
import { Card } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import { C, SPACE, createStyles } from '../../theme';

export default function AlertsScreen() {
  const { alerts, refreshing, refresh } = usePharmacyData();

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
      <Text style={styles.h1}>Alerts</Text>

      <Card>
        <Text style={styles.cardTitle}>Low Stock</Text>
        <RecordList
          data={alerts.low_stock}
          emptyIcon="check-circle"
          emptyTitle="No low-stock medicines"
          renderItem={(m) => <RecordCard title={m.name} fields={[{ label: 'Current Stock', value: m.current_stock }, { label: 'Threshold', value: m.low_stock_threshold }]} />}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Expiring Within 30 Days</Text>
        <RecordList
          data={alerts.expiring_soon}
          emptyIcon="check-circle"
          emptyTitle="Nothing expiring soon"
          renderItem={(m) => <RecordCard title={m.name} fields={[{ label: 'Expiry Date', value: m.expiry_date }]} />}
        />
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
});
