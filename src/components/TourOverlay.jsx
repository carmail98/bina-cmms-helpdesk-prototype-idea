import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, RotateCcw, Sparkles, HelpCircle } from 'lucide-react';
import { useTour } from '../context/TourContext';
import { classNames } from '../lib/utils';

const PAD = 8; // spotlight padding around target
const GAP = 14; // gap between target and card
const CARD_W = 360;

export default function TourOverlay() {
  const { run, index, step, total, next, prev, stop, goTo } = useTour();
  const [rect, setRect] = useState(null); // target rect or null (centered)
  const [pos, setPos] = useState(null); // card position {left, top}
  const elRef = useRef(null);
  const cardRef = useRef(null);
  const isSmall = typeof window !== 'undefined' && window.innerWidth < 680;

  // ---- locate & measure the target for the current step --------------------
  const measure = useCallback((el) => {
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    if (!run || !step) return;
    elRef.current = null;
    if (!step.target) {
      setRect(null);
      return;
    }
    let cancelled = false;
    let tries = 0;
    const find = () => {
      if (cancelled) return;
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        elRef.current = el;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const fullyVisible = r.top >= 0 && r.bottom <= vh;
        const tall = r.height >= vh * 0.85;
        if (fullyVisible) {
          measure(el); // already in view — don't scroll (avoids centering tall panels)
        } else {
          try {
            el.scrollIntoView({ block: tall ? 'start' : 'center', inline: 'center', behavior: 'smooth' });
          } catch {
            /* ignore */
          }
          setTimeout(() => {
            if (!cancelled && elRef.current) measure(elRef.current);
          }, 280);
        }
      } else if (tries++ < 15) {
        setTimeout(find, 90);
      } else {
        // target never appeared → skip this step gracefully
        if (!cancelled) next();
      }
    };
    find();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, index]);

  // keep the spotlight glued to the target on scroll / resize
  useEffect(() => {
    if (!run) return;
    const onMove = () => {
      if (elRef.current) measure(elRef.current);
    };
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [run, measure]);

  // ---- position the card relative to the target ----------------------------
  useLayoutEffect(() => {
    if (!run) return;
    const cardEl = cardRef.current;
    const cardH = cardEl ? cardEl.offsetHeight : 260;
    const cardW = cardEl ? Math.min(cardEl.offsetWidth || CARD_W, CARD_W) : CARD_W;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (isSmall || !rect) {
      // centered / bottom-sheet style
      if (!rect) {
        setPos({ left: (vw - cardW) / 2, top: Math.max(24, (vh - cardH) / 2) });
      } else {
        setPos({ left: (vw - cardW) / 2, top: vh - cardH - 20 });
      }
      return;
    }

    const placement = step?.placement || 'bottom';
    let left;
    let top;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const fits = {
      bottom: rect.top + rect.height + GAP + cardH < vh,
      top: rect.top - GAP - cardH > 0,
      right: rect.left + rect.width + GAP + cardW < vw,
      left: rect.left - GAP - cardW > 0,
    };
    const order = [placement, 'bottom', 'top', 'right', 'left'];
    const chosen = order.find((p) => fits[p]) || 'bottom';

    switch (chosen) {
      case 'top':
        left = cx - cardW / 2;
        top = rect.top - GAP - cardH;
        break;
      case 'right':
        left = rect.left + rect.width + GAP;
        top = cy - cardH / 2;
        break;
      case 'left':
        left = rect.left - GAP - cardW;
        top = cy - cardH / 2;
        break;
      default: // bottom
        left = cx - cardW / 2;
        top = rect.top + rect.height + GAP;
    }
    // clamp into viewport
    left = Math.max(12, Math.min(left, vw - cardW - 12));
    top = Math.max(12, Math.min(top, vh - cardH - 12));
    setPos({ left, top });
  }, [rect, index, run, isSmall, step]);

  if (!run || !step) return null;

  const isLast = index === total - 1;
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* click-blocker so the app can't be touched mid-tour (auto-perform model) */}
      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }} onClick={(e) => e.stopPropagation()} />

      {/* Spotlight hole (only when a target rect exists) */}
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-2xl transition-all duration-300 ease-out"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
            outline: '2px solid rgba(255,255,255,0.55)',
            outlineOffset: '2px',
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(15,23,42,0.55)' }} />
      )}

      {/* Glass explanation card */}
      <div
        ref={cardRef}
        className="glass-strong absolute w-[92vw] max-w-[360px] overflow-hidden rounded-2xl p-0 shadow-glass-lg animate-scale-in"
        style={{ left: pos?.left ?? 0, top: pos?.top ?? 0, pointerEvents: 'auto' }}
      >
        {/* progress bar */}
        <div className="h-1 w-full bg-slate-500/15">
          <div className="h-full bg-accent-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent-600 dark:text-accent-300">
              <Sparkles className="h-3.5 w-3.5" />
              Panduan · Langkah {index + 1} / {total}
            </span>
            <button
              onClick={stop}
              className="btn-ghost -mr-2 -mt-1 h-7 w-7 !px-0 text-slate-400"
              aria-label="Tutup panduan"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{step.title}</h3>

          <div className="mt-3 space-y-3 text-sm">
            {step.apa && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Apa ini</div>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-300">{step.apa}</p>
              </div>
            )}
            {step.kenapa && (
              <div className="rounded-xl bg-accent-500/[0.07] p-3">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-accent-600 dark:text-accent-300">
                  Kenapa
                </div>
                <p className="mt-0.5 leading-relaxed text-slate-600 dark:text-slate-200">{step.kenapa}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button onClick={stop} className="btn-ghost text-xs text-slate-400">
              Langkau
            </button>
            <div className="flex items-center gap-2">
              {isLast ? (
                <>
                  <button onClick={() => goTo(0)} className="btn-soft text-sm">
                    <RotateCcw className="h-4 w-4" /> Ulang
                  </button>
                  <button onClick={stop} className="btn-primary text-sm">
                    Selesai
                  </button>
                </>
              ) : (
                <>
                  <button onClick={prev} disabled={index === 0} className="btn-soft text-sm">
                    <ChevronLeft className="h-4 w-4" /> Kembali
                  </button>
                  <button onClick={next} className="btn-primary text-sm">
                    Seterusnya <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper icon export reused by the welcome banner
export { HelpCircle };
