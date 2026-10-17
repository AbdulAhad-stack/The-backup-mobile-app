import React, { useState, useEffect, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { LineChart } from 'react-native-gifted-charts';
import api from '../../api/client';
import { useAdminData } from '../../context/AdminDataContext';
import { Card } from '../../components/ui';
import StatCard, { StatGrid } from '../../components/StatCard';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const SCREEN_W = Dimensions.get('window').width;

const STATUS = {
  good: { bg: '#f0fdf4', fg: '#15803d', ring: '#bbf7d0' },
  warning: { bg: '#fffbeb', fg: '#b45309', ring: '#fde68a' },
  critical: { bg: '#fef2f2', fg: '#dc2626', ring: '#fecaca' },
};

function RecommendCard({ tone, icon, title, detail, onPress }) {
  const c = STATUS[tone];
  return (
    <TouchableOpacity disabled={!onPress} onPress={onPress} style={[styles.recCard, { backgroundColor: c.bg, borderColor: c.ring }]}>
      <Feather name={icon} size={16} color={c.fg} />
      <View style={{ flex: 1 }}>
        <Text style={styles.recTitle}>{title}</Text>
        <Text style={styles.recDetail}>{detail}</Text>
      </View>
      {onPress && <Feather name="chevron-right" size={14} color="#9ca3af" />}
    </TouchableOpacity>
  );
}

export default function AdminOverviewScreen({ navigation }) {
  const { staff, doctors, refreshing: parentRefreshing, refresh: parentRefresh } = useAdminData();
  const [stats, setStats] = useState({ total_patients: 0, today_appointments: 0 });
  const [report, setReport] = useState(null);
  const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });
  const [mismatches, setMismatches] = useState(0);
  const [cashFlag, setCashFlag] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  const load = useCallback(async () => {
    const month = new Date().toISOString().slice(0, 7);
    const results = await Promise.allSettled([
      api.get('/api/stats'),
      api.get('/api/admin/reports/financial', { params: { month } }),
      api.get('/api/pharmacy/alerts'),
      api.get('/api/admin/dispense-mismatches'),
      api.get('/api/admin/cash-reconciliation'),
      api.get('/api/admin/audit-logs', { params: { limit: 6 } }),
    ]);
    const [s, rep, alr, mis, cash, logs] = results;
    if (s.status === 'fulfilled') setStats(s.value.data);
    if (rep.status === 'fulfilled') setReport(rep.value.data);
    if (alr.status === 'fulfilled') setAlerts(alr.value.data);
    if (mis.status === 'fulfilled') setMismatches(mis.value.data.total || 0);
    if (cash.status === 'fulfilled') {
      const bad = (cash.value.data.records || []).find((r) => Math.abs(r.difference || 0) > 0);
      setCashFlag(bad || null);
    }
    if (logs.status === 'fulfilled') setRecentLogs(logs.value.data.logs || []);
  }, []);

  useEffect(() => { load(); }, [load]);
  useLiveNotifications(useCallback((notif) => { if (notif.target_role === 'admin') load(); }, [load]));

  const activeStaff = staff.filter((s) => s.status !== 'INACTIVE').length;
  const lowStockCount = alerts.low_stock?.length || 0;
  const expiringCount = alerts.expiring_soon?.length || 0;

  const recommendations = [
    lowStockCount > 0 && { tone: 'warning', icon: 'alert-triangle', title: `${lowStockCount} medicine${lowStockCount > 1 ? 's' : ''} low on stock`, detail: 'Pharmacist should restock soon.', tab: 'Wastage Approvals' },
    expiringCount > 0 && { tone: 'warning', icon: 'clock', title: `${expiringCount} medicine${expiringCount > 1 ? 's' : ''} expiring within 30 days`, detail: 'Plan wastage/return before expiry.', tab: 'Wastage Approvals' },
    mismatches > 0 && { tone: 'critical', icon: 'x-circle', title: `${mismatches} prescription mismatch${mismatches > 1 ? 'es' : ''} flagged`, detail: 'Doctor-suggested vs pharmacist-given quantity differs.', tab: 'Rx Mismatches' },
    cashFlag && { tone: 'critical', icon: 'alert-triangle', title: `Cash mismatch on ${cashFlag.date}`, detail: `Difference of ${cashFlag.difference} between system total and counted cash.`, tab: 'Cash Reconciliation' },
  ].filter(Boolean);

  const refreshBoth = async () => { await Promise.all([parentRefresh(), load()]); };

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={parentRefreshing} onRefresh={refreshBoth} tintColor={C.blue} />}>
      <Text style={styles.h1}>Admin Overview</Text>
      <Text style={styles.sub}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>

      <StatGrid>
        <StatCard label="Total Staff" value={staff.length} icon="users" color={C.blue} bg={C.blueSoft} onPress={() => navigation.navigate('Staff')} />
        <StatCard label="Active Staff" value={activeStaff} icon="check-circle" color="#15803d" bg="#f0fdf4" onPress={() => navigation.navigate('Staff')} />
        <StatCard label="Total Doctors" value={doctors.length} icon="user-check" color={C.blue} bg={C.blueSoft} onPress={() => navigation.navigate('Doctors')} />
        <StatCard label="Today's Appointments" value={stats.today_appointments || 0} icon="calendar" color="#5b5fc7" bg="#ecefff" />
      </StatGrid>

      <Card>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Revenue — Last 6 Months</Text>
          {report && <Text style={styles.revenueValue}>Rs {report.revenue.toLocaleString()}</Text>}
        </View>
        {report && report.trend?.length > 0 ? (
          <LineChart
            data={report.trend.map((t) => ({ value: t.revenue, label: t.month }))}
            areaChart
            curved
            width={SCREEN_W - SPACE.lg * 2 - SPACE.md * 2 - 30}
            height={180}
            color={C.blue}
            thickness={2}
            startFillColor={C.blue}
            endFillColor={C.blue}
            startOpacity={0.25}
            endOpacity={0}
            dataPointsColor={C.blue}
            dataPointsRadius={3}
            yAxisTextStyle={{ color: C.textMuted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: C.textMuted, fontSize: 10 }}
            rulesColor="#e9ebf9"
            xAxisColor="#dcdff3"
            yAxisColor="#dcdff3"
            noOfSections={4}
            initialSpacing={10}
            spacing={(SCREEN_W - SPACE.lg * 2 - SPACE.md * 2 - 30 - 20) / Math.max(report.trend.length - 1, 1)}
          />
        ) : (
          <Text style={styles.mutedText}>No revenue data for this period yet.</Text>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recommended For You</Text>
        {recommendations.length === 0 ? (
          <RecommendCard tone="good" icon="check-circle" title="All clear" detail="No pending approvals or flagged issues right now." />
        ) : (
          <View style={{ gap: 10 }}>
            {recommendations.map((r, i) => (
              <RecommendCard key={i} {...r} onPress={() => navigation.navigate(r.tab)} />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        {recentLogs.length === 0 ? (
          <Text style={styles.mutedText}>No activity recorded yet.</Text>
        ) : recentLogs.map((l, i) => (
          <View key={l.id} style={[styles.logRow, i > 0 && styles.logRowBorder]}>
            <View style={styles.logIcon}><Feather name="activity" size={13} color={C.blue} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.logText}><Text style={{ fontWeight: '700' }}>{l.actor_id}</Text> ({l.actor_role}) — {(l.action || '').replace(/[_:]/g, ' ')}</Text>
            </View>
            <Text style={styles.logTime}>{l.timestamp}</Text>
          </View>
        ))}
      </Card>
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: SPACE.md },
  revenueValue: { fontSize: 18, fontWeight: '800', color: '#15803d' },
  mutedText: { fontSize: 13, color: C.textMuted },
  recCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: RADIUS.md, padding: SPACE.md },
  recTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  recDetail: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  logRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, alignItems: 'center' },
  logRowBorder: { borderTopWidth: 1, borderTopColor: C.faint },
  logIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  logText: { fontSize: 12.5, color: C.text },
  logTime: { fontSize: 10.5, color: C.muted },
});
