/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Risk alignment (questionnaire ↔ analyzer) + client profile save/load
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══ CLIENT PROFILES + RISK ALIGNMENT ══
// ══ RISK ALIGNMENT — connects the questionnaire to the analyzer ══
let _clientTolerance = null;

function riskColorSafe(s) {
  return (typeof riskColor === 'function') ? riskColor(s)
    : (s <= 25 ? '#2563a8' : s <= 40 ? '#22a06b' : s <= 60 ? '#6b7e96' : s <= 75 ? '#d4820a' : '#c0392b');
}

function cpCaptureTolerance(s1, s2) {
  const hasS2 = (s2 !== null && s2 !== undefined);
  const today = new Date().toISOString().slice(0, 10);
  _clientTolerance = {
    s1: s1,
    s2: hasS2 ? s2 : null,
    asOf1: today,
    asOf2: hasS2 ? today : null,
    household: hasS2 ? Math.round((s1 + s2) / 2) : s1,
    coupleMode: hasS2,
    p1Name: (typeof p1Name !== 'undefined' && p1Name) ? p1Name : 'Client',
    p2Name: (typeof p2Name !== 'undefined' && p2Name) ? p2Name : 'Co-Client',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    source: 'questionnaire'
  };
  if (typeof renderRiskAlignment === 'function') renderRiskAlignment();
  if (typeof cpAutoSaveTolerance === 'function') cpAutoSaveTolerance();
}

// Show/hide the manual entry editor. Prefills from existing tolerance.
function toggleToleranceEditor(show) {
  const ed = document.getElementById('align-editor');
  if (!ed) return;
  ed.style.display = show ? 'block' : 'none';
}

// Save from the manual editor — supports one or two named people, each with a date.
function saveManualTolerance() {
  const n1 = (document.getElementById('align-name1') || {}).value || '';
  const v1 = parseInt((document.getElementById('align-score1') || {}).value);
  const d1 = (document.getElementById('align-date1') || {}).value || '';
  const couple = (document.getElementById('align-couple-chk') || {}).checked;
  const n2 = (document.getElementById('align-name2') || {}).value || '';
  const v2raw = (document.getElementById('align-score2') || {}).value;
  const v2 = parseInt(v2raw);
  const d2 = (document.getElementById('align-date2') || {}).value || '';

  if (isNaN(v1) || v1 < 0 || v1 > 100) { alert('Enter a risk score between 0 and 100 for the first person.'); return; }
  if (couple && (isNaN(v2) || v2 < 0 || v2 > 100)) { alert('Enter a risk score between 0 and 100 for the second person, or uncheck the second person.'); return; }

  const household = couple ? Math.round((v1 + v2) / 2) : v1;
  _clientTolerance = {
    s1: v1,
    s2: couple ? v2 : null,
    asOf1: d1 || null,
    asOf2: couple ? (d2 || null) : null,
    household: household,
    coupleMode: couple,
    p1Name: n1.trim() || 'Client',
    p2Name: couple ? (n2.trim() || 'Co-Client') : null,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    source: 'manual'
  };
  renderRiskAlignment();
  if (typeof cpAutoSaveTolerance === 'function') cpAutoSaveTolerance();
}

// Kept for backward compatibility with any older saved profiles / calls.
function setManualTolerance() { saveManualTolerance(); }

// Format an ISO date (yyyy-mm-dd) as "Mon d, yyyy"; returns '' if empty.
function fmtAsOf(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Months elapsed since an ISO date; null if empty/invalid.
function monthsSince(iso) {
  if (!iso) return null;
  const parts = iso.split('-');
  if (parts.length !== 3) return null;
  const then = new Date(parts[0], parts[1] - 1, parts[2]);
  if (isNaN(then)) return null;
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

// Build the editor markup, prefilled from current tolerance (or blank).
function alignEditorHTML() {
  const t = _clientTolerance || {};
  const couple = !!t.coupleMode;
  const esc = s => (s || '').replace(/"/g, '&quot;');
  return `<div class="align-editor" id="align-editor" style="display:none">
    <div class="align-ed-row">
      <input type="text" id="align-name1" placeholder="Name (optional)" value="${esc(t.p1Name && t.p1Name !== 'Client' ? t.p1Name : '')}">
      <input type="number" id="align-score1" min="0" max="100" placeholder="Risk score" value="${(t.s1 != null ? t.s1 : '')}">
      <label class="align-ed-lbl">as of</label>
      <input type="date" id="align-date1" value="${t.asOf1 || ''}">
    </div>
    <label class="align-couple-toggle"><input type="checkbox" id="align-couple-chk" ${couple ? 'checked' : ''} onchange="document.getElementById('align-person2').style.display=this.checked?'flex':'none'"> Add a second person (spouse / co-client)</label>
    <div class="align-ed-row" id="align-person2" style="display:${couple ? 'flex' : 'none'}">
      <input type="text" id="align-name2" placeholder="Name (optional)" value="${esc(t.p2Name && t.p2Name !== 'Co-Client' ? t.p2Name : '')}">
      <input type="number" id="align-score2" min="0" max="100" placeholder="Risk score" value="${(t.s2 != null ? t.s2 : '')}">
      <label class="align-ed-lbl">as of</label>
      <input type="date" id="align-date2" value="${t.asOf2 || ''}">
    </div>
    <div class="align-ed-actions">
      <button class="align-ed-save" onclick="saveManualTolerance()">Save risk scores</button>
      <button class="align-ed-cancel" onclick="toggleToleranceEditor(false)">Cancel</button>
    </div>
  </div>`;
}

const ALIGN_STALE_MONTHS = 12; // flag assessments at least this old

function renderRiskAlignment() {
  const host = document.getElementById('az-alignment');
  if (!host) return;
  const raw = document.getElementById('az-score');
  const pScore = raw ? parseInt(raw.textContent) : NaN;
  if (isNaN(pScore)) { host.innerHTML = ''; return; }

  if (!_clientTolerance) {
    host.innerHTML = `<div class="align-card">
      <div class="align-head"><div class="align-title">🎯 Risk Alignment</div><div class="align-badge" style="background:#f2f0ea;color:#6b7e96">No tolerance on file</div></div>
      <div style="font-size:.74rem;color:#3d4c5c;line-height:1.6;margin-bottom:10px">Complete the Risk Tolerance Questionnaire with this client and their score appears here automatically — or enter risk scores manually below (one person or two, each with the date it was assessed).</div>
      <button class="align-ed-open" onclick="toggleToleranceEditor(true)">＋ Enter risk scores manually</button>
      ${alignEditorHTML()}
    </div>`;
    return;
  }

  const t = _clientTolerance;
  const gap = pScore - t.household;
  const abs = Math.abs(gap);
  let cls, badge, msg;
  const tolWord = t.coupleMode ? "household's blended tolerance" : "client's stated tolerance";
  if (abs <= 10) {
    cls = 'ok'; badge = '✓ Aligned';
    msg = `The portfolio's risk level is within ${abs} point${abs === 1 ? '' : 's'} of the ${tolWord} — what they own matches the amount of risk they've told us they're comfortable taking.`;
  } else if (gap > 0) {
    cls = 'above'; badge = gap + ' pts above tolerance';
    msg = `The portfolio is taking <strong>${gap} points more risk</strong> than the ${tolWord} of ${t.household}. In a sharp downturn it may fall further than they're emotionally prepared for — a strong, objective starting point for a rebalancing conversation.`;
  } else {
    cls = 'below'; badge = abs + ' pts below tolerance';
    msg = `The portfolio is <strong>more conservative than the ${tolWord}</strong> by ${abs} points. There may be room to pursue more growth while staying inside their comfort zone — worth confirming whether that caution is intentional.`;
  }

  // Per-person tolerance detail (one or two people), with as-of dates + staleness flags.
  const people = [];
  people.push({ name: t.p1Name || 'Client', score: t.s1, asOf: t.asOf1 });
  if (t.coupleMode && t.s2 != null) people.push({ name: t.p2Name || 'Co-Client', score: t.s2, asOf: t.asOf2 });

  let anyStale = false;
  const personRows = people.map(p => {
    const m = monthsSince(p.asOf);
    const stale = (m != null && m >= ALIGN_STALE_MONTHS);
    if (stale) anyStale = true;
    const dateTxt = p.asOf ? 'as of ' + fmtAsOf(p.asOf) : 'no date on file';
    const staleTag = stale ? `<span class="align-stale-tag">⚠ ${Math.floor(m / 12) >= 1 ? Math.floor(m / 12) + 'y' : m + 'mo'} old</span>` : '';
    return `<div class="align-person">
      <span class="align-person-dot" style="background:${riskColorSafe(p.score)}"></span>
      <span class="align-person-name">${p.name}</span>
      <span class="align-person-score" style="color:${riskColorSafe(p.score)}">${p.score}</span>
      <span class="align-person-date ${stale ? 'stale' : ''}">${dateTxt}</span>
      ${staleTag}
    </div>`;
  }).join('');

  const householdLabel = t.coupleMode ? 'Blended Tolerance' : 'Client Tolerance';
  const householdSub = t.coupleMode ? 'average of both scores' : (t.source === 'manual' ? 'entered manually' : 'from questionnaire');

  const staleBanner = anyStale
    ? `<div class="align-stale-banner">⚠ At least one risk assessment is over ${ALIGN_STALE_MONTHS} months old. Tolerance can drift with age, markets, and life changes — consider refreshing the questionnaire before relying on this comparison.</div>`
    : '';

  // Pins: portfolio + each person (deduped label stacking handled by CSS offset via nth)
  const personPins = people.map((p, i) => `<div class="align-pin person" style="left:${p.score}%;background:${riskColorSafe(p.score)}"><span class="${i % 2 ? 'up' : ''}" style="color:${riskColorSafe(p.score)}">${p.name.split(' ')[0]} ${p.score}</span></div>`).join('');

  host.innerHTML = `<div class="align-card">
    <div class="align-head"><div class="align-title">🎯 Risk Alignment</div><div class="align-badge ${cls}">${badge}</div></div>
    <div class="align-grid">
      <div class="align-cell"><label>Portfolio Risk Score</label><div class="align-num" style="color:${riskColorSafe(pScore)}">${pScore}</div><div class="align-sub">what they own today</div></div>
      <div class="align-cell"><label>${householdLabel}</label><div class="align-num" style="color:${riskColorSafe(t.household)}">${t.household}</div><div class="align-sub">${householdSub}</div></div>
      <div class="align-cell align-msg"><span>${msg}</span></div>
    </div>
    <div class="align-people">${personRows}</div>
    ${staleBanner}
    <div class="align-scale">
      <div class="align-pin" style="left:${pScore}%;background:${riskColorSafe(pScore)}"><span class="up" style="color:${riskColorSafe(pScore)}">Portfolio ${pScore}</span></div>
      ${personPins}
    </div>
    <button class="align-ed-open" style="margin-top:6px" onclick="toggleToleranceEditor(true)">✎ Edit risk scores &amp; dates</button>
    ${alignEditorHTML()}
  </div>`;
}

function buildAlignmentExportHTML() {
  const host = document.getElementById('az-alignment');
  if (!host || !host.innerHTML.trim() || !_clientTolerance) return '';
  return host.innerHTML;
}

// ══ CLIENT PROFILES — save / load client work in this browser ══
const CP_STORE_KEY = 'cpwm_clients_v1';
let _cpActiveId = null;

function cpReadStore() {
  try { return JSON.parse(localStorage.getItem(CP_STORE_KEY)) || { clients: {} }; }
  catch (e) { return { clients: {} }; }
}
function cpWriteStore(store) {
  try { localStorage.setItem(CP_STORE_KEY, JSON.stringify(store)); return true; }
  catch (e) { alert('Could not save — browser storage is unavailable or full.'); return false; }
}

function cpGatherState() {
  let portfolio = null;
  if (typeof _portfolioAccounts !== 'undefined' && _portfolioAccounts && _portfolioAccounts.length) {
    const titleEl = document.getElementById('az-portfolio-title');
    const name = titleEl ? titleEl.textContent.replace('✎', '').trim() : 'Client Portfolio';
    portfolio = { portfolio_name: name, accounts: JSON.parse(JSON.stringify(_portfolioAccounts)) };
  }
  return {
    portfolio: portfolio,
    tolerance: (typeof _clientTolerance !== 'undefined') ? _clientTolerance : null,
    dist: {
      amt: (typeof _stDistAmount !== 'undefined') ? _stDistAmount : '',
      freq: (typeof _stDistFreq !== 'undefined') ? _stDistFreq : 'monthly'
    }
  };
}

function cpSaveFromModal() {
  const input = document.getElementById('cp-name-input');
  const name = input ? input.value.trim() : '';
  if (!name) { alert('Give this client profile a name first.'); return; }
  const store = cpReadStore();
  let id = _cpActiveId;
  if (!id || !store.clients[id]) { id = 'c' + Date.now(); _cpActiveId = id; }
  store.clients[id] = { id: id, name: name, updated: Date.now(), data: cpGatherState() };
  if (cpWriteStore(store)) { cpUpdateBar(); cpRenderModal('✓ Saved ' + name); }
}

function cpAutoSaveTolerance() {
  if (!_cpActiveId) return;
  const store = cpReadStore();
  const c = store.clients[_cpActiveId];
  if (!c) return;
  c.data = c.data || {};
  c.data.tolerance = _clientTolerance;
  c.updated = Date.now();
  cpWriteStore(store);
  cpUpdateBar();
}

function cpLoadClient(id) {
  const store = cpReadStore();
  const c = store.clients[id];
  if (!c) return;
  _cpActiveId = id;
  const d = c.data || {};
  _clientTolerance = d.tolerance || null;
  if (d.dist) {
    if (typeof _stDistAmount !== 'undefined') _stDistAmount = d.dist.amt || '';
    if (typeof _stDistFreq !== 'undefined') _stDistFreq = d.dist.freq || 'monthly';
  }
  if (d.portfolio && d.portfolio.accounts && d.portfolio.accounts.length) {
    if (typeof showView === 'function') showView('analyzer');
    if (typeof switchMode === 'function') { try { switchMode('portfolio'); } catch (e) {} }
    const saved = JSON.parse(JSON.stringify(d.portfolio));
    if (typeof renderPortfolio === 'function') {
      renderPortfolio(saved);
      (saved.accounts || []).forEach((a, i) => {
        if (_portfolioAccounts[i] && a.cash_added) _portfolioAccounts[i].cash_added = a.cash_added;
      });
      if (typeof recalcPortfolio === 'function') recalcPortfolio();
    }
  }
  if (typeof renderRiskAlignment === 'function') renderRiskAlignment();
  cpUpdateBar();
  cpCloseModal();
}

function cpDeleteClient(id) {
  const store = cpReadStore();
  const c = store.clients[id];
  if (!c) return;
  if (!confirm('Delete "' + c.name + '"? This cannot be undone.')) return;
  delete store.clients[id];
  if (_cpActiveId === id) _cpActiveId = null;
  cpWriteStore(store);
  cpUpdateBar();
  cpRenderModal();
}

function cpNewClient() {
  _cpActiveId = null;
  cpUpdateBar();
  cpRenderModal();
  const input = document.getElementById('cp-name-input');
  if (input) { input.value = ''; input.focus(); }
}

function cpExportAll() {
  const store = cpReadStore();
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'capital-planning-clients-backup.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function cpImportFile(ev) {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const incoming = JSON.parse(reader.result);
      if (!incoming || typeof incoming.clients !== 'object') throw new Error('bad shape');
      const store = cpReadStore();
      let n = 0;
      for (const id in incoming.clients) { store.clients[id] = incoming.clients[id]; n++; }
      cpWriteStore(store);
      cpRenderModal('✓ Imported ' + n + ' client' + (n === 1 ? '' : 's'));
    } catch (e) { alert('That file doesn\'t look like a Capital Planning client backup.'); }
  };
  reader.readAsText(file);
  ev.target.value = '';
}

function cpUpdateBar() {
  const bar = document.getElementById('cp-client-bar');
  const nameEl = document.getElementById('cp-client-bar-name');
  if (!bar || !nameEl) return;
  const store = cpReadStore();
  const c = _cpActiveId ? store.clients[_cpActiveId] : null;
  if (c) { bar.classList.add('active'); nameEl.textContent = c.name; }
  else { bar.classList.remove('active'); nameEl.textContent = 'No client loaded'; }
}

function cpOpenModal() { cpRenderModal(); const m = document.getElementById('cp-client-modal'); if (m) m.classList.add('open'); }
function cpCloseModal() { const m = document.getElementById('cp-client-modal'); if (m) m.classList.remove('open'); }

function cpRenderModal(notice) {
  const body = document.getElementById('cp-cm-body');
  if (!body) return;
  const store = cpReadStore();
  const active = _cpActiveId ? store.clients[_cpActiveId] : null;
  const list = Object.values(store.clients).sort((a, b) => (b.updated || 0) - (a.updated || 0));

  const rows = list.map(c => {
    const d = c.data || {};
    const bits = [];
    if (d.portfolio) bits.push('portfolio ✓');
    if (d.tolerance) bits.push('tolerance ' + d.tolerance.household);
    if (d.dist && d.dist.amt) bits.push('distributions ✓');
    const when = c.updated ? new Date(c.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return `<div class="cp-client-item">
      <div class="cp-ci-meta">
        <div class="cp-ci-name">${c.name}${c.id === _cpActiveId ? ' <span style="font-size:.6rem;color:#22a06b">● active</span>' : ''}</div>
        <div class="cp-ci-sub">Updated ${when}${bits.length ? ' · ' + bits.join(' · ') : ' · empty'}</div>
      </div>
      <button class="cp-btn primary" onclick="cpLoadClient('${c.id}')">Load</button>
      <button class="cp-btn danger" onclick="cpDeleteClient('${c.id}')">✕</button>
    </div>`;
  }).join('');

  body.innerHTML = `
    ${notice ? `<div style="background:#e6f4ed;color:#1d7a50;font-size:.72rem;font-weight:700;border-radius:8px;padding:9px 14px;margin-bottom:12px">${notice}</div>` : ''}
    <div class="cp-cm-row">
      <input type="text" id="cp-name-input" placeholder="Client / household name (e.g. Henderson Family)" value="${active ? active.name.replace(/"/g, '&quot;') : ''}">
      <button class="cp-btn primary" onclick="cpSaveFromModal()">💾 Save current work</button>
    </div>
    <div id="cp-client-list">${rows || '<div style="font-size:.74rem;color:#6b7e96;padding:14px 4px">No saved clients yet. Analyze a portfolio or run the questionnaire, then save it here under the client&#39;s name.</div>'}</div>
    <div class="cp-cm-row" style="margin-top:14px">
      <button class="cp-btn ghost" onclick="cpNewClient()">＋ New client</button>
      <button class="cp-btn ghost" onclick="cpExportAll()">⬇ Export backup</button>
      <label class="cp-btn ghost" style="display:inline-flex;align-items:center;cursor:pointer">⬆ Import<input type="file" accept=".json" style="display:none" onchange="cpImportFile(event)"></label>
      <button class="cp-btn ghost" style="margin-left:auto" onclick="cpCloseModal()">Close</button>
    </div>`;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cpUpdateBar);
} else {
  cpUpdateBar();
}
