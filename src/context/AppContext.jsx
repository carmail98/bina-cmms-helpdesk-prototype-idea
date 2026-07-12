import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { INITIAL_TICKETS, categoryById, NOW, DEMO_TICKET_ID } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ---- theme ----------------------------------------------------------------
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [dark]);

  const toggleDark = useCallback(() => setDark((d) => !d), []);

  // ---- tickets (in-memory, resets on refresh) -------------------------------
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  const addTicket = useCallback((draft) => {
    setTickets((prev) => {
      // ref no continues from the highest existing
      const maxNo = prev.reduce((m, t) => {
        const n = parseInt(t.refNo.split('-')[2], 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 141);
      const cat = categoryById(draft.categoryId);
      const now = new Date().toISOString();
      const newTicket = {
        id: 'tk' + (prev.length + 1) + '-' + maxNo,
        refNo: 'HD-2026-' + String(maxNo + 1).padStart(4, '0'),
        title: draft.title,
        categoryId: draft.categoryId,
        categoryName: cat ? cat.name : draft.categoryId, // SNAPSHOT
        assetId: draft.assetId || null,
        assetName: draft.assetName || draft.assetFreeText || '', // SNAPSHOT
        assetFreeText: draft.assetFreeText || '',
        building: draft.building,
        description: draft.description || '',
        status: 'New',
        priority: draft.priority || 'Medium',
        reportedBy: draft.reportedBy || 'Helpdesk (Walk-in)',
        assignedTo: null,
        createdAt: now,
        assignedAt: null,
        resolvedAt: null,
        closedAt: null,
        slaHours: draft.slaHours,
        slaBreached: false,
      };
      return [newTicket, ...prev];
    });
  }, []);

  const updateTicket = useCallback((id, patch) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  // ---- guided demo tour helpers (deterministic ticket lifecycle) -------------
  const DEMO_BASE_MS = NOW.getTime() - 2 * 3600 * 1000; // "created" 2h before NOW

  const resetDemo = useCallback(() => {
    setTickets((prev) => prev.filter((t) => !t.isDemo));
  }, []);

  const createDemoTicket = useCallback(() => {
    setTickets((prev) => {
      const cleaned = prev.filter((t) => !t.isDemo);
      const demo = {
        id: DEMO_TICKET_ID,
        refNo: 'HD-2026-0199',
        title: 'Aircond tidak sejuk di Dewan Bedah',
        categoryId: 'hvac',
        categoryName: 'HVAC / Aircond',
        assetId: 'a08',
        assetName: 'AHU Dewan Bedah',
        assetFreeText: '',
        building: 'Blok G – Dewan Bedah',
        description:
          'Suhu Dewan Bedah meningkat, aircond tidak sejuk. Mohon pemeriksaan segera untuk elak gangguan operasi pembedahan.',
        status: 'New',
        priority: 'High',
        reportedBy: 'Unit Dewan Bedah',
        assignedTo: null,
        createdAt: new Date(DEMO_BASE_MS).toISOString(),
        assignedAt: null,
        resolvedAt: null,
        closedAt: null,
        slaHours: 8,
        slaBreached: false,
        isDemo: true,
      };
      return [demo, ...cleaned];
    });
    return DEMO_TICKET_ID;
  }, [DEMO_BASE_MS]);

  const advanceDemoTicket = useCallback(
    (stage) => {
      const patches = {
        assign: {
          status: 'Assigned',
          assignedTo: 't2', // Nurul Izzati (HVAC)
          assignedAt: new Date(DEMO_BASE_MS + 30 * 60000).toISOString(),
        },
        progress: { status: 'In Progress' },
        resolve: {
          status: 'Resolved',
          resolvedAt: new Date(DEMO_BASE_MS + 3 * 3600 * 1000).toISOString(),
          slaBreached: false,
        },
        close: { status: 'Closed', closedAt: new Date(DEMO_BASE_MS + 4 * 3600 * 1000).toISOString() },
      };
      const patch = patches[stage];
      if (patch) updateTicket(DEMO_TICKET_ID, patch);
    },
    [DEMO_BASE_MS, updateTicket]
  );

  // ---- comments (in-memory) -------------------------------------------------
  const [comments, setComments] = useState({}); // { ticketId: [{text, at, by}] }

  const addComment = useCallback((ticketId, text, by = 'Helpdesk Admin') => {
    setComments((prev) => {
      const list = prev[ticketId] || [];
      return { ...prev, [ticketId]: [...list, { text, at: new Date().toISOString(), by }] };
    });
  }, []);

  // ---- toast ----------------------------------------------------------------
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, kind = 'success') => {
    setToast({ message, kind, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const value = {
    dark,
    toggleDark,
    tickets,
    addTicket,
    updateTicket,
    comments,
    addComment,
    toast,
    showToast,
    // demo tour
    resetDemo,
    createDemoTicket,
    advanceDemoTicket,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
