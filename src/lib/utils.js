import { NOW, SLA_HOURS } from '../data/mockData';

// ---- date & time formatting -------------------------------------------------
const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

export function fmtMonthKey(iso) {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

// ---- durations --------------------------------------------------------------
export function hoursBetween(aIso, bIso) {
  return (new Date(bIso) - new Date(aIso)) / 3600000;
}

export function fmtDuration(hours) {
  if (hours == null || isNaN(hours)) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} jam`;
  const days = Math.floor(hours / 24);
  const rem = Math.round(hours % 24);
  return rem ? `${days} hari ${rem} jam` : `${days} hari`;
}

// ---- SLA computation --------------------------------------------------------
// Returns { state: 'met' | 'breached' | 'running' | 'due-soon', remainingHours, elapsedHours, dueAt }
export function computeSla(ticket) {
  const slaHours = ticket.slaHours ?? SLA_HOURS[ticket.priority] ?? 24;
  const created = new Date(ticket.createdAt);
  const dueAt = new Date(created.getTime() + slaHours * 3600000);

  if (ticket.resolvedAt || ticket.status === 'Resolved' || ticket.status === 'Closed') {
    const end = new Date(ticket.resolvedAt || ticket.closedAt || NOW);
    const used = (end - created) / 3600000;
    return {
      state: used > slaHours ? 'breached' : 'met',
      slaHours,
      elapsedHours: used,
      remainingHours: slaHours - used,
      dueAt: dueAt.toISOString(),
    };
  }

  // still open
  const elapsed = (NOW - created) / 3600000;
  const remaining = slaHours - elapsed;
  let state = 'running';
  if (remaining <= 0) state = 'breached';
  else if (remaining <= slaHours * 0.25) state = 'due-soon';
  return {
    state,
    slaHours,
    elapsedHours: elapsed,
    remainingHours: remaining,
    dueAt: dueAt.toISOString(),
  };
}

export function resolutionHours(ticket) {
  if (!ticket.resolvedAt) return null;
  return hoursBetween(ticket.createdAt, ticket.resolvedAt);
}

// ---- misc -------------------------------------------------------------------
export function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

export function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function toCsv(rows) {
  return rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
