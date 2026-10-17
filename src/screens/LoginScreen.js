import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StatusBar, Modal } from 'react-native';
import { View, ScrollView, TouchableOpacity, Feather } from '../components/Themed';
import { Text } from '../components/AppText';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/toast';
import { Input, FieldLabel, PrimaryButton } from '../components/ui';
import { C, RADIUS, SPACE, createStyles, isDark, useScheme } from '../theme';

const LOGIN_COLOR = '#4B4E96';
const LOGIN_DARK = '#1c2146'; // brand band in dark mode

const ROLES = [
  { key: 'Patient', label: 'Patient', sub: 'View records, book visits, manage your care' },
  { key: 'Doctor', label: 'Doctor', sub: 'Consultations, prescriptions, patient history' },
  { key: 'admin', label: 'Admin', sub: 'Full system control & oversight' },
  { key: 'staff', label: 'Receptionist', sub: 'Front desk, registration & appointments' },
  { key: 'staff', label: 'Pharmacist', sub: 'Inventory, dispensing & prescriptions' },
  { key: 'lab_technician', label: 'Lab Technician', sub: 'Samples, results & reports' },
];

const DEMO_ACCOUNTS = [
  { roleIdx: 0, label: 'Patient', identifier: '35201-1111111-1', password: 'patient123' },
  { roleIdx: 1, label: 'Doctor', identifier: '0311-1111111', password: 'doctor123' },
  { roleIdx: 2, label: 'Admin', identifier: 'admin', password: 'ChangeMe123!' },
  { roleIdx: 3, label: 'Receptionist', identifier: 'REC-0002', password: 'reception123' },
  { roleIdx: 4, label: 'Pharmacist', identifier: 'PHM-0003', password: 'pharmacy123' },
  { roleIdx: 5, label: 'Lab Tech', identifier: 'LAB-1001', password: 'labpass123' },
];

export default function LoginScreen() {
  useScheme();
  const [roleIdx, setRoleIdx] = useState(0);
  const [roleOpen, setRoleOpen] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const role = ROLES[roleIdx];
  const demoAccounts = DEMO_ACCOUNTS.filter((a) => a.roleIdx === roleIdx);

  const fillDemo = (acc) => { setIdentifier(acc.identifier); setPassword(acc.password); };

  const selectRole = (idx) => {
    setRoleIdx(idx);
    setRoleOpen(false);
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password) { showError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      let res;
      if (role.key === 'lab_technician') {
        res = await api.post('/api/lab/login', { userid: identifier.trim(), password });
      } else {
        res = await api.post('/api/login', { userid: identifier.trim(), password, role: role.key });
      }
      if (res.data.status === 'success') {
        await login({ token: res.data.token, user_id: res.data.user_id, role: res.data.role });
      }
    } catch (err) {
      showError(err.response?.data?.detail || 'Invalid credentials. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.flex, isDark() && { backgroundColor: LOGIN_DARK }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.brand, isDark() && { backgroundColor: LOGIN_DARK }]}>
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/medicare-logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.brandTitle}>MediCare Portal</Text>
          <Text style={styles.brandTag}>One system, five roles, one clinic running in sync.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>{role.sub}</Text>

          <FieldLabel>Login As</FieldLabel>
          <TouchableOpacity style={styles.roleTrigger} onPress={() => setRoleOpen(true)}>
            <Text style={styles.roleTriggerText}>{role.label}</Text>
            <Feather name="chevron-down" size={16} color={C.textMuted} />
          </TouchableOpacity>

          <Modal visible={roleOpen} transparent animationType="fade" onRequestClose={() => setRoleOpen(false)}>
            <TouchableOpacity style={styles.roleOverlay} activeOpacity={1} onPress={() => setRoleOpen(false)}>
              <View style={styles.roleSheet} onStartShouldSetResponder={() => true}>
                {ROLES.map((r, idx) => (
                  <TouchableOpacity
                    key={r.label}
                    style={[styles.roleOption, idx === roleIdx && styles.roleOptionActive]}
                    onPress={() => selectRole(idx)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roleOptionLabel}>{r.label}</Text>
                      <Text style={styles.roleOptionSub}>{r.sub}</Text>
                    </View>
                    {idx === roleIdx && <Feather name="check" size={16} color={LOGIN_COLOR} />}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          <FieldLabel>CNIC, Mobile Number, or User ID</FieldLabel>
          <Input
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. 42101-1234567-1, 0300-1234567, or REC-0001"
            autoCapitalize="none"
            style={{ marginBottom: SPACE.md }}
          />

          <FieldLabel>Password</FieldLabel>
          <View style={{ position: 'relative', marginBottom: SPACE.md }}>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPw}
              autoCapitalize="none"
              style={{ paddingRight: 44 }}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw((p) => !p)}>
              <Feather name={showPw ? 'eye-off' : 'eye'} size={17} color={C.textMuted} />
            </TouchableOpacity>
          </View>

          {demoAccounts.length > 0 && (
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>Demo:</Text>
              {demoAccounts.map((acc) => (
                <TouchableOpacity key={acc.label} style={styles.demoChip} onPress={() => fillDemo(acc)}>
                  <Text style={styles.demoChipText}>{acc.identifier}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <PrimaryButton
            label={`Sign In as ${role.label}`}
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: SPACE.md, backgroundColor: isDark() ? C.blue : LOGIN_COLOR }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: LOGIN_COLOR },
  scroll: { flexGrow: 1, backgroundColor: C.bg },
  brand: {
    backgroundColor: LOGIN_COLOR, paddingTop: 64, paddingBottom: 36, paddingHorizontal: SPACE.xl,
    alignItems: 'center',
  },
  logoWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACE.md,
  },
  logo: { width: 38, height: 38 },
  brandTitle: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: 'normal', fontSize: 28, letterSpacing: -0.7, marginBottom: 6 },
  brandTag: { color: 'rgba(255,255,255,0.65)', fontSize: 13, textAlign: 'center' },
  card: {
    backgroundColor: C.white, marginTop: -20, marginHorizontal: SPACE.lg, borderRadius: RADIUS.xl,
    padding: SPACE.xl, shadowColor: LOGIN_COLOR, shadowOpacity: 0.12, shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }, elevation: 6, marginBottom: SPACE.xl,
  },
  cardTitle: { fontWeight: '800', fontSize: 19, color: C.text },
  cardSub: { fontSize: 12.5, color: C.textMuted, marginTop: 4, marginBottom: SPACE.lg },
  roleTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: C.border, borderRadius: RADIUS.md, paddingVertical: 11,
    paddingHorizontal: 14, backgroundColor: '#f6f7fe', marginBottom: SPACE.md,
  },
  roleTriggerText: { fontSize: 13.5, fontWeight: '600', color: C.text },
  roleOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'center', padding: SPACE.xl },
  roleSheet: { backgroundColor: C.white, borderRadius: RADIUS.lg, paddingVertical: 6 },
  roleOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  roleOptionActive: { backgroundColor: C.blueSoft },
  roleOptionLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  roleOptionSub: { fontSize: 11.5, color: C.muted, marginTop: 2 },
  eyeBtn: { position: 'absolute', right: 12, top: 12 },
  demoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: SPACE.sm },
  demoLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', marginRight: 4 },
  demoChip: {
    backgroundColor: C.blueSoft, borderWidth: 1, borderColor: '#e0e3fb', borderRadius: RADIUS.pill,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  demoChipText: { fontSize: 11.5, color: LOGIN_COLOR, fontWeight: '600' },
});
