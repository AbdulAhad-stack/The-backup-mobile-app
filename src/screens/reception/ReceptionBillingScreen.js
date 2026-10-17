import React, { useState, useEffect, useCallback } from 'react';
import { View } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import api from '../../api/client';
import { showSuccess, showError } from '../../utils/toast';
import { Card, Input, FieldLabel, PrimaryButton } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SelectField from '../../components/SelectField';
import { downloadAndSharePdf } from '../../utils/pdf';
import { C, SPACE, createStyles } from '../../theme';

function CollectFeeSegment() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [unbilledSamples, setUnbilledSamples] = useState([]);
  const [selectedSampleIds, setSelectedSampleIds] = useState([]);
  const [form, setForm] = useState({ patient_id: '', doctor_id: '', category_id: '', medicine_cost: '', lab_charges: '', payment_method: 'Cash' });
  const [saving, setSaving] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [pRes, dRes, cRes, iRes] = await Promise.all([api.get('/api/users_by_role/Patient'), api.get('/api/users_by_role/Doctor'), api.get('/api/fee-categories'), api.get('/api/invoices')]);
      setPatients(pRes.data.users || []); setDoctors(dRes.data.users || []); setCategories(cRes.data.categories || []); setInvoices(iRes.data.invoices || []);
    } catch { showError('Failed to load billing data.'); }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    setSelectedSampleIds([]);
    if (!form.patient_id) { setUnbilledSamples([]); return; }
    api.get('/api/lab/samples', { params: { patient_id: form.patient_id } })
      .then((res) => setUnbilledSamples((res.data.samples || []).filter((s) => !s.billed)))
      .catch(() => setUnbilledSamples([]));
  }, [form.patient_id]);

  const selectedSamplesTotal = unbilledSamples.filter((s) => selectedSampleIds.includes(s.id)).reduce((sum, s) => sum + (s.price || 0), 0);
  const toggleSample = (id) => setSelectedSampleIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const submit = async () => {
    if (!form.patient_id) { showError('Select a patient.'); return; }
    setSaving(true);
    try {
      await api.post('/api/invoices', {
        ...form,
        medicine_cost: parseFloat(form.medicine_cost) || 0,
        lab_charges: selectedSampleIds.length > 0 ? 0 : (parseFloat(form.lab_charges) || 0),
        lab_sample_ids: selectedSampleIds.length > 0 ? selectedSampleIds : undefined,
      });
      showSuccess('Invoice generated.');
      setForm({ patient_id: '', doctor_id: '', category_id: '', medicine_cost: '', lab_charges: '', payment_method: 'Cash' });
      setSelectedSampleIds([]);
      loadAll();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to generate invoice.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Collect Fee / Generate Invoice</Text>
        <SelectField label="Patient" searchable value={form.patient_id} onChange={(v) => setForm((f) => ({ ...f, patient_id: v }))} options={patients.map((p) => ({ value: p.id, label: `${p.full_name} (${p.id})` }))} placeholder="Search patient…" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Doctor (optional)" searchable value={form.doctor_id} onChange={(v) => setForm((f) => ({ ...f, doctor_id: v }))} options={doctors.map((d) => ({ value: d.id, label: `${d.full_name} (${d.id})` }))} placeholder="Search doctor…" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Fee Category" value={form.category_id} onChange={(v) => setForm((f) => ({ ...f, category_id: v }))} options={categories.map((c) => ({ value: c.id, label: `${c.category_name} (${c.amount})` }))} placeholder="None" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Payment Method" value={form.payment_method} onChange={(v) => setForm((f) => ({ ...f, payment_method: v }))} options={[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }]} />
        <View style={{ height: SPACE.md }} />
        <FieldLabel>Medicine Cost (optional)</FieldLabel>
        <Input value={form.medicine_cost} onChangeText={(v) => setForm((f) => ({ ...f, medicine_cost: v }))} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
        <FieldLabel>Lab Charges {selectedSampleIds.length > 0 ? '(from selected tests below)' : '(optional)'}</FieldLabel>
        <Input
          value={selectedSampleIds.length > 0 ? String(selectedSamplesTotal) : form.lab_charges}
          editable={selectedSampleIds.length === 0}
          onChangeText={(v) => setForm((f) => ({ ...f, lab_charges: v }))}
          keyboardType="numeric"
          style={{ marginBottom: SPACE.md }}
        />

        {unbilledSamples.length > 0 && (
          <View style={styles.samplesBox}>
            <Text style={styles.samplesTitle}>Unbilled Lab Tests for This Patient</Text>
            {unbilledSamples.map((s) => (
              <RecordCard
                key={s.id}
                title={s.test_name}
                subtitle={s.status}
                fields={[{ label: 'Price', value: s.price ?? 0 }]}
                actions={[{ label: selectedSampleIds.includes(s.id) ? 'Selected ✓' : 'Select', onPress: () => toggleSample(s.id), bg: selectedSampleIds.includes(s.id) ? '#f0fdf4' : undefined, color: selectedSampleIds.includes(s.id) ? '#15803d' : undefined }]}
              />
            ))}
          </View>
        )}

        <PrimaryButton label="Generate Invoice" loading={saving} onPress={submit} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Recent Invoices</Text>
        <RecordList
          data={invoices.slice(0, 20)}
          emptyIcon="file-text"
          emptyTitle="No invoices generated yet"
          renderItem={(inv) => (
            <RecordCard
              title={inv.patient_name}
              subtitle={`${inv.payment_method}  ·  ${inv.generated_at}`}
              fields={[{ label: 'Total', value: inv.total?.toLocaleString() }]}
              actions={[{
                label: downloadingId === inv.id ? 'Preparing…' : 'Share / Download PDF',
                icon: 'share-2',
                onPress: () => {
                  setDownloadingId(inv.id);
                  downloadAndSharePdf(`/api/invoices/${inv.id}/pdf`, `invoice_${inv.id}.pdf`, { onEnd: () => setDownloadingId(null) });
                },
              }]}
            />
          )}
        />
      </Card>
    </>
  );
}

function DayCloseSegment() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cashCounted, setCashCounted] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!cashCounted) { showError('Enter the cash counted amount.'); return; }
    setSaving(true);
    try {
      const res = await api.post('/api/reception/day-close', { date, cash_counted: parseFloat(cashCounted) });
      setResult(res.data.record);
      showSuccess('Day closed.');
    } catch (err) { showError(err.response?.data?.detail || 'Failed to close day.'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Day Close — Cash Reconciliation</Text>
        <FieldLabel>Date (YYYY-MM-DD)</FieldLabel>
        <Input value={date} onChangeText={setDate} style={{ marginBottom: SPACE.md }} />
        <FieldLabel>Cash Counted</FieldLabel>
        <Input value={cashCounted} onChangeText={setCashCounted} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
        <PrimaryButton label="Close Day" loading={saving} onPress={submit} />
      </Card>
      {result && (
        <Card>
          <Text style={styles.cardTitle}>Result</Text>
          <Text style={styles.resultLine}>System Total: <Text style={styles.bold}>{result.system_total.toLocaleString()}</Text></Text>
          <Text style={styles.resultLine}>Cash Counted: <Text style={styles.bold}>{result.cash_counted.toLocaleString()}</Text></Text>
          <Text style={[styles.resultLine, { color: Math.abs(result.difference) > 0.01 ? C.red : '#15803d', fontWeight: '700' }]}>
            Difference: {result.difference.toLocaleString()}{Math.abs(result.difference) > 0.01 ? ' — Admin has been notified.' : ''}
          </Text>
        </Card>
      )}
    </>
  );
}

function LabOrdersSegment() {
  const [suggestions, setSuggestions] = useState([]);
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [walkIn, setWalkIn] = useState({ patient_id: '', test_id: '' });

  const load = useCallback(async () => {
    try {
      const [sRes, tRes, pRes] = await Promise.all([api.get('/api/lab-tests/suggestions', { params: { status: 'Suggested' } }), api.get('/api/lab-tests'), api.get('/api/users_by_role/Patient')]);
      setSuggestions(sRes.data.suggestions || []); setTests(tRes.data.tests || []); setPatients(pRes.data.users || []);
    } catch { showError('Failed to load lab order data.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const bookFromSuggestion = async (s) => {
    try {
      await api.post('/api/reception/lab-orders', { patient_id: s.patient_id, test_id: s.test_id, suggestion_id: s.id, doctor_id: s.doctor_id });
      showSuccess('Test booked — it now appears in the Lab queue.'); load();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to book test.'); }
  };

  const handleWalkIn = async () => {
    if (!walkIn.patient_id || !walkIn.test_id) { showError('Select a patient and a test.'); return; }
    try {
      await api.post('/api/reception/lab-orders', walkIn);
      showSuccess('Walk-in test booked — it now appears in the Lab queue.');
      setWalkIn({ patient_id: '', test_id: '' });
    } catch (err) { showError(err.response?.data?.detail || 'Failed to book test.'); }
  };

  return (
    <>
      <Card>
        <Text style={styles.cardTitle}>Doctor-Suggested Tests Awaiting Booking</Text>
        <Text style={styles.note}>Only book these once the patient has agreed to get the test done.</Text>
        <RecordList
          data={suggestions}
          emptyIcon="check-circle"
          emptyTitle="No pending suggestions"
          renderItem={(s) => (
            <RecordCard
              title={s.patient_name}
              subtitle={s.test_name}
              fields={[{ label: 'Price', value: s.price }, { label: 'Notes', value: s.notes || '—' }]}
              actions={[{ label: 'Book (Patient Agreed)', icon: 'check', onPress: () => bookFromSuggestion(s) }]}
            />
          )}
        />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Walk-in Test (No Doctor Involved)</Text>
        <SelectField label="Patient" searchable value={walkIn.patient_id} onChange={(v) => setWalkIn((w) => ({ ...w, patient_id: v }))} options={patients.map((p) => ({ value: p.id, label: `${p.full_name} (${p.id})` }))} placeholder="Select…" />
        <View style={{ height: SPACE.md }} />
        <SelectField label="Test" searchable value={walkIn.test_id} onChange={(v) => setWalkIn((w) => ({ ...w, test_id: v }))} options={tests.map((t) => ({ value: t.id, label: `${t.test_name} (${t.price})` }))} placeholder="Select…" />
        <View style={{ height: SPACE.lg }} />
        <PrimaryButton label="Book Test" onPress={handleWalkIn} />
      </Card>
    </>
  );
}

export default function ReceptionCollectFeeScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Collect Fee</Text>
      <CollectFeeSegment />
    </AnimatedScreen>
  );
}

export function ReceptionDayCloseScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Day Close</Text>
      <DayCloseSegment />
    </AnimatedScreen>
  );
}

export function ReceptionLabOrdersScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Lab Orders</Text>
      <LabOrdersSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  note: { fontSize: 12, color: C.textMuted, marginTop: -6, marginBottom: SPACE.md },
  samplesBox: { backgroundColor: '#f4f5fd', borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 10, marginBottom: SPACE.md },
  samplesTitle: { fontSize: 12.5, fontWeight: '600', color: C.text, marginBottom: 6 },
  resultLine: { fontSize: 13.5, color: C.text, marginBottom: 4 },
  bold: { fontWeight: '700' },
});
