import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from './AppContext';
import { TOUR_STEPS } from '../features/helpdesk/tourSteps';

const TourContext = createContext(null);

const SEEN_KEY = 'bina_helpdesk_tour_seen_v1';

function readSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}
function writeSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function TourProvider({ children }) {
  const app = useApp();
  const appRef = useRef(app);
  appRef.current = app;

  const steps = TOUR_STEPS;
  const [run, setRun] = useState(false);
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(readSeen);

  // Control object registered by HelpdeskModule (imperative app navigation).
  const controlRef = useRef({});
  const registerControl = useCallback((c) => {
    controlRef.current = { ...controlRef.current, ...c };
  }, []);

  const runStep = useCallback(
    (i) => {
      const step = steps[i];
      if (step && typeof step.onEnter === 'function') {
        try {
          step.onEnter(controlRef.current, appRef.current);
        } catch (e) {
          // never let a step action crash the tour
          // eslint-disable-next-line no-console
          console.warn('[tour] onEnter error at step', i, e);
        }
      }
    },
    [steps]
  );

  const goTo = useCallback(
    (i) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, i));
      runStep(clamped);
      setIndex(clamped);
    },
    [runStep, steps.length]
  );

  const start = useCallback(() => {
    setRun(true);
    runStep(0);
    setIndex(0);
  }, [runStep]);

  const stop = useCallback(() => {
    setRun(false);
    writeSeen();
    setSeen(true);
  }, []);

  const next = useCallback(() => {
    if (index >= steps.length - 1) {
      stop();
    } else {
      goTo(index + 1);
    }
  }, [index, steps.length, goTo, stop]);

  const prev = useCallback(() => {
    if (index > 0) goTo(index - 1);
  }, [index, goTo]);

  const dismissWelcome = useCallback(() => {
    writeSeen();
    setSeen(true);
  }, []);

  // keyboard: Esc closes, arrows navigate
  useEffect(() => {
    if (!run) return;
    const onKey = (e) => {
      if (e.key === 'Escape') stop();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, stop, next, prev]);

  const value = {
    run,
    index,
    steps,
    step: steps[index],
    total: steps.length,
    seen,
    start,
    stop,
    next,
    prev,
    goTo,
    registerControl,
    dismissWelcome,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}
