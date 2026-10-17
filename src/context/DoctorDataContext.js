import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { showError, showSuccess } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';
import { useAuth } from './AuthContext';

const DoctorDataContext = createContext(null);

const isToday = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  return !isNaN(d) && d.toDateString() === new Date().toDateString();
};

export const DoctorDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const docId = currentUser?.user_id || '';

  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, today_date: '' });
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get(`/api/patients?doc_id=${docId}`);
      setPatients(res.data.patients);
      setStats(res.data.stats);
    } catch { showError('Failed to load patient data.'); }
  }, [docId]);

  const fetchAssigned = useCallback(async () => {
    try {
      const res = await api.get(`/api/assigned_patients/${docId}`);
      setAssignedPatients(res.data.patients || []);
    } catch { /* silent */ }
  }, [docId]);

  const fetchDoctorPrescriptions = useCallback(async () => {
    try {
      const res = await api.get('/api/prescriptions', { params: { doctor_id: docId } });
      setDoctorPrescriptions(res.data.prescriptions || []);
    } catch { /* chart just stays empty */ }
  }, [docId]);

  const fetchMedicines = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/medicines'); setMedicines(res.data.medicines || []); }
    catch { /* non-fatal */ }
  }, []);

  const fetchTests = useCallback(async () => {
    try { const res = await api.get('/api/lab-tests'); setTests(res.data.tests || []); }
    catch { /* non-fatal */ }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchPatients(), fetchAssigned(), fetchDoctorPrescriptions(), fetchMedicines(), fetchTests()]);
  }, [fetchPatients, fetchAssigned, fetchDoctorPrescriptions, fetchMedicines, fetchTests]);

  useEffect(() => { (async () => { setLoading(true); await refreshAll(); setLoading(false); })(); }, []);

  useLiveNotifications(useCallback((notif) => {
    if (notif.type === 'doctor-assigned' && notif.doctor_id === docId) { fetchAssigned(); fetchPatients(); }
  }, [docId, fetchAssigned, fetchPatients]));

  const refresh = useCallback(async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); }, [refreshAll]);

  const fetchPrescriptionHistory = useCallback(async (pId) => {
    const res = await api.get('/api/prescriptions', { params: { patient_id: pId } });
    return res.data.prescriptions || [];
  }, []);

  const deletePatient = useCallback(async (pid) => {
    await api.delete(`/doctor/delete_patient/${pid}`);
    showSuccess('Patient record deleted.');
    fetchPatients();
  }, [fetchPatients]);

  const submitPrescription = useCallback(async (patientId, lines) => {
    const res = await api.post('/api/prescriptions', { patient_id: patientId, doctor_id: docId, medicines: lines });
    fetchDoctorPrescriptions();
    return res.data;
  }, [docId, fetchDoctorPrescriptions]);

  const fetchLabSuggestionHistory = useCallback(async (pId) => {
    const res = await api.get('/api/lab-tests/suggestions', { params: { patient_id: pId } });
    return res.data.suggestions || [];
  }, []);

  const suggestLabTest = useCallback(async (patientId, testId, notes) => {
    await api.post('/api/lab-tests/suggest', { patient_id: patientId, doctor_id: docId, test_id: testId, notes });
  }, [docId]);

  const activeAssigned = assignedPatients.filter((p) => p.checked_in !== 'True');
  const completedAssigned = assignedPatients.filter((p) => p.checked_in === 'True' && isToday(p.checked_in_at));

  return (
    <DoctorDataContext.Provider value={{
      docId, patients, stats, assignedPatients, activeAssigned, completedAssigned,
      doctorPrescriptions, medicines, tests, loading, refreshing, refresh,
      fetchPrescriptionHistory, deletePatient, submitPrescription, fetchLabSuggestionHistory, suggestLabTest,
    }}>
      {children}
    </DoctorDataContext.Provider>
  );
};

export const useDoctorData = () => {
  const ctx = useContext(DoctorDataContext);
  if (!ctx) throw new Error('useDoctorData must be used within DoctorDataProvider');
  return ctx;
};
