/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Client profiles — save / load a household in this browser
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════════
// CLIENT PROFILES — save / load a household's work in this browser
// (ported from the multi-file branch, wired into the live Risk Alignment card)
//
// Saves: analyzed portfolio (incl. score edits, cash/debit balances, account
// overrides), the client's risk tolerance (questionnaire or manual), the
// questionnaire flags, and the stress-test distribution amount.
// Storage: this browser's localStorage only. Use Export backup to move or keep a copy.
// Next step: move to shared, secure storage behind a firm login.
// ══════════════════════════════════════════════════════════════════════
const CP_STORE_KEY = 'cpwm_clients_v1';
let _cpActiveId = null;
let _clientTolerance = null;

function _cpEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}
function _cpToday() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Called by the questionnaire when results are shown
function cpCaptureTolerance(s1, s2) {
  const hasS2 = (s2 !== null && s2 !== undefined);
  _clientTolerance = {
    s1: s1,
    s2: hasS2 ? s2 : null,
    household: hasS2 ? Math.round((s1 + s2) / 2) : s1,
    coupleMode: hasS2,
    p1Name: (typeof p1Name !== 'undefined' && p1Name) ? p1Name : 'Client',
    p2Name: (typeof p2Name !== 'undefined' && p2Name) ? p2Name : 'Co-Client',
    date: _cpToday(),
    source: 'questionnaire',
    flags: (typeof _quizFlags !== 'undefined' && _quizFlags) ? _quizFlags.slice() : []
  };
  _cpSyncToleranceToAnalyzer();
  cpAutoSaveTolerance();
}

// Called by the Risk Alignment card when the advisor types a tolerance
function cpNoteManualTolerance(v) {
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 1) return;
  if (_clientTolerance && _clientTolerance.household === n) return;   // unchanged (e.g. pre-filled from the questionnaire)
  _clientTolerance = { s1: n, s2: null, household: n, coupleMode: false, date: _cpToday(), source: 'manual' };
  cpAutoSaveTolerance();
}

// Push the stored tolerance into the analyzer's Risk Alignment card
function _cpSyncToleranceToAnalyzer() {
  const t = _clientTolerance;
  if (!t) {
    window._lastQuizResult = null;
    if (typeof _stToleranceScore !== 'undefined') _stToleranceScore = '';
  } else {
    if (typeof _stToleranceScore !== 'undefined') _stToleranceScore = String(t.household);
    window._lastQuizResult = t.source === 'questionnaire'
      ? { score: t.household, who: t.coupleMode ? `${t.p1Name} ${t.s1} · ${t.p2Name} ${t.s2} · average` : '', date: t.date }
      : null;
  }
  const azRA = document.getElementById('az-risk-align');
  if (azRA && document.getElementById('az-score') && typeof buildRiskAlignmentSection === 'function') {
    azRA.innerHTML = buildRiskAlignmentSection();
    if (typeof updateRiskAlignment === 'function') updateRiskAlignment();
  }
}

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
    tolerance: _clientTolerance,
    dist: {
      amt:  (typeof _stDistAmount !== 'undefined') ? _stDistAmount : '',
      freq: (typeof _stDistFreq   !== 'undefined') ? _stDistFreq   : 'monthly'
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
  if (typeof _stDistAmount !== 'undefined') _stDistAmount = (d.dist && d.dist.amt) || '';
  if (typeof _stDistFreq   !== 'undefined') _stDistFreq   = (d.dist && d.dist.freq) || 'monthly';

  if (d.portfolio && d.portfolio.accounts && d.portfolio.accounts.length) {
    if (typeof showView === 'function') showView('analyzer');
    if (typeof switchMode === 'function') { try { switchMode('portfolio'); } catch (e) {} }
    const saved = JSON.parse(JSON.stringify(d.portfolio));
    if (typeof renderPortfolio === 'function') {
      renderPortfolio(saved);
      (saved.accounts || []).forEach((a, i) => {
        if (_portfolioAccounts[i] && a.cash_added) {
          _portfolioAccounts[i].cash_added = a.cash_added;
          const inp = document.getElementById('acct-' + i + '-cash-input');
          if (inp) inp.value = a.cash_added;
        }
      });
      if (typeof recalcPortfolio === 'function') recalcPortfolio();
    }
  } else if (typeof resetAnalyzer === 'function' && typeof _portfolioAccounts !== 'undefined' && _portfolioAccounts.length) {
    resetAnalyzer();   // don't leave the previous client's portfolio on screen
  }
  _cpSyncToleranceToAnalyzer();
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
  else   { bar.classList.remove('active'); nameEl.textContent = 'Client profiles'; }
}

function cpOpenModal()  { cpRenderModal(); const m = document.getElementById('cp-client-modal'); if (m) m.classList.add('open'); }
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
    if (d.tolerance) bits.push('tolerance ' + d.tolerance.household + (d.tolerance.source === 'manual' ? ' (manual)' : ''));
    if (d.dist && d.dist.amt) bits.push('distributions ✓');
    const when = c.updated ? new Date(c.updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    return `<div class="cp-client-item">
      <div class="cp-ci-meta">
        <div class="cp-ci-name">${_cpEsc(c.name)}${c.id === _cpActiveId ? ' <span style="font-size:.6rem;color:#22a06b">● active</span>' : ''}</div>
        <div class="cp-ci-sub">Updated ${when}${bits.length ? ' · ' + bits.join(' · ') : ' · empty'}</div>
      </div>
      <button class="cp-btn primary" onclick="cpLoadClient('${_cpEsc(c.id)}')">Load</button>
      <button class="cp-btn danger" onclick="cpDeleteClient('${_cpEsc(c.id)}')" title="Delete">✕</button>
    </div>`;
  }).join('');

  body.innerHTML = `
    ${notice ? `<div style="background:#e6f4ed;color:#1d7a50;font-size:.72rem;font-weight:700;border-radius:8px;padding:9px 14px;margin-bottom:12px">${_cpEsc(notice)}</div>` : ''}
    <div class="cp-cm-row">
      <input type="text" id="cp-name-input" placeholder="Client / household name (e.g. Henderson Family)" value="${active ? _cpEsc(active.name) : ''}">
      <button class="cp-btn primary" onclick="cpSaveFromModal()">💾 ${active ? 'Update' : 'Save current work'}</button>
    </div>
    <div id="cp-client-list">${rows || '<div style="font-size:.74rem;color:#6b7e96;padding:14px 4px">No saved clients yet. Analyze a portfolio or run the questionnaire, then save it here under the client&#39;s name.</div>'}</div>
    <div class="cp-cm-row" style="margin-top:14px">
      <button class="cp-btn ghost" onclick="cpNewClient()">＋ Save as new client</button>
      <button class="cp-btn ghost" onclick="cpExportAll()">⬇ Export backup</button>
      <label class="cp-btn ghost" style="display:inline-flex;align-items:center;cursor:pointer">⬆ Import<input type="file" accept=".json" style="display:none" onchange="cpImportFile(event)"></label>
      <button class="cp-btn ghost" style="margin-left:auto" onclick="cpCloseModal()">Close</button>
    </div>`;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cpUpdateBar);
else cpUpdateBar();
