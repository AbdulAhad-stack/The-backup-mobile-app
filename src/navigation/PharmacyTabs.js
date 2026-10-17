import React from 'react';
import RoleTabs from '../components/RoleTabs';
import { PharmacyDataProvider } from '../context/PharmacyDataContext';
import PharmacyOverviewScreen from '../screens/pharmacy/PharmacyOverviewScreen';
import MedicinesScreen from '../screens/pharmacy/MedicinesScreen';
import SuppliersScreen from '../screens/pharmacy/SuppliersScreen';
import AlertsScreen from '../screens/pharmacy/AlertsScreen';
import DispenseScreen from '../screens/pharmacy/DispenseScreen';

const ICONS = { Overview: 'home', Medicines: 'package', Suppliers: 'briefcase', Alerts: 'alert-triangle', 'Dispense (Rx)': 'clipboard' };
const LABELS = { Overview: 'Overview', Medicines: 'Medicines', Suppliers: 'Suppliers', Alerts: 'Alerts', 'Dispense (Rx)': 'Dispense', Settings: 'Settings' };

const SCREENS = [
  { name: 'Overview', component: PharmacyOverviewScreen, options: { title: 'Pharmacy Portal' } },
  { name: 'Medicines', component: MedicinesScreen },
  { name: 'Suppliers', component: SuppliersScreen },
  { name: 'Alerts', component: AlertsScreen },
  { name: 'Dispense (Rx)', component: DispenseScreen },
];

export default function PharmacyTabs() {
  return (
    <PharmacyDataProvider>
      <RoleTabs portalName="Pharmacy Portal" screens={SCREENS} icons={ICONS} labels={LABELS} />
    </PharmacyDataProvider>
  );
}
