import React, { useState } from 'react';
import { View, TouchableOpacity, RefreshControl, Feather } from '../../components/Themed';
import { Text } from '../../components/AppText';
import AnimatedScreen from '../../components/animated/AnimatedScreen';
import { useDoctorData } from '../../context/DoctorDataContext';
import { Input, EmptyState } from '../../components/ui';
import { RecordCard, RecordList } from '../../components/DataList';
import { C, SPACE, RADIUS, createStyles } from '../../theme';

export default function DoctorAssignedScreen({ navigation }) {
  const { activeAssigned, completedAssigned, refreshing, refresh } = useDoctorData();
  const [search, setSearch] = useState('');

  const filterList = (list) => search.trim()
    ? list.filter((p) => (p.full_name || p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.id || '').toLowerCase().includes(search.toLowerCase()) || (p.cnic || '').includes(search))
    : list;

  const pending = filterList(activeAssigned);
  const completed = filterList(completedAssigned);

  return (
    <AnimatedScreen style={styles.flex} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.blue} />}>
      <Text style={styles.h1}>Assigned Patients</Text>
      <Text style={styles.sub}>Patients referred by reception — start a consultation below.</Text>

      <Input value={search} onChangeText={setSearch} placeholder="Search by name, ID, or CNIC…" style={{ marginBottom: SPACE.lg }} />

      {pending.length === 0 && completed.length === 0 ? (
        <EmptyState icon={<Feather name="users" size={44} color={C.faint} />} title="No Assigned Patients" subtitle="Patients assigned by reception will appear here." />
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Pending Consultation ({pending.length})</Text>
              {pending.map((p) => (
                <View key={p.id || p.p_id} style={styles.pendingCard}>
                  <View style={styles.pRow}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{(p.full_name || p.name || 'P')[0].toUpperCase()}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pName}>{p.full_name || p.name || '—'}</Text>
                      <Text style={styles.pMeta}>{p.id || p.p_id}{p.age ? `  ·  ${p.age}y` : ''}{p.gender ? `  ·  ${p.gender}` : ''}</Text>
                    </View>
                    <View style={styles.pendingBadge}><Feather name="clock" size={10} color="#c2410c" /><Text style={styles.pendingBadgeText}> Pending</Text></View>
                  </View>
                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() => navigation.navigate('Consultation', { presetPatientId: p.id || p.p_id })}
                  >
                    <Feather name="file-plus" size={14} color="#fff" />
                    <Text style={styles.startBtnText}>Start Consultation</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {completed.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: SPACE.md }]}>Completed Today ({completed.length})</Text>
              <RecordList
                data={completed}
                renderItem={(p) => (
                  <RecordCard
                    title={p.full_name || p.name || '—'}
                    subtitle={p.id || p.p_id}
                    badge={{ label: 'Completed', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' }}
                  />
                )}
              />
            </>
          )}
        </>
      )}
    </AnimatedScreen>
  );
}

const styles = createStyles({
  flex: { flex: 1, backgroundColor: C.bg },
  content: { padding: SPACE.lg, paddingBottom: 40 },
  h1: { fontWeight: '800', fontSize: 22, color: C.navyMid },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2, marginBottom: SPACE.lg },
  sectionLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, color: C.textMuted, marginBottom: 10 },
  pendingCard: { backgroundColor: C.white, borderWidth: 2, borderColor: '#fed7aa', borderRadius: RADIUS.md, padding: SPACE.md, marginBottom: SPACE.sm },
  pRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACE.sm },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.blueSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 15, color: C.blue },
  pName: { fontWeight: '700', fontSize: 14, color: C.text },
  pMeta: { fontSize: 11.5, color: C.textMuted, marginTop: 1 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: RADIUS.pill, paddingVertical: 3, paddingHorizontal: 8 },
  pendingBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#c2410c' },
  startBtn: { flexDirection: 'row', gap: 6, backgroundColor: '#5b5fc7', borderRadius: RADIUS.sm, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
