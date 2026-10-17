import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { showSuccess, showError } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [staff, setStaff] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStaff = useCallback(async () => {
    try { const res = await api.get('/api/admin/staff'); setStaff(res.data.staff || []); }
    catch { showError('Failed to load staff list.'); }
  }, []);
  const fetchDoctors = useCallback(async () => {
    try { const res = await api.get('/api/users_by_role/Doctor'); setDoctors(res.data.users || []); }
    catch { showError('Failed to load doctors list.'); }
  }, []);
  const fetchAuditLogs = useCallback(async () => {
    try { const res = await api.get('/api/admin/audit-logs'); setAuditLogs(res.data.logs || []); }
    catch { showError('Failed to load audit logs.'); }
  }, []);

  const refreshAll = useCallback(async () => { await Promise.all([fetchStaff(), fetchDoctors()]); }, [fetchStaff, fetchDoctors]);

  useEffect(() => { (async () => { setLoading(true); await refreshAll(); setLoading(false); })(); }, []);
  useLiveNotifications(useCallback((notif) => {
    if (notif.type === 'audit-log-entry') fetchAuditLogs();
  }, [fetchAuditLogs]));

  const refresh = useCallback(async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); }, [refreshAll]);

  const addStaff = useCallback(async (form) => {
    await api.post(`/api/generate/${form.role}`, form);
    showSuccess('Staff member created successfully.');
    fetchStaff();
  }, [fetchStaff]);

  const addDoctor = useCallback(async (form) => {
    await api.post('/api/generate/doctor', form);
    showSuccess('Doctor registered successfully.');
    fetchDoctors();
  }, [fetchDoctors]);

  const deactivate = useCallback(async (col, id, reason) => {
    const path = col === 'staff' ? `/api/admin/staff/${id}/deactivate` : `/api/admin/doctor/${id}/deactivate`;
    await api.post(path, { reason });
    showSuccess('Deactivated successfully.');
    col === 'staff' ? fetchStaff() : fetchDoctors();
  }, [fetchStaff, fetchDoctors]);

  const activate = useCallback(async (col, id) => {
    const path = col === 'staff' ? `/api/admin/staff/${id}/activate` : `/api/admin/doctor/${id}/activate`;
    await api.post(path);
    showSuccess('Activated successfully.');
    col === 'staff' ? fetchStaff() : fetchDoctors();
  }, [fetchStaff, fetchDoctors]);

  return (
    <AdminDataContext.Provider value={{
      staff, doctors, auditLogs, loading, refreshing, refresh,
      fetchAuditLogs, addStaff, addDoctor, deactivate, activate,
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
};
