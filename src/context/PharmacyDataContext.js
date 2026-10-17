import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { showSuccess, showError } from '../utils/toast';
import { useLiveNotifications } from '../hooks/useLiveNotifications';

const PharmacyDataContext = createContext(null);

export const PharmacyDataProvider = ({ children }) => {
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [alerts, setAlerts] = useState({ low_stock: [], expiring_soon: [] });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMedicines = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/medicines'); setMedicines(res.data.medicines || []); }
    catch { showError('Failed to load medicines.'); }
  }, []);
  const fetchSuppliers = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/suppliers'); setSuppliers(res.data.suppliers || []); }
    catch { showError('Failed to load suppliers.'); }
  }, []);
  const fetchAlerts = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/alerts'); setAlerts(res.data); }
    catch { showError('Failed to load alerts.'); }
  }, []);
  const fetchPendingOrders = useCallback(async () => {
    try { const res = await api.get('/api/pharmacy/pending-orders'); setPendingOrders(res.data.orders || []); }
    catch { /* list just stays empty */ }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchMedicines(), fetchAlerts(), fetchSuppliers(), fetchPendingOrders()]);
  }, [fetchMedicines, fetchAlerts, fetchSuppliers, fetchPendingOrders]);

  useEffect(() => { (async () => { setLoading(true); await refreshAll(); setLoading(false); })(); }, []);
  useLiveNotifications(useCallback(() => { fetchMedicines(); fetchAlerts(); fetchPendingOrders(); }, [fetchMedicines, fetchAlerts, fetchPendingOrders]));

  const refresh = useCallback(async () => { setRefreshing(true); await refreshAll(); setRefreshing(false); }, [refreshAll]);

  const addMedicine = useCallback(async (form) => {
    await api.post('/api/pharmacy/medicines', {
      ...form,
      cost_price: parseFloat(form.cost_price) || 0,
      sale_price: parseFloat(form.sale_price) || 0,
      current_stock: parseFloat(form.current_stock) || 0,
      low_stock_threshold: parseFloat(form.low_stock_threshold) || 10,
    });
    showSuccess('Medicine added.');
    fetchMedicines(); fetchAlerts();
  }, [fetchMedicines, fetchAlerts]);

  const restock = useCallback(async (medicine, qty) => {
    await api.post(`/api/pharmacy/medicines/${medicine.id}/restock`, { qty });
    showSuccess('Medicine restocked.');
    fetchMedicines(); fetchAlerts();
  }, [fetchMedicines, fetchAlerts]);

  const reportWastage = useCallback(async (medicine, form) => {
    await api.post(`/api/pharmacy/medicines/${medicine.id}/wastage`, form);
    showSuccess('Wastage request submitted for admin approval.');
  }, []);

  const addSupplier = useCallback(async (form) => {
    await api.post('/api/pharmacy/suppliers', form);
    showSuccess('Supplier added.');
    fetchSuppliers();
  }, [fetchSuppliers]);

  const lookupPrescription = useCallback(async (id) => {
    const res = await api.get(`/api/prescriptions/${id}`);
    return res.data.prescription;
  }, []);

  const dispenseAgainstPrescription = useCallback(async (prescription, medicineName, qty) => {
    const res = await api.post('/api/pharmacy/dispense-against-prescription', {
      prescription_id: prescription.id, medicine_name: medicineName,
      qty_given: qty, patient_id: prescription.patient_id,
    });
    fetchMedicines();
    fetchPendingOrders();
    return res.data;
  }, [fetchMedicines, fetchPendingOrders]);

  return (
    <PharmacyDataContext.Provider value={{
      medicines, suppliers, alerts, pendingOrders, loading, refreshing, refresh,
      addMedicine, restock, reportWastage, addSupplier, lookupPrescription, dispenseAgainstPrescription,
    }}>
      {children}
    </PharmacyDataContext.Provider>
  );
};

export const usePharmacyData = () => {
  const ctx = useContext(PharmacyDataContext);
  if (!ctx) throw new Error('usePharmacyData must be used within PharmacyDataProvider');
  return ctx;
};
