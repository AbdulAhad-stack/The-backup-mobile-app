import React from 'react';
import RoleTabs from '../components/RoleTabs';
import { ReceptionDataProvider } from '../context/ReceptionDataContext';
import ReceptionOverviewScreen from '../screens/reception/ReceptionOverviewScreen';
import ReceptionRegisterPatientScreen, { ReceptionAllRecordsScreen } from '../screens/reception/ReceptionPatientsScreen';
import ReceptionAppointmentsScreen from '../screens/reception/ReceptionAppointmentsScreen';
import ReceptionCollectFeeScreen, { ReceptionDayCloseScreen, ReceptionLabOrdersScreen } from '../screens/reception/ReceptionBillingScreen';
import ReceptionAssignDoctorScreen, { ReceptionAttendanceScreen } from '../screens/reception/ReceptionMoreScreen';

const ICONS = {
  Overview: 'home', 'Register Patient': 'user-plus', 'Assign Doctor': 'link', Appointments: 'calendar',
  'All Records': 'list', 'Collect Fee': 'credit-card', 'Day Close': 'check-circle',
  'Lab Orders': 'activity', Attendance: 'check-circle',
};
const LABELS = { 'Register Patient': 'Register', 'Assign Doctor': 'Assign', Appointments: 'Appointments', 'All Records': 'Records', 'Collect Fee': 'Collect', 'Lab Orders': 'Labs', 'Day Close': 'Close', Attendance: 'Attendance', Settings: 'Settings' };

// Same grouping as before — now shown inside the "More" sheet.
const SECTIONS = [
  { title: 'Main', routes: ['Overview'] },
  { title: 'Registration', routes: ['Register Patient'] },
  { title: 'Assignment', routes: ['Assign Doctor', 'Appointments'] },
  { title: 'Records', routes: ['All Records'] },
  { title: 'Billing', routes: ['Collect Fee', 'Day Close'] },
  { title: 'Lab', routes: ['Lab Orders'] },
  { title: 'Staff', routes: ['Attendance'] },
];

const SCREENS = [
  { name: 'Overview', component: ReceptionOverviewScreen, options: { title: 'Receptionist Portal' } },
  { name: 'Register Patient', component: ReceptionRegisterPatientScreen },
  { name: 'Assign Doctor', component: ReceptionAssignDoctorScreen },
  { name: 'Appointments', component: ReceptionAppointmentsScreen },
  { name: 'All Records', component: ReceptionAllRecordsScreen },
  { name: 'Collect Fee', component: ReceptionCollectFeeScreen },
  { name: 'Day Close', component: ReceptionDayCloseScreen },
  { name: 'Lab Orders', component: ReceptionLabOrdersScreen },
  { name: 'Attendance', component: ReceptionAttendanceScreen },
];

export default function ReceptionTabs() {
  return (
    <ReceptionDataProvider>
      <RoleTabs
        portalName="Receptionist Portal"
        screens={SCREENS}
        icons={ICONS}
        labels={LABELS}
        sections={SECTIONS}
        primary={['Overview', 'Register Patient', 'Appointments', 'Collect Fee']}
      />
    </ReceptionDataProvider>
  );
}
