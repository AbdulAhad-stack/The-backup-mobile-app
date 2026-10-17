import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { showSuccess, showError } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';

const ReceptionDataContext = createContext(null);

export const ReceptionDataProvider = ({ children }) => {
  const [stats, setStats] = useState({ total_patients: 0, total_doctors: 0, active_patients: 0, activ_doctors: 0 });
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([api.get('/api/stats'), api.get('/api/recent_users')]);
      setStats(s.data); setUsers(u.data);
    } catch { showError('Failed to load dashboard data.'); }
  }, []);

  const fetchAssignData = useCallback(async () => {
    try {
      const [pRes, dRes] = await Promise.all([api.get('/api/users_by_role/Patient'), api.get('/api/users_by_role/Doctor')]);
      setPatients(pRes.data.users || []); setDoctors(dRes.data.users || []);
    } catch { showError('Failed to load patients/doctors list.'); }
  }, []);

  const fetchAssignments = useCallback(async () => {
    try { const res = await api.get('/api/assignments'); setAssignments(res.data.assignments || []); }
    catch { /* silent */ }
  }, []);

  const refreshAll = useCallback(async () => { await Promise.all([fetchData(), fetchAssignData(), fetchAssignments()]); }, [fetchData, fetchAssignData, fetchAssignments]);

  useEffect(() => { (async () => { setLoading(true); await refreshAll(); setLoading(false); })(); }, []);
  useLiveNotifications(useCallback(() => { fetchData(); }, [fetchData]));

  const refresh = useCallback(async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); }, [refreshAll]);

  const registerPatient = useCallback(async (form) => {
    const res = await api.post('/api/generate/Patient', form);
    await fetchData();
    return res.data.user;
  }, [fetchData]);

  const assignDoctor = useCallback(async (patientId, doctorId) => {
    await api.post('/api/assign_doctor', { patient_id: patientId, doctor_id: doctorId });
    showSuccess('Doctor successfully assigned to patient.');
    fetchAssignments();
  }, [fetchAssignments]);

  const deleteUser = useCallback(async (id, role) => {
    if (role === 'Patient') {
      await api.delete(`/doctor/delete_patient/${id}`);
      showSuccess('Patient marked as deleted. Can be restored later.');
    } else {
      await api.delete(`/api/delete_user/${id}/${role}`);
      showSuccess('Record deleted successfully.');
    }
    fetchData();
  }, [fetchData]);

  const activeUsers = users.filter((u) => !u.is_deleted);

  return (
    <ReceptionDataContext.Provider value={{
      stats, users, activeUsers, patients, doctors, assignments, loading, refreshing, refresh,
      registerPatient, assignDoctor, deleteUser,
    }}>
      {children}
    </ReceptionDataContext.Provider>
  );
};

export const useReceptionData = () => {
  const ctx = useContext(ReceptionDataContext);
  if (!ctx) throw new Error('useReceptionData must be used within ReceptionDataProvider');
  return ctx;
};
