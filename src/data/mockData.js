// ============================================================================
// Bina Cloud CMMS — Helpdesk Prototype
// Mock data layer (in-memory, hardcoded). No backend, no database.
// Pilot context: KTPC — 16 buildings, hospital/institutional facility (Malaysia)
// ============================================================================

// Fixed "now" so the prototype's charts & SLA math stay stable across refreshes.
export const NOW = new Date('2026-07-11T09:00:00');

// ---------------------------------------------------------------------------
// Category master list (FIXED — bukan free text)
// ---------------------------------------------------------------------------
export const CATEGORIES = [
  { id: 'electrical', name: 'Electrical', color: '#f59e0b' },
  { id: 'plumbing', name: 'Plumbing', color: '#3b82f6' },
  { id: 'hvac', name: 'HVAC / Aircond', color: '#06b6d4' },
  { id: 'lift', name: 'Lift & Escalator', color: '#8b5cf6' },
  { id: 'cleanliness', name: 'Cleanliness', color: '#10b981' },
  { id: 'fire', name: 'Fire Safety', color: '#ef4444' },
  { id: 'civil', name: 'Civil / Structural', color: '#a16207' },
  { id: 'landscaping', name: 'Landscaping', color: '#65a30d' },
  { id: 'security', name: 'Security System', color: '#6366f1' },
  { id: 'others', name: 'Others', color: '#64748b' },
];

export const categoryById = (id) => CATEGORIES.find((c) => c.id === id);

// ---------------------------------------------------------------------------
// Buildings (16) — institutional / hospital naming ala KTPC
// ---------------------------------------------------------------------------
export const BUILDINGS = [
  'Blok A – Wad Pesakit',
  'Blok B – Pentadbiran',
  'Blok C – Klinik Pakar',
  'Blok D – Kecemasan & Trauma',
  'Blok E – Makmal & Diagnostik',
  'Blok F – Farmasi',
  'Blok G – Dewan Bedah',
  'Blok H – Wad Bersalin',
  'Blok J – Pediatrik',
  'Blok K – Rehabilitasi',
  'Blok L – Kafeteria & Servis',
  'Blok M – Stor Pusat',
  'Blok N – Kuarters Staf',
  'Blok P – Auditorium & Latihan',
  'Blok Q – Loji Utiliti',
  'Blok R – Mortuari & Patologi',
];

// ---------------------------------------------------------------------------
// Technicians
// ---------------------------------------------------------------------------
export const TECHNICIANS = [
  { id: 't1', name: 'Ahmad Faizal', trade: 'Electrical' },
  { id: 't2', name: 'Nurul Izzati', trade: 'HVAC' },
  { id: 't3', name: 'Raj Kumar', trade: 'Plumbing' },
  { id: 't4', name: 'Lim Wei Sheng', trade: 'Mechanical / Lift' },
  { id: 't5', name: 'Mohd Hafiz', trade: 'General / Civil' },
  { id: 't6', name: 'Sarah Tan', trade: 'Fire & Safety' },
];

export const technicianById = (id) => TECHNICIANS.find((t) => t.id === id);

const REPORTERS = [
  'Jabatan Kejururawatan',
  'Unit Farmasi',
  'Pentadbiran Am',
  'Unit Kecemasan',
  'Makmal Patologi',
  'Kaunter Pesakit Luar',
  'Unit Rehabilitasi',
  'Staf Kuarters',
  'Kafeteria',
  'Keselamatan',
];

// ---------------------------------------------------------------------------
// Assets (~18) across categories & buildings — for cascading dropdown
// ---------------------------------------------------------------------------
export const ASSETS = [
  { id: 'a01', name: 'Papan Suis Utama (MSB)', categoryId: 'electrical', building: 'Blok Q – Loji Utiliti', location: 'Aras Bawah', code: 'ELE-MSB-Q01' },
  { id: 'a02', name: 'Genset Standby 500kVA', categoryId: 'electrical', building: 'Blok Q – Loji Utiliti', location: 'Bilik Genset', code: 'ELE-GEN-Q02' },
  { id: 'a03', name: 'Panel DB Wad 3A', categoryId: 'electrical', building: 'Blok A – Wad Pesakit', location: 'Aras 3', code: 'ELE-DB-A31' },
  { id: 'a04', name: 'Pam Air Domestik #1', categoryId: 'plumbing', building: 'Blok Q – Loji Utiliti', location: 'Bilik Pam', code: 'PLB-PMP-Q11' },
  { id: 'a05', name: 'Tangki Air Bumbung', categoryId: 'plumbing', building: 'Blok A – Wad Pesakit', location: 'Bumbung', code: 'PLB-TNK-A99' },
  { id: 'a06', name: 'Sistem Paip Wad Bersalin', categoryId: 'plumbing', building: 'Blok H – Wad Bersalin', location: 'Aras 2', code: 'PLB-PIP-H21' },
  { id: 'a07', name: 'Chiller Unit #1 (350RT)', categoryId: 'hvac', building: 'Blok Q – Loji Utiliti', location: 'Bilik Chiller', code: 'HVC-CHL-Q31' },
  { id: 'a08', name: 'AHU Dewan Bedah', categoryId: 'hvac', building: 'Blok G – Dewan Bedah', location: 'Aras 1', code: 'HVC-AHU-G11' },
  { id: 'a09', name: 'FCU Klinik Pakar', categoryId: 'hvac', building: 'Blok C – Klinik Pakar', location: 'Aras 2', code: 'HVC-FCU-C21' },
  { id: 'a10', name: 'Lif Pesakit #2', categoryId: 'lift', building: 'Blok A – Wad Pesakit', location: 'Lobi Utama', code: 'LFT-PAX-A02' },
  { id: 'a11', name: 'Lif Servis Bekalan', categoryId: 'lift', building: 'Blok M – Stor Pusat', location: 'Lobi Servis', code: 'LFT-SRV-M01' },
  { id: 'a12', name: 'Sistem Penggera Kebakaran', categoryId: 'fire', building: 'Blok B – Pentadbiran', location: 'Bilik Kawalan', code: 'FIR-FAP-B01' },
  { id: 'a13', name: 'Pam Bomba (Fire Pump)', categoryId: 'fire', building: 'Blok Q – Loji Utiliti', location: 'Bilik Pam Bomba', code: 'FIR-PMP-Q41' },
  { id: 'a14', name: 'CCTV Lobi Kecemasan', categoryId: 'security', building: 'Blok D – Kecemasan & Trauma', location: 'Lobi', code: 'SEC-CCT-D01' },
  { id: 'a15', name: 'Sistem Access Door Farmasi', categoryId: 'security', building: 'Blok F – Farmasi', location: 'Pintu Masuk', code: 'SEC-ACS-F01' },
  { id: 'a16', name: 'Struktur Siling Koridor', categoryId: 'civil', building: 'Blok C – Klinik Pakar', location: 'Koridor Aras 1', code: 'CIV-CEL-C11' },
  { id: 'a17', name: 'Kawasan Landskap Pintu Utama', categoryId: 'landscaping', building: 'Blok B – Pentadbiran', location: 'Kawasan Luar', code: 'LND-GRD-B01' },
  { id: 'a18', name: 'Sistem Pembersihan Longkang', categoryId: 'cleanliness', building: 'Blok L – Kafeteria & Servis', location: 'Kawasan Servis', code: 'CLN-DRN-L01' },
];

export const assetsByCategory = (categoryId, building) =>
  ASSETS.filter(
    (a) => a.categoryId === categoryId && (!building || a.building === building)
  );

// ---------------------------------------------------------------------------
// Status & Priority
// ---------------------------------------------------------------------------
export const STATUSES = ['New', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// Deterministic ticket used by the guided demo tour (fixed narrative: HVAC, Blok G).
export const DEMO_TICKET_ID = 'demo-hvac-ktpc';

// SLA target (hours) by priority
export const SLA_HOURS = { Low: 72, Medium: 24, High: 8, Critical: 4 };

// ---------------------------------------------------------------------------
// Seeded PRNG (deterministic dummy data)
// ---------------------------------------------------------------------------
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}
const rng = makeRng(20260711);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const pickWeighted = (pairs) => {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let r = rng() * total;
  for (const [val, w] of pairs) {
    if ((r -= w) <= 0) return val;
  }
  return pairs[pairs.length - 1][0];
};
const randInt = (min, max) => min + Math.floor(rng() * (max - min + 1));

// Title templates per category
const TITLE_TEMPLATES = {
  electrical: ['Lampu tidak menyala di koridor', 'Litar pintas / trip berulang', 'Soket kuasa rosak', 'Genset gagal auto-start', 'Voltan tidak stabil'],
  plumbing: ['Paip bocor di siling', 'Tandas tersumbat', 'Pam air tidak berfungsi', 'Tekanan air rendah', 'Sinki bocor'],
  hvac: ['Aircond tidak sejuk', 'Chiller bunyi bising', 'FCU bocor air', 'Suhu bilik terlalu panas', 'AHU trip'],
  lift: ['Lif tersekat antara aras', 'Pintu lif tidak tutup', 'Butang lif tidak berfungsi', 'Lif bunyi bising'],
  cleanliness: ['Longkang tersumbat berbau', 'Sampah tidak dikutip', 'Tumpahan di lantai koridor'],
  fire: ['Penggera kebakaran palsu berbunyi', 'Alat pemadam tamat tempoh', 'Pam bomba perlu diperiksa', 'Pintu kecemasan tersekat'],
  civil: ['Siling retak / mengelupas', 'Lantai berlubang', 'Dinding lembap & berkulat', 'Bumbung bocor waktu hujan'],
  landscaping: ['Rumput perlu dipotong', 'Pokok tumbang halang laluan', 'Sistem siraman rosak'],
  security: ['CCTV tidak merakam', 'Access door tidak berfungsi', 'Palang keselamatan rosak'],
  others: ['Permohonan pindah perabot', 'Papan tanda tercabut', 'Cadangan penambahbaikan ruang', 'Kerosakan tidak dikategorikan', 'Jam dinding rosak'],
};

const OTHERS_FREETEXT = [
  'Rak simpanan di stor bergegar — minta pemeriksaan',
  'Bau kurang menyenangkan dari bilik utiliti',
  'Papan tanda arah pudar, perlu ganti',
  'Kerusi menunggu patah di lobi',
  'Permintaan tambah titik kuasa untuk peralatan baharu',
  'Tingkap tidak boleh dikunci sepenuhnya',
  'Pili air minuman tidak berfungsi',
  'Cadangan pasang cermin di simpang koridor',
];

// Category distribution weight (Electrical & Plumbing heavy; ~12% Others)
const CATEGORY_WEIGHTS = [
  ['electrical', 22],
  ['plumbing', 20],
  ['hvac', 14],
  ['lift', 8],
  ['cleanliness', 7],
  ['fire', 6],
  ['civil', 6],
  ['landscaping', 4],
  ['security', 6],
  ['others', 12],
];

const PRIORITY_WEIGHTS = [
  ['Low', 20],
  ['Medium', 42],
  ['High', 28],
  ['Critical', 10],
];

function addHours(date, h) {
  return new Date(date.getTime() + h * 3600 * 1000);
}

// ---------------------------------------------------------------------------
// Generate tickets (deterministic)
// ---------------------------------------------------------------------------
function generateTickets(count) {
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const categoryId = pickWeighted(CATEGORY_WEIGHTS);
    const priority = pickWeighted(PRIORITY_WEIGHTS);
    const slaHours = SLA_HOURS[priority];

    // choose a building — prefer a building that has an asset for this category
    let building;
    let assetId = null;
    let assetFreeText = '';
    let assetName = '';

    if (categoryId === 'others') {
      building = pick(BUILDINGS);
      assetFreeText = pick(OTHERS_FREETEXT);
      assetName = assetFreeText;
    } else {
      const candidates = ASSETS.filter((a) => a.categoryId === categoryId);
      if (candidates.length && rng() > 0.25) {
        const asset = pick(candidates);
        assetId = asset.id;
        assetName = asset.name;
        building = asset.building;
      } else {
        // asset not in list → free text but still real category
        building = pick(BUILDINGS);
        assetFreeText = 'Aset tidak dalam senarai — ' + pick(TITLE_TEMPLATES[categoryId]);
        assetName = assetFreeText;
      }
    }

    // created between 1 and 118 days ago (spread ~4 months)
    const daysAgo = randInt(1, 118);
    const createdAt = addHours(NOW, -(daysAgo * 24 + randInt(0, 23)));

    // status: older tickets more likely closed; recent ones more likely open
    let status;
    if (daysAgo > 30) {
      status = pickWeighted([['Closed', 78], ['Resolved', 12], ['In Progress', 6], ['Assigned', 3], ['New', 1]]);
    } else if (daysAgo > 10) {
      status = pickWeighted([['Closed', 42], ['Resolved', 20], ['In Progress', 22], ['Assigned', 12], ['New', 4]]);
    } else {
      status = pickWeighted([['New', 26], ['Assigned', 24], ['In Progress', 30], ['Resolved', 12], ['Closed', 8]]);
    }

    const statusIndex = STATUSES.indexOf(status);

    // timestamps derived from status
    let assignedAt = null;
    let resolvedAt = null;
    let closedAt = null;
    let assignedTo = null;

    if (statusIndex >= 1) {
      assignedAt = addHours(createdAt, randInt(1, Math.max(2, Math.floor(slaHours * 0.6))));
      assignedTo = pick(TECHNICIANS).id;
    }
    if (statusIndex >= 3) {
      // resolution time: sometimes within SLA, sometimes breached
      const breachRoll = rng();
      const factor = breachRoll < 0.82 ? 0.35 + rng() * 0.5 : 1.1 + rng() * 1.3;
      const resolveHours = Math.max(1, Math.round(slaHours * factor));
      resolvedAt = addHours(createdAt, resolveHours);
    }
    if (statusIndex >= 4) {
      closedAt = addHours(resolvedAt, randInt(2, 48));
    }

    // SLA breach: if resolved -> compare resolution vs sla; if open -> compare elapsed vs sla
    let slaBreached;
    if (resolvedAt) {
      slaBreached = (resolvedAt - createdAt) / 3600000 > slaHours;
    } else {
      slaBreached = (NOW - createdAt) / 3600000 > slaHours;
    }

    const title = pick(TITLE_TEMPLATES[categoryId]);
    const refNo = 'HD-2026-' + String(1000 + i).slice(1);

    tickets.push({
      id: 'tk' + (i + 1),
      refNo: 'HD-2026-' + String(142 + i).padStart(4, '0'),
      title,
      categoryId, // SNAPSHOT at creation
      categoryName: categoryById(categoryId).name, // snapshot label
      assetId,
      assetName, // snapshot of asset name at creation
      assetFreeText,
      building,
      description: buildDescription(categoryId, title, assetName, building),
      status,
      priority,
      reportedBy: pick(REPORTERS),
      assignedTo,
      createdAt: createdAt.toISOString(),
      assignedAt: assignedAt ? assignedAt.toISOString() : null,
      resolvedAt: resolvedAt ? resolvedAt.toISOString() : null,
      closedAt: closedAt ? closedAt.toISOString() : null,
      slaHours,
      slaBreached,
    });
  }
  // sort newest first
  tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return tickets;
}

function buildDescription(categoryId, title, assetName, building) {
  const loc = building.split('–')[1]?.trim() || building;
  const templates = [
    `${title}. Dilaporkan di ${loc}. Mohon pihak penyelenggaraan periksa dan ambil tindakan segera.`,
    `Aduan berkaitan ${assetName || title.toLowerCase()} di ${building}. Keadaan mengganggu operasi harian.`,
    `${title} — sudah beberapa hari. Perlu pemeriksaan dan pembaikan. Terima kasih.`,
  ];
  return pick(templates);
}

// Generate 56 tickets
export const INITIAL_TICKETS = generateTickets(56);

// Helper: build activity timeline from ticket timestamps
export function buildTimeline(ticket) {
  const events = [];
  events.push({ type: 'created', label: 'Aduan dicipta', at: ticket.createdAt, by: ticket.reportedBy });
  if (ticket.assignedAt) {
    const tech = technicianById(ticket.assignedTo);
    events.push({ type: 'assigned', label: `Ditugaskan kepada ${tech ? tech.name : '—'}`, at: ticket.assignedAt, by: 'Helpdesk Admin' });
  }
  if (ticket.status === 'In Progress' || ticket.resolvedAt) {
    // approximate "in progress" start right after assignment
    if (ticket.assignedAt) {
      const startAt = new Date(new Date(ticket.assignedAt).getTime() + 3600 * 1000).toISOString();
      events.push({ type: 'progress', label: 'Kerja pembaikan dimulakan', at: startAt, by: technicianById(ticket.assignedTo)?.name || 'Teknisian' });
    }
  }
  if (ticket.resolvedAt) {
    events.push({ type: 'resolved', label: 'Ditanda sebagai selesai (Resolved)', at: ticket.resolvedAt, by: technicianById(ticket.assignedTo)?.name || 'Teknisian' });
  }
  if (ticket.closedAt) {
    events.push({ type: 'closed', label: 'Aduan ditutup (Closed)', at: ticket.closedAt, by: 'Helpdesk Admin' });
  }
  return events;
}
