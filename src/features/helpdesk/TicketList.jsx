import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, BUILDINGS, STATUSES, categoryById } from '../../data/mockData';
import { StatusBadge, PriorityPill, CategoryChip, StatCard, EmptyState, GlassCard } from '../../components/ui';
import { fmtDate, computeSla, classNames } from '../../lib/utils';
import { Inbox, Plus, Filter, X, AlertTriangle, CheckCircle2, Clock, Ticket as TicketIcon } from 'lucide-react';

export default function TicketList({ search, onOpenTicket, onNewTicket }) {
  const { tickets } = useApp();
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    return tickets.filter((t) => {
      if (status && t.status !== status) return false;
      if (category && t.categoryId !== category) return false;
      if (building && t.building !== building) return false;
      if (fromDate && new Date(t.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(t.createdAt) > new Date(toDate + 'T23:59:59')) return false;
      if (q) {
        const hay = `${t.refNo} ${t.title} ${t.categoryName} ${t.building} ${t.assetName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, status, category, building, fromDate, toDate, search]);

  // stats over ALL tickets (not filtered) for a stable overview
  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status !== 'Closed' && t.status !== 'Resolved').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
    const breached = tickets.filter((t) => computeSla(t).state === 'breached').length;
    return { total: tickets.length, open, resolved, breached };
  }, [tickets]);

  const activeFilterCount = [status, category, building, fromDate, toDate].filter(Boolean).length;

  function clearFilters() {
    setStatus('');
    setCategory('');
    setBuilding('');
    setFromDate('');
    setToDate('');
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Jumlah Aduan" value={stats.total} icon={TicketIcon} tone="accent" sub="Keseluruhan rekod" />
        <StatCard label="Aktif / Terbuka" value={stats.open} icon={Clock} tone="amber" sub="Belum selesai" />
        <StatCard label="Selesai" value={stats.resolved} icon={CheckCircle2} tone="emerald" sub="Resolved + Closed" />
        <StatCard label="SLA Terlewat" value={stats.breached} icon={AlertTriangle} tone="rose" sub="Melebihi sasaran SLA" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className={classNames('btn-soft', activeFilterCount && 'ring-2 ring-accent-400/40')}
            onClick={() => setShowFilters((s) => !s)}
          >
            <Filter className="h-4 w-4" />
            Penapis
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-accent-600 px-1.5 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button className="btn-ghost text-xs" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" /> Kosongkan
            </button>
          )}
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} daripada {tickets.length} aduan
          </span>
        </div>
        <button className="btn-primary" onClick={onNewTicket}>
          <Plus className="h-4 w-4" />
          Aduan Baru
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <GlassCard className="animate-slide-up p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Semua status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Semua kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bangunan</label>
              <select className="input" value={building} onChange={(e) => setBuilding(e.target.value)}>
                <option value="">Semua bangunan</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Dari tarikh</label>
              <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Hingga tarikh</label>
              <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Table */}
      <div className="surface overflow-hidden rounded-2xl">
        {filtered.length === 0 ? (
          <EmptyState icon={Inbox} title="Tiada aduan sepadan" description="Cuba ubah penapis atau kata carian." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-white/10 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Ref No</th>
                  <th className="px-5 py-3">Tajuk</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3">Bangunan</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Ditugaskan</th>
                  <th className="px-5 py-3 whitespace-nowrap">Tarikh</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const cat = categoryById(t.categoryId);
                  const sla = computeSla(t);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onOpenTicket(t.id)}
                      className="group cursor-pointer border-b border-slate-100 last:border-0 transition hover:bg-accent-500/5 dark:border-white/5"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          {t.refNo}
                          {sla.state === 'breached' && (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" title="SLA terlewat" />
                          )}
                        </div>
                      </td>
                      <td className="max-w-[240px] px-5 py-3.5">
                        <div className="truncate font-medium text-slate-800 dark:text-slate-100">{t.title}</div>
                        <div className="truncate text-xs text-slate-400">{t.assetName || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <CategoryChip name={t.categoryName} color={cat?.color} />
                      </td>
                      <td className="max-w-[150px] truncate px-5 py-3.5 text-slate-600 dark:text-slate-300">{t.building}</td>
                      <td className="px-5 py-3.5"><PriorityPill priority={t.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {t.assignedTo ? assignedName(t.assignedTo) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500 dark:text-slate-400">{fmtDate(t.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { technicianById } from '../../data/mockData';
function assignedName(id) {
  return technicianById(id)?.name || '—';
}
