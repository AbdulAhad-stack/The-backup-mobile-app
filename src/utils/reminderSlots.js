import { C } from '../theme';

export const getTimeSlot = (timeStr) => {
  if (!timeStr) return 'Unscheduled';
  const lower = timeStr.toLowerCase();
  if (lower.includes('morning') || lower.includes('sunrise')) return 'Morning';
  if (lower.includes('night') || lower.includes('evening') || lower.includes('bed')) return 'Night';
  if (lower.includes('afternoon') || lower.includes('noon')) return 'Afternoon';

  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const h = parseInt(match[1], 10);
    if (h >= 5 && h < 12) return 'Morning';
    if (h >= 12 && h < 18) return 'Afternoon';
    if (h >= 18 || h < 5) return 'Night';
  }
  return 'Unscheduled';
};

export const SLOT_CONFIG = [
  { key: 'Morning', label: 'Morning', icon: 'sunrise', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { key: 'Afternoon', label: 'Afternoon', icon: 'sun', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
  { key: 'Night', label: 'Night', icon: 'moon', color: C.indigo, bg: C.indigoBg, border: C.indigoBorder },
  { key: 'Unscheduled', label: 'Unscheduled', icon: 'clock', color: '#94a3b8', bg: '#f4f5fd', border: '#e2e8f0' },
];
