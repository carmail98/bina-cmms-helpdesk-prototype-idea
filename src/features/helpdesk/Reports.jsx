import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, BUILDINGS, STATUSES, categoryById } from '../../data/mockData';
import { GlassCard, StatusBadge, CategoryChip, EmptyState, Segmented } from '../../components/ui';
import { fmtDate, fmtDuration, computeSla, resolutionHours, toCsv, downloadTextFile, classNames } from '../../lib/utils';
import { Download, ChevronRight, ListFilter, MessageCircleQuestion } from 'lucide-react';

const STATUS_COLORS = {
  New: '#94a3b8',
  Assigned: '#38bdf8',
  'In Progress': '#f59e0b',
  Resolved: '#10b981',
  Closed: '#64748b',
};

export default function Reports({ onOpenTicket }) {
  const { tickets, showToast } = useApp();
  const [report, setReport] = useState('category');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const scoped = useMemo(() => {
    return tickets.filter((t) => {
      if (fromDate && new Date(t.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(t.createdAt) > new Date(toDate + 'T23:59:59')) return false;
      return true;
    });
  }, [tickets, fromDate, toDate]);

  function exportCsv(rows, name) {
    downloadTextFile(name, toCsv(rows));
    showToast('Exported — ' + name, 'info');
  }

  const reports = [
    { value: 'category', label: 'Kategori' },
    { value: 'statusBuilding', label: 'Status × Bangunan' },
    { value: 'sla', label: 'SLA / Resolution' },
    { value: 'others', label: 'Semakan “Others”' },
  ];

  return (
    <div className="space-y-6">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented options={reports} value={report} onChange={setReport} />
        <div className="flex flex-wrap items-center gap-2">
          <input type="date" className="input w-auto" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span className="text-slate-400">—</span>
          <input type="date" className="input w-auto" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          {(fromDate || toDate) && (
            <button
              className="btn-ghost text-xs"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-slate-500 dark:text-slate-400">
        {scoped.length} aduan dalam julat tarikh dipilih
      </div>

      {report === 'category' && <ReportCategory scoped={scoped} onExport={exportCsv} onOpenTicket={onOpenTicket} />}
      {report === 'statusBuilding' && <ReportStatusBuilding scoped={scoped} onExport={exportCsv} />}
      {report === 'sla' && <ReportSla scoped={scoped} onExport={exportCsv} />}
      {report === 'others' && <ReportOthers scoped={scoped} onExport={exportCsv} onOpenTicket={onOpenTicket} />}
    </div>
  );
}

function ExportBtn({ onClick }) {
  return (
    <button className="btn-soft text-xs" onClick={onClick}>
      <Download className="h-3.5 w-3.5" /> Export
    </button>
  );
}

// ---------------------------------------------------------------------------
// a) Aduan by Kategori — chart + table + drill-down
// ---------------------------------------------------------------------------
function ReportCategory({ scoped, onExport, onOpenTicket }) {
  const [mode, setMode] = useState('bar');
  const [drill, setDrill] = useState(null); // categoryId

  const rows = useMemo(() => {
    return CATEGORIES.map((c) => {
      const list = scoped.filter((t) => t.categoryId === c.id);
      const resolved = list.map(resolutionHours).filter((h) => h != null);
      const avg = resolved.length ? resolved.reduce((a, b) => a + b, 0) / resolved.length : null;
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        count: list.length,
        pct: scoped.length ? (list.length / scoped.length) * 100 : 0,
        avgResolution: avg,
      };
    })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [scoped]);

  const drillList = useMemo(
    () => (drill ? scoped.filter((t) => t.categoryId === drill) : []),
    [drill, scoped]
  );

  if (!scoped.length) return <GlassCard className="p-6"><EmptyState icon={ListFilter} title="Tiada data" /></GlassCard>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        <GlassCard className="p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Aduan Mengikut Kategori</h3>
            <Segmented
              options={[{ value: 'bar', label: 'Bar' }, { value: 'pie', label: 'Pai' }]}
              value={mode}
              onChange={setMode}
            />
          </div>
          <div className="surface rounded-xl p-3">
            <ResponsiveContainer width="100%" height={320}>
              {mode === 'bar' ? (
                <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={70} interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} onClick={(d) => setDrill(d.id)} cursor="pointer">
                    {rows.map((r) => (
                      <Cell key={r.id} fill={r.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={rows}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={110}
                    paddingAngle={2}
                    onClick={(d) => setDrill(d.id)}
                    cursor="pointer"
                  >
                    {rows.map((r) => (
                      <Cell key={r.id} fill={r.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-400">Klik pada kategori untuk drill-down ke senarai aduan.</p>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ringkasan</h3>
            <ExportBtn
              onClick={() =>
                onExport(
                  [['Kategori', 'Jumlah', '%', 'Purata Resolution (jam)'], ...rows.map((r) => [r.name, r.count, r.pct.toFixed(1), r.avgResolution ? r.avgResolution.toFixed(1) : '-'])],
                  'aduan-by-kategori.csv'
                )
              }
            />
          </div>
          <div className="surface overflow-hidden rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2.5">Kategori</th>
                  <th className="px-3 py-2.5 text-right">Jml</th>
                  <th className="px-3 py-2.5 text-right">%</th>
                  <th className="px-3 py-2.5 text-right">Avg</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDrill(r.id)}
                    className={classNames(
                      'cursor-pointer border-b border-slate-100 last:border-0 hover:bg-accent-500/5 dark:border-white/5',
                      drill === r.id && 'bg-accent-500/10'
                    )}
                  >
                    <td className="px-3 py-2.5"><CategoryChip name={r.name} color={r.color} /></td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-700 dark:text-slate-200">{r.count}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{r.pct.toFixed(0)}%</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{r.avgResolution ? fmtDuration(r.avgResolution) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* drill-down */}
      {drill && (
        <GlassCard className="animate-slide-up p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Drill-down: <CategoryChip name={categoryById(drill)?.name} color={categoryById(drill)?.color} />
              <span className="text-slate-400">({drillList.length})</span>
            </h3>
            <button className="btn-ghost text-xs" onClick={() => setDrill(null)}>Tutup</button>
          </div>
          <DrillTable list={drillList} onOpenTicket={onOpenTicket} />
        </GlassCard>
      )}
    </div>
  );
}

function DrillTable({ list, onOpenTicket }) {
  if (!list.length) return <EmptyState icon={ListFilter} title="Tiada aduan" />;
  return (
    <div className="surface overflow-x-auto rounded-xl">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 dark:border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2.5">Ref No</th>
            <th className="px-4 py-2.5">Tajuk</th>
            <th className="px-4 py-2.5">Bangunan</th>
            <th className="px-4 py-2.5">Status</th>
            <th className="px-4 py-2.5">Tarikh</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr
              key={t.id}
              onClick={() => onOpenTicket(t.id)}
              className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-accent-500/5 dark:border-white/5"
            >
              <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200">{t.refNo}</td>
              <td className="max-w-[240px] truncate px-4 py-2.5 text-slate-700 dark:text-slate-200">{t.title}</td>
              <td className="max-w-[150px] truncate px-4 py-2.5 text-slate-500">{t.building}</td>
              <td className="px-4 py-2.5"><StatusBadge status={t.status} /></td>
              <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{fmtDate(t.createdAt)}</td>
              <td className="px-4 py-2.5 text-right"><ChevronRight className="h-4 w-4 text-slate-400" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// b) Aduan by Status & Bangunan — stacked bar / matrix
// ---------------------------------------------------------------------------
function ReportStatusBuilding({ scoped, onExport }) {
  const data = useMemo(() => {
    return BUILDINGS.map((b) => {
      const row = { building: b.replace(/^Blok /, '').slice(0, 16), full: b, total: 0 };
      STATUSES.forEach((s) => (row[s] = 0));
      scoped
        .filter((t) => t.building === b)
        .forEach((t) => {
          row[t.status] = (row[t.status] || 0) + 1;
          row.total += 1;
        });
      return row;
    })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [scoped]);

  if (!scoped.length) return <GlassCard className="p-6"><EmptyState icon={ListFilter} title="Tiada data" /></GlassCard>;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <GlassCard className="p-6 lg:col-span-3">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Aduan Mengikut Bangunan & Status</h3>
        <div className="surface rounded-xl p-3">
          <ResponsiveContainer width="100%" height={Math.max(340, data.length * 34)}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis type="category" dataKey="building" tick={{ fontSize: 11, fill: '#94a3b8' }} width={110} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {STATUSES.map((s, i) => (
                <Bar
                  key={s}
                  dataKey={s}
                  stackId="a"
                  fill={STATUS_COLORS[s]}
                  radius={i === STATUSES.length - 1 ? [0, 5, 5, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Matriks</h3>
          <ExportBtn
            onClick={() =>
              onExport(
                [['Bangunan', ...STATUSES, 'Jumlah'], ...data.map((r) => [r.full, ...STATUSES.map((s) => r[s]), r.total])],
                'aduan-status-bangunan.csv'
              )
            }
          />
        </div>
        <div className="surface overflow-x-auto rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/70 dark:border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2.5">Bangunan</th>
                {STATUSES.map((s) => (
                  <th key={s} className="px-2 py-2.5 text-center" title={s}>{s.slice(0, 3)}</th>
                ))}
                <th className="px-2 py-2.5 text-right">Jml</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.full} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                  <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300" title={r.full}>{r.building}</td>
                  {STATUSES.map((s) => (
                    <td key={s} className="px-2 py-2.5 text-center text-slate-500">
                      {r[s] || <span className="text-slate-300 dark:text-slate-700">·</span>}
                    </td>
                  ))}
                  <td className="px-2 py-2.5 text-right font-medium text-slate-700 dark:text-slate-200">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// c) SLA / Resolution Time
// ---------------------------------------------------------------------------
function ReportSla({ scoped, onExport }) {
  const { inTime, breached, atRisk, donut, perCat } = useMemo(() => {
    // SLA compliance is measured over COMPLETED tickets (resolved/closed).
    let inTime = 0;
    let breached = 0;
    let atRisk = 0; // still-open tickets already past SLA (operational alert)
    scoped.forEach((t) => {
      const completed = t.status === 'Resolved' || t.status === 'Closed';
      const s = computeSla(t);
      if (completed) {
        if (s.state === 'breached') breached += 1;
        else inTime += 1;
      } else if (s.state === 'breached') {
        atRisk += 1;
      }
    });
    const donut = [
      { name: 'Dalam SLA', value: inTime, color: '#10b981' },
      { name: 'Terlewat', value: breached, color: '#ef4444' },
    ];
    const perCat = CATEGORIES.map((c) => {
      const list = scoped.filter((t) => t.categoryId === c.id);
      const res = list.map(resolutionHours).filter((h) => h != null);
      const avg = res.length ? res.reduce((a, b) => a + b, 0) / res.length : 0;
      const br = list.filter((t) => computeSla(t).state === 'breached').length;
      return { name: c.name, color: c.color, avg, count: list.length, breached: br };
    })
      .filter((r) => r.count > 0)
      .sort((a, b) => b.avg - a.avg);
    return { inTime, breached, atRisk, donut, perCat };
  }, [scoped]);

  const total = inTime + breached;
  const pctIn = total ? Math.round((inTime / total) * 100) : 0;

  if (!scoped.length) return <GlassCard className="p-6"><EmptyState icon={ListFilter} title="Tiada data" /></GlassCard>;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <GlassCard className="p-6 lg:col-span-2">
        <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Pematuhan SLA</h3>
        <div className="surface rounded-xl p-3">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={donut} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} paddingAngle={3}>
                {donut.map((d) => (
                  <Cell key={d.name} fill={d.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 text-center">
          <div>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{pctIn}%</div>
            <div className="text-xs text-slate-400">dalam SLA</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-rose-600 dark:text-rose-400">{breached}</div>
            <div className="text-xs text-slate-400">selesai lewat</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{atRisk}</div>
            <div className="text-xs text-slate-400">terbuka &amp; lewat</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          Pematuhan dikira ke atas aduan yang telah selesai (Resolved / Closed).
        </p>
      </GlassCard>

      <GlassCard className="p-6 lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Purata Masa Penyelesaian / Kategori</h3>
          <ExportBtn
            onClick={() =>
              onExport(
                [['Kategori', 'Bil', 'Purata Resolution (jam)', 'SLA Terlewat'], ...perCat.map((r) => [r.name, r.count, r.avg.toFixed(1), r.breached])],
                'sla-resolution.csv'
              )
            }
          />
        </div>
        <div className="surface rounded-xl p-3">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={perCat} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={70} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="j" />
              <Tooltip content={<ChartTip unit="jam" />} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {perCat.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// d) Semakan "Others" — free-text review
// ---------------------------------------------------------------------------
function ReportOthers({ scoped, onExport, onOpenTicket }) {
  const list = useMemo(
    () => scoped.filter((t) => t.categoryId === 'others' || (!t.assetId && t.assetFreeText)),
    [scoped]
  );

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-500/10 text-slate-500">
            <MessageCircleQuestion className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Semakan “Others” &amp; Aset Bebas ({list.length})
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Senarai aduan berkategori Others atau aset taip-bebas. Admin boleh kenal pasti isu berulang untuk dijadikan
              kategori / aset baharu dalam master list.
            </p>
          </div>
          <ExportBtn
            onClick={() =>
              onExport(
                [['Ref No', 'Tajuk', 'Aset (free-text)', 'Bangunan', 'Status', 'Tarikh'], ...list.map((t) => [t.refNo, t.title, t.assetName, t.building, t.status, fmtDate(t.createdAt)])],
                'semakan-others.csv'
              )
            }
          />
        </div>
      </GlassCard>

      <div className="surface overflow-hidden rounded-2xl">
        {list.length === 0 ? (
          <EmptyState icon={MessageCircleQuestion} title="Tiada aduan Others" description="Tiada aduan free-text dalam julat ini." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200/70 dark:border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Ref No</th>
                  <th className="px-5 py-3">Tajuk</th>
                  <th className="px-5 py-3">Butiran (free-text)</th>
                  <th className="px-5 py-3">Bangunan</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Tarikh</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => onOpenTicket(t.id)}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-accent-500/5 dark:border-white/5"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-200">{t.refNo}</td>
                    <td className="max-w-[200px] truncate px-5 py-3.5 text-slate-700 dark:text-slate-200">{t.title}</td>
                    <td className="max-w-[240px] truncate px-5 py-3.5 text-slate-500">{t.assetName || '—'}</td>
                    <td className="max-w-[150px] truncate px-5 py-3.5 text-slate-500">{t.building}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={t.status} /></td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{fmtDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
function ChartTip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-glass-lg">
      {label && <div className="mb-1 font-medium text-slate-700 dark:text-slate-200">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color || p.payload?.color }} />
          {p.name}: <span className="font-medium">{unit ? fmtDuration(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
