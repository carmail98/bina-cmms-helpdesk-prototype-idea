import { DEMO_TICKET_ID } from '../../data/mockData';

// Prefill fed into the Create modal during the tour so the cascading
// Category -> Asset is populated with a real, deterministic example.
const DEMO_PREFILL = {
  categoryId: 'hvac',
  building: 'Blok G – Dewan Bedah',
  assetChoice: 'a08', // AHU Dewan Bedah
  title: 'Aircond tidak sejuk di Dewan Bedah',
  description:
    'Suhu Dewan Bedah meningkat, aircond tidak sejuk. Mohon pemeriksaan segera untuk elak gangguan operasi pembedahan.',
  priority: 'High',
};

// Each step: { target (data-tour key | null for centered), placement, title, apa, kenapa, onEnter }
export const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Selamat datang ke Helpdesk 👋',
    apa: 'Ini modul Helpdesk — pusat merekod semua aduan & kerosakan fasiliti.',
    kenapa:
      'Kita akan lalui SATU aduan dari mula sampai jadi report untuk management — supaya kamu faham bukan sahaja cara guna, tapi kenapa setiap langkah penting.',
    onEnter: (c, app) => {
      app.resetDemo();
      c.closeCreate?.();
      c.closeTicket?.();
      c.setView?.('inbox');
    },
  },
  {
    id: 'sidebar',
    target: 'sidebar',
    placement: 'right',
    title: 'Sidebar — 16 modul',
    apa: 'Bina CMMS ada 16 modul. Buat demo ini, Helpdesk yang aktif; yang lain "Coming soon".',
    kenapa:
      'Helpdesk ialah pintu masuk aduan sebelum ia mengalir ke modul lain (Work Order, Asset, dsb.).',
    onEnter: (c) => {
      c.closeCreate?.();
      c.closeTicket?.();
      c.setView?.('inbox');
    },
  },
  {
    id: 'inbox',
    target: 'inbox-table',
    placement: 'top',
    title: 'Inbox / Senarai Aduan',
    apa: 'Semua aduan tersenarai di sini — RefNo, kategori, bangunan, status, priority.',
    kenapa:
      'Ini "single source of truth". Management boleh nampak keseluruhan beban kerja sekali pandang.',
  },
  {
    id: 'stats',
    target: 'stat-cards',
    placement: 'bottom',
    title: 'Kad Ringkasan',
    apa: 'Ringkasan angka di atas inbox: jumlah, aktif, selesai, SLA terlewat.',
    kenapa: 'Bagi gambaran kesihatan operasi segera tanpa perlu kira manual.',
  },
  {
    id: 'filter',
    target: 'filter-toolbar',
    placement: 'bottom',
    title: 'Penapis & Carian',
    apa: 'Tapis ikut status / kategori / bangunan / tarikh, atau cari terus.',
    kenapa:
      'Bila aduan banyak, ini cara fokus pada yang penting — contoh semua "Critical" yang belum selesai.',
  },
  {
    id: 'new-btn',
    target: 'new-aduan-btn',
    placement: 'left',
    title: 'Butang "+ Aduan Baru"',
    apa: 'Titik masuk untuk merekod aduan baharu.',
    kenapa:
      'Setiap kerosakan yang dilaporkan kena masuk sistem di sini supaya ia dijejak & akhirnya muncul dalam report. Jom cipta satu.',
  },
  {
    id: 'field-kategori',
    target: 'field-kategori',
    placement: 'right',
    title: 'Pilih Kategori',
    apa: 'Senarai tetap (Electrical, Plumbing, HVAC…). Untuk contoh ni kita pilih HVAC / Aircond.',
    kenapa:
      'Kategori TETAP (bukan taip bebas) supaya report boleh dikumpul dengan tepat. Kalau setiap orang taip sendiri, data jadi berterabur & report tak berguna.',
    onEnter: (c) => c.openCreate?.(DEMO_PREFILL),
  },
  {
    id: 'field-bangunan',
    target: 'field-bangunan',
    placement: 'left',
    title: 'Pilih Bangunan',
    apa: 'Lokasi aduan — contoh: Blok G – Dewan Bedah.',
    kenapa:
      'Membolehkan report "aduan mengikut bangunan" — kenal pasti blok yang paling banyak masalah.',
    onEnter: (c) => c.openCreate?.(DEMO_PREFILL),
  },
  {
    id: 'field-aset',
    target: 'field-aset',
    placement: 'right',
    title: 'Dropdown Aset (cascading)',
    apa: 'Selepas pilih kategori + bangunan, senarai aset auto-tapis kepada aset berkaitan sahaja — di sini "AHU Dewan Bedah".',
    kenapa:
      'Mengaitkan aduan kepada aset SEBENAR membolehkan sejarah penyelenggaraan setiap aset (cth "Chiller #1 dah 5 kali rosak bulan ni" → isyarat untuk ganti / PPM).',
    onEnter: (c) => c.openCreate?.(DEMO_PREFILL),
  },
  {
    id: 'field-others',
    target: 'field-aset',
    placement: 'right',
    title: 'Pilihan "Others / taip bebas"',
    apa: 'Dalam dropdown aset ada pilihan "Lain-lain / taip bebas" — bila aset tiada dalam senarai atau isu tak berkategori.',
    kenapa:
      'Escape hatch supaya aduan tetap boleh direkod — tapi ia direkod sebagai teks sahaja & akan disemak kemudian (lihat report "Semakan Others").',
    onEnter: (c) => c.openCreate?.(DEMO_PREFILL),
  },
  {
    id: 'field-priority',
    target: 'field-priority',
    placement: 'top',
    title: 'Priority & SLA',
    apa: 'Low / Medium / High / Critical — setiap satu ada sasaran masa (SLA). Contoh ni High (8 jam).',
    kenapa:
      'Menetapkan "tempoh sepatutnya selesai". Sistem guna ini untuk kira sama ada aduan lewat atau ikut masa.',
    onEnter: (c) => c.openCreate?.(DEMO_PREFILL),
  },
  {
    id: 'submit',
    target: 'demo-ticket-row',
    placement: 'bottom',
    title: 'Hantar Aduan',
    apa: 'Aduan disimpan dan terus muncul di inbox dengan status New (baris diserlahkan).',
    kenapa:
      'Aduan kini wujud & dijejak. Semua tindakan seterusnya akan direkod pada aduan ini.',
    onEnter: (c, app) => {
      c.closeCreate?.();
      app.createDemoTicket();
      c.closeTicket?.();
      c.setView?.('inbox');
    },
  },
  {
    id: 'open-detail',
    target: 'ticket-detail',
    placement: 'top',
    title: 'Buka Ticket Detail',
    apa: 'Klik aduan untuk lihat butiran penuh + garis masa (timeline).',
    kenapa: 'Di sinilah kerja sebenar diuruskan — tugas, status, nota.',
    onEnter: (c) => c.openTicket?.(DEMO_TICKET_ID),
  },
  {
    id: 'timeline',
    target: 'tour-timeline',
    placement: 'right',
    title: 'Timeline / Log Aktiviti',
    apa: 'Rekod setiap peristiwa (dicipta → ditugaskan → …).',
    kenapa: 'Jejak audit — siapa buat apa & bila. Penting untuk akauntabiliti & pematuhan FMM.',
    onEnter: (c) => c.openTicket?.(DEMO_TICKET_ID),
  },
  {
    id: 'assign',
    target: 'tour-assign',
    placement: 'left',
    title: 'Assign kepada Teknisian',
    apa: 'Tetapkan siapa bertanggungjawab — di sini Nurul Izzati (HVAC). Status bertukar ke Assigned.',
    kenapa: 'Tanpa penugasan, tiada siapa akauntabel. Timeline pun terus dikemas kini.',
    onEnter: (c, app) => {
      c.openTicket?.(DEMO_TICKET_ID);
      app.advanceDemoTicket('assign');
    },
  },
  {
    id: 'status',
    target: 'tour-status',
    placement: 'left',
    title: 'Tukar Status: In Progress → Resolved',
    apa: 'Gerakkan aduan melalui kitaran hidupnya sehingga selesai (Resolved), dan akhirnya Closed bila disahkan.',
    kenapa:
      'Setiap peralihan merekod masa — inilah data yang jadi metrik "purata masa penyelesaian" dalam report.',
    onEnter: (c, app) => {
      c.openTicket?.(DEMO_TICKET_ID);
      app.advanceDemoTicket('progress');
      app.advanceDemoTicket('resolve');
    },
  },
  {
    id: 'sla',
    target: 'tour-sla',
    placement: 'left',
    title: 'Penunjuk SLA',
    apa: 'Masa berbaki / sudah lewat. Aduan ni selesai dalam masa → "Dalam SLA".',
    kenapa: 'Amaran visual supaya pasukan utamakan aduan yang hampir / sudah langgar SLA.',
    onEnter: (c) => c.openTicket?.(DEMO_TICKET_ID),
  },
  {
    id: 'go-reports',
    target: 'reports-tabs',
    placement: 'bottom',
    title: 'Pergi ke Reports',
    apa: 'Beralih dari operasi harian → pandangan analitik.',
    kenapa: 'Di sini semua aduan tadi bertukar jadi insight untuk management.',
    onEnter: (c) => {
      c.closeTicket?.();
      c.setView?.('reports');
      c.setReportTab?.('category');
    },
  },
  {
    id: 'report-category',
    target: 'reports-panel',
    placement: 'top',
    title: 'Report A — Aduan Mengikut Kategori',
    apa: 'Bar/pai + jadual jumlah, %, purata masa selesai.',
    kenapa:
      'CARA BACA: bar tertinggi = jenis aduan paling kerap. Cth "Electrical" tinggi → boleh tambah teknisian elektrik / buat penyelenggaraan pencegahan. Klik satu bar → drill-down ke senarai aduan sebenar.',
    onEnter: (c) => {
      c.setView?.('reports');
      c.setReportTab?.('category');
    },
  },
  {
    id: 'report-status-building',
    target: 'reports-panel',
    placement: 'top',
    title: 'Report B — Status × Bangunan',
    apa: 'Stacked bar / matriks bangunan lawan status.',
    kenapa:
      'CARA BACA: nampak bangunan mana ada paling banyak aduan belum selesai (backlog). Blok dengan banyak "In Progress / New" = perlu perhatian sumber.',
    onEnter: (c) => {
      c.setView?.('reports');
      c.setReportTab?.('statusBuilding');
    },
  },
  {
    id: 'report-sla',
    target: 'reports-panel',
    placement: 'top',
    title: 'Report C — SLA / Resolution',
    apa: 'Donut % dalam-SLA vs terlewat + purata masa penyelesaian per kategori.',
    kenapa:
      'CARA BACA: % hijau besar = prestasi baik. "Selesai lewat" & "terbuka & lewat" = isu yang jejaskan SLA. Kategori dengan purata masa tinggi = proses lambat, perlu disiasat.',
    onEnter: (c) => {
      c.setView?.('reports');
      c.setReportTab?.('sla');
    },
  },
  {
    id: 'report-others',
    target: 'reports-panel',
    placement: 'top',
    title: 'Report D — Semakan "Others"',
    apa: 'Senarai aduan berkategori Others / aset taip-bebas.',
    kenapa:
      'CARA BACA: kalau benda sama berulang di sini (cth ramai lapor "lif rosak" tapi lif tak berdaftar), itu isyarat untuk tambah aset/kategori baharu ke master list. Gelung maklum balas untuk perbaiki data.',
    onEnter: (c) => {
      c.setView?.('reports');
      c.setReportTab?.('others');
    },
  },
  {
    id: 'export',
    target: 'report-export',
    placement: 'left',
    title: 'Butang Export',
    apa: 'Muat turun report (CSV).',
    kenapa: 'Management selalu perlu bawa report ke mesyuarat atau simpan untuk audit FMM.',
    onEnter: (c) => {
      c.setView?.('reports');
      c.setReportTab?.('others');
    },
  },
  {
    id: 'done',
    target: null,
    title: 'Tamat — kamu dah nampak keseluruhan flow 🎉',
    apa: 'Satu aduan telah mengalir dari dicipta → ditugaskan → diselesaikan → menjadi insight report.',
    kenapa:
      'Itulah nilai Helpdesk: setiap aduan bukan sekadar direkod, tapi jadi data yang membantu keputusan management. Cuba sendiri sekarang — atau ulang panduan bila-bila dari butang di topbar.',
  },
];
