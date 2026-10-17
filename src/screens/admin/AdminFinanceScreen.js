import React, { useState, useEffect, useCallback } from 'react';
import { View, RefreshControl } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel, PrimaryButton } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import SelectField from '../../components/SelectField';
import { C, SPACE, createStyles } from '../../theme';

function FeesSegment() {
  const [categories, setCategories] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorFees, setDoctorFees] = useState([]);
  const [catForm, setCatForm] = useState({ category_name: '', amount: '' });
  const [feeForm, setFeeForm] = useState({ doctor_id: '', category_id: '', amount: '' });
  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [catRes, docRes, feeRes] = await Promise.all([api.get('/api/fee-categories'), api.get('/api/users_by_role/Doctor'), api.get('/api/doctor-fees')]);
      setCategories(catRes.data.categories || []); setDoctors(docRes.data.users || []); setDoctorFees(feeRes.data.doctor_fees || []);
    } catch { showError('Failed to load fee data.'); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const catName = (id) => categories.find((c) => c.id === id)?.category_name || id;
  const docName = (id) => doctors.find((d) => d.id === id)?.full_name || id;

  const addCategory = async () => {
    if (!catForm.category_name.trim() || !catForm.amount) { showError('Category name and amount are required.'); return; }
    setSaving1(true);
    try {
      await api.post('/api/admin/fee-categories', { category_name: catForm.category_name, amount: parseFloat(catForm.amount) });
      showSuccess('Fee category created.'); setCatForm({ category_name: '', amount: '' }); loadAll();
    } catch { showError('Failed to create fee category.'); } finally { setSaving1(false); }
  };

  const setDoctorFee = async () => {
    if (!feeForm.doctor_id || !feeForm.category_id || !feeForm.amount) { showError('All fields are required.'); return; }
    setSaving2(true);
    try {
      await api.post('/api/admin/doctor-fees', { ...feeForm, amount: parseFloat(feeForm.amount) });
      showSuccess('Doctor fee set.'); setFeeForm({ doctor_id: '', category_id: '', amount: '' }); loadAll();
    } catch { showError('Failed to set doctor fee.'); } finally { setSaving2(false); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Fee Categories</Text>
        <FieldLabel>Category Name</FieldLabel>
        <Input value={catForm.category_name} onChangeText={(v) => setCatForm((f) => ({ ...f, category_name: v }))} placeholder="New Patient / Follow-up" style={{ marginBottom: SPACE.md }} />
        <FieldLabel>Amount</FieldLabel>
        <Input value={catForm.amount} onChangeText={(v) => setCatForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
        <PrimaryButton label="Add Category" loading={saving1} onPress={addCategory} />
      </Card>
      <Card>
        <RecordList data={categories} emptyIcon="tag" emptyTitle="No fee categories yet" renderItem={(c) => <RecordCard title={c.category_name} fields={[{ label: 'Amount', value: c.amount }]} />} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Doctor Fees</Text>
        <SelectField label="Doctor" value={feeForm.doctor_id} onChange={(v) => setFeeForm((f) => ({ ...f, doctor_id: v }))} options={doctors.map((d) => ({ value: d.id, label: d.full_name }))} placeholder="Select…" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Category" value={feeForm.category_id} onChange={(v) => setFeeForm((f) => ({ ...f, category_id: v }))} options={categories.map((c) => ({ value: c.id, label: c.category_name }))} placeholder="Select…" />
        <View style={{ height: SPACE.md }} />
        <FieldLabel>Amount</FieldLabel>
        <Input value={feeForm.amount} onChangeText={(v) => setFeeForm((f) => ({ ...f, amount: v }))} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
        <PrimaryButton label="Set Fee" loading={saving2} onPress={setDoctorFee} />
      </Card>
      <Card>
        <RecordList data={doctorFees} emptyIcon="dollar-sign" emptyTitle="No doctor fees set yet" renderItem={(f) => <RecordCard title={docName(f.doctor_id)} subtitle={catName(f.category_id)} fields={[{ label: 'Amount', value: f.amount }]} />} />
      </Card>
    </>
  );
}

function CashSegment() {
  const [records, setRecords] = useState([]);
  const load = useCallback(async () => {
    try { const res = await api.get('/api/admin/cash-reconciliation'); setRecords(res.data.records || []); }
    catch { showError('Failed to load cash reconciliation records.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <Card>
      <RecordList
        data={records}
        emptyIcon="dollar-sign"
        emptyTitle="No day-close records yet"
        renderItem={(r) => (
          <RecordCard
            title={r.date}
            subtitle={`Receptionist: ${r.receptionist_id}`}
            fields={[
              { label: 'System Total', value: r.system_total?.toLocaleString() },
              { label: 'Cash Counted', value: r.cash_counted?.toLocaleString() },
              { label: 'Difference', value: r.difference?.toLocaleString() },
            ]}
            badge={Math.abs(r.difference) > 0.01 ? { label: 'Mismatch', bg: '#fef2f2', color: C.red, border: '#fecaca' } : { label: 'Matched', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }}
          />
        )}
      />
    </Card>
  );
}

function LabCatalogSegment() {
  const [tests, setTests] = useState([]);
  const [form, setForm] = useState({ test_name: '', price: '', category: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const res = await api.get('/api/lab-tests'); setTests(res.data.tests || []); }
    catch { showError('Failed to load lab test catalog.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.test_name.trim() || !form.price) { showError('Test name and price are required.'); return; }
    setSaving(true);
    try {
      await api.post('/api/admin/lab-tests', { ...form, price: parseFloat(form.price) });
      showSuccess('Lab test added to catalog.'); setForm({ test_name: '', price: '', category: '' }); load();
    } catch { showError('Failed to add lab test.'); } finally { setSaving(false); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Add Test</Text>
        <FieldLabel>Test Name</FieldLabel>
        <Input value={form.test_name} onChangeText={(v) => setForm((f) => ({ ...f, test_name: v }))} placeholder="e.g. CBC, Blood Sugar" style={{ marginBottom: SPACE.md }} />
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACE.md }}>
          <View style={{ flex: 1 }}><FieldLabel>Price</FieldLabel><Input value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><FieldLabel>Category</FieldLabel><Input value={form.category} onChangeText={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="Blood/Imaging" /></View>
        </View>
        <PrimaryButton label="Add Test" loading={saving} onPress={add} />
      </Card>
      <Card>
        <RecordList data={tests} emptyIcon="activity" emptyTitle="No lab tests in catalog yet" renderItem={(t) => <RecordCard title={t.test_name} subtitle={t.category || '—'} fields={[{ label: 'Price', value: t.price }]} />} />
      </Card>
    </>
  );
}

export default function AdminFinanceScreen() {
  const [seg, setSeg] = useState('fees');
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}>
      <Text style={styles.h1}>Finance</Text>
      <SegmentedTabs options={[{ key: 'fees', label: 'Fees' }, { key: 'cash', label: 'Cash Reconciliation' }, { key: 'lab', label: 'Lab Catalog' }]} value={seg} onChange={setSeg} />
      {seg === 'fees' && <FeesSegment />}
      {seg === 'cash' && <CashSegment />}
      {seg === 'lab' && <LabCatalogSegment />}
    </AnimatedScreen>
  );
}

// Standalone, single-purpose screens — same segment components, used by the
// flat web-matching sidebar where Fees / Cash Reconciliation / Lab Test
// Catalog are separate drawer items instead of tabs inside one screen.
export function AdminFeesScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Fees</Text>
      <FeesSegment />
    </AnimatedScreen>
  );
}
export function AdminCashScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Cash Reconciliation</Text>
      <CashSegment />
    </AnimatedScreen>
  );
}
export function AdminLabCatalogScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Lab Test Catalog</Text>
      <LabCatalogSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
});
