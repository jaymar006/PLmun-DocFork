'use strict';
/* PLMun Portal — vanilla JS, modular objects (no build step, works from file://) */

/* ===== Utils & constants ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
const mask = n => n.split(' ').map(w => w[0] + '•'.repeat(Math.max(w.length - 1, 2))).join(' ');
const slug = s => String(s).toLowerCase().replace(/[^a-z]+/g, '-');
const badge = s => `<span class="badge s-${slug(s)}">${esc(s)}</span>`;
const DOCS = ['Transcript of Records', 'Diploma', 'Certification', 'Certificate of Registration (COR)'];
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
  t.textContent = msg;
  $('#toasts').append(t);
  setTimeout(() => t.remove(), 3400);
}

/* ===== Store (mock database persisted in localStorage) ===== */
const Store = {
  KEY: 'plmun-portal-v1', db: null,
  init() {
    try { this.db = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.db = null; }
    if (!this.db || !this.db.users) { this.db = this.seed(); this.save(); }
  },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.db)); } catch { /* storage blocked */ } },
  seed() {
    const ago = n => new Date(Date.now() - n * 864e5).toISOString();
    return {
      seq: 1005,
      users: [
        { id: 'u1', role: 'admin', name: 'PLMun Super Admin', email: 'admin@plmun.edu.ph', pw: 'admin123', status: 'active' },
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
    if (u.status === 'disabled') return { err: 'This account was disabled by the Super Admin.' };
    this.user = u; sessionStorage.setItem('plmun-sid', u.id);
    return { ok: true };
  },
  logout() { this.user = null; sessionStorage.removeItem('plmun-sid'); }
};

/* ===== Privacy layer: registrars only ever receive this projection ===== */
const Privacy = {
  registrarView: () => Store.db.requests.map(({ id, type, status, date }) => ({ id, type, status, date }))
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
  },
  toggle() { this.set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); UI.nav(); }
};

/* ===== Views ===== */
const HEAD = {
  student: ['Student Portal', 'My document requests', 'Request records and follow every step.'],
  registrar: ['Registrar Panel', 'Fulfillment queue', 'Process requests using privacy-safe details only.'],
  admin: ['Super Admin', 'Registrar management', 'Invite, activate and disable registrar accounts.']
};
const Welcome = r => `<section class="welcome"><div><p class="eyebrow">${HEAD[r][0]}</p><h1>${HEAD[r][1]}</h1><p class="muted">${HEAD[r][2]}</p></div><img src="logo.png" alt="" aria-hidden="true"></section>`;
const stat = (l, v) => `<div class="glass-card stat"><small>${l}</small><strong>${v}</strong></div>`;
const toolbar = opts => `<div class="toolbar">
  <input type="search" data-search placeholder="Search…" aria-label="Search">
  <select data-filter aria-label="Filter by status"><option value="">All statuses</option>${opts.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
const tableShell = (heads, opts) => `${toolbar(opts)}<div class="wrap"><table>
  <thead><tr>${heads.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody id="rows"></tbody></table></div>`;

const Views = {
  landing() {
    return `<div class="auth-wrap">
      <aside class="brand-panel"><img class="watermark" src="logo.png" alt="">
        <div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun</b><span>Pamantasan ng Lungsod ng Muntinlupa</span></div></div>
        <div><p class="eyebrow">Student &amp; Faculty Portal</p><h1>Document Request <em>System</em></h1>
          <p>Request. Track. Receive. Your records and your privacy, in one clear place.</p>
          <div class="pills"><span>🔒 Privacy-first</span><span>📄 TOR · Diploma · COR</span><span>🛡️ Role-based access</span></div></div>
        <small>© 2026 Pamantasan ng Lungsod ng Muntinlupa · All rights reserved</small></aside>
      <div class="form-panel"><button class="btn btn-ghost btn-sm fab" data-act="theme">🌓 Theme</button>
        <form class="signin glass-card" data-form="login" novalidate>
          <img class="seal" src="logo.png" alt="PLMun seal"><p class="eyebrow">Document Request System</p>
          <h2>Sign in</h2><p class="muted">Use your PLMun portal account.</p>
          <div class="field" style="margin-top:1.2rem"><label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="username" placeholder="name@plmun.edu.ph" required></div>
          <div class="field"><label for="password">Password</label>
            <div class="pw"><input id="password" name="password" type="password" autocomplete="current-password" required>
            <button class="btn btn-ghost btn-sm" type="button" data-act="showpw">Show</button></div></div>
          <p id="loginErr" class="err" role="alert"></p>
          <button class="btn btn-primary" type="submit">Sign in</button>
          <div class="demo"><span class="muted small">Demo accounts:</span>
            <button class="btn btn-ghost btn-sm" type="button" data-act="demo" data-role="student">Student</button>
            <button class="btn btn-ghost btn-sm" type="button" data-act="demo" data-role="registrar">Registrar</button>
            <button class="btn btn-ghost btn-sm" type="button" data-act="demo" data-role="admin">Super Admin</button></div>
        </form></div></div>`;
  },
  student(u) {
    const mine = Store.db.requests.filter(r => r.owner === u.id), c = s => mine.filter(r => r.status === s).length;
    return `<section class="glass-card privacy"><span aria-hidden="true">🔒</span><div><strong>Your data is protected.</strong>
      Signed in as ${esc(mask(u.name))} · Student No. ${esc('••••-•••' + u.sno.slice(-2))}.
      Registrar staff only see your request ID, document type and status.</div></section>
      <div class="stats">${stat('Total requests', mine.length)}${stat('Pending', c('Pending'))}
      ${stat('In progress', c('Processing') + c('Ready for Pickup'))}${stat('Released', c('Released'))}</div>
      <div class="cols">
        <form class="glass-card" data-form="request"><h2>New request</h2>
          <div class="field"><label for="doc">Document</label><select id="doc" name="doc">${DOCS.map(d => `<option>${d}</option>`).join('')}</select></div>
          <div class="field"><label for="copies">Copies</label><input id="copies" name="copies" type="number" min="1" max="5" value="1" required></div>
          <div class="field"><label for="purpose">Purpose</label><textarea id="purpose" name="purpose" maxlength="120" required></textarea></div>
          <button class="btn btn-primary" type="submit">Submit request</button></form>
        <section class="glass-card"><h2>My requests</h2>
          ${tableShell(['Request ID', 'Document', 'Copies', 'Date', 'Status'], [...FLOW, 'Rejected'])}</section></div>`;
  },
  registrar() {
    const all = Privacy.registrarView(), c = s => all.filter(r => r.status === s).length;
    return `<section class="glass-card privacy"><span aria-hidden="true">🛡️</span><div><strong>Restricted processing view.</strong>
      Student names, numbers and purposes are hidden. You only see what is needed to fulfill each request.</div></section>
      <div class="stats">${stat('Queue', all.length)}${stat('Pending', c('Pending'))}${stat('Processing', c('Processing'))}${stat('Ready', c('Ready for Pickup'))}</div>
      <section class="glass-card"><h2>Request queue</h2>
        ${tableShell(['Request ID', 'Document', 'Date', 'Status', 'Actions'], [...FLOW, 'Rejected'])}</section>`;
  },
  admin() {
    const regs = Store.db.users.filter(u => u.role === 'registrar'), c = s => regs.filter(u => u.status === s).length;
    return `<div class="stats">${stat('Registrars', regs.length)}${stat('Active', c('active'))}${stat('Invited', c('invited'))}
      ${stat('Disabled', c('disabled'))}${stat('Total requests', Store.db.requests.length)}</div>
      <div class="cols">
        <form class="glass-card" data-form="invite"><h2>Invite a registrar</h2>
          <div class="field"><label for="fullname">Full name</label><input id="fullname" name="fullname" required></div>
          <div class="field"><label for="gmail">Gmail address</label><input id="gmail" name="gmail" type="email" placeholder="name@gmail.com" required></div>
          <button class="btn btn-primary" type="submit">Create &amp; send invitation</button>
          <p class="muted small">An activation email is simulated; no real email is sent.</p></form>
        <section class="glass-card"><h2>Registrar accounts</h2>
          ${tableShell(['Name', 'Email', 'Status', 'Actions'], ['active', 'invited', 'disabled'])}</section></div>`;
  },
  rows() {
    const u = Auth.user; if (!u) return '';
    const { q, status } = UI.state, t = q.trim().toLowerCase();
    let list = u.role === 'student' ? Store.db.requests.filter(r => r.owner === u.id)
      : u.role === 'registrar' ? Privacy.registrarView()
      : Store.db.users.filter(x => x.role === 'registrar');
    list = list.filter(r => (!status || r.status === status) &&
      (!t || [r.id, r.type, r.name, r.email].some(v => v && String(v).toLowerCase().includes(t))));
    if (!list.length) return `<tr><td class="empty" colspan="5">Nothing matches yet.</td></tr>`;
    return list.map(r => {
      if (u.role === 'student') return `<tr><td>${esc(r.id)}</td><td>${esc(r.type)}</td><td>${r.copies}</td><td>${fmtDate(r.date)}</td><td>${badge(r.status)}</td></tr>`;
      if (u.role === 'registrar') {
        const i = FLOW.indexOf(r.status), next = i > -1 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
        return `<tr><td>${esc(r.id)}</td><td>${esc(r.type)}</td><td>${fmtDate(r.date)}</td><td>${badge(r.status)}</td><td>
          ${next ? `<button class="btn btn-primary btn-sm" data-act="advance" data-id="${esc(r.id)}">Mark ${esc(next)}</button>` : ''}
          ${['Pending', 'Processing'].includes(r.status) ? `<button class="btn btn-danger btn-sm" data-act="reject" data-id="${esc(r.id)}">Reject</button>` : ''}</td></tr>`;
      }
      return `<tr><td>${esc(r.name)}</td><td>${esc(r.email)}</td><td>${badge(r.status)}</td><td>
        ${r.status === 'invited' ? `<button class="btn btn-ghost btn-sm" data-act="invite" data-id="${r.id}">View invite</button>` : ''}
        ${r.status === 'active' ? `<button class="btn btn-danger btn-sm" data-act="toggle" data-id="${r.id}">Disable</button>` : ''}
        ${r.status === 'disabled' ? `<button class="btn btn-ghost btn-sm" data-act="toggle" data-id="${r.id}">Enable</button>` : ''}</td></tr>`;
    }).join('');
  }
};

/* ===== UI controller ===== */
const UI = {
  state: { q: '', status: '' },
  reset() { this.state = { q: '', status: '' }; $('#mail').open && $('#mail').close(); this.render(); },
  render() {
    document.body.classList.toggle('auth', !Auth.user);
    this.nav();
    $('#app').innerHTML = Auth.user ? Welcome(Auth.user.role) + Views[Auth.user.role](Auth.user) : Views.landing();
    this.paintRows();
  },
  paintRows() { const b = $('#rows'); if (b) b.innerHTML = Views.rows(); },
  nav() {
    const u = Auth.user, dark = document.documentElement.dataset.theme === 'dark';
    const role = { student: 'Student', registrar: 'Registrar', admin: 'Super Admin' };
    $('#nav').innerHTML = `<div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun Portal</b><span>Document Request System</span></div></div>
      <div class="actions">${u ? `<span class="badge s-active">${role[u.role]}</span>` : ''}
        <button class="btn btn-ghost btn-sm" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${dark ? '☀️ Light' : '🌙 Dark'}</button>
        ${u ? `<button class="btn btn-ghost btn-sm" data-act="logout">Sign out</button>` : `<button class="btn btn-primary btn-sm" data-act="openLogin">Sign in</button>`}</div>`;
  }
};

/* ===== Gmail invitation simulator ===== */
const Mail = {
  show(u) {
    const link = `https://plmun-portal.example/activate?token=${u.token}`;
    $('#mailBody').innerHTML = `<div class="mail">
      <p><b>From:</b> PLMun Registrar Portal &lt;no-reply@plmun.edu.ph&gt;</p>
      <p><b>To:</b> ${esc(u.email)}</p><p><b>Subject:</b> You're invited as a PLMun Registrar</p><hr>
      <p>Hello ${esc(u.name)},</p>
      <p>The Super Admin created a Registrar account for you. Your temporary password is <code>${esc(u.pw)}</code>.</p>
      <p>Activate it here: <u>${esc(link)}</u></p></div>
      <button class="btn btn-primary" data-act="activate" data-id="${u.id}">Simulate clicking the link</button>`;
    $('#mail').showModal();
  }
};

/* ===== Actions (click delegation) ===== */
const findReq = id => Store.db.requests.find(r => r.id === id);
const Actions = {
  showpw(el) { const p = $('#password'), s = p.type === 'password'; p.type = s ? 'text' : 'password'; el.textContent = s ? 'Hide' : 'Show'; },
  close(el) { el.closest('dialog').close(); },
  theme() { Theme.toggle(); },
  logout() { Auth.logout(); UI.reset(); toast('Signed out safely.'); },
  demo(el) {
    const m = { student: ['student@plmun.edu.ph', 'student123'], registrar: ['maria.registrar@gmail.com', 'registrar123'], admin: ['admin@plmun.edu.ph', 'admin123'] }[el.dataset.role];
    $('#email').value = m[0]; $('#password').value = m[1];
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
    if (!DOCS.includes(d.doc) || !purpose) return toast('Please complete the form.', true);
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
  }
};

/* ===== Event delegation & boot ===== */
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && Actions[el.dataset.act]) Actions[el.dataset.act](el); });
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); Forms[f.dataset.form](f); } });
document.addEventListener('input', e => { if (e.target.matches('[data-search]')) { UI.state.q = e.target.value; UI.paintRows(); } });
document.addEventListener('change', e => { if (e.target.matches('[data-filter]')) { UI.state.status = e.target.value; UI.paintRows(); } });
window.addEventListener('storage', e => { if (e.key === Store.KEY) { Store.init(); Auth.restore(); UI.render(); } });

Theme.init(); Store.init(); Auth.restore(); UI.render();