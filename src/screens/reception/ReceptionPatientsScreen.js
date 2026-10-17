import React, { useState } from 'react';
import { Alert } from 'react-native';
import { View, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useReceptionData } from '../../context/ReceptionDataContext';
import { Card, Input, FieldLabel, PrimaryButton, SecondaryButton, EmptyState } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import SelectField from '../../components/SelectField';
import BottomSheet from '../../components/BottomSheet';
import { showSuccess, showError } from '../../utils/toast';
import { C, SPACE, createStyles } from '../../theme';

const INIT_P = { first_name: '', last_name: '', email: '', password: '', mobile: '', cnic: '', address: '', age: '', gender: 'Male' };
const GENDER_OPTS = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }];
const ROLE_TABS = ['All', 'Patient', 'Doctor', 'Receptionist', 'Pharmacist', 'Nurse', 'Compounder', 'Sweeper', 'Security'];

const validators = {
  cnic: (v) => /^\d{5}-\d{7}-\d{1}$/.test(v),
  mobile: (v) => /^((\+92|0092|0)[-\s]?)?[0-9]{3}[-\s]?[0-9]{7}$/.test(v.replace(/\s/g, '')),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  name: (v) => v.trim().length >= 2,
  password: (v) => v.length >= 8,
  age: (v) => { const n = parseInt(v, 10); return n >= 1 && n <= 120; },
};

const formatCNIC = (v) => { const d = v.replace(/\D/g, '').slice(0, 13); if (d.length <= 5) return d; if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`; return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`; };
const formatMobile = (v) => { const d = v.replace(/\D/g, '').slice(0, 11); if (d.length <= 4) return d; return `${d.slice(0, 4)}-${d.slice(4)}`; };

function RegisterSegment({ onRegistered }) {
  const { registerPatient } = useReceptionData();
  const [form, setForm] = useState(INIT_P);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (k) => (v) => {
    let val = v;
    if (k === 'cnic') val = formatCNIC(v);
    if (k === 'mobile') val = formatMobile(v);
    setForm((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!validators.name(form.first_name)) e.first_name = 'Valid first name required';
    if (!validators.name(form.last_name)) e.last_name = 'Valid last name required';
    if (!validators.email(form.email)) e.email = 'Enter a valid email';
    if (!validators.password(form.password)) e.password = 'Min 8 characters';
    if (!validators.mobile(form.mobile)) e.mobile = 'Enter a valid mobile number';
    if (!validators.cnic(form.cnic)) e.cnic = 'Format: 42101-1234567-1';
    if (!validators.age(form.age)) e.age = 'Age must be 1-120';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { showError('Please fix the highlighted fields.'); return; }
    setSaving(true);
    try {
      const user = await registerPatient(form);
      setForm(INIT_P); setErrors({});
      onRegistered(user);
    } catch (err) { showError(err.response?.data?.detail || 'Registration failed. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <Card>
      <Text style={styles.cardTitle}>Register New Patient</Text>
      <Text style={styles.note}>System ID will be auto-generated (e.g. P-0001)</Text>

      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>First Name</FieldLabel><Input value={form.first_name} onChangeText={set('first_name')} />{errors.first_name && <Text style={styles.err}>{errors.first_name}</Text>}</View>
        <View style={{ flex: 1 }}><FieldLabel>Last Name</FieldLabel><Input value={form.last_name} onChangeText={set('last_name')} />{errors.last_name && <Text style={styles.err}>{errors.last_name}</Text>}</View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Age</FieldLabel><Input value={form.age} onChangeText={set('age')} keyboardType="numeric" />{errors.age && <Text style={styles.err}>{errors.age}</Text>}</View>
        <View style={{ flex: 1 }}><SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTS} /></View>
      </View>
      <FieldLabel>CNIC</FieldLabel>
      <Input value={form.cnic} onChangeText={set('cnic')} placeholder="42101-1234567-1" style={{ marginBottom: 4 }} />
      {errors.cnic ? <Text style={styles.err}>{errors.cnic}</Text> : null}
      <View style={{ height: SPACE.md }} />

      <FieldLabel>Mobile Number</FieldLabel>
      <Input value={form.mobile} onChangeText={set('mobile')} placeholder="0300-1234567" style={{ marginBottom: 4 }} />
      {errors.mobile ? <Text style={styles.err}>{errors.mobile}</Text> : <Text style={styles.hint}>Patient will use this to log in.</Text>}
      <View style={{ height: SPACE.md }} />

      <FieldLabel>Email</FieldLabel>
      <Input value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: 4 }} />
      {errors.email && <Text style={styles.err}>{errors.email}</Text>}
      <View style={{ height: SPACE.md }} />

      <FieldLabel>Home Address (optional)</FieldLabel>
      <Input value={form.address} onChangeText={set('address')} style={{ marginBottom: SPACE.md }} />

      <FieldLabel>Password</FieldLabel>
      <Input value={form.password} onChangeText={set('password')} secureTextEntry style={{ marginBottom: 4 }} />
      {errors.password ? <Text style={styles.err}>{errors.password}</Text> : <Text style={styles.hint}>At least 8 characters.</Text>}
      <View style={{ height: SPACE.lg }} />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton label="Clear" onPress={() => { setForm(INIT_P); setErrors({}); }} style={{ flex: 1 }} />
        <PrimaryButton label="Register Patient" loading={saving} onPress={submit} style={{ flex: 2 }} />
      </View>
    </Card>
  );
}

function RecordsSegment() {
  const { activeUsers, deleteUser } = useReceptionData();
  const [listTab, setListTab] = useState('All');
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  let list = listTab === 'All' ? activeUsers : activeUsers.filter((u) => u.role === listTab);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter((u) => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.cnic || '').includes(q) || (u.mobile || '').includes(q) || (u.id || '').toLowerCase().includes(q));
  }

  const confirmDelete = (u) => {
    const msg = u.role === 'Patient' ? `Mark patient "${u.full_name || u.id}" as deleted? This can be restored later.` : `Delete "${u.full_name || u.id}" permanently? This cannot be undone.`;
    Alert.alert('Confirm', msg, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteUser(u.id, u.role).catch((err) => showError(err.response?.data?.detail || 'Delete failed.')) },
    ]);
  };

  return (
    <>
      <Card>
        <SegmentedTabs options={ROLE_TABS.map((t) => ({ key: t, label: t }))} value={listTab} onChange={setListTab} />
        <Input value={search} onChangeText={setSearch} placeholder="Search by name, ID, CNIC, or mobile…" />
      </Card>
      <RecordList
        data={list}
        emptyIcon="search"
        emptyTitle="No active records found"
        renderItem={(u) => (
          <RecordCard
            title={u.full_name || '—'}
            subtitle={`${u.id}  ·  ${u.role}`}
            fields={[{ label: u.role === 'Patient' ? 'CNIC' : 'Specialization', value: u.role === 'Patient' ? (u.cnic || '—') : (u.specialization || '—') }, { label: 'Mobile', value: u.mobile || '—' }]}
            actions={[
              { label: 'View', icon: 'eye', onPress: () => setViewUser(u) },
              ...(u.role === 'Patient' ? [{ label: 'Delete', icon: 'trash-2', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => confirmDelete(u) }] : []),
            ]}
          />
        )}
      />

      <BottomSheet visible={!!viewUser} onClose={() => setViewUser(null)} title={viewUser?.full_name || viewUser?.id || ''} icon="user">
        {viewUser && [
          ['System ID', viewUser.id], ['Full Name', viewUser.full_name], ['Email', viewUser.email], ['Mobile', viewUser.mobile],
          ['Gender', viewUser.gender], ['Age', viewUser.age && `${viewUser.age} years`], ['CNIC', viewUser.cnic], ['Address', viewUser.address],
          ['Specialization', viewUser.specialization], ['Qualification', viewUser.qualification], ['Registered On', viewUser.created_at],
        ].filter(([, v]) => v).map(([k, v]) => (
          <View key={k} style={styles.viewRow}>
            <Text style={styles.viewLabel}>{k}</Text>
            <Text style={styles.viewValue}>{v}</Text>
          </View>
        ))}
      </BottomSheet>
    </>
  );
}

export default function ReceptionRegisterPatientScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Register Patient</Text>
      <RegisterSegment onRegistered={(u) => showSuccess(`Patient ${u.full_name} registered — ID ${u.id}`)} />
    </AnimatedScreen>
  );
}

export function ReceptionAllRecordsScreen() {
  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>All Records</Text>
      <RecordsSegment />
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  cardTitle: { fontWeight: '700', fontSize: 15, color: C.text, marginBottom: 4 },
  note: { fontSize: 12, color: C.textMuted, marginBottom: SPACE.lg },
  row2: { flexDirection: 'row', gap: 12, marginBottom: SPACE.md },
  err: { fontSize: 11, color: C.red, marginTop: 4 },
  hint: { fontSize: 11, color: C.textMuted, marginTop: 4 },
  viewRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.faint, paddingVertical: 9 },
  viewLabel: { fontSize: 12, color: C.textMuted, fontWeight: '600' },
  viewValue: { fontSize: 13, color: C.text, fontWeight: '600' },
});
