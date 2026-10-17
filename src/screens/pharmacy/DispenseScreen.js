import React, { useState } from 'react';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { usePharmacyData } from '../../context/PharmacyDataContext';
import { Card, Input, FieldLabel, PrimaryButton, EmptyState } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SelectField from '../../components/SelectField';
import { showSuccess, showError } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

export default function DispenseScreen() {
  const { pendingOrders, lookupPrescription, dispenseAgainstPrescription, refreshing, refresh } = usePharmacyData();
  const [prescriptionId, setPrescriptionId] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [medicineName, setMedicineName] = useState('');
  const [qtyGiven, setQtyGiven] = useState('');
  const [dispensing, setDispensing] = useState(false);

  const doLookup = async (id) => {
    try {
      const presc = await lookupPrescription(id);
      setPrescription(presc);
      setMedicineName(''); setQtyGiven('');
    } catch (err) { showError(err.response?.data?.detail || 'Prescription not found.'); setPrescription(null); }
  };

  const handleLookup = () => {
    if (!prescriptionId.trim()) { showError('Enter a prescription ID.'); return; }
    doLookup(prescriptionId.trim());
  };

  const pickPendingOrder = (prescId) => { setPrescriptionId(prescId); doLookup(prescId); };

  const handleDispense = async () => {
    const qty = parseFloat(qtyGiven);
    if (!medicineName || !qty || qty <= 0) { showError('Select a medicine and enter a valid quantity.'); return; }
    setDispensing(true);
    try {
      const res = await dispenseAgainstPrescription(prescription, medicineName, qty);
      if (res.mismatch_flag) {
        showError("Dispensed, but quantity does not match the doctor's prescription — flagged for Admin review.");
      } else {
        showSuccess('Dispensed successfully — quantity matches prescription.');
      }
      setMedicineName(''); setQtyGiven('');
    } catch (err) { showError(err.response?.data?.detail || 'Failed to dispense.'); }
    finally { setDispensing(false); }
  };

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5b5fc7" />}>
      <Text style={styles.h1}>Dispense Against Prescription</Text>

      <Card>
        <Text style={styles.cardTitle}>Pending Store Orders</Text>
        <RecordList
          data={pendingOrders}
          emptyIcon="inbox"
          emptyTitle="No pending store orders"
          renderItem={(o, i) => (
            <RecordCard
              title={o.medicine_name}
              subtitle={`Rx ${o.prescription_id}`}
              fields={[
                { label: 'Suggested', value: o.qty_suggested },
                { label: 'Dispensed So Far', value: o.qty_dispensed_so_far },
                { label: 'Date', value: o.created_at },
              ]}
              actions={[{ label: 'Dispense', icon: 'arrow-right-circle', bg: '#ecefff', border: '#cfd2f4', color: '#4548a8', onPress: () => pickPendingOrder(o.prescription_id) }]}
            />
          )}
        />
      </Card>

      <Card>
        <FieldLabel>Prescription ID</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Input value={prescriptionId} onChangeText={setPrescriptionId} placeholder="Paste the prescription ID" style={{ flex: 1 }} />
          <TouchableOpacity style={styles.lookupBtn} onPress={handleLookup}>
            <Feather name="search" size={14} color={C.text} />
            <Text style={styles.lookupBtnText}>Look Up</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {prescription && (
        <Card>
          <Text style={styles.cardTitle}>Prescribed Medicines (Patient: {prescription.patient_id})</Text>
          {(prescription.medicines || []).map((m, i) => (
            <View key={i} style={styles.medRow}>
              <Text style={styles.medName}>{m.name}</Text>
              <Text style={styles.medMeta}>Qty: {m.qty_suggested}  ·  {m.source}</Text>
            </View>
          ))}

          <View style={{ marginTop: SPACE.md }}>
            <SelectField
              label="Medicine"
              value={medicineName}
              onChange={setMedicineName}
              options={(prescription.medicines || []).map((m) => ({ value: m.name, label: m.name }))}
              placeholder="Select…"
            />
          </View>
          <View style={{ height: SPACE.md }} />
          <FieldLabel>Qty Given</FieldLabel>
          <Input value={qtyGiven} onChangeText={setQtyGiven} keyboardType="numeric" style={{ marginBottom: SPACE.md }} />
          <PrimaryButton label="Dispense" loading={dispensing} onPress={handleDispense} />
          <Text style={styles.hint}>If the quantity given differs from what the doctor suggested, it will be automatically flagged for Admin review.</Text>
        </Card>
      )}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.lg },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: SPACE.md },
  lookupBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.md, paddingHorizontal: 14, justifyContent: 'center',
  },
  lookupBtnText: { fontSize: 13, fontWeight: '600', color: C.text },
  medRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  medName: { fontWeight: '700', fontSize: 13.5, color: C.text },
  medMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  hint: { fontSize: 11.5, color: C.textMuted, marginTop: 10 },
});
