import React, { useState } from 'react';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePharmacyData } from '../../context/PharmacyDataContext';
import { RecordCard, RecordList } from '../../components/DataList';
import BottomSheet from '../../components/BottomSheet';
import SelectField from '../../components/SelectField';
import { Input, FieldLabel, PrimaryButton } from '../../components/ui';
import FAB from '../../components/animated/FAB';
import { showError } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const INIT_MED = { name: '', type: 'Paid', unit: '', cost_price: '', sale_price: '', current_stock: '', low_stock_threshold: '10', expiry_date: '', batch_no: '' };

function AddMedicineSheet({ visible, onClose, onSave }) {
  const [form, setForm] = useState(INIT_MED);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { showError('Medicine name is required.'); return; }
    setSaving(true);
    try {
      await onSave(form);
      setForm(INIT_MED);
      onClose();
    } catch (err) { showError(err.response?.data?.detail || 'Failed to add medicine.'); }
    finally { setSaving(false); }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Medicine" icon="package">
      <FieldLabel>Name</FieldLabel>
      <Input value={form.name} onChangeText={set('name')} style={{ marginBottom: SPACE.md }} />
      <SelectField label="Type" value={form.type} onChange={set('type')} options={[{ value: 'Paid', label: 'Paid' }, { value: 'Free', label: 'Free' }]} />
      <View style={{ height: SPACE.md }} />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Unit</FieldLabel><Input value={form.unit} onChangeText={set('unit')} placeholder="tablet/bottle" /></View>
        <View style={{ flex: 1 }}><FieldLabel>Batch No.</FieldLabel><Input value={form.batch_no} onChangeText={set('batch_no')} /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Cost Price</FieldLabel><Input value={form.cost_price} onChangeText={set('cost_price')} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><FieldLabel>Sale Price</FieldLabel><Input value={form.sale_price} onChangeText={set('sale_price')} keyboardType="numeric" /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Initial Stock</FieldLabel><Input value={form.current_stock} onChangeText={set('current_stock')} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><FieldLabel>Low Stock Threshold</FieldLabel><Input value={form.low_stock_threshold} onChangeText={set('low_stock_threshold')} keyboardType="numeric" /></View>
      </View>
      <FieldLabel>Expiry Date (YYYY-MM-DD)</FieldLabel>
      <Input value={form.expiry_date} onChangeText={set('expiry_date')} placeholder="2027-01-01" style={{ marginBottom: SPACE.lg }} />
      <PrimaryButton label="Add Medicine" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

function RestockSheet({ medicine, onClose, onSave }) {
  const [qty, setQty] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    const q = parseFloat(qty);
    if (!q || q <= 0) { showError('Enter a valid quantity.'); return; }
    setSaving(true);
    try { await onSave(q); setQty(''); onClose(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to restock.'); }
    finally { setSaving(false); }
  };
  return (
    <BottomSheet visible={!!medicine} onClose={onClose} title={`Restock — ${medicine?.name || ''}`} icon="plus-circle">
      <FieldLabel>Quantity to Add</FieldLabel>
      <Input value={qty} onChangeText={setQty} keyboardType="numeric" style={{ marginBottom: SPACE.lg }} />
      <PrimaryButton label="Restock" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

function WastageSheet({ medicine, onClose, onSave }) {
  const [form, setForm] = useState({ qty: '', reason: '', type: 'Wastage' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const submit = async () => {
    const q = parseFloat(form.qty);
    if (!q || q <= 0 || !form.reason.trim()) { showError('Quantity and reason are required.'); return; }
    setSaving(true);
    try { await onSave({ ...form, qty: q }); setForm({ qty: '', reason: '', type: 'Wastage' }); onClose(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to submit wastage request.'); }
    finally { setSaving(false); }
  };
  return (
    <BottomSheet visible={!!medicine} onClose={onClose} title={`Report Wastage — ${medicine?.name || ''}`} icon="alert-triangle">
      <SelectField label="Type" value={form.type} onChange={set('type')} options={[{ value: 'Wastage', label: 'Wastage' }, { value: 'Expired', label: 'Expired' }]} />
      <View style={{ height: SPACE.md }} />
      <FieldLabel>Quantity</FieldLabel>
      <Input value={form.qty} onChangeText={set('qty')} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
      <FieldLabel>Reason</FieldLabel>
      <Input value={form.reason} onChangeText={set('reason')} multiline numberOfLines={3} style={{ marginBottom: 6, minHeight: 70, textAlignVertical: 'top' }} />
      <Text style={styles.hint}>Stock is only removed once an Admin approves this request.</Text>
      <View style={{ height: SPACE.md }} />
      <PrimaryButton label="Submit for Approval" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

export default function MedicinesScreen() {
  const { medicines, addMedicine, restock, reportWastage, refreshing, refresh } = usePharmacyData();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null);
  const [wastageTarget, setWastageTarget] = useState(null);

  const filtered = search.trim()
    ? medicines.filter((m) => (m.name || '').toLowerCase().includes(search.toLowerCase()) || (m.type || '').toLowerCase().includes(search.toLowerCase()))
    : medicines;

  return (
    <View style={styles.flex}>
      <AnimatedScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
        <Text style={styles.h1}>Medicines</Text>
        <Input value={search} onChangeText={setSearch} placeholder="Search by name or type…" style={{ marginBottom: SPACE.lg }} />

        <RecordList
          data={filtered}
          emptyIcon="package"
          emptyTitle="No medicines added yet"
          renderItem={(m) => (
            <RecordCard
              title={m.name}
              subtitle={m.type}
              fields={[
                { label: 'Stock', value: `${m.current_stock} ${m.unit || ''}`.trim() },
                { label: 'Expiry', value: m.expiry_date || '—' },
              ]}
              badge={m.is_low_stock ? { label: 'Low Stock', bg: '#fef3c7', color: '#92400e', border: '#fde68a' } : m.is_expiring_soon ? { label: 'Expiring', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' } : undefined}
              actions={[
                { label: 'Restock', icon: 'plus', bg: '#ecefff', border: '#cfd2f4', color: '#4548a8', onPress: () => setRestockTarget(m) },
                { label: 'Wastage', icon: 'alert-triangle', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => setWastageTarget(m) },
              ]}
            />
          )}
        />
      </AnimatedScreen>

      <FAB onPress={() => setShowAdd(true)} />

      <AddMedicineSheet visible={showAdd} onClose={() => setShowAdd(false)} onSave={addMedicine} />
      <RestockSheet medicine={restockTarget} onClose={() => setRestockTarget(null)} onSave={(qty) => restock(restockTarget, qty)} />
      <WastageSheet medicine={wastageTarget} onClose={() => setWastageTarget(null)} onSave={(form) => reportWastage(wastageTarget, form)} />
    </View>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 90 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  row2: { flexDirection: 'row', gap: 12, marginBottom: SPACE.md },
  hint: { fontSize: 11.5, color: C.textMuted },
  fab: {
    position: 'absolute', right: SPACE.lg, bottom: SPACE.lg, width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#5b5fc7', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
