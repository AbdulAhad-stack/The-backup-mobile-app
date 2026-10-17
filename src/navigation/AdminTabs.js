import React from 'react';
import RoleTabs from '../components/RoleTabs';
import { AdminDataProvider } from '../context/AdminDataContext';
import AdminOverviewScreen from '../screens/admin/AdminOverviewScreen';
import { AdminStaffScreen, AdminDoctorsScreen } from '../screens/admin/AdminPeopleScreen';
import { AdminDoctorAvailabilityScreen, AdminAttendanceScreen, AdminPayrollScreen } from '../screens/admin/AdminHRScreen';
import { AdminFeesScreen, AdminCashScreen, AdminLabCatalogScreen } from '../screens/admin/AdminFinanceScreen';
import { AdminWastageScreen, AdminMismatchesScreen, AdminReportsScreen, AdminAuditScreen } from '../screens/admin/AdminMoreScreen';

const ICONS = {
  Overview: 'home', Staff: 'users', Doctors: 'user-check', 'Doctor Availability': 'calendar',
  Attendance: 'calendar', Payroll: 'briefcase',
  Fees: 'credit-card', 'Cash Reconciliation': 'clipboard', 'Lab Test Catalog': 'activity',
  'Wastage Approvals': 'alert-triangle', 'Rx Mismatches': 'x-circle',
  'Financial Reports': 'trending-up', 'Audit Log': 'clock',
};
const LABELS = {
  'Doctor Availability': 'Availability', 'Cash Reconciliation': 'Cash', 'Lab Test Catalog': 'Catalog',
  'Wastage Approvals': 'Wastage', 'Rx Mismatches': 'Mismatches', 'Financial Reports': 'Reports', 'Audit Log': 'Audit',
};

// Same grouping as before — now shown inside the "More" sheet.
const SECTIONS = [
  { title: 'Main', routes: ['Overview'] },
  { title: 'Management', routes: ['Staff', 'Doctors', 'Doctor Availability'] },
  { title: 'HR & Payroll', routes: ['Attendance', 'Payroll'] },
  { title: 'Billing', routes: ['Fees', 'Cash Reconciliation', 'Lab Test Catalog'] },
  { title: 'Pharmacy Oversight', routes: ['Wastage Approvals', 'Rx Mismatches'] },
  { title: 'Reports', routes: ['Financial Reports'] },
  { title: 'Security', routes: ['Audit Log'] },
];

const SCREENS = [
  { name: 'Overview', component: AdminOverviewScreen, options: { title: 'Admin Portal' } },
  { name: 'Staff', component: AdminStaffScreen },
  { name: 'Doctors', component: AdminDoctorsScreen },
  { name: 'Doctor Availability', component: AdminDoctorAvailabilityScreen },
  { name: 'Attendance', component: AdminAttendanceScreen },
  { name: 'Payroll', component: AdminPayrollScreen },
  { name: 'Fees', component: AdminFeesScreen },
  { name: 'Cash Reconciliation', component: AdminCashScreen },
  { name: 'Lab Test Catalog', component: AdminLabCatalogScreen },
  { name: 'Wastage Approvals', component: AdminWastageScreen },
  { name: 'Rx Mismatches', component: AdminMismatchesScreen },
  { name: 'Financial Reports', component: AdminReportsScreen },
  { name: 'Audit Log', component: AdminAuditScreen },
];

export default function AdminTabs() {
  return (
    <AdminDataProvider>
      <RoleTabs
        portalName="Admin Portal"
        screens={SCREENS}
        icons={ICONS}
        labels={LABELS}
        sections={SECTIONS}
        primary={['Overview', 'Staff', 'Doctors', 'Fees']}
      />
    </AdminDataProvider>
  );
}
