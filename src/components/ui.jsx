import { useEffect } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../lib/utils';

// ---- Status badge -----------------------------------------------------------
const STATUS_STYLES = {
  New: 'bg-slate-400/15 text-slate-600 dark:text-slate-300 ring-slate-400/30',
  Assigned: 'bg-sky-400/15 text-sky-700 dark:text-sky-300 ring-sky-400/30',
  'In Progress': 'bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-400/30',
  Resolved: 'bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 ring-emerald-400/30',
  Closed: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 ring-slate-500/25',
};
const STATUS_DOT = {
  New: 'bg-slate-400',
  Assigned: 'bg-sky-500',
  'In Progress': 'bg-amber-500',
  Resolved: 'bg-emerald-500',
  Closed: 'bg-slate-500',
};

export function StatusBadge({ status }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        STATUS_STYLES[status] || STATUS_STYLES.New
      )}
    >
      <span className={classNames('h-1.5 w-1.5 rounded-full', STATUS_DOT[status] || 'bg-slate-400')} />
      {status}
    </span>
  );
}

// ---- Priority pill ----------------------------------------------------------
const PRIORITY_STYLES = {
  Low: 'text-slate-500 dark:text-slate-400',
  Medium: 'text-sky-600 dark:text-sky-400',
  High: 'text-amber-600 dark:text-amber-400',
  Critical: 'text-rose-600 dark:text-rose-400',
};
const PRIORITY_DOT = {
  Low: 'bg-slate-400',
  Medium: 'bg-sky-500',
  High: 'bg-amber-500',
  Critical: 'bg-rose-500',
};
export function PriorityPill({ priority }) {
  return (
    <span className={classNames('inline-flex items-center gap-1.5 text-xs font-medium', PRIORITY_STYLES[priority])}>
      <span className={classNames('h-2 w-2 rounded-full', PRIORITY_DOT[priority])} />
      {priority}
    </span>
  );
}

// ---- Category chip ----------------------------------------------------------
export function CategoryChip({ name, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
      <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

// ---- SLA badge --------------------------------------------------------------
export function SlaBadge({ state }) {
  const map = {
    met: ['Dalam SLA', 'bg-emerald-400/15 text-emerald-700 dark:text-emerald-300 ring-emerald-400/30'],
    breached: ['SLA Terlewat', 'bg-rose-400/15 text-rose-700 dark:text-rose-300 ring-rose-400/30'],
    running: ['SLA Berjalan', 'bg-sky-400/15 text-sky-700 dark:text-sky-300 ring-sky-400/30'],
    'due-soon': ['Hampir Tamat', 'bg-amber-400/15 text-amber-700 dark:text-amber-300 ring-amber-400/30'],
  };
  const [label, cls] = map[state] || map.running;
  return (
    <span className={classNames('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', cls)}>
      {label}
    </span>
  );
}

// ---- Glass card -------------------------------------------------------------
export function GlassCard({ className, children, ...rest }) {
  return (
    <div className={classNames('glass rounded-2xl', className)} {...rest}>
      {children}
    </div>
  );
}

// ---- Stat card --------------------------------------------------------------
export function StatCard({ label, value, sub, icon: Icon, tone = 'accent' }) {
  const tones = {
    accent: 'text-accent-600 dark:text-accent-300 bg-accent-500/10',
    emerald: 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10',
    amber: 'text-amber-600 dark:text-amber-300 bg-amber-500/10',
    rose: 'text-rose-600 dark:text-rose-300 bg-rose-500/10',
    slate: 'text-slate-600 dark:text-slate-300 bg-slate-500/10',
  };
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
          {sub && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
        </div>
        {Icon && (
          <div className={classNames('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </GlassCard>
  );
}

// ---- Modal ------------------------------------------------------------------
export function Modal({ open, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={classNames(
          'glass-strong relative z-10 my-4 w-full rounded-3xl p-0 animate-scale-in',
          maxWidth
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 dark:border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="btn-ghost -mr-2 -mt-1 h-9 w-9 !px-0" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ---- Toast ------------------------------------------------------------------
export function Toast({ toast }) {
  if (!toast) return null;
  const tones = {
    success: 'text-emerald-700 dark:text-emerald-300',
    info: 'text-accent-700 dark:text-accent-300',
    error: 'text-rose-700 dark:text-rose-300',
  };
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-slide-up">
      <div className="glass-strong flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-glass-lg">
        <span className={classNames('h-2 w-2 rounded-full bg-current', tones[toast.kind] || tones.success)} />
        <span className={tones[toast.kind] || tones.success}>{toast.message}</span>
      </div>
    </div>
  );
}

// ---- Empty state ------------------------------------------------------------
export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-400">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</div>
      {description && <div className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</div>}
    </div>
  );
}

// ---- Segmented control ------------------------------------------------------
export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-slate-500/10 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={classNames(
            'rounded-lg px-3.5 py-1.5 text-sm font-medium transition',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
