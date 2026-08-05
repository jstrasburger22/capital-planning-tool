/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Add-account modal + deep dive analysis panel
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */
// ══ ADD ACCOUNT MODAL ══

let _aaRowScores = {}; // ticker -> {score, type} for newly entered holdings

function openAddAccountModal() {
  _aaRowScores = {};
  document.getElementById('aa-acct-name').value = '';
  document.getElementById('aa-cash').value = '';
  document.getElementById('aa-holdings-list').innerHTML = '';
  document.getElementById('aa-score-status').textContent = '';
  // Start with 3 empty rows
  addHoldingRow(); addHoldingRow(); addHoldingRow();
  document.getElementById('aa-overlay').style.display = 'flex';
  document.getElementById('aa-acct-name').focus();
}

function closeAddAccountModal() {
  document.getElementById('aa-overlay').style.display = 'none';
}

function addHoldingRow(ticker='', name='', value='') {
  const list = document.getElementById('aa-holdings-list');
  const idx = list.children.length;
  const row = document.createElement('div');
  row.className = 'aa-holding-row';
  row.dataset.idx = idx;
  row.innerHTML = `
    <input placeholder="TICKER" value="${ticker}" oninput="clearRowScore(this)" style="text-transform:uppercase">
    <input placeholder="Name / Description" value="${name}">
    <input type="number" placeholder="e.g. 10000" value="${value}" min="0">
    <button class="aa-remove-btn" onclick="this.closest('.aa-holding-row').remove()" title="Remove">✕</button>`;
  list.appendChild(row);
}

function clearRowScore(input) {
  const ticker = input.value.trim().toUpperCase();
  if (_aaRowScores[ticker]) {
    delete _aaRowScores[ticker];
    document.getElementById('aa-score-status').textContent = 'Re-score after editing tickers.';
  }
}

async function scoreNewHoldings() {
  const rows = document.querySelectorAll('#aa-holdings-list .aa-holding-row');
  const toScore = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const ticker = inputs[0].value.trim().toUpperCase();
    const name   = inputs[1].value.trim();
    if (ticker || name) toScore.push({ ticker, name, row });
  });

  if (!toScore.length) {
    document.getElementById('aa-score-status').textContent = 'Add at least one holding first.';
    return;
  }

  const btn = document.getElementById('aa-score-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Scoring…';
  document.getElementById('aa-score-status').textContent = '';

  // Build a mini-portfolio string for the AI
  const holdingsList = toScore.map((h, i) => (i+1) + '. Ticker: ' + (h.ticker || '(none)') + ' | Name: ' + (h.name || '(none)')).join('\n');

  // Pull known scores for any tickers already in our table
  const knownLines = toScore
    .filter(h => TICKER_SCORES[h.ticker] !== undefined || _sessionScoreCache[h.ticker] !== undefined)
    .map(h => `${h.ticker}: ${TICKER_SCORES[h.ticker] ?? _sessionScoreCache[h.ticker]}`)
    .join(', ');

  const prompt = `You are a financial risk analyst. Score each holding below on a Nitrogen/Riskalyze 0-100 risk scale.

${knownLines ? 'PRE-VERIFIED SCORES (use exactly): ' + knownLines + '\n' : ''}
HOLDINGS TO SCORE:
${holdingsList}

Calibration: SPY=74, QQQ=85, AGG=28, TLT=35, HYG=48, GLD=65, EEM=82, IBIT=95, Money market/cash=5, Variable annuity=50, Other annuities=5, Structured note=30, Bond=20, CD=5

Return ONLY valid JSON array, no markdown:
[{"ticker":"","name":"","type":"","risk_score":0}]

Rules:
- One entry per holding in the same order
- type: brief asset class (e.g. "Large Cap ETF", "Structured Note", "Annuity", "Bond Fund")
- risk_score: integer 0-100
- If ticker is blank, classify by name/description`;

  try {
    const resp = await fetch('/api/proxy', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await resp.json();
    const txt = (data.content || []).map(b => b.text||'').join('').replace(/```json|```/g,'').trim();
    const m = txt.match(/\[[\s\S]*\]/);
    if (!m) throw new Error('No JSON array returned');
    const scored = JSON.parse(m[0]);

    // Apply scores back to rows + fill in name if blank
    scored.forEach((s, i) => {
      if (!toScore[i]) return;
      const inputs = toScore[i].row.querySelectorAll('input');
      const ticker = inputs[0].value.trim().toUpperCase();
      const name   = inputs[1].value.trim();

      // Apply classifyHolding overrides first
      const fakeH = { ticker, name, type: s.type || '', risk_score: s.risk_score };
      const classified = classifyHolding(fakeH);
      const finalScore = classified ? classified.score : (TICKER_SCORES[ticker] ?? _sessionScoreCache[ticker] ?? s.risk_score ?? 50);
      const finalType  = classified ? classified.type : (s.type || '');

      _aaRowScores[ticker || ('_row_' + i)] = { score: finalScore, type: finalType, name: s.name || name };

      // Fill in name if the user left it blank and AI provided one
      if (!name && s.name) inputs[1].value = s.name;

      // Show score badge on the row
      let badge = toScore[i].row.querySelector('.aa-score-badge');
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'aa-score-badge';
        badge.style.cssText = 'font-size:.68rem;font-weight:700;margin-top:2px;grid-column:1/-1;padding:3px 8px;border-radius:5px;display:inline-block;';
        toScore[i].row.appendChild(badge);
      }
      const col = finalScore<=25?'#2563a8':finalScore<=40?'#22a06b':finalScore<=60?'#6b7e96':finalScore<=75?'#d4820a':'#c0392b';
      const bg  = finalScore<=25?'#e8f0fa':finalScore<=40?'#e6f4ed':finalScore<=60?'#eef0f4':finalScore<=75?'#fff3e0':'#fde8e8';
      badge.style.background = bg; badge.style.color = col;
      badge.textContent = `Risk Score: ${finalScore} · ${finalType || riskLevelLabel(finalScore)}`;
    });

    document.getElementById('aa-score-status').textContent = `✓ ${scored.length} holding${scored.length!==1?'s':''} scored`;
  } catch(e) {
    document.getElementById('aa-score-status').textContent = 'Scoring failed — check connection and retry.';
    console.error(e);
  }

  btn.disabled = false;
  btn.textContent = '🔍 Score Holdings with AI';
}

function confirmAddAccount() {
  const acctName = document.getElementById('aa-acct-name').value.trim() || 'New Account';
  const cashAdded = parseFloat(document.getElementById('aa-cash').value) || 0;
  const rows = document.querySelectorAll('#aa-holdings-list .aa-holding-row');

  const holdings = [];
  rows.forEach((row, i) => {
    const inputs = row.querySelectorAll('input');
    const ticker = inputs[0].value.trim().toUpperCase();
    const name   = inputs[1].value.trim();
    const mv     = parseFloat(inputs[2].value) || 0;
    if (!ticker && !name) return; // skip blank rows

    const scoreData = _aaRowScores[ticker || ('_row_' + i)] || {};
    // Apply classifyHolding one more time as safety net
    const fakeH = { ticker, name, type: scoreData.type || '', risk_score: scoreData.score || 50 };
    const classified = classifyHolding(fakeH);
    const finalScore = classified ? classified.score : (TICKER_SCORES[ticker] ?? _sessionScoreCache[ticker] ?? scoreData.score ?? 50);
    const finalType  = classified ? classified.type : (scoreData.type || 'Unknown');

    holdings.push({
      ticker,
      name: scoreData.name || name || ticker,
      type: finalType,
      market_value: mv,
      allocation_pct: 0, // recalculated below
      risk_score: finalScore,
      risk_level: riskLevelLabel(finalScore)
    });
  });

  // Recalc allocation_pct within this account
  const totalMv = holdings.reduce((s, h) => s + h.market_value, 0);
  if (totalMv > 0) holdings.forEach(h => { h.allocation_pct = h.market_value / totalMv * 100; });

  // Add to global accounts array
  const newAcct = { account_name: acctName, holdings, cash_added: cashAdded };
  _portfolioAccounts.push(newAcct);

  // Render the new account card and append to DOM
  const ai = _portfolioAccounts.length - 1;
  const wrap = document.getElementById('az-accounts-wrap');
  if (wrap) {
    const div = document.createElement('div');
    div.innerHTML = renderAccountBlock(newAcct, ai);
    wrap.appendChild(div.firstElementChild);
  }

  // Update global scores + allocation
  recalcPortfolio();
  closeAddAccountModal();
}


// ══ DEEP DIVE ANALYSIS ══

let _ddOpen = false;
let _ddExcluded = new Set(); // account indices excluded from deep dive
let _ddNarrativeGenerated = false;

function toggleDeepDive() {
  _ddOpen = !_ddOpen;
  const btn   = document.getElementById('dd-toggle-btn');
  const panel = document.getElementById('dd-panel');
  if (btn)   btn.classList.toggle('open', _ddOpen);
  if (panel) panel.classList.toggle('open', _ddOpen);
  if (_ddOpen) renderDeepDive();
}

// ── Infer sub-asset category from holding type + ticker + risk score ──
function inferSubCategory(h) {
  const t   = (h.type   || '').toLowerCase();
  const nm  = (h.name   || '').toLowerCase();
  const tk  = (h.ticker || '').toUpperCase();
  const s   = parseFloat(h.risk_score) || 50;

  // Hard-typed first
  if (t.includes('annuity'))                         return 'Annuities';
  if (t.includes('structured note') || t.includes('buffer note') ||
      t.includes('autocall') || t.includes('barrier') ||
      t.includes('principal protected') || t.includes('participation note')) return 'Structured Notes';
  if ((t.includes('cash') && !t.includes('cash flow') && !t.includes('cashflow')) || t.includes('money market') || s <= 6) return 'Cash & Money Market';
  if (t.includes('cd') || nm.includes(' cd ') || nm.includes('certificate')) return 'CDs';

  // Bonds by duration / type
  if (t.includes('treasury') || tk === 'BIL' || tk === 'SHV' || tk === 'SGOV' || tk === 'TBLL') return 'US Treasuries';
  if (t.includes('municipal') || t.includes('muni'))                         return 'Municipal Bonds';
  if (t.includes('high yield') || t.includes('junk') || (t.includes('bond') && s >= 45)) return 'High Yield Bonds';
  if (t.includes('international') && (t.includes('bond') || t.includes('fixed')))         return 'International Bonds';
  if (t.includes('bond') || t.includes('fixed income') || t.includes('aggregate') || (s > 8 && s <= 38)) return 'Investment Grade Bonds';

  // Equity by geography + style
  if (t.includes('emerging') || nm.includes('emerging'))                     return 'Emerging Markets';
  if (t.includes('international') || t.includes('foreign') || t.includes('developed') ||
      nm.includes('international') || ['EFA','VEA','IEFA','SCHF','VGK','EWJ','EWU','EWG'].includes(tk)) return 'International Developed';

  // US equity by style box (risk-score proxy)
  if (t.includes('small cap') || nm.includes('small cap') || nm.includes('small-cap') ||
      ['IWM','VB','IJR','SCHA','AVUV','DFSVX'].includes(tk))                 return 'US Small Cap';
  if (t.includes('mid cap') || nm.includes('mid cap') || ['MDY','IJH','VO','IWS'].includes(tk)) return 'US Mid Cap';

  // Sector / thematic
  if (t.includes('real estate') || t.includes('reit') || ['VNQ','XLRE','IYR','SCHH'].includes(tk)) return 'Real Estate';
  if (t.includes('commodity') || t.includes('gold') || t.includes('silver') ||
      ['GLD','IAU','SLV','PDBC','GSG','DJP','USO'].includes(tk))             return 'Commodities & Real Assets';
  if (t.includes('crypto') || t.includes('bitcoin') || s >= 93)              return 'Crypto / Digital Assets';

  // Covered call / income equity
  if (t.includes('covered call') || t.includes('income') ||
      ['JEPI','JEPQ','XYLD','QYLD','DIVO'].includes(tk))                     return 'Equity Income / Options';

  // Balanced / allocation funds
  if (t.includes('balanced') || t.includes('allocation') || t.includes('target') || (s >= 42 && s <= 62 && t.includes('fund'))) return 'Balanced / Target Date';

  // US large cap — default equity bucket
  if (s >= 62)                                                                return 'US Large Cap Equity';

  return 'Other';
}

// PIE CHART COLORS per bucket
const DD_COLORS = {
  'Equities':          '#2563a8',
  'Fixed Income':      '#22a06b',
  'Cash & Money Market':'#6b7e96',
  'Annuities':         '#cda561',
  'Structured Notes':  '#8b5cf6',
  'Alternatives':      '#d4820a',
  // sub-cats
  'US Large Cap Equity':'#1d4ed8',
  'US Mid Cap':         '#3b82f6',
  'US Small Cap':       '#60a5fa',
  'International Developed':'#0e7490',
  'Emerging Markets':   '#0891b2',
  'Equity Income / Options':'#2563a8',
  'Balanced / Target Date':'#7c3aed',
  'Investment Grade Bonds':'#16a34a',
  'US Treasuries':      '#15803d',
  'Municipal Bonds':    '#166534',
  'High Yield Bonds':   '#ca8a04',
  'International Bonds':'#4d7c0f',
  'Cash & Money Market':'#6b7280',
  'CDs':                '#9ca3af',
  'Real Estate':        '#c2410c',
  'Commodities & Real Assets':'#b45309',
  'Crypto / Digital Assets':'#7c3aed',
  'Structured Notes':   '#8b5cf6',
  'Annuities':          '#cda561',
  'Other':              '#d1d5db',
};

function ddColor(label) {
  return DD_COLORS[label] || '#6b7e96';
}

function getActiveDDHoldings() {
  // Returns flat array of holdings from non-excluded accounts, with cash rows added
  const all = [];
  _portfolioAccounts.forEach((acct, ai) => {
    if (_ddExcluded.has(ai)) return;
    (acct.holdings || []).forEach(h => all.push(h));
    if (acct.cash_added > 0) {
      all.push({ ticker:'CASH', name:'Cash', type:'Cash & Money Market', market_value: acct.cash_added, allocation_pct: 0, risk_score: 5 });
    } else if (acct.cash_added < 0) {
      all.push({ ticker:'DEBIT', name:'Debit Balance (Margin / Borrowed)', type:'Debit Balance', market_value: acct.cash_added, allocation_pct: 0, risk_score: 85 });
    }
  });
  return all;
}

function renderDeepDive() {
  renderDDFilters();
  renderDDPie();
  renderDDSubAssets();
  // Reset narrative if accounts changed
  _ddNarrativeGenerated = false;
  const nb = document.getElementById('dd-narrative-box');
  const btn = document.getElementById('dd-narrative-btn');
  if (nb)  { nb.textContent = ''; nb.classList.remove('visible'); }
  if (btn) { btn.disabled = false; btn.innerHTML = '✨ Draft Client Email'; }
}

function renderDDFilters() {
  const wrap = document.getElementById('dd-acct-filters');
  if (!wrap) return;
  wrap.innerHTML = _portfolioAccounts.map((acct, ai) => {
    const active = !_ddExcluded.has(ai);
    return `<div class="dd-acct-pill ${active ? 'active' : ''}" onclick="toggleDDAccount(${ai})">
      <div class="dd-pill-dot"></div>
      <span>${acct.account_name || 'Account ' + (ai+1)}</span>
    </div>`;
  }).join('');
}

function toggleDDAccount(ai) {
  if (_ddExcluded.has(ai)) _ddExcluded.delete(ai);
  else _ddExcluded.add(ai);
  renderDeepDive();
}

// Map holding → broad pie sleeve
function inferPieSleeve(h) {
  const t  = (h.type  || '').toLowerCase();
  const nm = (h.name  || '').toLowerCase();
  const tk = (h.ticker|| '').toUpperCase();
  const s  = parseFloat(h.risk_score) || 50;
  if (t.includes('annuity'))                                                    return 'Annuities';
  if (t.includes('structured note') || t.includes('buffer note') ||
      t.includes('autocall') || t.includes('barrier') ||
      t.includes('principal protected') || t.includes('participation note'))    return 'Structured Notes';
  if (s <= 6 || t.includes('money market') || (t.includes('cash') && !t.includes('cash flow') && !t.includes('cashflow')) ||
      t.includes('cd') || nm.includes('certificate of deposit'))               return 'Cash & Money Market';
  if (s <= 40 || t.includes('bond') || t.includes('fixed income') ||
      t.includes('treasury') || t.includes('municipal') ||
      t.includes('aggregate') || t.includes('high yield'))                     return 'Fixed Income';
  if (t.includes('real estate') || t.includes('reit') || t.includes('commodity') ||
      t.includes('gold') || t.includes('silver') ||
      ['VNQ','XLRE','IYR','SCHH','GLD','IAU','SLV','PDBC','GSG','DJP','USO'].includes(tk)) return 'Real Assets';
  if (t.includes('crypto') || t.includes('bitcoin') || s >= 93 ||
      ['IBIT','FBTC','GBTC','ETHE','BITB','BITO'].includes(tk))                return 'Crypto / Digital Assets';
  if (t.includes('international') || t.includes('emerging') || t.includes('foreign') ||
      t.includes('developed') || nm.includes('international') ||
      nm.includes('emerging') || nm.includes('europe') || nm.includes('asia') ||
      ['EFA','VEA','IEFA','SCHF','VGK','EWJ','EWU','EWG','VWO','EEM','IEMG'].includes(tk)) return 'International Equities';
  return 'US Equities';
}

const PIE_SLEEVE_COLORS = {
  'US Equities':             '#1d4ed8',
  'International Equities':  '#0e7490',
  'Fixed Income':            '#16a34a',
  'Real Assets':             '#c2410c',
  'Cash & Money Market':     '#6b7280',
  'Annuities':               '#cda561',
  'Structured Notes':        '#7c3aed',
  'Crypto / Digital Assets': '#9333ea',
};

function drawDonutSVG(svgEl, legendEl, buckets, total, centerLine1, centerLine2) {
  if (total === 0) {
    svgEl.innerHTML = '<text x="110" y="115" text-anchor="middle" fill="#6b7e96" font-size="12" font-family="Nunito Sans">No data</text>';
    if (legendEl) legendEl.innerHTML = '';
    return;
  }
  const cx = 110, cy = 110, r = 95, innerR = 52;
  const entries = Object.entries(buckets).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);
  let startAngle = -Math.PI / 2, slicesHTML = '', legendHTML = '';
  entries.forEach(([label, val]) => {
    const frac = val / total, angle = frac * 2 * Math.PI, end = startAngle + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1  = cx + r*Math.cos(startAngle),      y1  = cy + r*Math.sin(startAngle);
    const x2  = cx + r*Math.cos(end),             y2  = cy + r*Math.sin(end);
    const ix1 = cx + innerR*Math.cos(startAngle), iy1 = cy + innerR*Math.sin(startAngle);
    const ix2 = cx + innerR*Math.cos(end),        iy2 = cy + innerR*Math.sin(end);
    const col = PIE_SLEEVE_COLORS[label] || ddColor(label) || '#6b7e96';
    const pct = (frac * 100).toFixed(1);
    slicesHTML += `<path class="dd-pie-slice" d="M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1} Z" fill="${col}" title="${label}: ${pct}%"/>`;
    if (legendEl) legendHTML += `<div class="dd-legend-item"><div class="dd-legend-dot" style="background:${col}"></div><span class="dd-legend-label">${label}</span><span class="dd-legend-pct">${pct}%</span></div>`;
    startAngle = end;
  });
  slicesHTML += `<text x="${cx}" y="${cy-6}" text-anchor="middle" fill="#1b2b3a" font-size="10" font-weight="700" font-family="Nunito Sans,sans-serif">${centerLine1}</text>`;
  slicesHTML += `<text x="${cx}" y="${cy+9}" text-anchor="middle" fill="#1b2b3a" font-size="10" font-weight="700" font-family="Nunito Sans,sans-serif">${centerLine2}</text>`;
  svgEl.innerHTML = slicesHTML;
  if (legendEl) legendEl.innerHTML = legendHTML;
}

function renderDDPie() {
  const holdings = getActiveDDHoldings();
  const svg    = document.getElementById('dd-pie-svg');
  const legend = document.getElementById('dd-legend');
  if (!svg) return;
  const buckets = {};
  let total = 0;
  holdings.forEach(h => {
    const mv = parseFloat(h.market_value) || 0;
    buckets[inferPieSleeve(h)] = (buckets[inferPieSleeve(h)] || 0) + mv;
    total += mv;
  });
  drawDonutSVG(svg, legend, buckets, total, 'PORTFOLIO', 'ALLOCATION');
}
function renderDDSubAssets() {
  const holdings = getActiveDDHoldings();
  const grid = document.getElementById('dd-sub-grid');
  if (!grid) return;

  const cats = {};
  let total = 0;
  holdings.forEach(h => {
    const mv  = parseFloat(h.market_value) || 0;
    const cat = inferSubCategory(h);
    cats[cat] = (cats[cat] || 0) + mv;
    total += mv;
  });

  if (total === 0) { grid.innerHTML = '<div style="color:var(--slate);font-size:.75rem">No data available.</div>'; return; }

  const sorted = Object.entries(cats).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]);

  grid.innerHTML = sorted.map(([label, val]) => {
    const pct = (val / total * 100);
    const col = ddColor(label);
    return `<div class="dd-sub-row">
      <div class="dd-sub-label">${label}</div>
      <div class="dd-sub-bar-bg"><div class="dd-sub-bar-fill" style="width:0%;background:${col}" data-pct="${pct.toFixed(1)}"></div></div>
      <div class="dd-sub-pct">${pct.toFixed(1)}%</div>
    </div>`;
  }).join('');

  // Animate bars in
  setTimeout(() => {
    grid.querySelectorAll('.dd-sub-bar-fill').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 60);
}

async function generateNarrative() {
  const btn = document.getElementById('dd-narrative-btn');
  const box = document.getElementById('dd-narrative-box');
  if (!btn || !box) return;

  btn.disabled = true;
  btn.innerHTML = '⏳ Generating analysis…';
  box.classList.add('visible');
  box.innerHTML = '<span class="dd-narrative-streaming">Analyzing your portfolio…</span>';

  // Build a concise portfolio summary for the AI
  const holdings = getActiveDDHoldings();
  const activeAccts = _portfolioAccounts.filter((_,ai) => !_ddExcluded.has(ai));
  const totalMV = holdings.reduce((s,h) => s + (parseFloat(h.market_value)||0), 0);

  // Sub-asset tallies
  const cats = {};
  holdings.forEach(h => {
    const mv  = parseFloat(h.market_value) || 0;
    const cat = inferSubCategory(h);
    cats[cat] = (cats[cat] || 0) + mv;
  });
  const catSummary = Object.entries(cats).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1])
    .map(([l,v]) => l + ': ' + (v/totalMV*100).toFixed(1) + '%').join(', ');

  // Overall score from DOM
  const overallScore = parseInt(document.getElementById('az-score')?.textContent) || 50;
  const overallLevel = document.getElementById('az-level')?.textContent || '';

  // Account summaries
  const acctLines = activeAccts.map((a,i) => {
    const el = document.getElementById('acct-' + _portfolioAccounts.indexOf(a) + '-score');
    const sc = el ? el.textContent : '?';
    const bal = a.holdings.reduce((s,h)=>s+(parseFloat(h.market_value)||0),0) + (a.cash_added||0); // cash_added can be negative (debit)
    return `• ${a.account_name}: Risk Score ${sc}, Balance ${bal > 0 ? '$' + Math.round(bal).toLocaleString() : 'unknown'}`;
  }).join('\n');

  const topHoldings = [...holdings].sort((a,b)=>(parseFloat(b.market_value)||0)-(parseFloat(a.market_value)||0))
    .slice(0,8).map(h => (h.ticker||h.name) + ' (' + (h.type||'') + ', score ' + Math.round(parseFloat(h.risk_score)||50) + ')').join(', ');

  const prompt = `You are a senior financial advisor writing a portfolio analysis for a CLIENT (not an advisor). Write in warm, plain English — no jargon, no technical terms without explanation. Be direct, encouraging, and honest.

PORTFOLIO DATA:
- Overall Risk Score: ${overallScore}/100 (${overallLevel})
- Total Value: ${totalMV > 0 ? '$' + Math.round(totalMV).toLocaleString() : 'not provided'}
- Accounts:\n${acctLines}
- Asset Category Breakdown: ${catSummary}
- Top Holdings: ${topHoldings}

Write a 4-paragraph client-facing analysis covering:
1. Overall portfolio character — what kind of investor this portfolio is built for, and how it balances growth vs protection
2. What's working well — strengths in the current allocation
3. Areas to be mindful of — any concentration risks, gaps, or things worth discussing with your advisor (keep this constructive, not alarming)
4. One forward-looking thought — how this portfolio is positioned for the road ahead

Format as plain paragraphs — NO bullet points, NO headers, NO markdown. Write as if speaking directly to the client. Keep it under 280 words total. Be specific to their actual numbers.`;

  try {
    const requestBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    };

    const resp = await fetch('/api/proxy', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify(requestBody)
    });

    let data;
    try {
      data = await resp.json();
    } catch(parseErr) {
      const raw = await resp.text().catch(() => '(unreadable)');
      throw new Error('JSON parse failed. Status ' + resp.status + '. Body: ' + raw.slice(0, 200));
    }

    // Surface API-level errors (auth, rate limit, etc.)
    if (data.error) {
      throw new Error('API: ' + (data.error.message || JSON.stringify(data.error)));
    }
    if (!resp.ok) {
      throw new Error('HTTP ' + resp.status + ': ' + JSON.stringify(data).slice(0, 200));
    }

    const text = (data.content||[]).map(b => b.type === 'text' ? b.text : '').join('').trim();

    if (!text) throw new Error('No text in response. Content: ' + JSON.stringify(data.content).slice(0,200));

    // Parse subject line and body
    const subjectMatch = text.match(/^Subject:\s*(.+)/im);
    const subject = subjectMatch ? subjectMatch[1].trim() : '';
    const body = text.replace(/^Subject:\s*.+\n?/im, '').trim();

    const paragraphs = body.split(/\n\n+/).filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');

    box.innerHTML = `
      ${subject ? `<div style="background:var(--border);border-radius:6px;padding:8px 14px;margin-bottom:16px;font-size:.72rem;color:var(--slate)"><strong style="color:var(--navy)">Subject:</strong> ${subject}</div>` : ''}
      <div class="dd-email-body">${paragraphs}</div>
      <button class="dd-copy-email-btn" onclick="copyEmailText(this)" data-subject="${subject.replace(/"/g,'&quot;')}" data-body="${encodeURIComponent(body)}">📋 Copy Email</button>
    `;
    _ddNarrativeGenerated = true;
    btn.innerHTML = '↺ Redraft Email';
    btn.disabled = false;
  } catch(e) {
    console.error('Narrative error:', e);
    box.innerHTML = `<p style="color:#c0392b;font-weight:600">Could not generate analysis.</p><p style="color:#6b7e96;font-size:.75rem">${e.message || 'Unknown error'}</p>`;
    btn.innerHTML = '✨ Generate Client-Ready Analysis';
    btn.disabled = false;
  }
}


function loadSamplePortfolio() {
  // Realistic sample: married couple, moderate-aggressive, 3 accounts
  const sampleData = {
    portfolio_name: "Sample — Robert & Linda Matthews",
    accounts: [
      {
        account_name: "Robert — Rollover IRA (4812)",
        holdings: [
          { ticker:"VTI",   name:"Vanguard Total Stock Market ETF",      type:"ETF",            market_value:87400,  allocation_pct:34.9, risk_score:72, risk_level:"Moderately High" },
          { ticker:"VXUS",  name:"Vanguard Total Intl Stock ETF",         type:"ETF",            market_value:41200,  allocation_pct:16.4, risk_score:74, risk_level:"Moderately High" },
          { ticker:"BND",   name:"Vanguard Total Bond Market ETF",        type:"ETF",            market_value:38600,  allocation_pct:15.4, risk_score:28, risk_level:"Conservative" },
          { ticker:"JEPI",  name:"JPMorgan Equity Premium Income ETF",    type:"ETF",            market_value:29800,  allocation_pct:11.9, risk_score:55, risk_level:"Moderate" },
          { ticker:"GLD",   name:"SPDR Gold Shares",                      type:"ETF",            market_value:18500,  allocation_pct:7.4,  risk_score:62, risk_level:"Moderate" },
          { ticker:"",      name:"2027 Buffer Note S&P 500 15% Buffer",   type:"Buffer Note",    market_value:22000,  allocation_pct:8.8,  risk_score:30, risk_level:"Conservative" },
          { ticker:"SGOV",  name:"iShares 0-3 Month Treasury Bond ETF",   type:"ETF",            market_value:13300,  allocation_pct:5.3,  risk_score:5,  risk_level:"Low Risk" },
        ]
      },
      {
        account_name: "Linda — Roth IRA (2291)",
        holdings: [
          { ticker:"QQQ",   name:"Invesco QQQ Trust (Nasdaq 100)",        type:"ETF",            market_value:54600,  allocation_pct:38.2, risk_score:82, risk_level:"High Risk" },
          { ticker:"AVUV",  name:"Avantis US Small Cap Value ETF",         type:"ETF",            market_value:31200,  allocation_pct:21.8, risk_score:78, risk_level:"High Risk" },
          { ticker:"VGK",   name:"Vanguard FTSE Europe ETF",              type:"ETF",            market_value:22400,  allocation_pct:15.7, risk_score:70, risk_level:"Moderately High" },
          { ticker:"IBIT",  name:"iShares Bitcoin Trust ETF",             type:"ETF",            market_value:9800,   allocation_pct:6.9,  risk_score:95, risk_level:"High Risk" },
          { ticker:"SCHH",  name:"Schwab US REIT ETF",                    type:"ETF",            market_value:14600,  allocation_pct:10.2, risk_score:65, risk_level:"Moderate" },
          { ticker:"VCSH",  name:"Vanguard Short-Term Corp Bond ETF",     type:"ETF",            market_value:10200,  allocation_pct:7.1,  risk_score:22, risk_level:"Conservative" },
        ]
      },
      {
        account_name: "Joint Taxable — Matthews (7703)",
        holdings: [
          { ticker:"",      name:"Lincoln Financial Fixed Indexed Annuity", type:"Fixed Indexed Annuity", market_value:95000, allocation_pct:45.7, risk_score:5, risk_level:"Low Risk" },
          { ticker:"AAPL",  name:"Apple Inc.",                             type:"Stock",          market_value:28400,  allocation_pct:13.7, risk_score:72, risk_level:"Moderately High" },
          { ticker:"MSFT",  name:"Microsoft Corporation",                  type:"Stock",          market_value:24600,  allocation_pct:11.8, risk_score:70, risk_level:"Moderately High" },
          { ticker:"VNQ",   name:"Vanguard Real Estate ETF",               type:"ETF",            market_value:18200,  allocation_pct:8.8,  risk_score:65, risk_level:"Moderate" },
          { ticker:"",      name:"2026 Autocall Note Linked to Russell 2000", type:"Autocall Note", market_value:35000, allocation_pct:16.8, risk_score:30, risk_level:"Conservative" },
          { ticker:"PDBC",  name:"Invesco Optimum Yield Diversified Commodity", type:"ETF",       market_value:6800,   allocation_pct:3.3,  risk_score:62, risk_level:"Moderate" },
        ]
      }
    ]
  };

  // Directly render — skip API call
  document.getElementById('upload-area').style.display = 'none';
  document.getElementById('analyzing-state').style.display = 'none';
  renderPortfolio(sampleData);
}

