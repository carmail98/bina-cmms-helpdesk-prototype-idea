import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TECHNICIANS,
  STATUSES,
  categoryById,
  technicianById,
  buildTimeline,
} from '../../data/mockData';
import { StatusBadge, PriorityPill, CategoryChip, SlaBadge, GlassCard } from '../../components/ui';
import { fmtDateTime, fmtDuration, computeSla, resolutionHours, classNames } from '../../lib/utils';
import {
  ArrowLeft,
  MapPin,
  Box,
  User,
  UserPlus,
  MessageSquarePlus,
  CircleDot,
  Clock3,
  CheckCircle2,
  PlayCircle,
  Lock,
  FilePlus2,
  Send,
} from 'lucide-react';

const EVENT_ICON = {
  created: FilePlus2,
  assigned: UserPlus,
  progress: PlayCircle,
  resolved: CheckCircle2,
  closed: Lock,
  comment: MessageSquarePlus,
  status: CircleDot,
};

export default function TicketDetail({ ticketId, onBack }) {
  const { tickets, updateTicket, comments, addComment, showToast } = useApp();
  const ticket = tickets.find((t) => t.id === ticketId);
  const [comment, setComment] = useState('');

  const cat = ticket ? categoryById(ticket.categoryId) : null;
  const sla = ticket ? computeSla(ticket) : null;

  const timeline = useMemo(() => {
    if (!ticket) return [];
    const base = buildTimeline(ticket).map((e) => ({ ...e, kind: e.type }));
    const cs = (comments[ticket.id] || []).map((c) => ({
      type: 'comment',
      kind: 'comment',
      label: c.text,
      at: c.at,
      by: c.by,
    }));
    return [...base, ...cs].sort((a, b) => new Date(a.at) - new Date(b.at));
  }, [ticket, comments]);

  if (!ticket) {
    return (
      <div className="py-20 text-center text-slate-500">
        Aduan tidak dijumpai.
        <div className="mt-3">
          <button className="btn-soft" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
        </div>
      </div>
    );
  }

  const statusIndex = STATUSES.indexOf(ticket.status);

  function nextStatus() {
    const idx = STATUSES.indexOf(ticket.status);
    if (idx < 0 || idx >= STATUSES.length - 1) return;
    const next = STATUSES[idx + 1];
    const now = new Date().toISOString();
    const patch = { status: next };
    if (next === 'Assigned' && !ticket.assignedAt) patch.assignedAt = now;
    if (next === 'Resolved' && !ticket.resolvedAt) {
      patch.resolvedAt = now;
      patch.slaBreached = computeSla({ ...ticket, resolvedAt: now, status: 'Resolved' }).state === 'breached';
    }
    if (next === 'Closed' && !ticket.closedAt) patch.closedAt = now;
    updateTicket(ticket.id, patch);
    showToast(`Status dikemas kini → ${next}`);
  }

  function assignTo(techId) {
    const now = new Date().toISOString();
    const patch = { assignedTo: techId };
    if (!ticket.assignedAt) patch.assignedAt = now;
    if (ticket.status === 'New') patch.status = 'Assigned';
    updateTicket(ticket.id, patch);
    showToast(`Ditugaskan kepada ${technicianById(techId)?.name}`);
  }

  function setStatus(s) {
    const now = new Date().toISOString();
    const patch = { status: s };
    if (s === 'Assigned' && !ticket.assignedAt) patch.assignedAt = now;
    if (s === 'In Progress' && !ticket.assignedAt) patch.assignedAt = now;
    if (s === 'Resolved' && !ticket.resolvedAt) {
      patch.resolvedAt = now;
      patch.slaBreached = computeSla({ ...ticket, resolvedAt: now, status: 'Resolved' }).state === 'breached';
    }
    if (s === 'Closed' && !ticket.closedAt) {
      patch.closedAt = now;
      if (!ticket.resolvedAt) patch.resolvedAt = now;
    }
    updateTicket(ticket.id, patch);
    showToast(`Status ditukar → ${s}`);
  }

  function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    addComment(ticket.id, comment.trim());
    setComment('');
    showToast('Nota ditambah');
  }

  return (
    <div className="space-y-6" data-tour="ticket-detail">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-soft" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Inbox
        </button>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          {sla && <SlaBadge state={sla.state} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: main info + timeline */}
        <div className="space-y-6 lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>{ticket.refNo}</span>
              <span>·</span>
              <span>Dilapor oleh {ticket.reportedBy}</span>
            </div>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              {ticket.title}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
              <CategoryChip name={ticket.categoryName} color={cat?.color} />
              <PriorityPill priority={ticket.priority} />
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> {ticket.building}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Box className="h-3.5 w-3.5" /> {ticket.assetName || '—'}
                {!ticket.assetId && ticket.assetName && (
                  <span className="rounded-full bg-slate-500/10 px-1.5 py-0.5 text-[10px] text-slate-400">free-text</span>
                )}
              </span>
            </div>
            {ticket.description && (
              <p className="mt-4 rounded-xl bg-slate-500/5 p-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {ticket.description}
              </p>
            )}
          </GlassCard>

          {/* Timeline */}
          <GlassCard className="p-6" data-tour="tour-timeline">
            <h3 className="mb-5 text-sm font-semibold text-slate-700 dark:text-slate-200">Log Aktiviti</h3>
            <ol className="relative space-y-5 border-l border-slate-200/70 dark:border-white/10 pl-6">
              {timeline.map((e, i) => {
                const Icon = EVENT_ICON[e.kind] || CircleDot;
                return (
                  <li key={i} className="relative">
                    <span
                      className={classNames(
                        'absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900',
                        e.kind === 'resolved'
                          ? 'bg-emerald-500 text-white'
                          : e.kind === 'closed'
                          ? 'bg-slate-500 text-white'
                          : e.kind === 'comment'
                          ? 'bg-slate-400 text-white'
                          : 'bg-accent-600 text-white'
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.label}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {fmtDateTime(e.at)} · {e.by}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Add comment */}
            <form onSubmit={submitComment} className="mt-6 flex items-center gap-2">
              <input
                className="input"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tambah nota / komen…"
              />
              <button type="submit" className="btn-primary shrink-0" disabled={!comment.trim()}>
                <Send className="h-4 w-4" /> Hantar
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right: actions + SLA */}
        <div className="space-y-6">
          {/* SLA */}
          <GlassCard className="p-6" data-tour="tour-sla">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">SLA</h3>
            <SlaMeter ticket={ticket} sla={sla} />
          </GlassCard>

          {/* Assign */}
          <GlassCard className="p-6" data-tour="tour-assign">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <User className="h-4 w-4" /> Tugasan
            </h3>
            <p className="mb-3 text-xs text-slate-400">
              {ticket.assignedTo ? `Kini: ${technicianById(ticket.assignedTo)?.name}` : 'Belum ditugaskan'}
            </p>
            <label className="label">Tugaskan kepada teknisian</label>
            <select
              className="input"
              value={ticket.assignedTo || ''}
              onChange={(e) => e.target.value && assignTo(e.target.value)}
            >
              <option value="">— Pilih teknisian —</option>
              {TECHNICIANS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} · {t.trade}
                </option>
              ))}
            </select>
          </GlassCard>

          {/* Status actions */}
          <GlassCard className="p-6" data-tour="tour-status">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <Clock3 className="h-4 w-4" /> Tukar Status
            </h3>

            {statusIndex < STATUSES.length - 1 && (
              <button className="btn-primary mb-3 w-full" onClick={nextStatus}>
                Teruskan ke “{STATUSES[statusIndex + 1]}”
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={classNames(
                    'rounded-xl border px-2 py-2 text-xs font-medium transition',
                    ticket.status === s
                      ? 'border-accent-400 bg-accent-500/10 text-accent-700 dark:text-accent-300'
                      : 'border-slate-200/70 text-slate-600 hover:bg-slate-500/5 dark:border-white/10 dark:text-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Meta */}
          <GlassCard className="p-6 text-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Butiran</h3>
            <dl className="space-y-2.5">
              <Meta label="Dicipta" value={fmtDateTime(ticket.createdAt)} />
              <Meta label="Ditugaskan" value={fmtDateTime(ticket.assignedAt)} />
              <Meta label="Selesai (Resolved)" value={fmtDateTime(ticket.resolvedAt)} />
              <Meta label="Ditutup" value={fmtDateTime(ticket.closedAt)} />
              <Meta
                label="Masa penyelesaian"
                value={resolutionHours(ticket) != null ? fmtDuration(resolutionHours(ticket)) : '—'}
              />
            </dl>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-right text-xs font-medium text-slate-600 dark:text-slate-300">{value}</dd>
    </div>
  );
}

function SlaMeter({ ticket, sla }) {
  const closed = ticket.status === 'Resolved' || ticket.status === 'Closed';
  const pctUsed = Math.min(100, Math.max(0, (sla.elapsedHours / sla.slaHours) * 100));
  const barColor =
    sla.state === 'breached' ? 'bg-rose-500' : sla.state === 'due-soon' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {closed
            ? sla.state === 'breached'
              ? 'Terlewat'
              : 'Dalam SLA'
            : sla.remainingHours > 0
            ? fmtDuration(sla.remainingHours)
            : 'Tamat'}
        </div>
        <div className="text-xs text-slate-400">Sasaran {sla.slaHours}j</div>
      </div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {closed ? 'Diselesaikan dalam ' + fmtDuration(sla.elapsedHours) : sla.remainingHours > 0 ? 'masa berbaki' : 'melebihi sasaran'}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-500/15">
        <div className={classNames('h-full rounded-full transition-all', barColor)} style={{ width: `${pctUsed}%` }} />
      </div>
    </div>
  );
}
