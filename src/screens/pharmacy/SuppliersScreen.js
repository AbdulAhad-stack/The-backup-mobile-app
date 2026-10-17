import React, { useState } from 'react';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePharmacyData } from '../../context/PharmacyDataContext';
import { RecordCard, RecordList } from '../../components/DataList';
import BottomSheet from '../../components/BottomSheet';
import { Input, FieldLabel, PrimaryButton } from '../../components/ui';
import FAB from '../../components/animated/FAB';
import { showError } from '../../utils/toast';
import { C, SPACE, createStyles } from '../../theme';

function AddSupplierSheet({ visible, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', contact: '' });
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!form.name.trim()) { showError('Supplier name is required.'); return; }
    setSaving(true);
    try { await onSave(form); setForm({ name: '', contact: '' }); onClose(); }
    catch { showError('Failed to add supplier.'); }
    finally { setSaving(false); }
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Supplier" icon="briefcase">
      <FieldLabel>Name</FieldLabel>
      <Input value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} style={{ marginBottom: SPACE.md }} />
      <FieldLabel>Contact</FieldLabel>
      <Input value={form.contact} onChangeText={(v) => setForm((p) => ({ ...p, contact: v }))} style={{ marginBottom: SPACE.lg }} />
      <PrimaryButton label="Add Supplier" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

export default function SuppliersScreen() {
  const { suppliers, addSupplier, refreshing, refresh } = usePharmacyData();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <View style={styles.flex}>
      <AnimatedScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
        <Text style={styles.h1}>Suppliers</Text>
        <RecordList
          data={suppliers}
          emptyIcon="briefcase"
          emptyTitle="No suppliers added yet"
          renderItem={(s) => <RecordCard title={s.name} fields={[{ label: 'Contact', value: s.contact || '—' }]} />}
        />
      </AnimatedScreen>
      <FAB onPress={() => setShowAdd(true)} />
      <AddSupplierSheet visible={showAdd} onClose={() => setShowAdd(false)} onSave={addSupplier} />
    </View>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 90 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  fab: {
    position: 'absolute', right: SPACE.lg, bottom: SPACE.lg, width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#5b5fc7', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
