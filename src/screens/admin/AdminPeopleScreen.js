import React, { useState } from 'react';
import { Alert } from 'react-native';
import { View, RefreshControl, TouchableOpacity, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useAdminData } from '../../context/AdminDataContext';
import { RecordCard, RecordList } from '../../components/DataList';
import SegmentedTabs from '../../components/SegmentedTabs';
import SelectField from '../../components/SelectField';
import BottomSheet from '../../components/BottomSheet';
import { Input, FieldLabel, PrimaryButton } from '../../components/ui';
import FAB from '../../components/animated/FAB';
import { showError } from '../../utils/toast';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

const STAFF_ROLES = [
  { value: 'receptionist', label: 'Receptionist', hasLogin: true },
  { value: 'pharmacist', label: 'Pharmacist', hasLogin: true },
  { value: 'nurse', label: 'Nurse', hasLogin: false },
  { value: 'compounder', label: 'Compounder', hasLogin: false },
  { value: 'sweeper', label: 'Sweeper', hasLogin: false },
  { value: 'security', label: 'Security', hasLogin: false },
];
const INIT_STAFF = { role: 'receptionist', first_name: '', last_name: '', mobile: '', cnic: '', address: '', age: '', gender: 'Male', email: '', password: '' };
const INIT_DOCTOR = { first_name: '', last_name: '', mobile: '', cnic: '', gender: 'Male', specialization: '', qualification: '', email: '', password: '' };
const GENDER_OPTS = [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }];

function AddStaffSheet({ visible, onClose, onSave }) {
  const [form, setForm] = useState(INIT_STAFF);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const roleMeta = STAFF_ROLES.find((r) => r.value === form.role);

  const submit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.mobile.trim()) { showError('First name, last name and mobile are required.'); return; }
    if (roleMeta.hasLogin && (!form.email.trim() || form.password.length < 8)) { showError('Email and a password of at least 8 characters are required for this role.'); return; }
    setSaving(true);
    try { await onSave(form); setForm(INIT_STAFF); onClose(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to create staff member.'); }
    finally { setSaving(false); }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add Staff Member" icon="user-plus">
      <SelectField label="Role" value={form.role} onChange={set('role')} options={STAFF_ROLES.map((r) => ({ value: r.value, label: r.label }))} />
      {!roleMeta.hasLogin && <Text style={styles.hint}>HR record only — this role has no portal login.</Text>}
      <View style={{ height: SPACE.md }} />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>First Name</FieldLabel><Input value={form.first_name} onChangeText={set('first_name')} /></View>
        <View style={{ flex: 1 }}><FieldLabel>Last Name</FieldLabel><Input value={form.last_name} onChangeText={set('last_name')} /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Mobile</FieldLabel><Input value={form.mobile} onChangeText={set('mobile')} placeholder="0300-1234567" /></View>
        <View style={{ flex: 1 }}><FieldLabel>CNIC (optional)</FieldLabel><Input value={form.cnic} onChangeText={set('cnic')} placeholder="42101-1234567-1" /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Age (optional)</FieldLabel><Input value={form.age} onChangeText={set('age')} keyboardType="numeric" /></View>
        <View style={{ flex: 1 }}><SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTS} /></View>
      </View>
      <FieldLabel>Address (optional)</FieldLabel>
      <Input value={form.address} onChangeText={set('address')} style={{ marginBottom: SPACE.md }} />
      {roleMeta.hasLogin && (<>
        <FieldLabel>Email</FieldLabel>
        <Input value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: SPACE.md }} />
        <FieldLabel>Password</FieldLabel>
        <Input value={form.password} onChangeText={set('password')} secureTextEntry style={{ marginBottom: SPACE.md }} />
      </>)}
      <PrimaryButton label="Create Staff Member" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

function DeactivateSheet({ target, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!reason.trim()) { showError('A reason is required.'); return; }
    setSaving(true);
    try { await onConfirm(reason.trim()); setReason(''); onClose(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to deactivate.'); }
    finally { setSaving(false); }
  };
  return (
    <BottomSheet visible={!!target} onClose={onClose} title={`Deactivate — ${target?.name || ''}`} icon="x-circle">
      <FieldLabel>Reason (required)</FieldLabel>
      <Input value={reason} onChangeText={setReason} multiline numberOfLines={3} placeholder="Why is this account being deactivated?" style={{ marginBottom: SPACE.lg, minHeight: 70, textAlignVertical: 'top' }} />
      <PrimaryButton label="Deactivate" loading={saving} onPress={submit} style={{ backgroundColor: C.red }} />
    </BottomSheet>
  );
}

function AddDoctorSheet({ visible, onClose, onSave }) {
  const [form, setForm] = useState(INIT_DOCTOR);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.mobile.trim()) { showError('First name, last name and mobile are required.'); return; }
    if (!form.email.trim() || form.password.length < 8) { showError('Email and a password of at least 8 characters are required.'); return; }
    setSaving(true);
    try { await onSave(form); setForm(INIT_DOCTOR); onClose(); }
    catch (err) { showError(err.response?.data?.detail || 'Failed to register doctor.'); }
    finally { setSaving(false); }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Register New Doctor" icon="user-plus">
      <Text style={styles.hint}>Doctors log in with their mobile number and password.</Text>
      <View style={{ height: SPACE.md }} />
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>First Name</FieldLabel><Input value={form.first_name} onChangeText={set('first_name')} /></View>
        <View style={{ flex: 1 }}><FieldLabel>Last Name</FieldLabel><Input value={form.last_name} onChangeText={set('last_name')} /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Mobile</FieldLabel><Input value={form.mobile} onChangeText={set('mobile')} placeholder="0300-1234567" /></View>
        <View style={{ flex: 1 }}><FieldLabel>CNIC (optional)</FieldLabel><Input value={form.cnic} onChangeText={set('cnic')} /></View>
      </View>
      <View style={styles.row2}>
        <View style={{ flex: 1 }}><FieldLabel>Specialization</FieldLabel><Input value={form.specialization} onChangeText={set('specialization')} placeholder="e.g. Cardiologist" /></View>
        <View style={{ flex: 1 }}><FieldLabel>Qualification</FieldLabel><Input value={form.qualification} onChangeText={set('qualification')} placeholder="e.g. MBBS" /></View>
      </View>
      <SelectField label="Gender" value={form.gender} onChange={set('gender')} options={GENDER_OPTS} />
      <View style={{ height: SPACE.md }} />
      <FieldLabel>Email</FieldLabel>
      <Input value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" style={{ marginBottom: SPACE.md }} />
      <FieldLabel>Password</FieldLabel>
      <Input value={form.password} onChangeText={set('password')} secureTextEntry style={{ marginBottom: SPACE.md }} />
      <PrimaryButton label="Register Doctor" loading={saving} onPress={submit} />
    </BottomSheet>
  );
}

// `lockedTab`: when set, this renders as a single-purpose screen for just
// that segment (no switcher) — used by the flat, web-matching sidebar where
// Staff and Doctors are separate drawer items instead of one "People" screen
// with an internal tab switcher.
function AdminPeople({ lockedTab, title }) {
  const { staff, doctors, addStaff, addDoctor, deactivate, activate, refreshing, refresh } = useAdminData();
  const [seg, setSeg] = useState(lockedTab || 'staff');
  const [search, setSearch] = useState('');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null); // { col, id, name }

  const filteredStaff = search.trim()
    ? staff.filter((s) => (s.full_name || '').toLowerCase().includes(search.toLowerCase()) || (s.role || '').toLowerCase().includes(search.toLowerCase()) || (s.id || '').toLowerCase().includes(search.toLowerCase()))
    : staff;

  const askDeactivate = (col, id, name) => setDeactivateTarget({ col, id, name });

  const confirmActivate = (col, id, name) => {
    Alert.alert('Reactivate', `Reactivate "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Activate', onPress: () => activate(col, id).catch((err) => showError(err.response?.data?.detail || 'Failed to activate.')) },
    ]);
  };

  return (
    <View style={styles.flex}>
      <AnimatedScreen contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}>
        <Text style={styles.h1}>{title || 'People'}</Text>
        {!lockedTab && (
          <SegmentedTabs options={[{ key: 'staff', label: `Staff (${staff.length})` }, { key: 'doctors', label: `Doctors (${doctors.length})` }]} value={seg} onChange={setSeg} />
        )}

        {seg === 'staff' ? (
          <>
            <Input value={search} onChangeText={setSearch} placeholder="Search by name, role or ID…" style={{ marginBottom: SPACE.lg }} />
            <RecordList
              data={filteredStaff}
              emptyIcon="users"
              emptyTitle="No staff records found"
              renderItem={(s) => (
                <RecordCard
                  title={s.full_name}
                  subtitle={`${s.id}  ·  ${(s.role || '').charAt(0).toUpperCase() + (s.role || '').slice(1)}`}
                  fields={[{ label: 'Mobile', value: s.mobile }, { label: 'Email', value: s.email || '—' }]}
                  badge={s.status === 'INACTIVE' ? { label: 'INACTIVE', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' } : { label: 'ACTIVE', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }}
                  actions={[s.status === 'INACTIVE'
                    ? { label: 'Activate', icon: 'check-circle', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', onPress: () => confirmActivate('staff', s.id, s.full_name) }
                    : { label: 'Deactivate', icon: 'x-circle', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => askDeactivate('staff', s.id, s.full_name) }]}
                />
              )}
            />
          </>
        ) : (
          <RecordList
            data={doctors}
            emptyIcon="user-check"
            emptyTitle="No doctors registered yet"
            renderItem={(d) => (
              <RecordCard
                title={d.full_name}
                subtitle={`${d.id}  ·  ${d.specialization || 'General'}`}
                fields={[{ label: 'Mobile', value: d.mobile }, { label: 'Email', value: d.email }]}
                badge={d.status === 'INACTIVE' ? { label: 'INACTIVE', bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' } : { label: 'ACTIVE', bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' }}
                actions={[d.status === 'INACTIVE'
                  ? { label: 'Activate', icon: 'check-circle', bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', onPress: () => confirmActivate('doctors', d.id, d.full_name) }
                  : { label: 'Deactivate', icon: 'x-circle', bg: '#fef2f2', border: '#fecaca', color: C.red, onPress: () => askDeactivate('doctors', d.id, d.full_name) }]}
              />
            )}
          />
        )}
      </AnimatedScreen>

      <FAB onPress={() => (seg === 'staff' ? setShowAddStaff(true) : setShowAddDoctor(true))} />

      <AddStaffSheet visible={showAddStaff} onClose={() => setShowAddStaff(false)} onSave={addStaff} />
      <AddDoctorSheet visible={showAddDoctor} onClose={() => setShowAddDoctor(false)} onSave={addDoctor} />
      <DeactivateSheet
        target={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={(reason) => deactivate(deactivateTarget.col, deactivateTarget.id, reason)}
      />
    </View>
  );
}

export default function AdminPeopleScreen() { return <AdminPeople />; }
export function AdminStaffScreen() { return <AdminPeople lockedTab="staff" title="Staff" />; }
export function AdminDoctorsScreen() { return <AdminPeople lockedTab="doctors" title="Doctors" />; }

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 90 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid, marginBottom: SPACE.md },
  hint: { fontSize: 11.5, color: C.textMuted },
  row2: { flexDirection: 'row', gap: 12, marginBottom: SPACE.md },
  fab: {
    position: 'absolute', right: SPACE.lg, bottom: SPACE.lg, width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
