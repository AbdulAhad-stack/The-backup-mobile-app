import { APP } from './appInfo';

// Legal copy tailored to what MediCare actually does (roles, data, session).
// Draft written from the app's behaviour — have it reviewed by legal counsel
// and update the contact details in appInfo.js before public release.
// Section shape: { h: heading, p: [paragraphs], bullets: [items] }

export const PRIVACY_POLICY = {
  title: 'Privacy Policy',
  updated: APP.policyUpdated,
  intro: `${APP.name} is a clinic management app by ${APP.developer}. It connects patients, doctors, reception, pharmacy, laboratory and administration in one system. This policy explains what information the app handles, why, and the choices you have.`,
  sections: [
    {
      h: '1. Information we handle',
      p: [`Depending on your role, ${APP.name} processes the following categories of information:`],
      bullets: [
        'Identity & contact details — name, CNIC, mobile number, email address, address, age and gender, provided at registration.',
        'Health information — medical history, consultations, diagnoses and notes, prescriptions and medication schedules, appointments, lab orders, samples and reports.',
        'Clinic operations — fee and payment records, day-close and cash reconciliation, pharmacy stock, suppliers, dispensing and wastage records.',
        'Staff records — attendance, payroll and availability for doctors and staff.',
        'Account & security data — your user ID, role, a sign-in token and an audit trail of important actions.',
        'Device preferences — theme, language and notification choices saved on your device.',
      ],
    },
    {
      h: '2. How we use it',
      bullets: [
        'To provide care workflows: registering patients, booking and managing appointments, recording consultations, prescribing, dispensing and reporting results.',
        'To run the clinic: billing, payroll, attendance, inventory control and financial reporting.',
        'To keep the service secure: authenticating users, enforcing role-based access, detecting errors and keeping an audit log.',
        'To keep your screens current through real-time updates, which you can switch off in Settings → Notifications.',
      ],
    },
    {
      h: '3. Who can see your information',
      p: ['Access is role-based. Each role only sees the areas needed for its job:'],
      bullets: [
        'Patients see their own records, prescriptions, schedule and appointments.',
        'Doctors see patients registered at or assigned to them and the consultations they record.',
        'Reception sees registration, appointment, billing and lab-order information needed at the front desk.',
        'Pharmacy sees prescriptions to dispense and inventory; the laboratory sees orders, samples and reports.',
        'Administrators oversee staff, finance, approvals and the audit log.',
      ],
    },
    {
      h: '4. Storage and security',
      p: [
        'Information is sent between the app and our servers over encrypted connections (HTTPS / secure WebSocket). We apply reasonable technical and organisational safeguards to protect it from unauthorised access, loss or misuse.',
        'On your device the app stores only your sign-in token and your preferences. Your session expires automatically, and signing out removes the token from the device. No system is perfectly secure, so please protect your password and sign out on shared devices.',
      ],
    },
    {
      h: '5. Sharing',
      p: [
        'We do not sell your personal or health information and we do not show advertising. Information is shared only with the clinic that treats you, with service providers that host or support the system under confidentiality obligations, or where the law requires it.',
      ],
    },
    {
      h: '6. Retention',
      p: ['Medical and financial records are kept for as long as the clinic needs them to provide care and meet legal, tax and audit obligations, and are then deleted or anonymised.'],
    },
    {
      h: '7. Your choices and rights',
      bullets: [
        'Ask the clinic to show you, correct or update the information held about you.',
        'Ask about deletion of your data, subject to medical-record retention rules.',
        'Change appearance, language, real-time updates and alert preferences at any time in Settings.',
        'Sign out at any time from Settings → Account.',
      ],
    },
    {
      h: "8. Children's information",
      p: ['Records for minors should be created and managed by a parent or legal guardian or by clinic staff on their behalf.'],
    },
    {
      h: '9. Changes to this policy',
      p: ['We may update this policy as the app evolves. The date at the top shows the latest revision, and significant changes will be highlighted in the app.'],
    },
    {
      h: '10. Contact us',
      p: [`Questions or requests about privacy: ${APP.supportEmail} · ${APP.supportPhone}. ${APP.developer}.`],
    },
  ],
};

export const TERMS = {
  title: 'Terms of Use',
  updated: APP.policyUpdated,
  intro: `By signing in to ${APP.name} you agree to these terms. If you do not agree, please do not use the app.`,
  sections: [
    {
      h: '1. About the service',
      p: [`${APP.name} helps clinics manage appointments, records, prescriptions, billing, pharmacy and laboratory work. Features available to you depend on your role.`],
    },
    {
      h: '2. Not for emergencies',
      p: ['The app does not provide emergency or diagnostic services and does not replace professional medical advice. In an emergency, contact your local emergency number or go to the nearest hospital immediately.'],
    },
    {
      h: '3. Your account',
      bullets: [
        'Accounts are issued by the clinic. Keep your password confidential and do not share your account.',
        'You are responsible for activity under your account. Tell the clinic straight away if you suspect unauthorised use.',
        'Provide accurate information and keep your contact details up to date.',
      ],
    },
    {
      h: '4. Acceptable use',
      bullets: [
        'Use the app only for its intended clinical and administrative purposes.',
        'Do not attempt to access records or features outside your role, or interfere with the security of the system.',
        'Staff must treat patient information as confidential and use it only for care, billing and clinic operations.',
        'Do not upload unlawful, misleading or harmful content.',
      ],
    },
    {
      h: '5. Medical information',
      p: ['Prescriptions, schedules and reports shown in the app are entered by clinic staff. Follow your doctor’s instructions and ask your care team if anything looks wrong or unclear.'],
    },
    {
      h: '6. Availability',
      p: ['We aim to keep the app available but cannot guarantee uninterrupted service. Features may change, and maintenance or connectivity problems may cause temporary interruptions.'],
    },
    {
      h: '7. Intellectual property',
      p: [`The ${APP.name} name, logo and software belong to ${APP.developer}. You may not copy, modify or reverse-engineer the app except where the law allows.`],
    },
    {
      h: '8. Limitation of liability',
      p: ['To the extent permitted by law, the app is provided “as is”. We are not liable for indirect or consequential loss arising from its use, or for decisions made without consulting a qualified healthcare professional.'],
    },
    {
      h: '9. Suspension and termination',
      p: ['The clinic or administrators may suspend or close an account that breaches these terms or is no longer needed. You can stop using the app at any time by signing out.'],
    },
    {
      h: '10. Changes and governing law',
      p: ['We may update these terms; continued use after an update means you accept it. These terms are governed by the laws of Pakistan.'],
    },
    {
      h: '11. Contact',
      p: [`${APP.developer} · ${APP.supportEmail} · ${APP.supportPhone}`],
    },
  ],
};

export const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'Open Book Appointment from the menu, choose a doctor, pick an available date and time slot, and confirm. You will see the request status there and get a live update when reception responds.',
  },
  {
    q: 'Where can I see my prescriptions and medicines?',
    a: 'Go to Medications for your current prescriptions and doses. Past visits, diagnoses and reports are listed under Medical History.',
  },
  {
    q: 'How do daily reminders work?',
    a: 'Daily Schedule shows your medicines arranged by time of day (morning, afternoon, evening, night) and by meal timing, based on what your doctor prescribed.',
  },
  {
    q: 'My appointment or records are not updating.',
    a: 'Pull down on the screen to refresh. Also make sure Real-time updates is on in Settings → Notifications and that you have an internet connection.',
  },
  {
    q: 'I forgot my password or cannot sign in.',
    a: 'Check that you selected the right role on the sign-in screen and are using your CNIC, mobile number or user ID. If it still fails, contact the clinic reception or support to have your password reset.',
  },
  {
    q: 'Who can see my medical information?',
    a: 'Only clinic staff who need it for your care, such as your doctor, pharmacy and lab, according to their role. See the Privacy Policy for details.',
  },
  {
    q: 'Can I use dark mode or change the language?',
    a: 'Yes. Open Settings → Appearance to choose Light, Dark or System. English is currently the only language; more are planned.',
  },
  {
    q: 'How do I sign out?',
    a: 'Open Settings → Account and tap Sign out, or use the logout button at the bottom of the side menu.',
  },
];
