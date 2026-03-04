export function toISODate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function formatShortFR(dateStr) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export function frDayLetterFromIndex(i) {
  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  return labels[i] || "";
}

export function weekLabelFR(startDate) {
  const start = new Date(startDate);
  const end = addDays(start, 6);
  return `${formatShortFR(start)} - ${formatShortFR(end)}`;
}

export function formatDDMMDots(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}`;
}

export function weekRangeLabelDots(startDate) {
  const start = new Date(startDate);
  const end = addDays(start, 6);
  return `${formatDDMMDots(start)} au ${formatDDMMDots(end)}`;
}