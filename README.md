# Bina Cloud CMMS — Helpdesk Module (Interactive Prototype)

Clickable prototype of the **Helpdesk** module for Bina Cloud CMMS (FMM-aligned facility
management). Built to let the team & management see **one complete end-to-end flow** —
*create aduan → assign → resolve → report* — before committing to real development.

> Pilot context: **KTPC** — 16 buildings, hospital/institutional facility (Malaysia).
> **No backend, no database.** All data is hardcoded/in-memory and resets on refresh.

## Features

- **App shell** with all 16 CMMS modules in the sidebar — only **Helpdesk** is active,
  the rest show a *Coming soon* badge (disabled).
- **Helpdesk — Inbox / List:** full ticket table with filters (status, category, building,
  date range, search), colour-coded status badges, SLA breach markers.
- **Create Aduan:** cascading **Category → Asset** dropdown (asset auto-filters by category
  + building). *Others* / asset-not-in-list falls back to free text. Category & asset name
  are **snapshotted** onto the ticket at creation.
- **Ticket Detail:** full info, activity **timeline**, **SLA** meter (remaining / breached),
  assign to technician, change status, add notes.
- **Reports (4):**
  1. Aduan by Kategori — bar/pie + table (count, %, avg resolution) with **drill-down**.
  2. Aduan by Status & Bangunan — stacked bar + matrix.
  3. SLA / Resolution Time — % in-SLA vs breached + avg resolution per category.
  4. Semakan "Others" — free-text review list for admin.
  Each report has a date-range filter + **Export** (mock CSV download + toast).

## Design

Glassmorphic + minimalist, Apple-inspired. Frosted-glass chrome (sidebar, cards, modals)
over a soft gradient; solid high-contrast surfaces for data tables & charts to keep it
management-presentable. Light **and** dark mode.

## Tech stack

React + Vite + Tailwind CSS · Recharts (charts) · lucide-react (icons). State via React
Context. Modular structure — Helpdesk lives in `src/features/helpdesk/` so new modules can
be added without a big refactor.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Build for production with `npm run build`.

## Project structure

```
src/
  components/      # shared UI primitives, Sidebar, Topbar
  context/         # AppContext (tickets, theme, toast)
  data/            # mock data (categories, buildings, assets, tickets), module list
  features/
    helpdesk/      # Helpdesk feature module (List, Create, Detail, Reports)
  lib/             # formatting & SLA helpers
```

---
Prototaip untuk demo flow sahaja — bukan production.
