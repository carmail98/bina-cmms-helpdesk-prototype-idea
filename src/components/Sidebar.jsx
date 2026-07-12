import { MODULES } from '../data/modules';
import { classNames } from '../lib/utils';
import { Cloud, X } from 'lucide-react';

export default function Sidebar({ current, onNavigate, mobileOpen, onCloseMobile }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col p-3 transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="glass flex h-full flex-col rounded-3xl p-3" data-tour="sidebar">
          {/* Brand */}
          <div className="flex items-center justify-between px-2 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-sm shadow-accent-600/40">
                <Cloud className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Bina Cloud</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">CMMS · KTPC</div>
              </div>
            </div>
            <button className="btn-ghost h-8 w-8 !px-0 lg:hidden" onClick={onCloseMobile} aria-label="Tutup menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="mt-2 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isCurrent = current === m.id && m.active;
              return (
                <button
                  key={m.id}
                  disabled={!m.active}
                  onClick={() => m.active && onNavigate(m.id)}
                  className={classNames(
                    'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isCurrent
                      ? 'bg-accent-600 text-white shadow-sm shadow-accent-600/30'
                      : m.active
                      ? 'text-slate-700 hover:bg-slate-500/10 dark:text-slate-200'
                      : 'cursor-not-allowed text-slate-400 dark:text-slate-600'
                  )}
                >
                  <Icon className={classNames('h-[18px] w-[18px] shrink-0', isCurrent ? 'text-white' : '')} />
                  <span className="flex-1 truncate text-left">{m.label}</span>
                  {!m.active && (
                    <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                      Coming soon
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-2 rounded-2xl bg-slate-500/5 px-3 py-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">Prototaip Interaktif</span>
            <br />
            Dummy data · tiada backend. Untuk demo flow Helpdesk.
          </div>
        </div>
      </aside>
    </>
  );
}
