import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { showSuccess, showError } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';

const PatientDataContext = createContext(null);

export const PatientDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const patientId = currentUser?.user_id;

  const [patient, setPatient] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorMap, setDoctorMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async ({ silent } = {}) => {
    if (!patientId) { setLoading(false); return; }
    if (!silent) setLoading(true);
    try {
      const dashRes = await api.get(`/api/patient/dashboard/${patientId}`);
      setPatient(dashRes.data.patient);
      setReminders(dashRes.data.reminders || []);

      const prescRes = await api.get('/api/prescriptions', { params: { patient_id: patientId } });
      setPrescriptions(prescRes.data.prescriptions || []);
    } catch {
      showError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData({ silent: true });
  }, [fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    api.get('/api/users_by_role/Doctor')
      .then((res) => {
        const map = {};
        (res.data.users || res.data.doctors || []).forEach((d) => { map[d.id] = d.full_name; });
        setDoctorMap(map);
      })
      .catch(() => {});
  }, []);

  useLiveNotifications(useCallback(() => { fetchData({ silent: true }); }, [fetchData]));

  const saveReminder = useCallback(async (form) => {
    const res = await api.post('/api/patient/save_reminder', {
      p_id: patientId,
      task: form.task,
      time: `${form.date ? form.date + ' ' : ''}${form.time}${form.repeat !== 'Once' ? ' · ' + form.repeat : ''}${form.notes ? ' — ' + form.notes : ''}`,
    });
    setReminders((prev) => [
      ...prev,
      { id: res.data.id, task: form.task, time: form.time, date: form.date, repeat: form.repeat, notes: form.notes, created_at: new Date().toLocaleDateString() },
    ]);
    showSuccess('Reminder saved successfully!');
  }, [patientId]);

  const deleteReminder = useCallback(async (id) => {
    await api.delete(`/api/patient/delete_reminder/${id}`);
    setReminders((prev) => prev.filter((r) => r.id !== id));
    showSuccess('Reminder deleted successfully.');
  }, []);

  return (
    <PatientDataContext.Provider value={{
      patientId, patient, reminders, prescriptions, doctorMap, loading, refreshing,
      refresh, saveReminder, deleteReminder,
    }}>
      {children}
    </PatientDataContext.Provider>
  );
};

export const usePatientData = () => {
  const ctx = useContext(PatientDataContext);
  if (!ctx) throw new Error('usePatientData must be used within PatientDataProvider');
  return ctx;
};
