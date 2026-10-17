// Per-role copy used by Settings: who the user is, what they can access,
// and which alert categories are relevant to them.
const RECEPTION_MODULES = ['Overview', 'Register Patient', 'Assign Doctor', 'Appointments', 'All Records', 'Collect Fee', 'Day Close', 'Lab Orders', 'Attendance'];
const RECEPTION_NOTIFY = [
  { key: 'appointmentRequests', title: 'Appointment requests', subtitle: 'New bookings and reschedule responses' },
  { key: 'payments', title: 'Payments & day close', subtitle: 'Fee collection and end-of-day reminders' },
  { key: 'labOrders', title: 'Lab orders', subtitle: 'Orders raised for your patients' },
];

export const ROLE_INFO = {
  Patient: {
    label: 'Patient',
    portal: 'Patient Portal',
    blurb: 'View your health records and medications, follow your daily schedule and book appointments.',
    modules: ['Overview', 'Medications', 'Medical History', 'Daily Schedule', 'Book Appointment'],
    notify: [
      { key: 'appointments', title: 'Appointment updates', subtitle: 'Confirmations, changes and reminders' },
      { key: 'prescriptions', title: 'Prescriptions & medication', subtitle: 'New prescriptions from your doctor' },
      { key: 'labReports', title: 'Lab reports', subtitle: 'When a report is ready to view' },
      { key: 'reminders', title: 'Daily schedule reminders', subtitle: 'Dose and meal-time reminders' },
    ],
  },
  Doctor: {
    label: 'Physician',
    portal: 'Physician Portal',
    blurb: 'Manage patient records, assigned patients and consultations.',
    modules: ['Overview', 'Patient Records', 'Assigned to Me', 'Consultation'],
    notify: [
      { key: 'assignments', title: 'New patient assignments', subtitle: 'When a patient is assigned to you' },
      { key: 'consultations', title: 'Consultation updates', subtitle: 'Status changes on your consultations' },
      { key: 'labResults', title: 'Lab results', subtitle: 'Results for tests you ordered' },
    ],
  },
  admin: {
    label: 'Administrator',
    portal: 'Admin Portal',
    blurb: 'Oversee staff, billing, payroll, pharmacy approvals, reports and the audit trail.',
    modules: ['Overview', 'Staff', 'Doctors', 'Doctor Availability', 'Attendance', 'Payroll', 'Fees', 'Cash Reconciliation', 'Lab Test Catalog', 'Wastage Approvals', 'Rx Mismatches', 'Financial Reports', 'Audit Log'],
    notify: [
      { key: 'approvals', title: 'Pending approvals', subtitle: 'Wastage approvals waiting for review' },
      { key: 'mismatches', title: 'Prescription mismatches', subtitle: 'Dispensed quantity differs from prescribed' },
      { key: 'dailySummary', title: 'Daily summary', subtitle: 'End-of-day clinic summary' },
    ],
  },
  receptionist: {
    label: 'Receptionist',
    portal: 'Receptionist Portal',
    blurb: 'Register patients, assign doctors, manage appointments, collect fees and close the day.',
    modules: RECEPTION_MODULES,
    notify: RECEPTION_NOTIFY,
  },
  staff: {
    label: 'Staff',
    portal: 'Staff Portal',
    blurb: 'Front-desk tools for registration, appointments, billing and attendance.',
    modules: RECEPTION_MODULES,
    notify: RECEPTION_NOTIFY,
  },
  pharmacist: {
    label: 'Pharmacist',
    portal: 'Pharmacy Portal',
    blurb: 'Manage medicine inventory, suppliers, stock alerts and prescription dispensing.',
    modules: ['Overview', 'Medicines', 'Suppliers', 'Alerts', 'Dispense (Rx)'],
    notify: [
      { key: 'lowStock', title: 'Low stock alerts', subtitle: 'Medicines running below minimum level' },
      { key: 'newRx', title: 'New prescriptions', subtitle: 'Prescriptions waiting to be dispensed' },
      { key: 'expiry', title: 'Expiry alerts', subtitle: 'Batches nearing expiry' },
    ],
  },
  lab_technician: {
    label: 'Lab Technician',
    portal: 'Lab Portal',
    blurb: 'Process incoming samples and publish lab reports.',
    modules: ['Overview', 'Samples', 'Reports'],
    notify: [
      { key: 'newSamples', title: 'New sample requests', subtitle: 'Tests ordered by doctors or reception' },
      { key: 'reportDue', title: 'Reports pending', subtitle: 'Samples awaiting a report' },
    ],
  },
};

export const roleInfo = (role) =>
  ROLE_INFO[role] || { label: String(role || 'User'), portal: 'MediCare', blurb: '', modules: [], notify: [] };

export const hasFeedbackAndHelp = (role) => role === 'Patient';
