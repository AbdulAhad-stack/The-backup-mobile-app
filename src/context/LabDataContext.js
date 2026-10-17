import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { showSuccess, showError } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';
import { useAuth } from './AuthContext';

const LabDataContext = createContext(null);

export const LabDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [dash, setDash] = useState({ total_samples: 0, pending_samples: 0, completed_today: 0, critical_count: 0, recent_samples: [], critical_alerts: [] });
  const [samples, setSamples] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDash = useCallback(async () => {
    try { const res = await api.get('/api/lab/dashboard'); setDash(res.data); }
    catch { showError('Failed to load lab dashboard.'); }
  }, []);

  const fetchSamples = useCallback(async (filter = statusFilter) => {
    try {
      const res = await api.get('/api/lab/samples', { params: filter !== 'All' ? { status: filter } : {} });
      setSamples(res.data.samples || []);
    } catch { showError('Failed to load samples.'); }
  }, [statusFilter]);

  const fetchReports = useCallback(async () => {
    try { const res = await api.get('/api/lab/reports'); setReports(res.data.reports || []); }
    catch { showError('Failed to load reports.'); }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchDash(), fetchSamples(), fetchReports()]);
  }, [fetchDash, fetchSamples, fetchReports]);

  useEffect(() => { (async () => { setLoading(true); await refreshAll(); setLoading(false); })(); }, []);
  useEffect(() => { fetchSamples(); }, [statusFilter, fetchSamples]);

  useLiveNotifications(useCallback(() => { fetchDash(); fetchSamples(); }, [fetchDash, fetchSamples]));

  const refresh = useCallback(async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); }, [refreshAll]);

  const changeStatus = useCallback(async (sample, status) => {
    await api.patch(`/api/lab/samples/${sample.id}/status`, { status });
    showSuccess(`Status updated to ${status}`);
    fetchSamples(); fetchDash();
  }, [fetchSamples, fetchDash]);

  const submitResults = useCallback(async (sample, results, notes) => {
    await api.post(`/api/lab/samples/${sample.id}/results`, {
      results, notes, technician_id: currentUser.user_id,
    });
    showSuccess('Results submitted and report generated.');
    fetchSamples(); fetchDash(); fetchReports();
  }, [currentUser, fetchSamples, fetchDash, fetchReports]);

  return (
    <LabDataContext.Provider value={{
      dash, samples, reports, statusFilter, setStatusFilter, loading, refreshing, refresh,
      changeStatus, submitResults,
    }}>
      {children}
    </LabDataContext.Provider>
  );
};

export const useLabData = () => {
  const ctx = useContext(LabDataContext);
  if (!ctx) throw new Error('useLabData must be used within LabDataProvider');
  return ctx;
};
