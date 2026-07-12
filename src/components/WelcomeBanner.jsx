import { Sparkles, X } from 'lucide-react';
import { useTour } from '../context/TourContext';

export default function WelcomeBanner() {
  const { seen, run, start, dismissWelcome } = useTour();
  if (seen || run) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] animate-fade-in" onClick={dismissWelcome} />
      <div className="glass-strong relative z-10 w-full max-w-md overflow-hidden rounded-3xl p-0 animate-scale-in">
        <div className="flex items-start gap-4 p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-600 text-white shadow-sm shadow-accent-600/40">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              Selamat datang ke Helpdesk
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Kali pertama di sini? Ambil <span className="font-medium">panduan berpandu 2 minit</span> — kita lalui satu
              aduan dari <em>dicipta → assign → selesai → report</em>, dengan penerangan <em>apa</em> &amp;{' '}
              <em>kenapa</em> setiap langkah.
            </p>
          </div>
          <button onClick={dismissWelcome} className="btn-ghost -mr-2 -mt-1 h-8 w-8 !px-0 text-slate-400" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-white/10 px-6 py-4">
          <button onClick={dismissWelcome} className="btn-soft">
            Nanti dulu
          </button>
          <button onClick={start} className="btn-primary">
            <Sparkles className="h-4 w-4" /> Mula Panduan
          </button>
        </div>
      </div>
    </div>
  );
}
