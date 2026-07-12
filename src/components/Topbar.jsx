import { Menu, Moon, Sun, Search, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTour } from '../context/TourContext';

export default function Topbar({ title, subtitle, onOpenMobile, actions, search }) {
  const { dark, toggleDark } = useApp();
  const { start: startTour } = useTour();
  return (
    <header className="sticky top-0 z-20 mb-6">
      <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
        <button className="btn-ghost h-9 w-9 !px-0 lg:hidden" onClick={onOpenMobile} aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {title}
          </h1>
          {subtitle && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>

        {search && (
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder || 'Cari…'}
              className="input w-64 pl-9"
            />
          </div>
        )}

        {actions}

        <button
          onClick={startTour}
          data-tour="start-tour"
          className="btn-primary h-9 text-sm"
          title="Mula panduan berpandu"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Mula Panduan</span>
        </button>

        <button className="btn-soft h-9 w-9 !px-0" onClick={toggleDark} aria-label="Tukar tema">
          {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div className="hidden items-center gap-2 rounded-xl bg-slate-500/5 px-2.5 py-1.5 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
            AD
          </div>
          <div className="pr-1 leading-tight">
            <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Admin Helpdesk</div>
            <div className="text-[10px] text-slate-400">KTPC · FMM</div>
          </div>
        </div>
      </div>
    </header>
  );
}
