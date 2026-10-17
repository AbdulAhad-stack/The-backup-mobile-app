import appJson from '../../app.json';

// Single source of truth for app metadata shown in Settings / About / legal.
// Version + build come from app.json so they never drift from the real build.
// TODO(before release): replace the placeholder contact details below.
const expo = appJson.expo || {};

export const APP = {
  name: 'MediCare',
  tagline: 'Clinic management, connected.',
  version: expo.version || '1.0.0',
  build: String(expo.android?.versionCode ?? 1),
  developer: 'WellMind Data Solutions',
  supportEmail: 'support@wellmind.example',
  supportPhone: '+92 300 0000000',
  supportHours: 'Mon – Sat, 9:00 AM – 6:00 PM (PKT)',
  website: 'https://wellmind.example',
  policyUpdated: '1 October 2026',
  year: 2026,
};
