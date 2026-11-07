'use strict';
/* PLMun Portal — vanilla JS, modular objects (no build step, works from file://) */

/* ===== Utils & constants ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
const mask = n => n.split(' ').map(w => w[0] + '•'.repeat(Math.max(w.length - 1, 2))).join(' ');
const slug = s => String(s).toLowerCase().replace(/[^a-z]+/g, '-');
const badge = s => `<span class="badge s-${slug(s)}">${esc(s)}</span>`;

/* Lucide-style inline icons — keeps the UI dependency-free */
const ICONS = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
  packageCheck: '<path d="m16 16 2 2 4-4"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><path d="M3.29 7 12 12l8.71-5"/><path d="M12 22V12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

const DEFAULT_DOCS = ['Transcript of Records', 'Diploma', 'Certification', 'Certificate of Registration (COR)'];
const FLOW = ['Pending', 'Processing', 'Ready for Pickup', 'Released'];
const PERMS = {
  student: ['request:create', 'request:own'],
  registrar: ['request:meta', 'request:advance'],
  admin: ['registrar:manage']
};
const can = p => !!Auth.user && PERMS[Auth.user.role].includes(p);
const guard = p => can(p) || (toast('That action is not allowed for your role.', true), false);

function toast(msg, isErr) {
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.innerHTML = `<span class="toast-icon">${icon(isErr ? 'alertCircle' : 'checkCircle')}</span><span class="toast-msg"></span>`;
  t.querySelector('.toast-msg').textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3400);
}

/* ===== Store (mock database persisted in localStorage) ===== */
const Store = {
  KEY: 'plmun-portal-v1', db: null,
  init() {
    try { this.db = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.db = null; }
    if (!this.db || !this.db.users) {
      this.db = this.seed(); this.save(); return;
    }
    // Migrate databases created before document types were admin-managed.
    if (!Array.isArray(this.db.docs) || !this.db.docs.length) {
      this.db.docs = [...DEFAULT_DOCS]; this.save();
    }
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.db)); } catch { /* storage blocked */ } },
  seed() {
    const ago = n => new Date(Date.now() - n * 864e5).toISOString();
    return {
      seq: 1005,
      docs: [...DEFAULT_DOCS],
      users: [
        { id: 'u1', role: 'admin', name: 'PLMun Admin', email: 'admin@plmun.edu.ph', pw: 'admin123', status: 'active' },
        { id: 'u2', role: 'registrar', name: 'Maria Santos', email: 'maria.registrar@gmail.com', pw: 'registrar123', status: 'active' },
        { id: 'u3', role: 'student', name: 'Juan Dela Cruz', email: 'student@plmun.edu.ph', pw: 'student123', status: 'active', sno: '2022-00123' },
        { id: 'u4', role: 'student', name: 'Ana Reyes', email: 'ana@plmun.edu.ph', pw: 'student123', status: 'active', sno: '2021-00456' }
      ],
      requests: [
        { id: 'REQ-1001', owner: 'u3', type: 'Certification', purpose: 'Scholarship', copies: 1, status: 'Released', date: ago(14) },
        { id: 'REQ-1002', owner: 'u4', type: 'Transcript of Records', purpose: 'Employment', copies: 2, status: 'Processing', date: ago(5) },
        { id: 'REQ-1003', owner: 'u3', type: 'Certificate of Registration (COR)', purpose: 'Enrollment', copies: 1, status: 'Ready for Pickup', date: ago(3) },
        { id: 'REQ-1004', owner: 'u4', type: 'Diploma', purpose: 'Abroad application', copies: 1, status: 'Pending', date: ago(1) }
      ]
    };
  }
};

/* ===== Auth / session isolation ===== */
const Auth = {
  user: null,
  restore() {
    const id = sessionStorage.getItem('plmun-sid');
    this.user = Store.db.users.find(u => u.id === id && u.status === 'active') || null;
  },
  login(email, pw) {
    const u = Store.db.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase() && x.pw === pw);
    if (!u) return { err: 'Incorrect email or password.' };
    if (u.status === 'invited') return { err: 'Account not activated yet. Open the Gmail invitation first.' };
    if (u.status === 'disabled') return { err: 'This account was disabled by the Admin.' };
    this.user = u; sessionStorage.setItem('plmun-sid', u.id);
    return { ok: true };
  },
  logout() { this.user = null; sessionStorage.removeItem('plmun-sid'); }
};

/* ===== Privacy layer: registrars only ever receive this projection ===== */
const Privacy = {
  registrarView: () => Store.db.requests.map(({ id, type, status, date, pickup }) => ({ id, type, status, date, pickup }))
};

/* ===== Pickup scheduling ===== */
const PICKUP = {
  startMin: 8 * 60,      // 8:00 AM
  endMin: 17 * 60,       // 5:00 PM
  stepMin: 30,           // 30-minute slots
  capacity: 4,           // requests per slot
  daysAhead: 30,         // bookable window
  leadMin: 60            // minimum notice for same-day pickups
};
const pad2 = n => String(n).padStart(2, '0');
const dateKey = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dateFromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const timeLabel = t => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad2(m)} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtPickup = p => `${fmtDate(dateFromKey(p.date))} · ${timeLabel(p.time)}`;

const Cal = {
  today() { return startOfDay(new Date()); },
  todayKey() { return dateKey(this.today()); },
  maxDate() { return addDays(this.today(), PICKUP.daysAhead); },
  minMonth() { const d = this.today(); return new Date(d.getFullYear(), d.getMonth(), 1); },
  maxMonth() { const d = this.maxDate(); return new Date(d.getFullYear(), d.getMonth(), 1); },
  isBookableDate(date) {
    const day = date.getDay();
    return day !== 0 && day !== 6 && date >= this.today() && date <= this.maxDate();
  },
  slotTimes() {
    const out = [];
    for (let m = PICKUP.startMin; m + PICKUP.stepMin <= PICKUP.endMin; m += PICKUP.stepMin) {
      out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
    }
    return out;
  },
  booked(date, time, excludeId) {
    return Store.db.requests.filter(r => r.status === 'Ready for Pickup' && r.pickup &&
      r.pickup.date === date && r.pickup.time === time && r.id !== excludeId).length;
  },
  slots(date, excludeId) {
    const now = new Date(), today = dateKey(now);
    const cutoff = now.getHours() * 60 + now.getMinutes() + PICKUP.leadMin;
    return this.slotTimes().map(time => {
      const [h, m] = time.split(':').map(Number);
      const past = date === today && h * 60 + m < cutoff;
      const left = Math.max(0, PICKUP.capacity - this.booked(date, time, excludeId));
      return { time, label: timeLabel(time), left, past, disabled: past || left === 0 };
    });
  },
  hasOpen(date, excludeId) {
    return this.isBookableDate(dateFromKey(date)) && this.slots(date, excludeId).some(s => !s.disabled);
  },
  monthDays(view) {
    const year = view.getFullYear(), month = view.getMonth();
    const first = new Date(year, month, 1);
    const total = Math.ceil((first.getDay() + new Date(year, month + 1, 0).getDate()) / 7) * 7;
    const start = addDays(first, -first.getDay());
    return Array.from({ length: total }, (_, i) => {
      const date = addDays(start, i);
      if (date.getMonth() !== month) return { key: null };
      return { key: dateKey(date), date };
    });
  }
};

/* ===== Theme ===== */
const Theme = {
  init() {
    let t = null; try { t = localStorage.getItem('plmun-theme'); } catch { /* ignore */ }
    this.set(t || 'dark');
  },
  set(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('plmun-theme', t); } catch { /* ignore */ }
    this.syncFab();
  },
  syncFab() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const fab = $('.fab');
    if (!fab) return;
    fab.innerHTML = `${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Light' : 'Dark'}</span>`;
    fab.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  },
  toggle() { this.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); UI.nav(); }
};

/* ===== Views ===== */
const HEAD = {
  student: ['Student Portal', 'My document requests', 'Request records and follow every step.'],
  registrar: ['Registrar Panel', 'Fulfillment queue', 'Process requests using privacy-safe details only.'],
  admin: ['Admin', 'Admin dashboard', 'Manage registrar accounts and document request types.']
};

const Welcome = r => `<section class="welcome">
  <div>
    <p class="eyebrow">${HEAD[r][0]}</p>
    <h1>${HEAD[r][1]}</h1>
    <p class="page-desc">${HEAD[r][2]}</p>
  </div>
  <img class="welcome-seal" src="logo.png" alt="" aria-hidden="true">
</section>`;

const stat = (l, v, ic = 'fileText') => `<div class="card stat">
  <div class="stat-top"><small>${l}</small><span class="stat-icon">${icon(ic)}</span></div>
  <strong>${v}</strong>
</div>`;

const cardHeader = (title, desc = '') => `<div class="card-header">
  <h2 class="card-title">${title}</h2>
  ${desc ? `<p class="card-desc">${desc}</p>` : ''}
</div>`;

const toolbar = opts => `<div class="toolbar">
  <div class="search"><span class="search-icon">${icon('search')}</span>
    <input type="search" data-search value="${esc(UI.state.q)}" placeholder="Search…" aria-label="Search"></div>
  <select data-filter class="select-filter" aria-label="Filter by status">
    <option value="">All statuses</option>${opts.map(o => `<option value="${o}"${o === UI.state.status ? ' selected' : ''}>${o}</option>`).join('')}
  </select>
</div>`;

const tableShell = (heads, opts) => `${toolbar(opts)}<div class="wrap"><table>
  <thead><tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>
  <tbody id="rows"></tbody></table></div>`;

const pickupCell = r => {
  if (r.status === 'Ready for Pickup') {
    if (!r.pickup) return `<button class="btn btn-primary btn-sm" data-act="schedule" data-id="${esc(r.id)}">${icon('calendar')} Schedule</button>`;
    return `<div class="pickup-cell">
      <span class="pickup-when">${icon('calendar')} ${fmtPickup(r.pickup)}</span>
      <button class="btn btn-ghost btn-sm" data-act="schedule" data-id="${esc(r.id)}">Reschedule</button>
    </div>`;
  }
  return r.pickup ? `<span class="pickup-when muted">${fmtPickup(r.pickup)}</span>` : '<span class="muted">—</span>';
};

const Views = {
  landing() {
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<div class="auth-wrap">
      <aside class="brand-panel"><img class="watermark" src="logo.png" alt="">
        <div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun</b><span>Pamantasan ng Lungsod ng Muntinlupa</span></div></div>
        <div class="brand-copy"><p class="eyebrow">Student &amp; Faculty Portal</p><h1>Document Request <em>System</em></h1>
          <p>Request. Track. Receive. Your records and your privacy, in one clear place.</p>
          <div class="pills"><span>${icon('lock')} Privacy-first</span><span>${icon('fileText')} TOR · Diploma · COR</span><span>${icon('shieldCheck')} Role-based access</span></div></div>
        <small>© 2026 Pamantasan ng Lungsod ng Muntinlupa · All rights reserved</small></aside>
      <div class="form-panel"><button class="btn btn-outline btn-sm fab" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Light' : 'Dark'}</span></button>
        <form class="signin" data-form="login" novalidate>
          <img class="seal" src="logo.png" alt="PLMun seal"><p class="eyebrow">Document Request System</p>
          <h2>Welcome back</h2><p class="signin-desc">Sign in with your PLMun portal account to continue.</p>
          <div class="field"><label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="username" placeholder="name@plmun.edu.ph" required></div>
          <div class="field"><label for="password">Password</label>
            <div class="pw"><input id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" required>
            <button class="btn btn-ghost btn-sm pw-toggle" type="button" data-act="showpw">${icon('eye')}<span>Show</span></button></div></div>
          <p id="loginErr" class="err" role="alert"></p>
          <button class="btn btn-primary btn-lg btn-block" type="submit">Sign in ${icon('arrowRight')}</button>
          <div class="demo"><span class="demo-label">Demo accounts</span>
            <button class="btn btn-outline btn-sm" type="button" data-act="demo" data-role="student">Student</button>
            <button class="btn btn-outline btn-sm" type="button" data-act="demo" data-role="registrar">Registrar</button>
            <button class="btn btn-outline btn-sm" type="button" data-act="demo" data-role="admin">Admin</button></div>
        </form></div></div>`;
  },
  student(u) {
    const mine = Store.db.requests.filter(r => r.owner === u.id), c = s => mine.filter(r => r.status === s).length;
    return `<section class="card alert privacy"><span class="alert-icon">${icon('shieldCheck')}</span>
      <div class="alert-body"><h3 class="alert-title">Your data is protected</h3>
      <p class="alert-desc">Signed in as ${esc(mask(u.name))} · Student No. ${esc('••••-•••' + u.sno.slice(-2))}.
      Registrar staff only see your request ID, document type and status.</p></div></section>
      <div class="stats">${stat('Total requests', mine.length, 'fileText')}${stat('Pending', c('Pending'), 'clock')}
      ${stat('In progress', c('Processing') + c('Ready for Pickup'), 'loader')}${stat('Released', c('Released'), 'checkCircle')}
      ${stat('Pickup scheduled', mine.filter(r => r.pickup && r.status === 'Ready for Pickup').length, 'calendar')}</div>
      <div class="cols">
        <form class="card" data-form="request">
          ${cardHeader('New request', 'Submit a document request to the registrar.')}
          <div class="field"><label for="doc">Document</label><select id="doc" name="doc">${Store.db.docs.map(d => `<option>${esc(d)}</option>`).join('')}</select></div>
          <div class="field"><label for="copies">Copies</label><input id="copies" name="copies" type="number" min="1" max="5" value="1" required></div>
          <div class="field"><label for="purpose">Purpose</label><textarea id="purpose" name="purpose" maxlength="120" placeholder="e.g. Scholarship application" required></textarea></div>
          <button class="btn btn-primary btn-block" type="submit">${icon('send')} Submit request</button></form>
        <section class="card">${cardHeader('My requests', 'Track status and schedule a pickup when your document is ready.')}
          ${tableShell(['Request ID', 'Document', 'Copies', 'Date', 'Status', 'Pickup'], [...FLOW, 'Rejected'])}</section></div>`;
  },
  registrar() {
    const all = Privacy.registrarView(), c = s => all.filter(r => r.status === s).length;
    return `<section class="card alert privacy"><span class="alert-icon">${icon('shieldCheck')}</span>
      <div class="alert-body"><h3 class="alert-title">Restricted processing view</h3>
      <p class="alert-desc">Student names, numbers and purposes are hidden. You only see what is needed to fulfill each request.</p></div></section>
      <div class="stats">${stat('Queue', all.length, 'inbox')}${stat('Pending', c('Pending'), 'clock')}
      ${stat('Processing', c('Processing'), 'loader')}${stat('Ready', c('Ready for Pickup'), 'packageCheck')}</div>
      <section class="card">${cardHeader('Request queue', 'Advance or reject requests as they move through fulfillment.')}
        ${tableShell(['Request ID', 'Document', 'Date', 'Status', 'Pickup', 'Actions'], [...FLOW, 'Rejected'])}</section>`;
  },
  admin() {
    const regs = Store.db.users.filter(u => u.role === 'registrar'), c = s => regs.filter(u => u.status === s).length;
    const docs = Store.db.docs, used = d => Store.db.requests.filter(r => r.type === d).length;
    return `<div class="stats">${stat('Registrars', regs.length, 'users')}${stat('Active', c('active'), 'checkCircle')}
      ${stat('Invited', c('invited'), 'mail')}${stat('Disabled', c('disabled'), 'ban')}
      ${stat('Document types', docs.length, 'fileText')}${stat('Total requests', Store.db.requests.length, 'inbox')}</div>
      <div class="cols">
        <form class="card" data-form="invite">
          ${cardHeader('Invite a registrar', 'Create an account and send a simulated activation email.')}
          <div class="field"><label for="fullname">Full name</label><input id="fullname" name="fullname" placeholder="e.g. Maria Santos" required></div>
          <div class="field"><label for="gmail">Gmail address</label><input id="gmail" name="gmail" type="email" placeholder="name@gmail.com" required></div>
          <button class="btn btn-primary btn-block" type="submit">${icon('userPlus')} Create &amp; send invitation</button>
          <p class="form-hint">An activation email is simulated; no real email is sent.</p></form>
        <section class="card">${cardHeader('Registrar accounts', 'Manage access for registrar staff.')}
          ${tableShell(['Name', 'Email', 'Status', 'Actions'], ['active', 'invited', 'disabled'])}</section></div>
      <section class="card">
        ${cardHeader('Document types', 'Add the forms students can request. New types appear in the request form immediately.')}
        <form class="inline-form" data-form="doctype">
          <div class="field"><label for="doctype">New document type</label>
            <input id="doctype" name="doctype" maxlength="60" placeholder="e.g. Certificate of Good Moral Character" required></div>
          <button class="btn btn-primary" type="submit">${icon('plus')} Add type</button>
        </form>
        <div class="wrap"><table>
          <thead><tr><th scope="col">Document type</th><th scope="col">Requests</th></tr></thead>
          <tbody>${docs.map(d => `<tr><td>${esc(d)}</td><td>${used(d)}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>`;
  },
  rows() {
    const u = Auth.user; if (!u) return '';
    const { q, status } = UI.state, t = q.trim().toLowerCase();
    let list = u.role === 'student' ? Store.db.requests.filter(r => r.owner === u.id)
      : u.role === 'registrar' ? Privacy.registrarView()
      : Store.db.users.filter(x => x.role === 'registrar');
    list = list.filter(r => (!status || r.status === status) &&
      (!t || [r.id, r.type, r.name, r.email].some(v => v && String(v).toLowerCase().includes(t))));
    if (!list.length) {
      const cols = u.role === 'admin' ? 4 : 6;
      return `<tr><td class="empty" colspan="${cols}"><div class="empty-state">
        <span class="empty-icon">${icon('inbox')}</span><span>Nothing matches yet.</span>
        <span class="empty-hint">Try a different search or filter.</span></div></td></tr>`;
    }
    return list.map(r => {
      if (u.role === 'student') return `<tr><td class="mono">${esc(r.id)}</td><td>${esc(r.type)}</td><td>${r.copies}</td><td>${fmtDate(r.date)}</td><td>${badge(r.status)}</td><td>${pickupCell(r)}</td></tr>`;
      if (u.role === 'registrar') {
        const i = FLOW.indexOf(r.status), next = i > -1 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
        return `<tr><td class="mono">${esc(r.id)}</td><td>${esc(r.type)}</td><td>${fmtDate(r.date)}</td><td>${badge(r.status)}</td>
          <td>${r.pickup ? `<span class="pickup-when">${icon('calendar')} ${fmtPickup(r.pickup)}</span>` : '<span class="muted">—</span>'}</td><td>
          ${next ? `<button class="btn btn-primary btn-sm" data-act="advance" data-id="${esc(r.id)}">Mark ${esc(next)}</button>` : ''}
          ${['Pending', 'Processing'].includes(r.status) ? `<button class="btn btn-danger btn-sm" data-act="reject" data-id="${esc(r.id)}">${icon('x')} Reject</button>` : ''}</td></tr>`;
      }
      return `<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${badge(r.status)}</td><td>
        ${r.status === 'invited' ? `<button class="btn btn-outline btn-sm" data-act="invite" data-id="${r.id}">${icon('mail')} View invite</button>` : ''}
        ${r.status === 'active' ? `<button class="btn btn-danger btn-sm" data-act="toggle" data-id="${r.id}">${icon('ban')} Disable</button>` : ''}
        ${r.status === 'disabled' ? `<button class="btn btn-outline btn-sm" data-act="toggle" data-id="${r.id}">${icon('check')} Enable</button>` : ''}</td></tr>`;
    }).join('');
  }
};

/* ===== UI controller ===== */
const UI = {
  state: { q: '', status: '' },
  schedule: null,
  reset() {
    this.state = { q: '', status: '' };
    this.schedule = null;
    $('#mail').open && $('#mail').close();
    $('#sched').open && $('#sched').close();
    this.render();
  },
  render() {
    document.body.classList.toggle('auth', !Auth.user);
    this.nav();
    $('#app').innerHTML = Auth.user ? Welcome(Auth.user.role) + Views[Auth.user.role](Auth.user) : Views.landing();
    this.paintRows();
  },
  paintRows() { const b = $('#rows'); if (b) b.innerHTML = Views.rows(); },
  renderSchedule() {
    const s = this.schedule; if (!s) return;
    const view = s.view, todayK = Cal.todayKey();
    const atMin = view <= Cal.minMonth(), atMax = view >= Cal.maxMonth();
    const days = Cal.monthDays(view).map(c => {
      if (!c.key) return '<span class="cal-day is-empty"></span>';
      const enabled = Cal.isBookableDate(c.date) && Cal.hasOpen(c.key, s.requestId);
      const cls = ['cal-day'];
      if (c.key === s.date) cls.push('is-selected');
      if (c.key === todayK) cls.push('is-today');
      const label = c.date.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      return `<button type="button" class="${cls.join(' ')}" data-act="pickDate" data-date="${c.key}" aria-label="${esc(label)}"${c.key === s.date ? ' aria-pressed="true"' : ''}${enabled ? '' : ' disabled'}>${c.date.getDate()}${enabled ? '<span class="cal-dot"></span>' : ''}</button>`;
    }).join('');

    const slots = s.date ? Cal.slots(s.date, s.requestId) : [];
    const openSlots = slots.filter(x => !x.disabled).length;
    const slotHtml = !s.date
      ? '<p class="slots-hint">Select an available date to see times.</p>'
      : openSlots === 0
        ? '<p class="slots-hint">No times left on this date. Try another day.</p>'
        : `<div class="slot-grid">${slots.map(x => `<button type="button" class="slot${x.time === s.time ? ' is-selected' : ''}" data-act="pickSlot" data-time="${x.time}" aria-pressed="${x.time === s.time}"${x.disabled ? ' disabled' : ''}>
            <span>${x.label}</span><small>${x.left === 0 ? 'Full' : x.past ? 'Unavailable' : `${x.left} left`}</small>
          </button>`).join('')}</div>`;

    $('#schedBody').innerHTML = `<div class="sched">
      <div class="calendar">
        <div class="calendar-head">
          <button type="button" class="btn btn-ghost btn-icon btn-sm" data-act="calPrev" aria-label="Previous month"${atMin ? ' disabled' : ''}>${icon('chevronLeft')}</button>
          <strong>${view.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</strong>
          <button type="button" class="btn btn-ghost btn-icon btn-sm" data-act="calNext" aria-label="Next month"${atMax ? ' disabled' : ''}>${icon('chevronRight')}</button>
        </div>
        <div class="calendar-grid cal-dow">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<span>${d}</span>`).join('')}</div>
        <div class="calendar-grid">${days}</div>
      </div>
      <div class="slots">
        <p class="slots-title">${s.date ? fmtDate(dateFromKey(s.date)) : 'Available times'}</p>
        ${slotHtml}
        ${s.date ? `<p class="slots-note">Each slot is ${PICKUP.stepMin} minutes, up to ${PICKUP.capacity} students.</p>` : ''}
      </div>
    </div>`;

    const selected = s.date && s.time ? Cal.slots(s.date, s.requestId).find(x => x.time === s.time) : null;
    $('#schedConfirm').disabled = !selected || selected.disabled;
  },
  nav() {
    const u = Auth.user, dark = document.documentElement.dataset.theme === 'dark';
    const role = { student: 'Student', registrar: 'Registrar', admin: 'Admin' };
    const initials = u ? u.name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() : '';
    $('#nav').innerHTML = `<div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun Portal</b><span>Document Request System</span></div></div>
      <div class="actions">${u ? `<span class="badge s-role">${role[u.role]}</span>` : ''}
        <button class="btn btn-ghost btn-icon" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}</button>
        ${u ? `<div class="nav-user"><span class="avatar" aria-hidden="true">${esc(initials)}</span><span class="nav-user-name">${esc(u.name)}</span></div>
        <button class="btn btn-outline btn-sm" data-act="logout" aria-label="Sign out">${icon('logOut')}<span>Sign out</span></button>`
        : `<button class="btn btn-primary btn-sm" data-act="openLogin">Sign in</button>`}</div>`;
  }
};

/* ===== Gmail invitation simulator ===== */
const Mail = {
  show(u) {
    const link = `https://plmun-portal.example/activate?token=${u.token}`;
    $('#mailBody').innerHTML = `<div class="mail">
      <div class="mail-head">
        <p><span class="mail-label">From</span><span>PLMun Registrar Portal &lt;no-reply@plmun.edu.ph&gt;</span></p>
        <p><span class="mail-label">To</span><span>${esc(u.email)}</span></p>
        <p><span class="mail-label">Subject</span><span>You're invited as a PLMun Registrar</span></p>
      </div>
      <div class="mail-body">
        <p>Hello ${esc(u.name)},</p>
        <p>The Admin created a Registrar account for you. Your temporary password is <code>${esc(u.pw)}</code>.</p>
        <p>Activate it here: <u>${esc(link)}</u></p>
      </div></div>
      <button class="btn btn-primary btn-block" data-act="activate" data-id="${u.id}">${icon('check')} Simulate clicking the link</button>`;
    $('#mail').showModal();
  }
};

/* ===== Actions (click delegation) ===== */
const findReq = id => Store.db.requests.find(r => r.id === id);
const Actions = {
  showpw(el) {
    const p = $('#password'), s = p.type === 'password';
    p.type = s ? 'text' : 'password';
    el.innerHTML = s ? `${icon('eyeOff')}<span>Hide</span>` : `${icon('eye')}<span>Show</span>`;
  },
  close(el) { el.closest('dialog').close(); },
  theme() { Theme.toggle(); },
  logout() { Auth.logout(); UI.reset(); toast('Signed out safely.'); },
  demo(el) {
    const m = { student: ['student@plmun.edu.ph', 'student123'], registrar: ['maria.registrar@gmail.com', 'registrar123'], admin: ['admin@plmun.edu.ph', 'admin123'] }[el.dataset.role];
    $('#email').value = m[0]; $('#password').value = m[1];
  },
  schedule(el) {
    const u = Auth.user, r = findReq(el.dataset.id);
    if (!u || u.role !== 'student' || !r || r.owner !== u.id || r.status !== 'Ready for Pickup')
      return toast('Only your own ready-for-pickup requests can be scheduled.', true);
    let date = r.pickup?.date || null, time = r.pickup?.time || null;
    if (date && !Cal.isBookableDate(dateFromKey(date))) { date = null; time = null; }
    if (date && time && !Cal.slots(date, r.id).some(x => x.time === time && !x.disabled)) time = null;
    const base = date ? dateFromKey(date) : Cal.today();
    UI.schedule = { requestId: r.id, view: new Date(base.getFullYear(), base.getMonth(), 1), date, time };
    $('#schedTitle').textContent = r.pickup ? 'Reschedule pickup' : 'Schedule pickup';
    $('#schedSubtitle').textContent = `${r.type} · ${r.id}`;
    UI.renderSchedule();
    $('#sched').showModal();
  },
  calPrev() {
    const s = UI.schedule; if (!s) return;
    const prev = new Date(s.view.getFullYear(), s.view.getMonth() - 1, 1);
    if (prev < Cal.minMonth()) return;
    s.view = prev; UI.renderSchedule();
  },
  calNext() {
    const s = UI.schedule; if (!s) return;
    const next = new Date(s.view.getFullYear(), s.view.getMonth() + 1, 1);
    if (next > Cal.maxMonth()) return;
    s.view = next; UI.renderSchedule();
  },
  pickDate(el) {
    const s = UI.schedule; if (!s) return;
    if (!Cal.hasOpen(el.dataset.date, s.requestId)) return;
    s.date = el.dataset.date; s.time = null;
    UI.renderSchedule();
  },
  pickSlot(el) {
    const s = UI.schedule; if (!s) return;
    s.time = el.dataset.time;
    UI.renderSchedule();
  },
  confirmPickup() {
    const s = UI.schedule, u = Auth.user, r = s && findReq(s.requestId);
    if (!s || !u || u.role !== 'student' || !r || r.owner !== u.id) return;
    if (r.status !== 'Ready for Pickup') return toast('This request is not ready for pickup yet.', true);
    if (!s.date || !s.time) return;
    const slot = Cal.slots(s.date, r.id).find(x => x.time === s.time);
    if (!Cal.isBookableDate(dateFromKey(s.date)) || !slot || slot.disabled) {
      toast('That time is no longer available. Pick another.', true);
      s.time = null; UI.renderSchedule(); return;
    }
    r.pickup = { date: s.date, time: s.time };
    Store.save();
    $('#sched').close();
    UI.schedule = null;
    UI.render();
    toast(`Pickup scheduled for ${fmtDate(dateFromKey(r.pickup.date))} at ${timeLabel(r.pickup.time)}.`);
  },
  advance(el) {
    if (!guard('request:advance')) return;
    const r = findReq(el.dataset.id), i = FLOW.indexOf(r.status);
    if (i < 0 || i === FLOW.length - 1) return;
    r.status = FLOW[i + 1]; Store.save(); UI.render(); toast(`${r.id} is now ${r.status}.`);
  },
  reject(el) {
    if (!guard('request:advance')) return;
    const r = findReq(el.dataset.id); r.status = 'Rejected'; Store.save(); UI.render(); toast(`${r.id} rejected.`);
  },
  toggle(el) {
    if (!guard('registrar:manage')) return;
    const u = Store.db.users.find(x => x.id === el.dataset.id && x.role === 'registrar');
    u.status = u.status === 'active' ? 'disabled' : 'active'; Store.save(); UI.render(); toast(`${u.name} is now ${u.status}.`);
  },
  invite(el) {
    if (!guard('registrar:manage')) return;
    Mail.show(Store.db.users.find(x => x.id === el.dataset.id));
  },
  activate(el) {
    const u = Store.db.users.find(x => x.id === el.dataset.id && x.status === 'invited'); if (!u) return;
    u.status = 'active'; delete u.token; Store.save(); $('#mail').close(); UI.render(); toast(`${u.name} activated. They can sign in now.`);
  }
};

/* ===== Forms ===== */
const Forms = {
  login(f) {
    const d = Object.fromEntries(new FormData(f)), r = Auth.login(d.email || '', d.password || '');
    if (r.err) { $('#loginErr').textContent = r.err; return; }
    f.reset();
    UI.reset(); toast(`Welcome, ${Auth.user.role === 'student' ? mask(Auth.user.name) : Auth.user.name}!`);
  },
  request(f) {
    if (!guard('request:create')) return;
    const d = Object.fromEntries(new FormData(f)), purpose = d.purpose.trim();
    if (!Store.db.docs.includes(d.doc) || !purpose) return toast('Please complete the form.', true);
    const copies = Math.min(5, Math.max(1, parseInt(d.copies, 10) || 1));
    const id = `REQ-${Store.db.seq++}`;
    Store.db.requests.unshift({ id, owner: Auth.user.id, type: d.doc, purpose, copies, status: 'Pending', date: new Date().toISOString() });
    Store.save(); UI.render(); toast(`Request ${id} submitted.`);
  },
  invite(f) {
    if (!guard('registrar:manage')) return;
    const d = Object.fromEntries(new FormData(f)), name = d.fullname.trim(), email = d.gmail.trim().toLowerCase();
    if (!name || !/^[^\s@]+@gmail\.com$/.test(email)) return toast('Enter a name and a valid @gmail.com address.', true);
    if (Store.db.users.some(u => u.email.toLowerCase() === email)) return toast('That email already has an account.', true);
    const u = { id: 'u' + Date.now(), role: 'registrar', name, email, status: 'invited',
      pw: 'Reg-' + Math.random().toString(36).slice(2, 8), token: Math.random().toString(36).slice(2, 12) };
    Store.db.users.push(u); Store.save(); UI.render(); Mail.show(u);
  },
  doctype(f) {
    if (!guard('registrar:manage')) return;
    const name = String(new FormData(f).get('doctype') || '').trim().replace(/\s+/g, ' ');
    if (!name) return toast('Enter a document type name.', true);
    if (name.length > 60) return toast('Keep the document type under 60 characters.', true);
    if (Store.db.docs.some(d => d.toLowerCase() === name.toLowerCase())) return toast('That document type already exists.', true);
    Store.db.docs.push(name); Store.save(); UI.render(); toast(`“${name}” added to the request form.`);
  }
};

/* ===== Event delegation & boot ===== */
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && Actions[el.dataset.act]) Actions[el.dataset.act](el); });
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); Forms[f.dataset.form](f); } });
document.addEventListener('input', e => { if (e.target.matches('[data-search]')) { UI.state.q = e.target.value; UI.paintRows(); } });
document.addEventListener('change', e => { if (e.target.matches('[data-filter]')) { UI.state.status = e.target.value; UI.paintRows(); } });
window.addEventListener('storage', e => { if (e.key === Store.KEY) { Store.init(); Auth.restore(); UI.render(); } });

Theme.init(); Store.init(); Auth.restore(); UI.render();
