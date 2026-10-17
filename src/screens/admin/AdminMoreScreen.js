import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { View, TouchableOpacity } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { useAdminData } from '../../context/AdminDataContext';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import StatCard, { StatGrid } from '../../components/StatCard';
import { useLiveNotifications } from '../../hooks/useLiveNotifications';
import { C, SPACE, createStyles } from '../../theme';

function WastageSegment() {
  const [txns, setTxns] = useState([]);
  const load = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/inventory-transactions', { params: { status: 'Pending' } }); setTxns(res.data.transactions || []); }
    catch { showError('Failed to load wastage requests.'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useLiveNotifications(useCallback((notif) => { if (notif.type === 'wastage-pending') load(); }, [load]));

  const decide = (id, action) => {
    Alert.alert(action === 'approve' ? 'Approve' : 'Reject', `${action === 'approve' ? 'Approve' : 'Reject'} this wastage request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action === 'approve' ? 'Approve' : 'Reject', style: action === 'reject' ? 'destructive' : 'default',
        onPress: async () => {
          try { await api.post(`/api/admin/wastage/${id}/${action}`); showSuccess(`Wastage request ${action === 'approve' ? 'approved' : 'rejected'}.`); load(); }
          catch (err) { showError(err.response?.data?.detail || 'Failed to update wastage request.'); }
        },
      },
    ]);
  };

  return (
    <Card>
      <RecordList
        data={txns}
        emptyIcon="check-circle"
        emptyTitle="No pending wastage requests"
        renderItem={(t) => (
          <RecordCard
            title={t.medicine_id}
            subtitle={`${t.type}  ·  Qty: ${t.qty}`}
            fields={[{ label: 'Reason', value: t.reason }, { label: 'Requested By', value: t.staff_id }]}
            actions={[
              { label: 'Approve', icon: 'check', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', onPress: () => decide(t.id, 'approve') },
              { label: 'Reject', icon: 'x', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => decide(t.id, 'reject') },
            ]}
          />
        )}
      />
    </Card>
  );
}

function MismatchesSegment() {
  const [mismatches, setMismatches] = useState([]);
  const load = useCallback(async () => {
    try { const res = await api.get('/api/admin/dispense-mismatches'); setMismatches(res.data.mismatches || []); }
    catch { showError('Failed to load mismatches.'); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useLiveNotifications(useCallback((notif) => { if (notif.type === 'qty-mismatch') load(); }, [load]));

  return (
    <Card>
      <Text style={styles.note}>Cases where the quantity a pharmacist dispensed did not match what the doctor originally prescribed.</Text>
      <RecordList
        data={mismatches}
        emptyIcon="check-circle"
        emptyTitle="No mismatches recorded"
        renderItem={(m) => (
          <RecordCard
            title={m.medicine_id}
            subtitle={`Patient: ${m.patient_id}`}
            fields={[
              { label: 'Suggested', value: m.qty_suggested_by_doctor },
              { label: 'Given', value: m.qty_actually_given },
              { label: 'Dispensed By', value: m.dispensed_by },
              { label: 'When', value: m.timestamp },
            ]}
          />
        )}
      />
    </Card>
  );
}

function ReportsSegment() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const load = useCallback(async () => {
    try { const res = await api.get('/api/admin/reports/financial', { params: { month } }); setReport(res.data); }
    catch { showError('Failed to load financial report.'); }
  }, [month]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Card>
        <FieldLabel>Month (YYYY-MM)</FieldLabel>
        <Input value={month} onChangeText={setMonth} />
      </Card>
      {report && (
        <>
          <StatGrid>
            <StatCard label="Revenue" value={report.revenue.toLocaleString()} icon="trending-up" color="#15803d" bg="#f0fdf4" />
            <StatCard label="Expense" value={report.expense.toLocaleString()} icon="trending-down" color={C.red} bg="#fef2f2" />
            <StatCard label="Profit" value={report.profit.toLocaleString()} icon="bar-chart-2" color={report.profit >= 0 ? '#15803d' : C.red} bg={report.profit >= 0 ? '#f0fdf4' : '#fef2f2'} />
          </StatGrid>
          <Card>
            <Text style={styles.cardTitle}>Top Doctors by Revenue ({month})</Text>
            <RecordList data={report.top_doctors} emptyIcon="user" emptyTitle="No doctor revenue recorded for this month" renderItem={(d) => <RecordCard title={d.doctor_id} fields={[{ label: 'Revenue', value: d.revenue?.toLocaleString?.() ?? d.revenue }]} />} />
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Expense Breakdown</Text>
            <RecordCard title="Payroll" fields={[{ label: 'Amount', value: report.payroll_expense.toLocaleString() }]} />
            <RecordCard title="Free Medicine Cost" fields={[{ label: 'Amount', value: report.free_medicine_expense.toLocaleString() }]} />
          </Card>
        </>
      )}
    </>
  );
}

function AuditSegment() {
  const { auditLogs, fetchAuditLogs } = useAdminData();
  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);
  return (
    <Card>
      <RecordList
        data={auditLogs}
        emptyIcon="shield"
        emptyTitle="No audit entries yet"
        renderItem={(l) => <RecordCard title={l.actor_id} subtitle={`${l.actor_role}  ·  ${l.action}`} fields={[{ label: 'Time', value: l.timestamp }]} />}
      />
    </Card>
  );
}

export default function AdminMoreScreen() {
  const [seg, setSeg] = useState('wastage');
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>More</Text>
      <SegmentedTabs
        options={[{ key: 'wastage', label: 'Wastage' }, { key: 'mismatches', label: 'Rx Mismatches' }, { key: 'reports', label: 'Reports' }, { key: 'audit', label: 'Audit Log' }]}
        value={seg} onChange={setSeg}
      />
      {seg === 'wastage' && <WastageSegment />}
      {seg === 'mismatches' && <MismatchesSegment />}
      {seg === 'reports' && <ReportsSegment />}
      {seg === 'audit' && <AuditSegment />}
    </AnimatedScreen>
  );
}

// Standalone, single-purpose screens for the flat web-matching sidebar.
export function AdminWastageScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Wastage Approvals</Text>
      <WastageSegment />
    </AnimatedScreen>
  );
}
export function AdminMismatchesScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Rx Mismatches</Text>
      <MismatchesSegment />
    </AnimatedScreen>
  );
}
export function AdminReportsScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Financial Reports</Text>
      <ReportsSegment />
    </AnimatedScreen>
  );
}
export function AdminAuditScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Audit Log</Text>
      <AuditSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  note: { fontSize: 12.5, color: C.textMuted, marginBottom: SPACE.md },
});
