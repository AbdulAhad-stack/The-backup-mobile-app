export function formatTime12(hhmm) {
  if (!hhmm || hhmm.length < 5) return hhmm || '';
  let [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatRange12(start, end) {
  return `${formatTime12(start)} – ${formatTime12(end)}`;
}

export function generateSlots(start, end, stepMinutes = 30) {
  if (!start || !end) return [];
  const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toHHMM = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  const startMin = toMinutes(start);
  const endMin = toMinutes(end);
  const slots = [];
  for (let m = startMin; m + stepMinutes <= endMin; m += stepMinutes) {
    const slotStart = toHHMM(m);
    const slotEnd = toHHMM(m + stepMinutes);
    slots.push({ start: slotStart, end: slotEnd, label: formatRange12(slotStart, slotEnd) });
  }
  return slots;
}
