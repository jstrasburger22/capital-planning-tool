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
  _clientTolerance = {
    s1: s1,
    s2: hasS2 ? s2 : null,
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

function setManualTolerance() {
  const el = document.getElementById('align-manual-score');
  const v = parseInt(el && el.value);
  if (isNaN(v) || v < 0 || v > 100) { alert('Enter a target risk score between 0 and 100.'); return; }
  _clientTolerance = {
    s1: v, s2: null, household: v, coupleMode: false,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    source: 'manual'
  };
  renderRiskAlignment();
  if (typeof cpAutoSaveTolerance === 'function') cpAutoSaveTolerance();
}

function renderRiskAlignment() {
  const host = document.getElementById('az-alignment');
  if (!host) return;
  const raw = document.getElementById('az-score');
  const pScore = raw ? parseInt(raw.textContent) : NaN;
  if (isNaN(pScore)) { host.innerHTML = ''; return; }

  if (!_clientTolerance) {
    host.innerHTML = `<div class="align-card">
      <div class="align-head"><div class="align-title">🎯 Risk Alignment</div><div class="align-badge" style="background:#f2f0ea;color:#6b7e96">No tolerance on file</div></div>
      <div class="align-manual" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:.74rem;color:#3d4c5c;line-height:1.6">
        Complete the Risk Tolerance Questionnaire with this client — their score will appear here automatically. Or enter a target score to compare now:
        <input id="align-manual-score" type="number" min="0" max="100" placeholder="e.g. 55">
        <button onclick="setManualTolerance()">Set</button>
      </div></div>`;
    return;
  }

  const t = _clientTolerance;
  const gap = pScore - t.household;
  const abs = Math.abs(gap);
  let cls, badge, msg;
  if (abs <= 10) {
    cls = 'ok'; badge = '✓ Aligned';
    msg = `The portfolio's risk level is within ${abs} point${abs === 1 ? '' : 's'} of the client's stated tolerance — what they own matches the amount of risk they've told us they're comfortable taking.`;
  } else if (gap > 0) {
    cls = 'above'; badge = gap + ' pts above tolerance';
    msg = `The portfolio is taking <strong>${gap} points more risk</strong> than the client's stated tolerance of ${t.household}. In a sharp downturn it may fall further than they're emotionally prepared for — a strong, objective starting point for a rebalancing conversation.`;
  } else {
    cls = 'below'; badge = abs + ' pts below tolerance';
    msg = `The portfolio is <strong>more conservative than the client's stated tolerance</strong> by ${abs} points. There may be room to pursue more growth while staying inside their comfort zone — worth confirming whether that caution is intentional.`;
  }
  const tolSub = t.source === 'manual'
    ? 'manually entered target'
    : (t.coupleMode ? `${t.p1Name}: ${t.s1} · ${t.p2Name}: ${t.s2} · household avg` : `questionnaire · ${t.date}`);

  host.innerHTML = `<div class="align-card">
    <div class="align-head"><div class="align-title">🎯 Risk Alignment</div><div class="align-badge ${cls}">${badge}</div></div>
    <div class="align-grid">
      <div class="align-cell"><label>Portfolio Risk Score</label><div class="align-num" style="color:${riskColorSafe(pScore)}">${pScore}</div><div class="align-sub">what they own today</div></div>
      <div class="align-cell"><label>Client Risk Tolerance</label><div class="align-num" style="color:${riskColorSafe(t.household)}">${t.household}</div><div class="align-sub">${tolSub}</div></div>
      <div class="align-cell align-msg"><span>${msg}</span></div>
    </div>
    <div class="align-scale">
      <div class="align-pin" style="left:${t.household}%"><span>Tolerance ${t.household}</span></div>
      <div class="align-pin" style="left:${pScore}%;background:${riskColorSafe(pScore)}"><span class="up" style="color:${riskColorSafe(pScore)}">Portfolio ${pScore}</span></div>
    </div>
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
