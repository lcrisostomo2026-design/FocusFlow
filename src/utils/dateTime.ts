const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parsed = parseLocalDate(dateStr);
  return toDateString(parsed) === dateStr;
}

export function getTodayDateString(): string {
  return toDateString(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function getMondayOfWeek(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return toDateString(date);
}

export function diffDays(fromDateStr: string, toDateStr: string): number {
  const from = parseLocalDate(fromDateStr);
  const to = parseLocalDate(toDateStr);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${DAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export function formatLongDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${DAYS_LONG[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatCompactDayLabel(dateStr: string): { dayName: string; dayNum: string; month: string } {
  const d = parseLocalDate(dateStr);
  return {
    dayName: DAYS_SHORT[d.getDay()],
    dayNum: String(d.getDate()),
    month: MONTHS_SHORT[d.getMonth()],
  };
}

export function formatDateRange(startDateStr: string, endDateStr: string): string {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`;
  }
  return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} – ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}`;
}

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export function formatClockTime(hhmm: string): string {
  const [hRaw, mRaw] = hhmm.split(':').map(Number);
  const h24 = hRaw || 0;
  const m = mRaw || 0;
  if (h24 === 24 && m === 0) {
    return '12:00 AM';
  }
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${pad2(m)} ${period}`;
}

export function formatTimeRange(startTime: string, durationMinutes = 90): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return `${formatClockTime(startTime)} – ${formatClockTime(minutesToTime(endMins))}`;
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${pad2(mins)}:${pad2(secs)}`;
}
