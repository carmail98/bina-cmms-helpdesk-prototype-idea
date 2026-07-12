# Developer Handoff — Bina Cloud CMMS · Helpdesk Prototype

This is a **clickable, front-end-only prototype** of the Helpdesk module for Bina Cloud
CMMS (FMM-aligned facility management). It exists to validate the *end-to-end flow and UX*
— **create aduan → assign → resolve → report** — before real development. There is **no
backend**; all data is hardcoded/in-memory and resets on refresh.

- **Live demo:** https://bina-cmms-helpdesk-prototype-idea.vercel.app
- **Repo:** https://github.com/carmail98/bina-cmms-helpdesk-prototype-idea
- **Pilot context for dummy data:** KTPC — 16 buildings, hospital/institutional facility.

---

## 1. Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev        # start dev server (Vite) — open the printed localhost URL
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

## 2. Tech stack

| Concern       | Choice                                  |
|---------------|-----------------------------------------|
| Framework     | React 18 + Vite 5                        |
| Styling       | Tailwind CSS 3 (glassmorphic + dark mode)|
| Charts        | Recharts 2                              |
| Icons         | lucide-react                            |
| State         | React Context (`src/context/AppContext`)|
| Deploy        | Vercel (auto-deploy on push to `main`)  |

No routing library — the app is a single shell with in-component view state. If you add
more modules, consider introducing `react-router`.

## 3. Project structure

```
src/
├── App.jsx                    # app shell: sidebar + main area
├── main.jsx                   # React entry
├── index.css                  # Tailwind + glass/utility styles
├── components/                # SHARED, module-agnostic UI
│   ├── Sidebar.jsx            #   16-module nav (only Helpdesk active)
│   ├── Topbar.jsx             #   header, search, theme toggle
│   └── ui.jsx                 #   primitives: Badge, Modal, StatCard, Toast, Segmented…
├── context/
│   └── AppContext.jsx         # global state: tickets, comments, theme, toast
├── data/                      # MOCK DATA LAYER (replace with API — see §5)
│   ├── mockData.js            #   categories, buildings, technicians, assets, tickets
│   └── modules.js             #   sidebar module list
├── features/
│   └── helpdesk/              # THE HELPDESK FEATURE MODULE (self-contained)
│       ├── HelpdeskModule.jsx #   container: Inbox / Reports / Detail switching
│       ├── TicketList.jsx     #   inbox table + filters + stat cards
│       ├── CreateTicketModal.jsx  # create aduan (cascading category→asset)
│       ├── TicketDetail.jsx   #   timeline, SLA, assign, status, comments
│       └── Reports.jsx        #   4 reports + drill-down + mock export
└── lib/
    └── utils.js               # date/duration formatting, SLA computation, CSV helpers
```

### Guided demo tour (added feature)
A self-contained, client-only walkthrough (23 steps: inbox → create → assign → resolve →
read all 4 reports), each with an *Apa ini / Kenapa* explanation. Files:
`context/TourContext.jsx` (state machine + imperative control registered by HelpdeskModule),
`features/helpdesk/tourSteps.js` (the script), `components/TourOverlay.jsx` (spotlight +
glass card), `components/WelcomeBanner.jsx` (first-run banner, `localStorage` flag). Targets
are anchored via stable `data-tour="..."` attributes (not CSS classes). The tour auto-performs
actions and drives a deterministic demo ticket (`AppContext.createDemoTicket` /
`advanceDemoTicket`, id `demo-hvac-ktpc`) so every run tells the same story. Start it from the
**"Mula Panduan"** button in the topbar.

**Modularity:** Helpdesk lives entirely under `src/features/helpdesk/`. To add another
CMMS module (Asset Management, Work Order, etc.), create a sibling `src/features/<module>/`,
add it to `src/data/modules.js` with `active: true`, and render it from `App.jsx`. No
refactor of Helpdesk needed.

## 4. Domain model (see `src/data/mockData.js`)

- **Categories** — FIXED master list (not free text): Electrical, Plumbing, HVAC/Aircond,
  Lift & Escalator, Cleanliness, Fire Safety, Civil/Structural, Landscaping, Security
  System, Others.
- **Ticket** — `{ id, refNo, title, categoryId, categoryName, assetId, assetName,
  assetFreeText, building, description, status, priority, reportedBy, assignedTo,
  createdAt, assignedAt, resolvedAt, closedAt, slaHours, slaBreached }`.
- **Status lifecycle:** New → Assigned → In Progress → Resolved → Closed.
- **Priority → SLA target (hours):** Low 72 · Medium 24 · High 8 · Critical 4
  (see `SLA_HOURS`).

### Important business rules already implemented
- **Snapshot on create:** `categoryName` and `assetName` are copied onto the ticket at
  creation. Editing the asset master later must **not** change historical tickets.
- **Cascading Category → Asset:** selecting a category filters the asset dropdown to that
  category + building. `Others`, or "asset not in list", falls back to free text
  (`assetFreeText`) and is **not** linked to the asset master — surfaced in the
  "Semakan Others" report for admin review.
- **SLA:** computed in `lib/utils.js#computeSla`. Compliance in reports is measured over
  *completed* tickets; still-open overdue tickets are flagged separately ("at risk").

## 5. Turning this into a real product (backend integration points)

The mock layer is deliberately isolated so it can be swapped for a real API with minimal UI
changes:

1. **Replace `src/data/mockData.js`** reads with API calls. The UI consumes data through
   `AppContext` (`tickets`, `addTicket`, `updateTicket`, `comments`, `addComment`) — point
   these at your endpoints (REST/GraphQL) instead of in-memory state.
2. **Persistence:** `addTicket` / `updateTicket` / `addComment` currently mutate React
   state. Wire them to `POST/PATCH` calls and refetch or optimistically update.
3. **Reference data** (categories, buildings, technicians, assets) → serve from DB; keep
   categories as a controlled master list.
4. **Auth:** none yet — add login + role-based access (admin / technician / requester).
5. **Real export:** report "Export" buttons currently download a client-side CSV / show a
   toast. Replace with server-generated exports if needed.
6. **Ref numbers, SLA timers, timeline/audit log** should move server-side for integrity.

## 6. Out of scope in this prototype
No authentication, no backend/DB/API, no real export, and the other 15 CMMS modules are
sidebar labels only ("Coming soon"). This is a flow/UX demo — **not** production code.

---
_Questions on intent or the KTPC pilot context: refer back to the original build brief
(`helpdeskprototypeprompt.md`)._
