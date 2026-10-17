import React from 'react';
import { View, RefreshControl, ActivityIndicator } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePharmacyData } from '../../context/PharmacyDataContext';
import { Card } from '../../components/ui';
import StatCard, { StatGrid } from '../../components/StatCard';
import { C, SPACE, createStyles } from '../../theme';

const PURPLE = '#5b5fc7';

export default function PharmacyOverviewScreen({ navigation }) {
  const { medicines, alerts, loading, refreshing, refresh } = usePharmacyData();

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={PURPLE} /></View>;

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={PURPLE} />}>
      <Text style={styles.h1}>Pharmacy Overview</Text>

      <StatGrid>
        <StatCard label="Total Medicines" value={medicines.length} icon="package" color={PURPLE} bg="#ecefff" onPress={() => navigation.navigate('Medicines')} />
        <StatCard label="Low Stock" value={alerts.low_stock.length} icon="trending-down" color="#b45309" bg="#fffbeb" onPress={() => navigation.navigate('Alerts')} />
        <StatCard label="Expiring Soon" value={alerts.expiring_soon.length} icon="alert-triangle" color="#dc2626" bg="#fef2f2" onPress={() => navigation.navigate('Alerts')} />
      </StatGrid>

      <Card>
        <Text style={styles.note}>
          Use <Text style={styles.bold}>Dispense (Rx)</Text> to fulfil a doctor's prescription — quantity mismatches are
          automatically flagged for Admin review. Use <Text style={styles.bold}>Medicines</Text> for direct
          over-the-counter sales not tied to a prescription.
        </Text>
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  note: { fontSize: 13.5, color: C.textMuted, lineHeight: 20 },
  bold: { fontWeight: '700', color: C.text },
});
