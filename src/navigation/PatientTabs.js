import React from 'react';
import RoleTabs from '../components/RoleTabs';
import { PatientDataProvider } from '../context/PatientDataContext';
import { AppearanceProvider } from '../context/AppearanceContext';
import OverviewScreen from '../screens/patient/OverviewScreen';
import MedicationsScreen from '../screens/patient/MedicationsScreen';
import HistoryScreen from '../screens/patient/HistoryScreen';
import RemindersScreen from '../screens/patient/RemindersScreen';
import BookingScreen from '../screens/patient/BookingScreen';

const ICONS = {
  Overview: 'home', Medications: 'pill', 'Medical History': 'file-text',
  'Daily Schedule': 'bell', 'Book Appointment': 'calendar',
};
const LABELS = {
  Overview: 'Home', Medications: 'Medications', 'Medical History': 'Records',
  'Daily Schedule': 'Schedule', 'Book Appointment': 'Bookings', Settings: 'Settings',
};
const SCREENS = [
  { name: 'Overview', component: OverviewScreen, options: { title: 'Home' } },
  { name: 'Medications', component: MedicationsScreen },
  { name: 'Medical History', component: HistoryScreen },
  { name: 'Daily Schedule', component: RemindersScreen },
  { name: 'Book Appointment', component: BookingScreen },
];

export default function PatientTabs() {
  return (
    <AppearanceProvider><PatientDataProvider>
      <RoleTabs portalName="Patient Portal" screens={SCREENS} icons={ICONS} labels={LABELS} />
    </PatientDataProvider></AppearanceProvider>
  );
}
