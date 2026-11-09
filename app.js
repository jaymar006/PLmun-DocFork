'use strict';
/* PLMun Portal — vanilla JS, modular objects (no build step, works from file://) */

/* ===== Utils & constants ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
const mask = n => n.split(' ').map(w => w[0] + '•'.repeat(Math.max(w.length - 1, 2))).join(' ');
const slug = s => String(s).toLowerCase().replace(/[^a-z]+/g, '-');
const badge = s => `<span class="badge s-${slug(s)}">${esc(s)}</span>`;
const initials = n => String(n || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
const hueOf = n => { let h = 0; for (const ch of String(n || '')) h = (h * 31 + ch.codePointAt(0)) % 360; return h; };
const normalizeMobile = v => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.startsWith('63') && d.length === 12) d = '0' + d.slice(2);
  if (d.length === 10 && d.startsWith('9')) d = '0' + d;
  return /^09\d{9}$/.test(d) ? d : '';
};
const formatMobile = v => {
  const d = normalizeMobile(v);
  return d ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : '';
};

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
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  graduationCap: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  bookOpen: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  creditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  banknote: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/>',
  clipboardCheck: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

/* ===== Minimal, robust QR Code generator (ISO/IEC 18004 Byte mode, Level M) ===== */
const QRCode = (function () {
  const EXP_TABLE = new Uint8Array(512), LOG_TABLE = new Uint8Array(256);
  for (let i = 0, x = 1; i < 255; i++) {
    EXP_TABLE[i] = x; EXP_TABLE[i + 255] = x; LOG_TABLE[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  const gmult = (a, b) => (!a || !b ? 0 : EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]]);

  function rsGenPoly(n) {
    let p = [1];
    for (let i = 0; i < n; i++) {
      let next = new Array(p.length + 1).fill(0);
      for (let j = 0; j < p.length; j++) {
        next[j] ^= gmult(p[j], EXP_TABLE[i]);
        next[j + 1] ^= p[j];
      }
      p = next;
    }
    return p;
  }

  function rsRemainder(data, numEc) {
    const gen = rsGenPoly(numEc), res = new Array(numEc).fill(0);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res.shift();
      res.push(0);
      if (factor !== 0) {
        for (let j = 0; j < numEc; j++) res[j] ^= gmult(gen[j], factor);
      }
    }
    return res;
  }

  const TABLE_M = [
    null,
    { total: 26, ecPerBlock: 10, blocks: [[1, 26]] },
    { total: 44, ecPerBlock: 16, blocks: [[1, 44]] },
    { total: 70, ecPerBlock: 26, blocks: [[1, 70]] },
    { total: 100, ecPerBlock: 18, blocks: [[2, 50]] },
    { total: 134, ecPerBlock: 24, blocks: [[2, 67]] },
    { total: 172, ecPerBlock: 16, blocks: [[4, 43]] },
    { total: 196, ecPerBlock: 18, blocks: [[4, 49]] }
  ];

  const ALIGN_POS = [[], [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38]];

  function getVersion(len) {
    for (let v = 1; v < TABLE_M.length; v++) {
      let cap = 0;
      for (const [cnt, tot] of TABLE_M[v].blocks) cap += cnt * (tot - TABLE_M[v].ecPerBlock);
      if (len + 2 <= cap) return v;
    }
    return TABLE_M.length - 1;
  }

  function encode(text, ver) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      const c = text.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
      else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    const info = TABLE_M[ver];
    let totalData = 0;
    for (const [cnt, tot] of info.blocks) totalData += cnt * (tot - info.ecPerBlock);

    const bits = [];
    const pushBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
    for (const b of bytes) pushBits(b, 8);

    const capBits = totalData * 8;
    for (let i = 0; i < 4 && bits.length < capBits; i++) bits.push(0);
    while (bits.length % 8 !== 0) bits.push(0);
    const pads = [0xEC, 0x11];
    let pIdx = 0;
    while (bits.length < capBits) pushBits(pads[(pIdx++) % 2], 8);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      codewords.push(b);
    }

    const blocks = [];
    let offset = 0;
    for (const [cnt, tot] of info.blocks) {
      const per = tot - info.ecPerBlock;
      for (let k = 0; k < cnt; k++) {
        const d = codewords.slice(offset, offset + per);
        offset += per;
        blocks.push({ data: d, ec: rsRemainder(d, info.ecPerBlock) });
      }
    }

    const finalCw = [];
    const maxD = Math.max(...blocks.map(b => b.data.length));
    for (let i = 0; i < maxD; i++) {
      for (const b of blocks) if (i < b.data.length) finalCw.push(b.data[i]);
    }
    const maxE = Math.max(...blocks.map(b => b.ec.length));
    for (let i = 0; i < maxE; i++) {
      for (const b of blocks) if (i < b.ec.length) finalCw.push(b.ec[i]);
    }
    return finalCw;
  }

  function matrix(ver, cw) {
    const size = ver * 4 + 17;
    const m = Array.from({ length: size }, () => new Array(size).fill(null));
    const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (r, c, v, res = true) => {
      m[r][c] = v ? 1 : 0;
      if (res) reserved[r][c] = true;
    };

    const drawFinder = (row, col) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          set(row + r, col + c, r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        }
      }
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = row + r, cc = col + c;
          if (rr >= 0 && rr < size && cc >= 0 && cc < size) {
            if (r === -1 || r === 7 || c === -1 || c === 7) set(rr, cc, 0);
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    const isFinder = (r, c) => (r <= 8 && c <= 8) || (r <= 8 && c >= size - 8) || (r >= size - 8 && c <= 8);
    const coords = ALIGN_POS[ver] || [];
    for (const r of coords) {
      for (const c of coords) {
        if (isFinder(r, c)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            set(r + dr, c + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
          }
        }
      }
    }

    for (let i = 8; i < size - 8; i++) {
      if (!reserved[6][i]) set(6, i, i % 2 === 0);
      if (!reserved[i][6]) set(i, 6, i % 2 === 0);
    }
    set(size - 8, 8, 1);

    for (let i = 0; i < 9; i++) if (i !== 6) { reserved[8][i] = true; reserved[i][8] = true; }
    for (let i = size - 8; i < size; i++) { reserved[8][i] = true; reserved[i][8] = true; }

    const bits = [];
    for (const c of cw) for (let b = 7; b >= 0; b--) bits.push((c >> b) & 1);

    let bIdx = 0, upwards = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--;
      const rows = upwards
        ? Array.from({ length: size }, (_, i) => size - 1 - i)
        : Array.from({ length: size }, (_, i) => i);
      for (const r of rows) {
        for (const c of [right, right - 1]) {
          if (!reserved[r][c]) {
            const v = bIdx < bits.length ? bits[bIdx++] : 0;
            const mask = (r + c) % 2 === 0;
            m[r][c] = (v ^ (mask ? 1 : 0)) ? 1 : 0;
          }
        }
      }
      upwards = !upwards;
    }

    const fmtBits = [];
    for (let i = 14; i >= 0; i--) fmtBits.push((0x5412 >> i) & 1);
    let fi = 0;
    for (let c = 0; c <= 8; c++) if (c !== 6) m[8][c] = fmtBits[fi++];
    for (let r = 7; r >= 0; r--) if (r !== 6) m[r][8] = fmtBits[fi++];

    let fi2 = 0;
    for (let r = size - 1; r >= size - 7; r--) m[r][8] = fmtBits[fi2++];
    for (let c = size - 8; c < size; c++) m[8][c] = fmtBits[fi2++];

    return m;
  }

  function toSvg(text, sizePx = 140) {
    const ver = getVersion(text.length);
    const cw = encode(text, ver);
    const m = matrix(ver, cw);
    const n = m.length, pad = 2, viewSize = n + pad * 2;
    let path = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (m[r][c] === 1) path += `M${c + pad},${r + pad}h1v1h-1z `;
      }
    }
    return `<svg class="qr-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges" role="img" aria-label="QR Code"><rect width="${viewSize}" height="${viewSize}" fill="#ffffff"/><path d="${path.trim()}" fill="#000000"/></svg>`;
  }

  return { toSvg };
})();

/* Tracking reference code generator / resolver */
const reqTracking = r => r.trackingCode || (`PLM-TRK-${r.date ? new Date(r.date).getFullYear() : 2026}-${(r.id || '').replace(/\D/g, '') || '0000'}`);

/* Document catalog shown on the landing page and in the request form. */
const DOC_CATALOG = [
  { name: 'Certificate of Grades', cat: 'Certifications', desc: 'Certified term grades record for scholarship, OJT, or employment verification.', days: '3 - 5', fee: 50, unit: 'copy', prereq: 2 },
  { name: 'Certificate of Enrollment', cat: 'Certifications', desc: 'Official certification verifying active enrollment status for the current academic term.', days: '2 - 3', fee: 50, unit: 'copy', prereq: 2 },
  { name: 'Certificate of Graduation', cat: 'Certifications', desc: 'Official certification confirming completed degree requirements and Board of Regents approval.', days: '3 - 5', fee: 100, unit: 'copy', prereq: 2 },
  { name: 'Certificate of Earned Units', cat: 'Certifications', desc: 'Official certification of the total academic units earned in the university.', days: '3 - 5', fee: 75, unit: 'copy', prereq: 2 },
  { name: 'CHED Endorsement', cat: 'Credentials', desc: 'Official endorsement letter and academic packet addressed to the Commission on Higher Education (CHED).', days: '5 - 7', fee: 150, unit: 'set', prereq: 3 },
  { name: 'Certificate of Incumbency', cat: 'Certifications', desc: 'Official incumbency and academic standing certification issued by the Office of the Registrar.', days: '3 - 5', fee: 75, unit: 'copy', prereq: 2 },
  { name: 'CAV / SO Certificate', cat: 'Credentials', desc: 'Certification, Authentication and Verification (CAV) / Special Order (SO) certificate.', days: '5 - 10', fee: 200, unit: 'set', prereq: 3 },
  { name: 'Certificate of Medium of Instruction', cat: 'Certifications', desc: 'Certification confirming English as the primary medium of university instruction.', days: '3 - 5', fee: 75, unit: 'copy', prereq: 2 },
  { name: 'Certificate of Matriculation', cat: 'Certifications', desc: 'Certified true copy of student matriculation and assessed tuition and fees.', days: '2 - 3', fee: 50, unit: 'copy', prereq: 2 },
  { name: 'Diploma', cat: 'Diplomas', desc: "Official bachelor's or associate degree diploma, or an authenticated second copy.", days: '10 - 15', fee: 350, unit: 'copy', prereq: 3 },
  { name: 'Certificate for Latin Honors', cat: 'Certifications', desc: 'Official certification of Cum Laude, Magna Cum Laude or Summa Cum Laude academic distinction.', days: '3 - 5', fee: 100, unit: 'copy', prereq: 3 },
  { name: 'Other Certificate (Specify)', cat: 'Certifications', desc: 'Custom academic certification or special registrar form. Specify the details upon request.', days: '3 - 5', fee: 75, unit: 'copy', prereq: 2 }
];
const DEFAULT_DOCS = DOC_CATALOG.map(d => d.name);
const DOC_META = Object.fromEntries(DOC_CATALOG.map(d => [d.name, d]));
const docMeta = name => DOC_META[name] || {
  name,
  cat: /diploma/i.test(name) ? 'Diplomas'
    : /transcript|tor|credential|dismissal/i.test(name) ? 'Credentials' : 'Certifications',
  desc: 'Registrar-issued document. Fees and turnaround are confirmed upon evaluation.',
  days: '3 - 5', fee: 75, unit: 'copy', prereq: 2
};
const LEGACY_DOCS = ['Transcript of Records', 'Diploma', 'Certification', 'Certificate of Registration (COR)'];

/* PLMun colleges and degree programs (used by the student profile). */
const PROGRAMS = [
  {
    college: 'College of Arts and Sciences (CAS)', programs: [
      'Bachelor of Science in Psychology',
      'Bachelor of Arts in Communication',
      'Bachelor of Arts in Political Science'
    ]
  },
  {
    college: 'College of Business Administration (CBA)', programs: [
      'Bachelor of Science in Accountancy',
      'Bachelor of Science in Business Administration – Operations Management',
      'Bachelor of Science in Business Administration – Marketing Management',
      'Bachelor of Science in Business Administration – Human Resource Management'
    ]
  },
  {
    college: 'College of Criminal Justice (CCJ)', programs: [
      'Bachelor of Science in Criminology'
    ]
  },
  {
    college: 'College of Information Technology and Computer Studies (CITCS)', programs: [
      'Bachelor of Science in Information Technology',
      'Bachelor of Science in Computer Science',
      'Associate in Computer Technology'
    ]
  },
  {
    college: 'College of Teacher Education (CTE)', programs: [
      'Bachelor in Elementary Education (BEEd) – Major in General Elementary Education',
      'Bachelor in Secondary Education (BSEd) – Majors in Sciences, English, and Social Science'
    ]
  }
];
const PROGRAM_LIST = PROGRAMS.flatMap(g => g.programs);
const DEFAULT_PROGRAM = PROGRAM_LIST[0];
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduated / Alumnus'];
const PURPOSES = ['Scholarship', 'Employment', 'Enrollment', 'Abroad application', 'Personal records', 'Transfer / Shifting', 'Board / Licensure exam', 'Other'];
const RELATIONSHIPS = ['Parent', 'Guardian', 'Sibling', 'Relative', 'Spouse', 'Friend', 'Other'];
const ID_TYPES = ['Philippine Passport', "Driver's License", 'PhilSys / National ID', 'UMID', 'PRC ID', 'Postal ID', "Voter's ID", 'Company / School ID', 'Other government-issued ID'];
const PAYMENT_METHODS = [
  { key: 'cashier', label: 'Cashier', full: 'Cashier (pay in person)', desc: "Settle the assessed fee at the University Cashier's Office before claiming your document." },
  { key: 'online', label: 'Online', full: 'Online payment', desc: 'Pay through the online payment channel after submitting your request and keep the reference number.' }
];
const paymentMeta = key => PAYMENT_METHODS.find(p => p.key === key) || PAYMENT_METHODS[0];
const collegeOf = p => (PROGRAMS.find(g => g.programs.includes(p)) || PROGRAMS[0]).college;
const WARNING_VERSION = 1;
const OTHER_DOC = 'Other Certificate (Specify)';
const WIZ_STEPS = [
  { n: 1, label: 'Step 01', desc: 'Policy & Privacy', hint: 'Read and acknowledge the official warning before submitting a request.' },
  { n: 2, label: 'Step 02', desc: 'Academic Identity', hint: 'Verify that your enrolled degree program and contact details match your official Registrar files.' },
  { n: 3, label: 'Step 03', desc: 'Document & Copies', hint: 'Choose the document, number of copies, and who will claim it at the Registrar Releasing Window.' },
  { n: 4, label: 'Step 04', desc: 'Review & Submit', hint: 'Review your details, choose a payment method, and submit. Submitted requests are final.' }
];
const isAcked = u => !!(u && u.warningAck && u.warningAck.version === WARNING_VERSION);
const FLOW = ['Pending', 'Processing', 'Ready for Pickup', 'Released'];
const REG_TABS = [
  { key: 'pending', label: 'Submitted', statuses: ['Pending'] },
  { key: 'approved', label: 'Approved', statuses: ['Processing'] },
  { key: 'ready', label: 'Ready for pickup', statuses: ['Ready for Pickup'] },
  { key: 'released', label: 'Released', statuses: ['Released'] },
  { key: 'rejected', label: 'Rejected', statuses: ['Rejected'] },
  { key: 'all', label: 'All requests', statuses: null }
];
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
    // Migrate document types: keep the built-in catalog in sync while preserving
    // any custom types the Admin has added, respecting any types deleted by Admin.
    this.db.deletedDocs = Array.isArray(this.db.deletedDocs) ? this.db.deletedDocs : [];
    const docs = Array.isArray(this.db.docs) ? this.db.docs : [];
    const custom = docs.filter(d => !LEGACY_DOCS.some(l => l.toLowerCase() === d.toLowerCase()));
    const allowedDefaults = DEFAULT_DOCS.filter(d => !this.db.deletedDocs.some(x => x.toLowerCase() === d.toLowerCase()));
    const merged = [...allowedDefaults, ...custom.filter(d => !DEFAULT_DOCS.some(n => n.toLowerCase() === d.toLowerCase()))];
    if (JSON.stringify(merged) !== JSON.stringify(docs)) {
      this.db.docs = merged; this.save();
    }
    // Give older student records an academic program so the profile is complete.
    let changed = false;
    this.db.users.filter(u => u.role === 'student').forEach(u => {
      if (!PROGRAM_LIST.includes(u.program)) { u.program = DEFAULT_PROGRAM; changed = true; }
      if (!YEAR_LEVELS.includes(u.yearLevel)) { u.yearLevel = '1st Year'; changed = true; }
      if (typeof u.mobile !== 'string') { u.mobile = ''; changed = true; }
    });
    // Ensure all requests have a trackingCode
    this.db.requests = Array.isArray(this.db.requests) ? this.db.requests : [];
    this.db.requests.forEach(r => {
      if (!r.trackingCode) {
        r.trackingCode = reqTracking(r);
        changed = true;
      }
    });
    if (changed) this.save();
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
        { id: 'u3', role: 'student', name: 'Juan Dela Cruz', email: 'student@plmun.edu.ph', pw: 'student123', status: 'active', sno: '2022-00123', program: 'Bachelor of Science in Information Technology', yearLevel: '3rd Year', mobile: '0917 555 0123' },
        { id: 'u4', role: 'student', name: 'Ana Reyes', email: 'ana@plmun.edu.ph', pw: 'student123', status: 'active', sno: '2021-00456', program: 'Bachelor of Science in Accountancy', yearLevel: '4th Year', mobile: '0918 555 0456' }
      ],
      requests: [
        { id: 'REQ-1001', trackingCode: 'PLM-TRK-2026-1001', owner: 'u3', type: 'Certificate of Grades', purpose: 'Scholarship', copies: 1, payment: 'cashier', status: 'Released', date: ago(14) },
        { id: 'REQ-1002', trackingCode: 'PLM-TRK-2026-1002', owner: 'u4', type: 'Certificate of Enrollment', purpose: 'Employment', copies: 2, payment: 'online', status: 'Processing', date: ago(5) },
        { id: 'REQ-1003', trackingCode: 'PLM-TRK-2026-1003', owner: 'u3', type: 'Certificate of Matriculation', purpose: 'Enrollment', copies: 1, payment: 'cashier', status: 'Ready for Pickup', date: ago(3), pickup: { date: dateKey(addDays(new Date(), 3)), time: '10:30' }, receiver: 'rep', claimant: { name: 'Maria Dela Cruz', relation: 'Parent', idType: "Driver's License", letter: true } },
        { id: 'REQ-1004', trackingCode: 'PLM-TRK-2026-1004', owner: 'u4', type: 'Diploma', purpose: 'Abroad application', copies: 1, payment: 'online', status: 'Pending', date: ago(1) }
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
    return Store.db.requests.filter(r => r.status !== 'Rejected' && r.pickup &&
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
  student: ['Student Portal', 'My Document requests', 'Request records and follow every step.'],
  registrar: ['Registrar Panel', 'Fulfillment desk', 'Review, approve and track document requests, pickup appointments and releases.'],
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

const stat = (l, v, ic = 'fileText', status = '') => `<div class="card stat${status ? ` stat--${slug(status)}` : ''}">
  <div class="stat-top"><small>${l}</small><span class="stat-icon">${icon(ic)}</span></div>
  <strong>${v}</strong>
</div>`;

/* ===== View-only notification previews (visual demo only) ===== */
const NOTIFICATIONS = {
  student: [
    { icon: 'packageCheck', title: 'Document ready for pickup', desc: 'REQ-1003 is ready. Schedule a pickup at the Registrar Releasing Window.', time: 'Just now' },
    { icon: 'calendar', title: 'Pickup appointment', desc: 'Your slot is confirmed for Fri, Nov 13 · 10:30 AM at Window 1.', time: '2 hours ago' },
    { icon: 'shieldCheck', title: 'Official warning acknowledged', desc: 'You can now submit document requests from your portal.', time: 'Nov 8' }
  ],
  registrar: [
    { icon: 'inbox', title: 'New request in queue', desc: 'A student submitted a Certificate of Grades request for review.', time: 'Just now' },
    { icon: 'calendar', title: 'Pickup scheduled', desc: 'A student booked a releasing-window slot for Fri, Nov 13.', time: '1 hour ago' },
    { icon: 'packageCheck', title: 'Queue update', desc: 'Two requests are ready for pickup and awaiting release.', time: 'Today' }
  ],
  admin: [
    { icon: 'users', title: 'Registrar invitation pending', desc: 'A newly invited registrar has not activated their account yet.', time: 'Just now' },
    { icon: 'fileText', title: 'Document catalog updated', desc: 'New document types are now available in the request form.', time: '3 hours ago' },
    { icon: 'shieldCheck', title: 'System notice', desc: 'Scheduled maintenance is simulated for this demo only.', time: 'Yesterday' }
  ]
};
const notifPanel = role => {
  const items = NOTIFICATIONS[role] || NOTIFICATIONS.student;
  return `<div class="notif-panel" id="notifPanel" role="region" aria-label="Notifications">
    <div class="notif-head"><strong>Notifications</strong><span class="notif-tag">View only</span></div>
    <ul class="notif-list">${items.map(n => `<li class="notif-item">
      <span class="notif-icon">${icon(n.icon)}</span>
      <div><b>${esc(n.title)}</b><p>${esc(n.desc)}</p><small>${esc(n.time)}</small></div>
    </li>`).join('')}</ul>
    <p class="notif-foot">Preview only — notifications cannot be opened or cleared.</p>
  </div>`;
};

const cardHeader = (title, desc = '') => `<div class="card-header">
  <h2 class="card-title">${title}</h2>
  ${desc ? `<p class="card-desc">${desc}</p>` : ''}
</div>`;

const toolbar = (opts, showFilter = true) => `<div class="toolbar">
  <div class="search"><span class="search-icon">${icon('search')}</span>
    <input type="search" data-search value="${esc(UI.state.q)}" placeholder="Search…" aria-label="Search"></div>
  ${showFilter ? `<select data-filter class="select-filter" aria-label="Filter by status">
    <option value="">All statuses</option>${opts.map(o => `<option value="${o}"${o === UI.state.status ? ' selected' : ''}>${o}</option>`).join('')}
  </select>` : ''}
</div>`;

const tableShell = (heads, opts, showFilter = true) => `${toolbar(opts, showFilter)}<div class="wrap"><table>
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

const docCard = d => `<article class="doc-card">
  <div class="doc-top">
    <span class="doc-cat">${esc(d.cat)}</span>
    <span class="doc-icon">${icon(d.cat === 'Diplomas' ? 'graduationCap' : d.cat === 'Credentials' ? 'shieldCheck' : 'fileText')}</span>
  </div>
  <h3>${esc(d.name)}</h3>
  <p class="doc-desc">${esc(d.desc)}</p>
  <div class="doc-meta">
    <div><small>Turnaround</small><strong>${esc(d.days)} <span>work days</span></strong></div>
    <div><small>Fee</small><strong>₱${d.fee}.00 <span>/ ${esc(d.unit)}</span></strong></div>
  </div>
  <div class="doc-foot">
    <span class="doc-unit">${d.prereq} prerequisites · per ${esc(d.unit)}</span>
    <button class="btn btn-primary btn-sm" type="button" data-act="requestDoc" data-doc="${esc(d.name)}">Request ${icon('arrowRight')}</button>
  </div>
</article>`;

const Views = {
  landing() {
    const total = Store.db.docs.length;
    return `<div class="landing">
      <section class="hero">
        <div class="shell hero-grid">
          <div class="hero-copy">
            <span class="hero-badge">${icon('shieldCheck')} Office of the Registrar</span>
            <h1>Official Student Document  <em>Request Portal </em></h1>
            <p class="hero-desc">A convenient way to request academic documents, monitor application progress, and arrange document pickup through the Office of the Registrar </p>
            <div class="hero-cta">
              <button class="btn btn-primary btn-lg" type="button" data-act="openLogin">${icon('fileText')} Request a document</button>
              <button class="btn btn-outline btn-lg" type="button" data-act="openLogin">${icon('lock')} Sign in to view status &amp; QR pass</button>
            </div>
            <ul class="hero-trust">
              <li>${icon('checkCircle')} ${total} document types</li>
              <li>${icon('checkCircle')} Real-time status tracking</li>
              <li>${icon('checkCircle')} Scheduled counter pickup</li>
            </ul>
            <p class="hero-signin">Looking for something else? <a class="link" href="#documents">Browse the catalog</a></p>
          </div>
        </div>
      </section>

      <section class="section" id="process">
        <div class="shell">
          <div class="section-head">
            <p class="eyebrow">How it works</p>
            <h2>Request Your Documents</h2>
            <p>Avoid campus queues with digital evaluation and designated window pickup.</p>
          </div>
          <div class="steps">
            <article class="step"><span class="step-num">1</span><h3>Select document</h3><p>Choose the certification, credential or diploma you need from the catalog.</p></article>
            <article class="step"><span class="step-num">2</span><h3>Clearance &amp; verification</h3><p>Complete the online form with the required information. Your request will be reviewed by the Office of the Registrar. </p></article>
            <article class="step"><span class="step-num">3</span><h3>Scheduled pickup</h3><p>Once approved and ready, choose an available pickup schedule. Present your confirmation or QR code when claiming your document.</p></article>
          </div>
        </div>
      </section>

      <section class="section alt" id="documents">
        <div class="shell">
          <div class="section-head">
            <p class="eyebrow">Document catalog</p>
            <h2>Academic Documents and Certifications 
</h2>
            <p>Certifications Browse the documents available through the Office of the Registrar. Check the requirements, processing time, and applicable fees for each document before submitting your request.</p>
          </div>
          <div id="catalogBody">${Views.catalogBody()}</div>
        </div>
      </section>

      <footer class="site-footer" id="contact">
        <div class="shell">
          <div class="foot-grid">
            <div class="foot-brand">
              <div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>1.	Pamantasan ng Lungsod ng Muntinlupa </b><span>Office of the Registrar</span></div></div>
              <p>Pamantasan ng Lungsod ng Muntinlupa<br>University Road, Poblacion, Muntinlupa City, Philippines</p>
              <p class="foot-note">${icon('shieldCheck')} Compliant with RA 10173 (Data Privacy Act)</p>
            </div>
            <div class="foot-col"><h4>University services</h4><ul class="foot-list">
              <li><button class="link" type="button" data-act="home">Home &amp; document catalog</button></li>
              <li><button class="link" type="button" data-act="openLogin">Request academic document</button></li>
              <li><button class="link" type="button" data-act="openLogin">View requests &amp; claiming slip</button></li>
            </ul></div>
            <div class="foot-col"><h4>Releasing window</h4>
              <p><b>Main Service Counter</b><br>Ground Floor, Administration Building</p>
              <p class="foot-muted">One designated window for all approved releases: certifications, credentials, diplomas and CAV.</p>
            </div>
            <div class="foot-col"><h4>Hotlines &amp; support</h4><ul class="foot-list plain">
              <li>${icon('phone')} (02) 8659-5247</li>
              <li>${icon('mail')} registrar@plmun.edu.ph</li>
              <li>${icon('mapPin')} Admin Building, Room 101</li>
            </ul></div>
          </div>
          <div class="foot-bottom">
            <span>© 2026 Pamantasan ng Lungsod ng Muntinlupa. All rights reserved.</span>
            <span>Strictly observe your appointment slot · No walk-ins without a reservation</span>
          </div>
        </div>
      </footer>
    </div>`;
  },
  catalogBody() {
    const cats = ['All', 'Certifications', 'Credentials', 'Diplomas'];
    const cat = UI.state.cat;
    const all = Store.db.docs.map(docMeta);
    const list = cat === 'All' ? all : all.filter(d => d.cat === cat);
    return `<div class="catalog-bar">
      <div class="chips">${cats.map(c => `<button class="chip${c === cat ? ' is-active' : ''}" type="button" data-act="cat" data-cat="${c}" aria-pressed="${c === cat}">${c}</button>`).join('')}</div>
      <p class="catalog-count">${list.length} of ${all.length} document types available</p>
    </div>
    <div class="doc-grid">${list.length ? list.map(docCard).join('') : `<p class="catalog-empty">No documents in this category yet.</p>`}</div>`;
  },
  auth() {
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<div class="auth-wrap">
      <aside class="brand-panel"><img class="watermark" src="logo.png" alt="">
       <div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun</b><span>Pamantasan ng Lungsod ng Muntinlupa</span></div></div>
        <div class="brand-copy"><p class="eyebrow">PLMUN REGISTRAR PORTAL </p><h1>Document Request <em>System</em></h1>
          <p>Track. Receive. Your records and your privacy, in one clear place.  To this “Submit document requests, track their status, and arrange pickup in one convenient place</p>
          <div class="pills"></div></div>
        <small>© 2026 Pamantasan ng Lungsod ng Muntinlupa · All rights reserved</small></aside>
      <div class="form-panel">
        <button class="btn btn-ghost btn-sm auth-back" type="button" data-act="home">${icon('arrowLeft')}<span>Home</span></button>
        <button class="btn btn-outline btn-sm fab" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Light' : 'Dark'}</span></button>
        ${UI.state.authMode === 'register' ? Views.registerForm() : Views.loginForm()}
      </div></div>`;
  },
  loginForm() {
    return `<form class="signin" data-form="login" novalidate>
      <img class="seal" src="logo.png" alt="PLMun seal"><p class="eyebrow">Official Student Document Request & Scheduling System</p>
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
      <p class="signin-alt">New to the portal? <button class="link" type="button" data-act="showRegister">Create an account</button></p>
    </form>`;
  },
  registerForm() {
    const opts = PROGRAMS.map(g => `<optgroup label="${esc(g.college)}">${g.programs.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</optgroup>`).join('');
    return `<form class="signin signin-register" data-form="register" novalidate>
      <img class="seal" src="logo.png" alt="PLMun seal"><p class="eyebrow">Student Registration</p>
      <h2>Create your account</h2><p class="signin-desc">Register with your PLMun details to request and track documents.</p>
      <div class="reg-grid">
        <div class="field"><label for="regName">Full name</label>
          <input id="regName" name="fullname" type="text" autocomplete="name" placeholder="Juan Dela Cruz" maxlength="80" required></div>
        <div class="field"><label for="regSno">Student ID number</label>
          <input id="regSno" name="sno" type="text" inputmode="numeric" placeholder="2022-00123" maxlength="10" required></div>
      </div>
      <div class="field"><label for="regProgram">Academic degree program</label>
        <select id="regProgram" name="program" required>
          <option value="" selected disabled>Select your degree program</option>${opts}</select>
        <p class="field-hint" id="regCollege">Choose your program to see its college.</p></div>
      <div class="field"><label for="regEmail">PLMun email address</label>
        <input id="regEmail" name="email" type="email" autocomplete="username" placeholder="name@plmun.edu.ph" required>
        <p class="field-hint">Use your official @plmun.edu.ph address.</p></div>
      <div class="field"><label for="regPassword">Password</label>
        <div class="pw"><input id="regPassword" name="password" type="password" autocomplete="new-password" placeholder="At least 8 characters" required>
        <button class="btn btn-ghost btn-sm pw-toggle" type="button" data-act="showpw">${icon('eye')}<span>Show</span></button></div></div>
      <div class="field"><label for="regConfirm">Confirm password</label>
        <div class="pw"><input id="regConfirm" name="confirm" type="password" autocomplete="new-password" placeholder="Re-enter password" required>
        <button class="btn btn-ghost btn-sm pw-toggle" type="button" data-act="showpw">${icon('eye')}<span>Show</span></button></div></div>
      <p id="regErr" class="err" role="alert"></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit">Create account ${icon('arrowRight')}</button>
      <p class="signin-alt">Already have an account? <button class="link" type="button" data-act="showLogin">Sign in</button></p>
    </form>`;
  },
  student(u) {
    const mine = Store.db.requests.filter(r => r.owner === u.id), c = s => mine.filter(r => r.status === s).length;
    return `<div class="stats">${stat('Total requests', mine.length, 'fileText')}${stat('Pending', c('Pending'), 'clock', 'Pending')}
      ${stat('In progress', c('Processing') + c('Ready for Pickup'), 'loader', 'Processing')}${stat('Released', c('Released'), 'checkCircle', 'Released')}
      ${stat('Appointments', mine.filter(r => r.pickup && r.status !== 'Released' && r.status !== 'Rejected').length, 'calendar')}</div>
      ${Views.protocolCard(u)}
      ${Views.wizard(u)}
      <section class="card">${cardHeader('My requests', 'Track status, appointments and schedule a pickup when your document is ready.')}
        ${tableShell(['Request', 'Document', 'Copies', 'Date', 'Status', 'Pickup', 'Actions'], [...FLOW, 'Rejected'])}</section>`;
  },
  protocolCard(u) {
    const w = UI.wizardFor(u);
    return `<section class="card protocol-card" id="protocolCard">
      ${cardHeader('Document request protocol', 'Complete the four-step protocol to request academic credentials. Pickup scheduling opens once the Registrar marks your request as Ready for Pickup.')}
      <ol class="stepper">${WIZ_STEPS.map(s => {
      const cls = s.n === w.step ? 'is-current' : s.n < w.step ? 'is-done' : '';
      return `<li class="step-tab ${cls}"${s.n === w.step ? ' aria-current="step"' : ''}>
          <span class="step-label">${s.label}</span><span class="step-desc">${esc(s.desc)}</span></li>`;
    }).join('')}</ol>
    </section>`;
  },
  wizard(u) {
    const w = UI.wizardFor(u);
    const gated = w.step === 1 && !w.ack && !isAcked(u);
    const step = WIZ_STEPS[w.step - 1];
    return `<section class="card wizard-card" id="wizardCard">
      ${cardHeader(`${step.label} · ${step.desc}`, step.hint)}
      <div id="wizardStage">${Views.wizardStage(u, w)}</div>
      <div class="wizard-actions">
        <button class="btn btn-outline" type="button" data-act="wizBack"${w.step === 1 ? ' disabled' : ''}>${icon('arrowLeft')} Back</button>
        <button class="btn btn-primary" type="button" data-act="wizNext" id="wizNext"${gated ? ' disabled' : ''}>
          ${w.step === 4 ? `${icon('send')} Submit request` : `Continue ${icon('arrowRight')}`}
        </button>
      </div>
    </section>`;
  },
  wizardStage(u, w) {
    if (w.step === 1) return `<div class="wiz-panel">
      <div class="wiz-warning">
        <h3>${icon('shieldCheck')} Official warning to all students and applicants</h3>
        <p>Submitting false information, making unauthorized document requests, or claiming documents without proper permission is a serious violation of school policies and may have legal consequences.</p>
        <ul>
          <li><b>False information and fraudulent applications.</b> Providing false personal information, using another student's identity, or submitting a request without the student's knowledge and authorization is strictly prohibited.</li>
          <li><b>Unauthorized document requests.</b> Request documents only for yourself, or for another person when you have proper authorization. Using another person's information without their consent is prohibited.</li>
          <li><b>Protection of personal information.</b> All information must be accurate and used only for legitimate academic purposes. Unauthorized access, misuse or disclosure may violate the Data Privacy Act of 2012.</li>
        </ul>
        <p>PLMUN reserves the right to verify submitted information, reject suspicious or unauthorized requests, and refer violations to the appropriate school authorities.</p>
      </div>
      <div class="wiz-toolbar">
        <button class="btn btn-outline btn-sm" type="button" data-act="openWarning">${icon('fileText')} Read the full official warning</button>
        <span class="small muted">Step 1 of 4</span>
      </div>
      <label class="check">
        <input type="checkbox" id="wizAck"${w.ack || isAcked(u) ? ' checked' : ''}>
        <span><b>Acknowledgment of Official Warning.</b> I have read and understood the Official Warning. I certify that I am submitting this request for a legitimate purpose and that the information I provide is true and accurate. I consent to the processing of my personal data in accordance with the Data Privacy Act of 2012.</span>
      </label>
    </div>`;

    if (w.step === 2) return `<div class="wiz-panel">
      <div class="wiz-section">
        <div class="wiz-section-head">
          <h3>${icon('shieldCheck')} Student identity</h3>
          <p>These details are locked to your official Registrar record.</p>
        </div>
        <div class="wiz-grid wiz-grid-2">
          <div class="field"><label for="wizName">Full name</label><input id="wizName" value="${esc(u.name)}" readonly></div>
          <div class="field"><label for="wizSno">Student ID number</label><input id="wizSno" value="${esc(u.sno)}" readonly></div>
        </div>
      </div>
      <div class="wiz-section">
        <div class="wiz-section-head">
          <h3>${icon('graduationCap')} Academic &amp; contact details</h3>
          <p>Confirm your enrolled program and active contact channels.</p>
        </div>
        <div class="field"><label for="wizProgram">Course / Program</label>
          <select id="wizProgram">${PROGRAMS.map(g => `<optgroup label="${esc(g.college)}">${g.programs.map(p => `<option value="${esc(p)}"${p === w.program ? ' selected' : ''}>${esc(p)}</option>`).join('')}</optgroup>`).join('')}</select>
          <p class="field-hint" id="wizCollege">${esc(collegeOf(w.program))}</p></div>
        <div class="wiz-grid wiz-grid-2">
          <div class="field"><label for="wizEmail">Institutional email</label>
            <input id="wizEmail" type="email" value="${esc(w.email)}" placeholder="name@plmun.edu.ph" autocomplete="email">
            <p class="field-hint">Used for Registrar updates and account sign-in.</p></div>
          <div class="field"><label for="wizMobile">Active mobile number</label>
            <input id="wizMobile" type="tel" value="${esc(w.mobile)}" placeholder="0917 123 4567" autocomplete="tel" inputmode="tel" maxlength="16">
            <p class="field-hint">Reachable during processing and pickup.</p></div>
        </div>
      </div>
      <div class="wiz-section">
        <div class="wiz-section-head">
          <h3>${icon('fileText')} Request details</h3>
          <p>Tell the Registrar why you need this document.</p>
        </div>
        <div class="field"><label for="wizPurpose">Purpose of request</label>
          <select id="wizPurpose">${PURPOSES.map(p => `<option${p === w.purpose ? ' selected' : ''}>${esc(p)}</option>`).join('')}</select></div>
      </div>
      <span class="small muted">Step 2 of 4</span>
    </div>`;

    if (w.step === 3) {
      const meta = docMeta(w.doc);
      const rep = w.receiver === 'rep';
      return `<div class="wiz-panel">
        <div class="wiz-section">
          <div class="wiz-section-head">
            <h3>${icon('fileText')} Document &amp; copies</h3>
            <p>Choose the credential and the number of copies you need.</p>
          </div>
          <div class="field"><label for="wizDoc">Document</label>
            <select id="wizDoc">${Store.db.docs.map(d => `<option${d === w.doc ? ' selected' : ''}>${esc(d)}</option>`).join('')}</select></div>
          <div class="wiz-doc-meta">
            <div><small>Category</small><strong>${esc(meta.cat)}</strong></div>
            <div><small>Turnaround</small><strong>${esc(meta.days)} work days</strong></div>
            <div><small>Fee</small><strong>₱${meta.fee}.00 <span>/ ${esc(meta.unit)}</span></strong></div>
          </div>
          ${w.doc === OTHER_DOC ? `<div class="field"><label for="wizOther">Specify certificate</label><input id="wizOther" maxlength="80" value="${esc(w.other)}" placeholder="e.g. Certificate of Good Moral Character"></div>` : ''}
          <div class="field"><label for="wizCopies">Number of copies</label><input id="wizCopies" type="number" min="1" max="5" value="${w.copies}"></div>
          <div class="wiz-estimate">Estimated fee <strong>₱${(meta.fee * w.copies).toFixed(2)}</strong></div>
        </div>

        <div class="wiz-section">
          <div class="wiz-section-head">
            <h3>${icon('users')} Document retrieval authorization</h3>
            <p>Tell the Registrar who will claim the document at the Registrar Releasing Window.</p>
          </div>
          <div class="wiz-choice" role="radiogroup" aria-label="Who will claim the document?">
            <label class="wiz-choice-card">
              <input type="radio" name="wizReceiver" value="self"${rep ? '' : ' checked'}>
              <span><b>Myself (student)</b><small>I will claim the document in person.</small></span>
            </label>
            <label class="wiz-choice-card">
              <input type="radio" name="wizReceiver" value="rep"${rep ? ' checked' : ''}>
              <span><b>Authorized representative</b><small>Someone else will claim it on my behalf.</small></span>
            </label>
          </div>
          ${rep ? `<div class="wiz-grid wiz-grid-2">
            <div class="field"><label for="wizRepName">Representative's full name</label>
              <input id="wizRepName" maxlength="80" value="${esc(w.repName)}" placeholder="e.g. Maria Dela Cruz" autocomplete="name"></div>
            <div class="field"><label for="wizRepRelation">Relationship to student</label>
              <select id="wizRepRelation">${RELATIONSHIPS.map(x => `<option${x === w.repRelation ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
          </div>
          <div class="field"><label for="wizRepId">Type of valid ID to be presented</label>
            <select id="wizRepId">${ID_TYPES.map(x => `<option${x === w.repId ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></div>
          <label class="check"><input type="checkbox" id="wizRepLetter"${w.repLetter ? ' checked' : ''}>
            <span><b>Authorization letter ready.</b> I will provide a signed authorization letter, a photocopy of my PLMun Student ID, and the representative's valid government-issued ID at the Registrar Releasing Window.</span></label>` : ''}
          <div class="wiz-protocol">${icon('shieldCheck')}<div>
            <b>Claiming protocol at the Registrar Releasing Window</b>
            <ul>
              <li>Students claiming in person must present the printed request slip or QR code and their valid PLMun Student ID.</li>
              <li>Authorized representatives must present a signed authorization letter, a photocopy of the student's valid ID, and their own valid government-issued ID.</li>
              <li>Claim the document within 90 calendar days; unclaimed documents are subject to Registrar storage disposal.</li>
            </ul>
          </div></div>
        </div>
        <span class="small muted">Step 3 of 4</span>
      </div>`;
    }

    const meta = docMeta(w.doc);
    const fee = (meta.fee * w.copies).toFixed(2);
    const rep = w.receiver === 'rep';
    const pay = paymentMeta(w.payment);
    const summaryGroup = (ic, title, rows) => `<section class="wiz-summary-group">
      <h3 class="wiz-summary-title">${icon(ic)} ${title}</h3>
      <dl class="wiz-summary-list">${rows.map(([label, value]) => `<div class="wiz-summary-row"><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
    </section>`;
    return `<div class="wiz-panel">
      <div class="wiz-section">
        <div class="wiz-section-head">
          <h3>${icon('clipboardCheck')} Review your request</h3>
          <p>Confirm every detail below. Submitted requests are final and can no longer be modified.</p>
        </div>
        <div class="wiz-summary">
          ${summaryGroup('graduationCap', 'Student details', [
            ['Full name', esc(u.name)],
            ['Student ID', `<span class="mono">${esc(u.sno)}</span>`],
            ['Program', esc(w.program)],
            ['Institutional email', `<span class="mono">${esc(w.email || '—')}</span>`],
            ['Mobile number', esc(w.mobile || '—')]
          ])}
          ${summaryGroup('fileText', 'Request details', [
            ['Document', esc(w.doc)],
            ['Copies', `${w.copies} ${w.copies === 1 ? 'copy' : 'copies'}`],
            ['Purpose', esc(w.purpose || '—')],
            ['Estimated fee', `<strong class="receipt-highlight">₱${fee}</strong>`]
          ])}
          ${summaryGroup('users', 'Retrieval authorization', [
            ['Authorized claimant', rep ? `${esc(w.repName)} · ${esc(w.repRelation)}` : 'Myself (student)'],
            ['Claiming location', 'Registrar Releasing Window 1'],
            ...(rep ? [
              ['Representative ID', esc(w.repId)],
              ['Authorization letter', `${icon('checkCircle')} Ready to present`]
            ] : [
              ['ID to present', 'PLMun Student ID']
            ])
          ])}
          ${summaryGroup('creditCard', 'Payment', [
            ['Payment method', pay.full],
            ['Amount due', `<strong class="receipt-highlight">₱${fee}</strong>`],
            ['Payment timing', w.payment === 'online' ? 'After submission' : 'Before claiming']
          ])}
        </div>
      </div>

      <div class="wiz-section">
        <div class="wiz-section-head">
          <h3>${icon('creditCard')} Payment method</h3>
          <p>Choose how you will settle the assessed fee. The Cashier verifies payment before the document is released.</p>
        </div>
        <div class="wiz-choice" role="radiogroup" aria-label="Payment method">
          ${PAYMENT_METHODS.map(p => `<label class="wiz-choice-card">
            <input type="radio" name="wizPayment" value="${p.key}"${w.payment === p.key ? ' checked' : ''}>
            <span><b>${p.label}</b><small>${p.desc}</small></span>
          </label>`).join('')}
        </div>
        <div class="wiz-pay-note">${icon('info')}<span>${w.payment === 'online'
          ? 'After submitting, pay through the online channel and keep your payment reference. Online payments are verified by the Cashier before release.'
          : "Pay the assessed fee at the University Cashier's Office. Bring your printed request slip or QR code when claiming at the Registrar Releasing Window."}</span></div>
      </div>

      <div class="wiz-window">${icon('calendar')}<div><b>Pickup scheduling</b><span>Choose a date and time at the Registrar Releasing Window once the Registrar marks your request as Ready for Pickup. A Schedule button will then appear on your request.</span></div></div>
      <div class="wiz-window">${icon('mapPin')}<div><b>Registrar Releasing Window</b><span>Ground Floor, Administration Building · Each slot is ${PICKUP.stepMin} minutes, up to ${PICKUP.capacity} students.</span></div></div>
      <span class="small muted">Step 4 of 4</span>
    </div>`;
  },
  regTabs() {
    const all = Store.db.requests;
    const count = t => t.statuses ? all.filter(r => t.statuses.includes(r.status)).length : all.length;
    return `<div class="queue-tabs" role="tablist" aria-label="Request queue">
      ${REG_TABS.map(t => `<button class="queue-tab${UI.state.regTab === t.key ? ' is-active' : ''}" type="button" role="tab" aria-selected="${UI.state.regTab === t.key}" data-act="regTab" data-tab="${t.key}">
        <span>${t.label}</span> <span class="queue-tab-count">${count(t)}</span>
      </button>`).join('')}
    </div>`;
  },
  pickupAppointments() {
    const rank = { 'Ready for Pickup': 0, 'Released': 1 };
    const list = Store.db.requests
      .filter(r => r.pickup && Object.prototype.hasOwnProperty.call(rank, r.status))
      .sort((a, b) => (rank[a.status] - rank[b.status]) || `${a.pickup.date} ${a.pickup.time || ''}`.localeCompare(`${b.pickup.date} ${b.pickup.time || ''}`));
    const body = list.length ? `<div class="wrap"><table>
      <thead><tr><th scope="col">Request</th><th scope="col">Appointment</th><th scope="col">Student</th><th scope="col">Document</th><th scope="col">Claimant</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
      <tbody>${list.map(r => {
        const student = Store.db.users.find(x => x.id === r.owner);
        const claimant = r.receiver === 'rep' && r.claimant ? `${r.claimant.name} · ${r.claimant.relation}` : 'Student (in person)';
        return `<tr>
          <td data-label="Request"><div class="req-cell"><span class="mono req-link">${esc(r.id)}</span><span class="trk-code">${esc(reqTracking(r))}</span></div></td>
          <td data-label="Appointment"><span class="pickup-when">${icon('calendar')} ${fmtPickup(r.pickup)}</span></td>
          <td data-label="Student"><div class="user-cell"><strong>${esc(student ? student.name : 'Unknown')}</strong><small class="muted mono block">${esc(student ? student.sno : '')}</small></div></td>
          <td data-label="Document">${esc(r.type)}</td>
          <td data-label="Claimant">${esc(claimant)}</td>
          <td data-label="Status"><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</td>
          <td class="table-actions" data-label="Actions"><div class="action-group">
            <button class="btn btn-outline btn-sm" type="button" data-act="viewReqOverview" data-id="${esc(r.id)}" title="View request details">${icon('eye')} View</button>
            ${r.status === 'Ready for Pickup'
              ? `<button class="btn btn-primary btn-sm" type="button" data-act="markReleased" data-id="${esc(r.id)}" title="Mark this document as released">${icon('checkCircle')} Release</button>`
              : `<button class="btn btn-outline btn-sm" type="button" data-act="viewReceipt" data-id="${esc(r.id)}" title="Print official receipt">${icon('printer')} Receipt</button>`}
          </div></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>` : `<div class="empty-state queue-empty">
      <span class="empty-icon">${icon('calendar')}</span>
      <span>No pickup appointments yet.</span>
      <span class="empty-hint">Slots appear here once a student books a ready-for-pickup request.</span>
    </div>`;
    return `<section class="card" id="pickupAppointments">
      ${cardHeader('Pickup appointments', 'Confirmed releasing-window slots for approved requests, including the authorized claimant.')}
      ${body}
    </section>`;
  },
  registrar() {
    const all = Store.db.requests, c = s => all.filter(r => r.status === s).length;
    const appts = all.filter(r => r.pickup && r.status === 'Ready for Pickup').length;
    return `<div class="stats">
      ${stat('Pending review', c('Pending'), 'clock', 'Pending')}${stat('Approved', c('Processing'), 'loader', 'Processing')}
      ${stat('Ready for pickup', c('Ready for Pickup'), 'packageCheck', 'Ready for Pickup')}${stat('Released', c('Released'), 'checkCircle', 'Released')}
      ${stat('Pickup appointments', appts, 'calendar')}</div>
      <section class="card" id="registrarQueue">
        ${cardHeader('Request queue', 'Review submitted applications, approve qualified requests, and move documents through fulfillment.')}
        ${Views.regTabs()}
        ${tableShell(['Request', 'Student', 'Document', 'Date', 'Status', 'Pickup', 'Actions'], [], false)}
      </section>
      ${Views.pickupAppointments()}`;
  },
  admin() {
    const regs = Store.db.users.filter(u => u.role === 'registrar'), c = s => regs.filter(u => u.status === s).length;
    const docs = Store.db.docs, used = d => Store.db.requests.filter(r => r.type === d).length;
    return `<div class="stats">${stat('Registrars', regs.length, 'users')}${stat('Active', c('active'), 'checkCircle', 'active')}
      ${stat('Invited', c('invited'), 'mail', 'invited')}${stat('Disabled', c('disabled'), 'ban', 'disabled')}
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
          <thead><tr><th scope="col">Document type</th><th scope="col">Category</th><th scope="col">Requests</th><th scope="col">Actions</th></tr></thead>
          <tbody>${docs.length ? docs.map(d => `<tr>
            <td data-label="Document type">${esc(d)}</td>
            <td data-label="Category">${esc(docMeta(d).cat)}</td>
            <td data-label="Requests">${used(d)}</td>
            <td data-label="Actions"><button class="btn btn-danger btn-sm" type="button" data-act="deleteDoc" data-doc="${esc(d)}">${icon('trash')} Delete</button></td>
          </tr>`).join('') : `<tr><td class="empty" colspan="4"><div class="empty-state"><span class="empty-icon">${icon('inbox')}</span><span>No document types configured.</span></div></td></tr>`}</tbody>
        </table></div>
      </section>`;
  },
  rows() {
    const u = Auth.user; if (!u) return '';
    const { q, status } = UI.state, t = q.trim().toLowerCase();
    let list = u.role === 'student' ? Store.db.requests.filter(r => r.owner === u.id)
      : u.role === 'registrar' ? Store.db.requests
        : Store.db.users.filter(x => x.role === 'registrar');
    if (u.role === 'registrar') {
      const tab = REG_TABS.find(x => x.key === UI.state.regTab) || REG_TABS[0];
      if (tab.statuses) list = list.filter(r => tab.statuses.includes(r.status));
    }
    list = list.filter(r => {
      if (status && r.status !== status) return false;
      if (!t) return true;
      const student = r.owner ? Store.db.users.find(x => x.id === r.owner) : null;
      return [r.id, r.trackingCode, r.type, r.purpose, student?.name, student?.sno, r.name, r.email]
        .some(v => v && String(v).toLowerCase().includes(t));
    });
    if (!list.length) {
      const cols = u.role === 'admin' ? 4 : 7;
      const regEmpty = {
        pending: ['No submitted requests waiting for review.', 'New student submissions will appear here.'],
        approved: ['No approved requests in processing.', 'Approve a submitted request to move it here.'],
        ready: ['No documents are ready for pickup.', 'Mark an approved request ready once it is prepared.'],
        released: ['No documents have been released yet.', 'Released documents are tracked here for records.'],
        rejected: ['No rejected requests.', 'Rejected submissions will appear here.'],
        all: ['No requests in the queue yet.', 'New student submissions will appear here.']
      };
      const [msg, hint] = u.role === 'registrar' && !t ? (regEmpty[UI.state.regTab] || ['Nothing matches yet.', 'Try a different search or filter.']) : ['Nothing matches yet.', 'Try a different search or filter.'];
      return `<tr><td class="empty" colspan="${cols}"><div class="empty-state">
        <span class="empty-icon">${icon('inbox')}</span><span>${msg}</span>
        <span class="empty-hint">${hint}</span></div></td></tr>`;
    }
    return list.map(r => {
      if (u.role === 'student') {
        const trk = reqTracking(r);
        return `<tr>
          <td data-label="Request"><div class="req-cell"><span class="mono">${esc(r.id)}</span><span class="trk-code">${esc(trk)}</span></div></td>
          <td data-label="Document">${esc(r.type)}</td>
          <td data-label="Copies">${r.copies || 1}</td>
          <td data-label="Date">${fmtDate(r.date)}</td>
          <td data-label="Status"><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</td>
          <td data-label="Pickup">${pickupCell(r)}</td>
          <td data-label="Actions"><button class="btn btn-outline btn-sm" type="button" data-act="viewReceipt" data-id="${esc(r.id)}" title="Print Official Receipt with QR Code">${icon('printer')} Print Receipt</button></td>
        </tr>`;
      }
      if (u.role === 'registrar') {
        const student = Store.db.users.find(x => x.id === r.owner);
        const trk = reqTracking(r);
        return `<tr class="clickable-row" data-act="viewReqOverview" data-id="${esc(r.id)}" tabindex="0" role="button" aria-label="View request details for ${esc(r.id)}">
          <td data-label="Request"><div class="req-cell"><span class="mono req-link">${esc(r.id)}</span><span class="trk-code">${esc(trk)}</span></div></td>
          <td data-label="Student">
            <div class="user-cell">
              <strong>${esc(student ? student.name : 'Unknown')}</strong>
              <small class="muted mono block">${esc(student ? student.sno : '')}</small>
            </div>
          </td>
          <td data-label="Document">${esc(r.type)}</td>
          <td data-label="Date">${fmtDate(r.date)}</td>
          <td data-label="Status"><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</td>
          <td data-label="Pickup">${r.pickup ? `<span class="pickup-when">${icon('calendar')} ${fmtPickup(r.pickup)}</span>` : '<span class="muted">—</span>'}</td>
          <td class="table-actions" data-label="Actions">
            <div class="action-group">
              <button class="btn btn-outline btn-sm" type="button" data-act="viewReqOverview" data-id="${esc(r.id)}" title="View complete request details">${icon('eye')} ${r.status === 'Pending' ? 'Review' : 'View'}</button>
              ${r.status === 'Pending' ? `<button class="btn btn-primary btn-sm" type="button" data-act="approve" data-id="${esc(r.id)}" title="Approve this request">${icon('check')} Approve</button>` : ''}
              ${r.status === 'Processing' ? `<button class="btn btn-primary btn-sm" type="button" data-act="markReady" data-id="${esc(r.id)}" title="Mark this document ready for pickup">${icon('packageCheck')} Mark ready</button>` : ''}
              ${r.status === 'Ready for Pickup' ? `<button class="btn btn-primary btn-sm" type="button" data-act="markReleased" data-id="${esc(r.id)}" title="Mark this document as released">${icon('checkCircle')} Release</button>` : ''}
              ${['Pending', 'Processing'].includes(r.status) ? `<button class="btn btn-danger btn-sm" type="button" data-act="reject" data-id="${esc(r.id)}" title="Reject this request">${icon('x')} Reject</button>` : ''}
              ${r.status === 'Released' ? `<button class="btn btn-outline btn-sm" type="button" data-act="viewReceipt" data-id="${esc(r.id)}" title="Print official receipt">${icon('printer')} Receipt</button>` : ''}
            </div>
          </td>
        </tr>`;
      }
      return `<tr><td data-label="Name">${esc(r.name)}</td><td data-label="Email">${esc(r.email)}</td><td data-label="Status"><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</td><td data-label="Actions">
        ${r.status === 'invited' ? `<button class="btn btn-outline btn-sm" data-act="invite" data-id="${r.id}">${icon('mail')} View invite</button>` : ''}
        ${r.status === 'active' ? `<button class="btn btn-danger btn-sm" data-act="toggle" data-id="${r.id}">${icon('ban')} Disable</button>` : ''}
        ${r.status === 'disabled' ? `<button class="btn btn-outline btn-sm" data-act="toggle" data-id="${r.id}">${icon('check')} Enable</button>` : ''}</td></tr>`;
    }).join('');
  }
};

/* ===== UI controller ===== */
const UI = {
  state: { q: '', status: '', regTab: 'pending', view: 'home', cat: 'All', preselect: '', authMode: 'login', notifOpen: false },
  schedule: null,
  wizard: null,
  reset() {
    this.state = { q: '', status: '', regTab: 'pending', view: 'home', cat: 'All', preselect: this.state.preselect, authMode: 'login', notifOpen: false };
    this.schedule = null;
    this.wizard = null;
    $('#mail').open && $('#mail').close();
    $('#sched').open && $('#sched').close();
    $('#profile').open && $('#profile').close();
    $('#warning').open && $('#warning').close();
    $('#receipt') && $('#receipt').open && $('#receipt').close();
    $('#reqDetails') && $('#reqDetails').open && $('#reqDetails').close();
    $('#submitConfirm') && $('#submitConfirm').open && $('#submitConfirm').close();
    this.render();
  },
  render() {
    const authed = !!Auth.user, mode = authed ? 'app' : UI.state.view;
    document.body.classList.toggle('auth', !authed && mode === 'auth');
    document.body.classList.toggle('landing', !authed && mode === 'home');
    this.nav();
    $('#app').innerHTML = authed
      ? Welcome(Auth.user.role) + Views[Auth.user.role](Auth.user)
      : mode === 'auth' ? Views.auth() : Views.landing();
    if (authed) this.paintRows();
    this.warnIfNeeded();
  },
  paintRows() { const b = $('#rows'); if (b) b.innerHTML = Views.rows(); },
  paintCatalog() { const b = $('#catalogBody'); if (b) b.innerHTML = Views.catalogBody(); },
  wizardFor(u) {
    if (!this.wizard || this.wizard.owner !== u.id) {
      this.wizard = {
        owner: u.id,
        step: 1,
        ack: isAcked(u),
        program: PROGRAM_LIST.includes(u.program) ? u.program : DEFAULT_PROGRAM,
        email: u.email || '',
        mobile: u.mobile || '',
        doc: (this.state.preselect && Store.db.docs.includes(this.state.preselect)) ? this.state.preselect : Store.db.docs[0],
        copies: 1,
        purpose: PURPOSES[0],
        payment: 'cashier',
        other: '',
        receiver: 'self',
        repName: '',
        repRelation: RELATIONSHIPS[0],
        repId: ID_TYPES[0],
        repLetter: false
      };
    }
    return this.wizard;
  },
  renderWizard() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    const protocol = $('#protocolCard');
    if (protocol) protocol.outerHTML = Views.protocolCard(u);
    const card = $('#wizardCard');
    if (card) card.outerHTML = Views.wizard(u);
  },
  warnIfNeeded() {
    const u = Auth.user;
    if (u && u.role === 'student' && !isAcked(u)) return Warning.open(true);
    const dlg = $('#warning');
    if (dlg && dlg.open && dlg.dataset.gated === '1') dlg.close();
  },
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
    if (!u) {
      $('#nav').innerHTML = `<div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>Pamantasan ng Lungsod ng Muntinlupa </b><span>Official Student Document Request & Scheduling System</span></div></div>
        <div class="actions">
          <nav class="nav-links" aria-label="Page sections">
            <a href="#process">Process</a><a href="#documents">Documents</a><a href="#contact">Contact</a>
          </nav>
          <button class="btn btn-ghost btn-icon" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}</button>
          <button class="btn btn-primary btn-sm" data-act="openLogin">Sign in</button>
        </div>`;
      return;
    }
    const notifOpen = !!UI.state.notifOpen;
    const notifCount = (NOTIFICATIONS[u.role] || NOTIFICATIONS.student).length;
    $('#nav').innerHTML = `<div class="brand"><img class="seal" src="logo.png" alt="PLMun seal"><div><b>PLMun Portal</b><span>Official Student Document Request & Scheduling System</span></div></div>
      <div class="actions"><span class="badge s-role">${role[u.role]}</span>
        <div class="notif">
          <button class="btn btn-ghost btn-icon notif-btn" type="button" data-act="notifToggle" aria-label="Notifications (${notifCount})" aria-expanded="${notifOpen}"${notifOpen ? ' aria-controls="notifPanel"' : ''} title="Notifications">${icon('bell')}<span class="notif-count" aria-hidden="true">${notifCount}</span></button>
          ${notifOpen ? notifPanel(u.role) : ''}
        </div>
        <button class="btn btn-ghost btn-icon" data-act="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} mode">${icon(dark ? 'sun' : 'moon')}</button>
        ${u.role === 'student'
        ? `<button class="nav-user nav-user-btn" type="button" data-act="editProfile" title="Edit student profile">
              <span class="avatar" style="--avatar-hue:${hueOf(u.name)}" aria-hidden="true">${esc(initials(u.name))}</span>
              <span class="nav-user-name">${esc(u.name)}</span></button>`
        : `<div class="nav-user"><span class="avatar" style="--avatar-hue:${hueOf(u.name)}" aria-hidden="true">${esc(initials(u.name))}</span><span class="nav-user-name">${esc(u.name)}</span></div>`}
        <button class="btn btn-outline btn-sm" data-act="logout" aria-label="Sign out">${icon('logOut')}<span>Sign out</span></button></div>`;
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

/* ===== Official warning gate ===== */
const Warning = {
  gated: false,
  open(gated = false) {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    this.gated = !!gated && !isAcked(u);
    const dlg = $('#warning');
    const acked = isAcked(u);
    $('#warnAck').checked = acked;
    const btn = $('#warnAgree');
    btn.textContent = acked ? 'Close' : 'I understand and agree';
    btn.disabled = this.gated;
    const decline = $('#warnDecline');
    if (decline) decline.textContent = acked ? 'Sign out' : 'Decline & sign out';
    dlg.dataset.gated = this.gated ? '1' : '0';
    if (!dlg.open) dlg.showModal();
  }
};

/* ===== Student profile & academic program ===== */
const Profile = {
  show(u) {
    const opts = PROGRAMS.map(g => `<optgroup label="${esc(g.college)}">${g.programs.map(p => `<option value="${esc(p)}"${p === u.program ? ' selected' : ''}>${esc(p)}</option>`).join('')}</optgroup>`).join('');
    $('#profileBody').innerHTML = `<div class="profile-dialog-head">
      <span class="avatar avatar-lg" style="--avatar-hue:${hueOf(u.name)}" aria-hidden="true">${esc(initials(u.name))}</span>
      <div><strong>${esc(u.name)}</strong><small>Student No. ${esc(u.sno)}</small></div></div>
      <div class="profile-fields">
        <div class="field"><label for="program">Course / Program</label>
          <select id="program" name="program">${opts}</select>
          <p class="field-hint" id="collegeHint">${esc(collegeOf(u.program))}</p></div>
        <div class="field"><label for="yearLevel">Year level</label>
          <select id="yearLevel" name="yearLevel">${YEAR_LEVELS.map(y => `<option${y === u.yearLevel ? ' selected' : ''}>${esc(y)}</option>`).join('')}</select></div>
      </div>
      <p class="form-hint">This academic affiliation is attached to your document requests.</p>`;
    $('#profile').showModal();
  }
};

/* ===== Official Receipt & Verification Slip ===== */
const Receipt = {
  activeId: null,
  show(id) {
    const r = Store.db.requests.find(x => x.id === id);
    if (!r) return toast('Request record not found.', true);
    const u = Store.db.users.find(x => x.id === r.owner) || Auth.user;
    this.activeId = id;
    const content = this.html(r, u);
    const body = $('#receiptBody');
    if (body) body.innerHTML = content;
    const printEl = $('#printArea');
    if (printEl) printEl.innerHTML = content;
    const dlg = $('#receipt');
    if (dlg && !dlg.open) dlg.showModal();
  },
  print() {
    if (this.activeId) {
      const r = Store.db.requests.find(x => x.id === this.activeId);
      const u = r ? (Store.db.users.find(x => x.id === r.owner) || Auth.user) : Auth.user;
      const printEl = $('#printArea');
      if (r && u && printEl) printEl.innerHTML = this.html(r, u);
    }
    window.print();
  },
  html(r, u) {
    const trk = reqTracking(r);
    const numPart = (r.trackingCode ? r.trackingCode.replace(/^PLM-TRK-\d{4}-/, '') : (r.id || '').replace(/\D/g, '')) || '0000';
    const yr = r.date ? new Date(r.date).getFullYear() : 2026;
    const orNo = `OR-${yr}-${numPart}`;
    const meta = docMeta(r.type);
    const copies = r.copies || 1;
    const unitFee = meta.fee;
    const totalFee = (unitFee * copies).toFixed(2);
    const prog = r.program || u.program || DEFAULT_PROGRAM;
    const college = collegeOf(prog);
    const yrLevel = u.yearLevel || '1st Year';
    const purpose = r.purpose || 'Academic / Employment Verification';
    const qrPayload = `https://plmun.edu.ph/verify?ref=${encodeURIComponent(trk)}&req=${encodeURIComponent(r.id)}&sno=${encodeURIComponent(u.sno || '')}`;
    const qrSvg = QRCode.toSvg(qrPayload, 130);

    return `<div class="receipt-slip">
      <div class="receipt-header">
        <img class="receipt-seal" src="logo.png" alt="PLMun Seal">
        <div class="receipt-inst">
          <span class="inst-rep">Republic of the Philippines</span>
          <h3 class="inst-name">PAMANTASAN NG LUNGSOD NG MUNTINLUPA</h3>
          <span class="inst-sub">University Road, Poblacion, Muntinlupa City · (02) 8478-3585</span>
          <span class="inst-office">OFFICE OF THE UNIVERSITY REGISTRAR</span>
        </div>
      </div>

      <div class="receipt-title-bar">
        <span class="receipt-title">OFFICIAL RECEIPT &amp; TRANSACTION SLIP</span>
        <span class="receipt-or-badge">${esc(orNo)}</span>
      </div>

      <div class="receipt-meta-grid">
        <div class="receipt-meta-item">
          <small>Tracking Reference Code</small>
          <strong class="mono receipt-highlight">${esc(trk)}</strong>
        </div>
        <div class="receipt-meta-item">
          <small>Request ID</small>
          <strong class="mono">${esc(r.id)}</strong>
        </div>
        <div class="receipt-meta-item">
          <small>Date Filed</small>
          <strong>${fmtDate(r.date)}</strong>
        </div>
        <div class="receipt-meta-item">
          <small>Billing Status</small>
          <strong class="receipt-status-paid">${icon('checkCircle')} ASSESSED / CLEARED</strong>
        </div>
      </div>

      <div class="receipt-section">
        <h4 class="receipt-section-title">Student Information</h4>
        <div class="receipt-info-grid">
          <div><small>Student Name</small><strong>${esc(u.name)}</strong></div>
          <div><small>Student Number</small><strong class="mono">${esc(u.sno || 'N/A')}</strong></div>
          <div><small>Course / Program</small><strong>${esc(prog)}</strong></div>
          <div><small>College</small><span>${esc(college)}</span></div>
          <div><small>Year Level</small><span>${esc(yrLevel)}</span></div>
          <div><small>Student Email</small><span class="mono">${esc(u.email)}</span></div>
        </div>
      </div>

      <div class="receipt-section">
        <h4 class="receipt-section-title">Order Assessment &amp; Document Details</h4>
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Document Requested</th>
              <th>Purpose</th>
              <th class="text-center">Copies</th>
              <th class="text-right">Unit Fee</th>
              <th class="text-right">Amount (PHP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${esc(r.type)}</strong>
                <div class="receipt-doc-meta">${esc(meta.cat)} · Est. ${esc(meta.days)} work days</div>
              </td>
              <td>${esc(purpose)}</td>
              <td class="text-center">${copies}</td>
              <td class="text-right">₱${unitFee.toFixed(2)}</td>
              <td class="text-right"><strong>₱${totalFee}</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="text-right"><strong>Total Amount Assessed / Paid:</strong></td>
              <td class="text-right"><strong class="receipt-total-amount">₱${totalFee}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="receipt-section receipt-split">
        <div class="receipt-split-main">
          <h4 class="receipt-section-title">Releasing &amp; Claiming Information</h4>
          <div class="receipt-claim-box">
            <div class="receipt-claim-row">
              <span class="claim-label">Current Status:</span>
              <span><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</span>
            </div>
            <div class="receipt-claim-row">
              <span class="claim-label">Pickup Schedule:</span>
              <strong>${r.pickup ? `${icon('calendar')} ${fmtPickup(r.pickup)}` : '<span class="muted">No appointment reserved yet</span>'}</strong>
            </div>
            <div class="receipt-claim-row">
              <span class="claim-label">Authorized Claimant:</span>
              <span>${r.receiver === 'rep' && r.claimant ? `${esc(r.claimant.name)} (${esc(r.claimant.relation)})` : 'Student (in person)'}</span>
            </div>
            <div class="receipt-claim-row">
              <span class="claim-label">Payment Method:</span>
              <span>${esc(paymentMeta(r.payment).full)}</span>
            </div>
            <div class="receipt-claim-row">
              <span class="claim-label">Claiming Location:</span>
              <span>Registrar Releasing Window 1, Ground Flr, Admin Bldg</span>
            </div>
          </div>
          <div class="receipt-notes">
            <p><strong>Claiming Reminders:</strong></p>
            <ol>
              <li>Present this printed Official Receipt or digital QR code together with your valid PLMun Student ID upon claiming.</li>
              <li>For authorized representatives, present an Authorization Letter, photocopy of Student ID, and representative's valid government ID.</li>
              <li>Documents unclaimed after 90 calendar days are subject to registrar storage disposal.</li>
            </ol>
          </div>
        </div>

        <div class="receipt-qr-panel">
          <div class="receipt-qr-wrap">
            ${qrSvg}
          </div>
          <span class="receipt-qr-code mono">${esc(trk)}</span>
          <span class="receipt-qr-hint">Scan at Registrar Window to verify authenticity</span>
        </div>
      </div>

      <div class="receipt-footer-signatures">
        <div class="receipt-sig">
          <div class="sig-line"></div>
          <small>Student / Claimant Signature</small>
        </div>
        <div class="receipt-sig">
          <div class="sig-stamp-box">
            <span class="sig-stamp-seal">${icon('shieldCheck')} PLMun REGISTRAR</span>
            <span class="sig-stamp-text">OFFICIALLY RECORDED</span>
          </div>
          <small>University Registrar Officer</small>
        </div>
      </div>
    </div>`;
  }
};

/* ===== Request Overview Details Modal (Registrar & Admin) ===== */
const ReqDetails = {
  activeId: null,
  show(id) {
    const r = Store.db.requests.find(x => x.id === id);
    if (!r) return toast('Request record not found.', true);
    this.activeId = id;
    const student = Store.db.users.find(x => x.id === r.owner) || {};
    const meta = docMeta(r.type);
    const trk = reqTracking(r);
    const copies = r.copies || 1;
    const totalFee = (meta.fee * copies).toFixed(2);
    const prog = r.program || student.program || DEFAULT_PROGRAM;
    const college = collegeOf(prog);

    const badgeEl = $('#reqDetailsBadge');
    if (badgeEl) badgeEl.innerHTML = badge(r.status);

    const body = $('#reqDetailsBody');
    if (body) {
      body.innerHTML = `
        <div class="req-overview-grid">
          <div class="overview-strip">
            <div><small>Request ID</small><strong class="mono">${esc(r.id)}</strong></div>
            <div><small>Tracking Ref</small><strong class="mono receipt-highlight">${esc(trk)}</strong></div>
            <div><small>Date Filed</small><strong>${fmtDate(r.date)}</strong></div>
            <div><small>Current Status</small><div><span class="status-dot s-${slug(r.status)}"></span>${badge(r.status)}</div></div>
          </div>

          <div class="overview-card">
            <h3 class="overview-title">${icon('users')} Student Applicant Details</h3>
            <div class="overview-profile">
              <div class="avatar avatar-lg" style="--avatar-hue:${hueOf(student.name || '?')}" aria-hidden="true">
                ${esc(initials(student.name || '?'))}
              </div>
              <div class="overview-profile-info">
                <h4>${esc(student.name || 'Unregistered Applicant')}</h4>
                <p class="muted">Student No. <strong class="mono">${esc(student.sno || 'N/A')}</strong> · ${esc(student.yearLevel || '1st Year')}</p>
                <p class="small mono muted">${esc(student.email || '—')}</p>
              </div>
            </div>
            <div class="overview-data-grid">
              <div><small>Degree Program</small><strong>${esc(prog)}</strong></div>
              <div><small>College / Department</small><span>${esc(college)}</span></div>
              <div><small>Warning Acknowledged</small><span>${isAcked(student) ? `${icon('checkCircle')} Acknowledged (${fmtDate(student.warningAck.at)})` : '<span class="muted">Not yet acknowledged</span>'}</span></div>
              <div><small>Account Status</small><span><span class="status-dot s-${slug(student.status || 'active')}"></span>${badge(student.status || 'active')}</span></div>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="overview-title">${icon('fileText')} Document &amp; Fulfillment Assessment</h3>
            <div class="overview-data-grid">
              <div><small>Document Type</small><strong>${esc(r.type)}</strong></div>
              <div><small>Category</small><span>${esc(meta.cat)}</span></div>
              <div><small>Quantity</small><strong>${copies} ${copies === 1 ? 'copy' : 'copies'}</strong></div>
              <div><small>Unit Fee</small><span>₱${meta.fee}.00 / ${esc(meta.unit)}</span></div>
              <div><small>Total Assessed Fee</small><strong class="receipt-highlight">₱${totalFee}</strong></div>
              <div><small>Payment Method</small><span>${esc(paymentMeta(r.payment).full)}</span></div>
              <div><small>Est. Turnaround</small><span>${esc(meta.days)} work days</span></div>
            </div>
            <div class="overview-purpose-box">
              <small>Stated Purpose</small>
              <p>${esc(r.purpose || 'None specified')}</p>
            </div>
          </div>

          <div class="overview-card">
            <h3 class="overview-title">${icon('calendar')} Pickup &amp; Claiming Schedule</h3>
            <div class="overview-data-grid">
              <div>
                <small>Appointment Slot</small>
                <strong>${r.pickup ? `${icon('calendar')} ${fmtPickup(r.pickup)}` : '<span class="muted">No appointment reserved yet</span>'}</strong>
              </div>
              <div>
                <small>Authorized Claimant</small>
                <strong>${r.receiver === 'rep' && r.claimant ? esc(r.claimant.name) : 'Myself (student)'}</strong>
              </div>
              ${r.receiver === 'rep' && r.claimant ? `
              <div><small>Relationship</small><span>${esc(r.claimant.relation)}</span></div>
              <div><small>Representative ID</small><span>${esc(r.claimant.idType)}</span></div>
              <div><small>Authorization Letter</small><span>${icon('checkCircle')} To be presented at the window</span></div>` : ''}
              <div>
                <small>Releasing Window</small>
                <span>Registrar Releasing Window 1</span>
              </div>
              <div>
                <small>Campus Location</small>
                <span>Ground Floor, Administration Building</span>
              </div>
              <div>
                <small>Official Claiming Slip</small>
                <span><button class="btn btn-outline btn-sm" type="button" data-act="viewReceipt" data-id="${esc(r.id)}">${icon('printer')} View Receipt &amp; QR Slip</button></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    const footer = $('#reqDetailsFooter');
    if (footer) {
      const primary = r.status === 'Pending'
        ? `<button class="btn btn-primary" type="button" data-act="modalApprove" data-id="${esc(r.id)}">${icon('check')} Approve request</button>`
        : r.status === 'Processing'
          ? `<button class="btn btn-primary" type="button" data-act="modalReady" data-id="${esc(r.id)}">${icon('packageCheck')} Mark ready for pickup</button>`
          : r.status === 'Ready for Pickup'
            ? `<button class="btn btn-primary" type="button" data-act="modalRelease" data-id="${esc(r.id)}">${icon('checkCircle')} Mark released</button>`
            : '';
      footer.innerHTML = `
        <button class="btn btn-outline" type="button" data-act="close">Close</button>
        <button class="btn btn-outline" type="button" data-act="viewReceipt" data-id="${esc(r.id)}">${icon('printer')} Official Receipt</button>
        ${['Pending', 'Processing'].includes(r.status) ? `<button class="btn btn-danger" type="button" data-act="modalReject" data-id="${esc(r.id)}">${icon('x')} Reject</button>` : ''}
        ${primary}
      `;
    }

    const dlg = $('#reqDetails');
    if (dlg && !dlg.open) dlg.showModal();
  }
};

/* ===== Final submission confirmation ===== */
const SubmitConfirm = {
  show(u, w) {
    const meta = docMeta(w.doc);
    const fee = (meta.fee * w.copies).toFixed(2);
    const pay = paymentMeta(w.payment);
    const claimant = w.receiver === 'rep' ? `${w.repName} · ${w.repRelation}` : 'Myself (student)';
    const body = $('#submitConfirmBody');
    if (body) body.innerHTML = `
      <div class="confirm-warning">${icon('alertCircle')}<div>
        <b>This request will be final.</b>
        <span>Once submitted, you will no longer be able to modify the details of this request. Review the summary below before confirming.</span>
      </div></div>
      <div class="confirm-summary">
        <div><small>Document</small><strong>${esc(w.doc)}</strong></div>
        <div><small>Copies</small><strong>${w.copies}</strong></div>
        <div><small>Estimated fee</small><strong>₱${fee}</strong></div>
        <div><small>Payment method</small><strong>${pay.full}</strong></div>
        <div><small>Authorized claimant</small><strong>${esc(claimant)}</strong></div>
        <div><small>Student</small><strong>${esc(u.name)} · <span class="mono">${esc(u.sno)}</span></strong></div>
      </div>`;
    const dlg = $('#submitConfirm');
    if (dlg && !dlg.open) dlg.showModal();
  },
  confirm() {
    const u = Auth.user, w = UI.wizard;
    const dlg = $('#submitConfirm');
    if (dlg && dlg.open) dlg.close();
    if (!u || u.role !== 'student' || !w) return;
    Actions.wizSubmit(u, w);
  }
};

/* ===== Actions (click delegation) ===== */
const findReq = id => Store.db.requests.find(r => r.id === id);
const Actions = {
  viewReqOverview(el) {
    const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
    if (id) ReqDetails.show(id);
  },
  regTab(el) {
    UI.state.regTab = el.dataset.tab || 'pending';
    UI.render();
  },
  modalAdvance(el) {
    const id = el.dataset.id;
    Actions.advance(el);
    if (id) ReqDetails.show(id);
  },
  modalApprove(el) {
    const id = el.dataset.id;
    Actions.approve(el);
    if (id) ReqDetails.show(id);
  },
  modalReady(el) {
    const id = el.dataset.id;
    Actions.markReady(el);
    if (id) ReqDetails.show(id);
  },
  modalRelease(el) {
    const id = el.dataset.id;
    Actions.markReleased(el);
    if (id) ReqDetails.show(id);
  },
  modalReject(el) {
    const id = el.dataset.id;
    Actions.reject(el);
    if (id) ReqDetails.show(id);
  },
  viewReceipt(el) {
    const id = el.dataset.id;
    Receipt.show(id);
  },
  printReceipt() {
    Receipt.print();
  },
  confirmSubmit() {
    SubmitConfirm.confirm();
  },
  openLogin() {
    UI.state.authMode = 'login';
    UI.state.view = 'auth';
    UI.render();
    const email = $('#email');
    if (email) email.focus();
  },
  showRegister() {
    UI.state.authMode = 'register';
    UI.state.view = 'auth';
    UI.render();
    const name = $('#regName');
    if (name) name.focus();
    window.scrollTo(0, 0);
  },
  showLogin() {
    UI.state.authMode = 'login';
    UI.state.view = 'auth';
    UI.render();
    const email = $('#email');
    if (email) email.focus();
    window.scrollTo(0, 0);
  },
  home() {
    if (Auth.user) return;
    UI.state.view = 'home';
    UI.state.preselect = '';
    UI.render();
    window.scrollTo(0, 0);
  },
  cat(el) {
    UI.state.cat = el.dataset.cat || 'All';
    UI.paintCatalog();
  },
  requestDoc(el) {
    UI.state.preselect = el.dataset.doc || '';
    Actions.openLogin();
  },
  openWarning() {
    if (!Auth.user || Auth.user.role !== 'student') return;
    Warning.open(!isAcked(Auth.user));
  },
  ackWarning() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    const wasAcked = isAcked(u);
    if (!wasAcked) {
      if (!$('#warnAck').checked) return toast('Tick the acknowledgment checkbox to continue.', true);
      u.warningAck = { at: new Date().toISOString(), version: WARNING_VERSION };
      Store.save();
      if (UI.wizard) UI.wizard.ack = true;
      toast('Official warning acknowledged.');
    }
    $('#warning').close();
    if (!wasAcked) UI.render();
  },
  declineWarning() {
    $('#warning').close();
    Actions.logout();
  },
  wizBack() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    const w = UI.wizardFor(u);
    if (w.step <= 1) return;
    w.step -= 1;
    UI.renderWizard();
  },
  wizNext() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    const w = UI.wizardFor(u);
    if (w.step === 1) {
      w.ack = !!($('#wizAck') && $('#wizAck').checked) || isAcked(u);
      if (!w.ack) return toast('Please acknowledge the Official Warning to continue.', true);
      if (!isAcked(u)) {
        u.warningAck = { at: new Date().toISOString(), version: WARNING_VERSION };
        Store.save();
      }
    }
    if (w.step === 2) {
      w.program = $('#wizProgram').value;
      w.email = $('#wizEmail').value.trim().toLowerCase();
      w.mobile = $('#wizMobile').value.trim();
      w.purpose = $('#wizPurpose').value;
      if (!PROGRAM_LIST.includes(w.program)) return toast('Select a valid course / program.', true);
      if (!/^[^\s@]+@plmun\.edu\.ph$/i.test(w.email)) return toast('Use your official @plmun.edu.ph email address.', true);
      if (Store.db.users.some(x => x.id !== u.id && x.email.toLowerCase() === w.email))
        return toast('That institutional email is already linked to another account.', true);
      const mobile = normalizeMobile(w.mobile);
      if (!mobile) return toast('Enter a valid active mobile number (e.g. 0917 123 4567).', true);
      w.mobile = formatMobile(mobile);
      if (!PURPOSES.includes(w.purpose)) return toast('Select the purpose of your request.', true);
    }
    if (w.step === 3) {
      w.doc = $('#wizDoc').value;
      w.copies = Math.min(5, Math.max(1, parseInt($('#wizCopies').value, 10) || 1));
      w.other = $('#wizOther') ? $('#wizOther').value.trim() : '';
      if (!Store.db.docs.includes(w.doc)) return toast('Select a document from the catalog.', true);
      if (w.doc === OTHER_DOC && !w.other) return toast('Please specify the certificate you need.', true);
      if (w.receiver === 'rep') {
        w.repName = $('#wizRepName').value.trim().replace(/\s+/g, ' ');
        w.repRelation = $('#wizRepRelation').value;
        w.repId = $('#wizRepId').value;
        w.repLetter = $('#wizRepLetter').checked;
        if (w.repName.length < 3) return toast("Enter the authorized representative's full name.", true);
        if (!RELATIONSHIPS.includes(w.repRelation)) return toast("Select the representative's relationship to you.", true);
        if (!ID_TYPES.includes(w.repId)) return toast("Select the representative's valid ID type.", true);
        if (!w.repLetter) return toast('Confirm that a signed authorization letter will be presented.', true);
      }
    }
    if (w.step === 4) {
      const chosen = document.querySelector('input[name="wizPayment"]:checked');
      if (chosen) w.payment = chosen.value;
      if (!PAYMENT_METHODS.some(p => p.key === w.payment)) return toast('Select a payment method to continue.', true);
      return SubmitConfirm.show(u, w);
    }
    w.step += 1;
    UI.renderWizard();
  },
  wizSubmit(u, w) {
    u.program = w.program;
    u.email = w.email;
    u.mobile = w.mobile;
    if (!isAcked(u)) u.warningAck = { at: new Date().toISOString(), version: WARNING_VERSION };
    const purpose = w.doc === OTHER_DOC && w.other ? `${w.purpose} — ${w.other}` : w.purpose;
    const claimant = w.receiver === 'rep'
      ? { name: w.repName, relation: w.repRelation, idType: w.repId, letter: !!w.repLetter }
      : null;
    const id = `REQ-${Store.db.seq++}`;
    const trackingCode = `PLM-TRK-${new Date().getFullYear()}-${id.replace('REQ-', '')}`;
    Store.db.requests.unshift({
      id, trackingCode, owner: u.id, type: w.doc, purpose, copies: w.copies, program: u.program,
      receiver: w.receiver, claimant, payment: paymentMeta(w.payment).key,
      status: 'Pending', date: new Date().toISOString()
    });
    Store.save();
    UI.wizard = null;
    UI.render();
    toast(`Request ${id} (Tracking Ref: ${trackingCode}) submitted. You can schedule a pickup once it is marked Ready for Pickup.`);
  },
  editProfile() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return toast('Only student profiles can be edited.', true);
    Profile.show(u);
  },
  saveProfile() {
    const u = Auth.user;
    if (!u || u.role !== 'student') return;
    const program = $('#program').value, yearLevel = $('#yearLevel').value;
    if (!PROGRAM_LIST.includes(program) || !YEAR_LEVELS.includes(yearLevel))
      return toast('Choose a valid course / program.', true);
    if (u.program === program && u.yearLevel === yearLevel) { $('#profile').close(); return; }
    u.program = program;
    u.yearLevel = yearLevel;
    Store.save(); $('#profile').close(); UI.render();
    toast('Profile updated. Your requests will use this academic affiliation.');
  },
  showpw(el) {
    const box = el.closest('.pw'), p = box ? box.querySelector('input') : $('#password');
    if (!p) return;
    const s = p.type === 'password';
    p.type = s ? 'text' : 'password';
    el.innerHTML = s ? `${icon('eyeOff')}<span>Hide</span>` : `${icon('eye')}<span>Show</span>`;
  },
  close(el) { el.closest('dialog').close(); },
  theme() { Theme.toggle(); },
  notifToggle() {
    if (!Auth.user) return;
    UI.state.notifOpen = !UI.state.notifOpen;
    UI.nav();
  },
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
  approve(el) {
    if (!guard('request:advance')) return;
    const r = findReq(el.dataset.id);
    if (!r || r.status !== 'Pending') return toast('Only submitted requests can be approved.', true);
    r.status = 'Processing'; Store.save(); UI.render();
    toast(`${r.id} approved and moved to processing.`);
  },
  markReady(el) {
    if (!guard('request:advance')) return;
    const r = findReq(el.dataset.id);
    if (!r || r.status !== 'Processing') return toast('Only approved requests can be marked ready.', true);
    r.status = 'Ready for Pickup'; Store.save(); UI.render();
    toast(`${r.id} is now ready for pickup.`);
  },
  markReleased(el) {
    if (!guard('request:advance')) return;
    const r = findReq(el.dataset.id);
    if (!r || r.status !== 'Ready for Pickup') return toast('Only ready-for-pickup requests can be released.', true);
    r.status = 'Released'; Store.save(); UI.render();
    toast(`${r.id} marked as released.`);
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
  },
  deleteDoc(el) {
    if (!guard('registrar:manage')) return;
    const name = el.dataset.doc;
    if (!name) return;
    if (Store.db.docs.length <= 1) return toast('At least one document type must remain.', true);
    const usedCount = Store.db.requests.filter(r => r.type === name).length;
    const msg = usedCount > 0
      ? `Delete “${name}”? There are ${usedCount} request(s) using this form.`
      : `Are you sure you want to delete “${name}”?`;
    if (typeof confirm === 'function' && !confirm(msg)) return;
    Store.db.docs = Store.db.docs.filter(d => d !== name);
    Store.db.deletedDocs = Array.isArray(Store.db.deletedDocs) ? Store.db.deletedDocs : [];
    if (!Store.db.deletedDocs.some(x => x.toLowerCase() === name.toLowerCase())) {
      Store.db.deletedDocs.push(name);
    }
    Store.save();
    if (UI.wizard && UI.wizard.doc === name) {
      UI.wizard.doc = Store.db.docs[0] || '';
    }
    UI.render();
    toast(`“${name}” deleted.`);
  },
  deleteForm(el) {
    this.deleteDoc(el);
  }
};

/* ===== Forms ===== */
const Forms = {
  login(f) {
    const d = Object.fromEntries(new FormData(f)), r = Auth.login(d.email || '', d.password || '');
    if (r.err) { $('#loginErr').textContent = r.err; return; }
    f.reset();
    UI.reset();
    UI.state.preselect = '';
    toast(`Welcome, ${Auth.user.role === 'student' ? mask(Auth.user.name) : Auth.user.name}!`);
  },
  register(f) {
    const d = Object.fromEntries(new FormData(f));
    const name = String(d.fullname || '').trim().replace(/\s+/g, ' ');
    const digits = String(d.sno || '').replace(/\D/g, '');
    const sno = digits.length === 9 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : String(d.sno || '').trim();
    const program = String(d.program || '');
    const email = String(d.email || '').trim().toLowerCase();
    const pw = String(d.password || ''), confirm = String(d.confirm || '');
    const fail = msg => { const el = $('#regErr'); if (el) el.textContent = msg; };

    if (name.length < 3) return fail('Enter your full name.');
    if (!/^\d{4}-\d{5}$/.test(sno)) return fail('Enter a valid student ID number (e.g. 2022-00123).');
    if (!PROGRAM_LIST.includes(program)) return fail('Choose your academic degree program.');
    if (!/^[^\s@]+@plmun\.edu\.ph$/i.test(email)) return fail('Use your PLMun email address ending in @plmun.edu.ph.');
    if (pw.length < 8) return fail('Password must be at least 8 characters.');
    if (pw !== confirm) return fail('Passwords do not match.');
    if (Store.db.users.some(u => u.email.toLowerCase() === email)) return fail('An account with this email already exists.');
    if (Store.db.users.some(u => (u.sno || '') === sno)) return fail('An account with this student ID already exists.');

    const u = {
      id: 'u' + Date.now(), role: 'student', name, email, pw, status: 'active',
      sno, program, yearLevel: '1st Year'
    };
    Store.db.users.push(u); Store.save();
    Auth.user = u; sessionStorage.setItem('plmun-sid', u.id);
    f.reset();
    UI.reset();
    UI.state.preselect = '';
    toast(`Account created. Welcome, ${mask(u.name)}!`);
  },
  invite(f) {
    if (!guard('registrar:manage')) return;
    const d = Object.fromEntries(new FormData(f)), name = d.fullname.trim(), email = d.gmail.trim().toLowerCase();
    if (!name || !/^[^\s@]+@gmail\.com$/.test(email)) return toast('Enter a name and a valid @gmail.com address.', true);
    if (Store.db.users.some(u => u.email.toLowerCase() === email)) return toast('That email already has an account.', true);
    const u = {
      id: 'u' + Date.now(), role: 'registrar', name, email, status: 'invited',
      pw: 'Reg-' + Math.random().toString(36).slice(2, 8), token: Math.random().toString(36).slice(2, 12)
    };
    Store.db.users.push(u); Store.save(); UI.render(); Mail.show(u);
  },
  doctype(f) {
    if (!guard('registrar:manage')) return;
    const name = String(new FormData(f).get('doctype') || '').trim().replace(/\s+/g, ' ');
    if (!name) return toast('Enter a document type name.', true);
    if (name.length > 60) return toast('Keep the document type under 60 characters.', true);
    if (Store.db.docs.some(d => d.toLowerCase() === name.toLowerCase())) return toast('That document type already exists.', true);
    if (Store.db.deletedDocs) {
      Store.db.deletedDocs = Store.db.deletedDocs.filter(d => d.toLowerCase() !== name.toLowerCase());
    }
    Store.db.docs.push(name); Store.save(); UI.render(); toast(`“${name}” added to the request form.`);
  },
  deleteDoc(name) {
    if (!guard('registrar:manage')) return;
    if (!name) return;
    if (Store.db.docs.length <= 1) return toast('At least one document type must remain.', true);
    Store.db.docs = Store.db.docs.filter(d => d !== name);
    Store.db.deletedDocs = Array.isArray(Store.db.deletedDocs) ? Store.db.deletedDocs : [];
    if (!Store.db.deletedDocs.some(x => x.toLowerCase() === name.toLowerCase())) {
      Store.db.deletedDocs.push(name);
    }
    Store.save();
    if (UI.wizard && UI.wizard.doc === name) {
      UI.wizard.doc = Store.db.docs[0] || '';
    }
    UI.render();
    toast(`“${name}” deleted.`);
  },
  deleteForm(name) {
    this.deleteDoc(name);
  }
};

/* ===== Event delegation & boot ===== */
document.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (el && Actions[el.dataset.act]) Actions[el.dataset.act](el); });
document.addEventListener('click', e => {
  if (UI.state.notifOpen && !e.target.closest('.notif')) { UI.state.notifOpen = false; UI.nav(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && UI.state.notifOpen) { UI.state.notifOpen = false; UI.nav(); }
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target.closest('button, a, input, select, textarea')) return;
  const row = e.target.closest('.clickable-row[data-act]');
  if (row && Actions[row.dataset.act]) { e.preventDefault(); Actions[row.dataset.act](row); }
});
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); Forms[f.dataset.form](f); } });
document.addEventListener('input', e => {
  if (e.target.matches('[data-search]')) { UI.state.q = e.target.value; UI.paintRows(); }
  const w = UI.wizard;
  if (!w) return;
  if (e.target.id === 'wizRepName') w.repName = e.target.value;
  if (e.target.id === 'wizOther') w.other = e.target.value;
});
document.addEventListener('change', e => {
  if (e.target.matches('[data-filter]')) { UI.state.status = e.target.value; UI.paintRows(); }
  if (e.target.id === 'program') {
    const hint = $('#collegeHint');
    if (hint) hint.textContent = collegeOf(e.target.value);
  }
  if (e.target.id === 'regProgram') {
    const hint = $('#regCollege');
    if (hint) hint.textContent = e.target.value ? collegeOf(e.target.value) : 'Choose your program to see its college.';
  }
  if (e.target.id === 'regSno') {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits.length === 9) e.target.value = `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (e.target.id === 'warnAck') {
    const btn = $('#warnAgree');
    if (btn) btn.disabled = Warning.gated && !e.target.checked;
  }
  if (e.target.id === 'wizAck') {
    const w = UI.wizard;
    if (w) w.ack = e.target.checked;
    const btn = $('#wizNext');
    if (btn) btn.disabled = !e.target.checked && !isAcked(Auth.user);
  }
  if (e.target.id === 'wizProgram') {
    const hint = $('#wizCollege');
    if (hint) hint.textContent = collegeOf(e.target.value);
  }
  if (e.target.id === 'wizMobile') {
    const formatted = formatMobile(e.target.value);
    if (formatted) e.target.value = formatted;
  }
  if (e.target.name === 'wizPayment') {
    const w = UI.wizard;
    if (!w) return;
    w.payment = e.target.value;
    UI.renderWizard();
  }
  if (e.target.name === 'wizReceiver') {
    const w = UI.wizard;
    if (!w) return;
    if ($('#wizRepName')) w.repName = $('#wizRepName').value.trim();
    if ($('#wizRepRelation')) w.repRelation = $('#wizRepRelation').value;
    if ($('#wizRepId')) w.repId = $('#wizRepId').value;
    if ($('#wizRepLetter')) w.repLetter = $('#wizRepLetter').checked;
    w.receiver = e.target.value;
    UI.renderWizard();
  }
  if (e.target.id === 'wizRepRelation' || e.target.id === 'wizRepId' || e.target.id === 'wizRepLetter') {
    const w = UI.wizard;
    if (!w) return;
    if (e.target.id === 'wizRepRelation') w.repRelation = e.target.value;
    if (e.target.id === 'wizRepId') w.repId = e.target.value;
    if (e.target.id === 'wizRepLetter') w.repLetter = e.target.checked;
  }
  if (['wizDoc', 'wizCopies'].includes(e.target.id)) {
    const w = UI.wizard;
    if (!w) return;
    if ($('#wizOther')) w.other = $('#wizOther').value;
    if (e.target.id === 'wizDoc') w.doc = e.target.value;
    if (e.target.id === 'wizCopies') w.copies = Math.min(5, Math.max(1, parseInt(e.target.value, 10) || 1));
    UI.renderWizard();
  }
});
$('#warning').addEventListener('cancel', e => { if ($('#warning').dataset.gated === '1') e.preventDefault(); });
window.addEventListener('storage', e => { if (e.key === Store.KEY) { Store.init(); Auth.restore(); UI.render(); } });

Theme.init(); Store.init(); Auth.restore(); UI.render();
