/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Portfolio stress test — scenarios, income bridge, PDF export
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */
// ══ STRESS TEST ══

// Historical asset class drawdowns per scenario (approximate, based on index data)
const STRESS_SCENARIOS = {
  '2008': {
    label: '2008 Financial Crisis',
    period: 'Sep 2008 – Mar 2009',
    duration: '6 months peak-to-trough',
    recovery: '~4 years to new highs',
    description: 'The worst financial crisis since the Great Depression. Triggered by the collapse of mortgage-backed securities and major financial institutions.',
    impacts: {
      'US Large Cap Equity':       -52,
      'US Mid Cap':                -55,
      'US Small Cap':              -58,
      'International Developed':   -54,
      'Emerging Markets':          -61,
      'Equity Income / Options':   -40,
      'Balanced / Target Date':    -32,
      'Investment Grade Bonds':    +5,
      'US Treasuries':             +14,
      'Municipal Bonds':           -5,
      'High Yield Bonds':          -33,
      'International Bonds':       -8,
      'Cash & Money Market':       +2,
      'CDs':                       +2,
      'Real Estate':               -68,
      'Commodities & Real Assets': -44,
      'Crypto / Digital Assets':   0,
      'Structured Notes':          -20,
      'Annuities':                 0,
      'Other':                     -40,
    },
    takeaway: 'Diversification across bonds and annuities provided meaningful protection. Equity-heavy portions of the portfolio would have faced significant temporary losses, but recovered fully within a few years for long-term holders.'
  },
  'covid': {
    label: '2020 COVID Crash',
    period: 'Feb 19 – Mar 23, 2020',
    duration: '33 days peak-to-trough',
    recovery: '~5 months to new highs',
    description: 'The fastest bear market in history, driven by global pandemic fears. Uniquely sharp but followed by the fastest recovery on record.',
    impacts: {
      'US Large Cap Equity':       -34,
      'US Mid Cap':                -41,
      'US Small Cap':              -41,
      'International Developed':   -34,
      'Emerging Markets':          -31,
      'Equity Income / Options':   -30,
      'Balanced / Target Date':    -22,
      'Investment Grade Bonds':    +3,
      'US Treasuries':             +8,
      'Municipal Bonds':           -10,
      'High Yield Bonds':          -21,
      'International Bonds':       -5,
      'Cash & Money Market':       +1,
      'CDs':                       +1,
      'Real Estate':               -38,
      'Commodities & Real Assets': -36,
      'Crypto / Digital Assets':   -50,
      'Structured Notes':          -15,
      'Annuities':                 0,
      'Other':                     -28,
    },
    takeaway: 'The COVID crash was brutal but brief. Portfolios with annuities and treasuries held firm. The rapid recovery rewarded those who stayed invested — panic selling near the bottom was the primary risk.'
  },
  '2022': {
    label: '2022 Rate Hike Bear Market',
    period: 'Jan 2022 – Oct 2022',
    duration: '10 months',
    recovery: '~18 months to new highs',
    description: 'The Federal Reserve\'s fastest rate-hiking cycle in 40 years crushed both stocks and bonds simultaneously — one of the few periods where traditional diversification offered little shelter.',
    impacts: {
      'US Large Cap Equity':       -25,
      'US Mid Cap':                -27,
      'US Small Cap':              -27,
      'International Developed':   -26,
      'Emerging Markets':          -30,
      'Equity Income / Options':   -14,
      'Balanced / Target Date':    -20,
      'Investment Grade Bonds':    -17,
      'US Treasuries':             -14,
      'Municipal Bonds':           -13,
      'High Yield Bonds':          -15,
      'International Bonds':       -19,
      'Cash & Money Market':       +2,
      'CDs':                       +3,
      'Real Estate':               -27,
      'Commodities & Real Assets': +16,
      'Crypto / Digital Assets':   -77,
      'Structured Notes':          -8,
      'Annuities':                 0,
      'Other':                     -20,
    },
    takeaway: 'This scenario exposed the limits of stock-bond diversification. Cash, CDs, annuities, and commodities were the rare bright spots. Structured notes with buffers also provided meaningful downside protection.'
  },
  'dotcom': {
    label: '2000 Dot Com Bubble',
    period: 'Mar 2000 – Oct 2002',
    duration: '30 months peak-to-trough',
    recovery: '~7 years to new highs',
    description: 'The bursting of the technology bubble wiped out trillions in paper wealth. Tech-heavy portfolios were devastated while value stocks and bonds held up remarkably well.',
    impacts: {
      'US Large Cap Equity':       -49,
      'US Mid Cap':                -45,
      'US Small Cap':              -44,
      'International Developed':   -48,
      'Emerging Markets':          -40,
      'Equity Income / Options':   -30,
      'Balanced / Target Date':    -25,
      'Investment Grade Bonds':    +29,
      'US Treasuries':             +34,
      'Municipal Bonds':           +18,
      'High Yield Bonds':          -5,
      'International Bonds':       +12,
      'Cash & Money Market':       +5,
      'CDs':                       +5,
      'Real Estate':               +10,
      'Commodities & Real Assets': +10,
      'Crypto / Digital Assets':   0,
      'Structured Notes':          -10,
      'Annuities':                 0,
      'Other':                     -35,
    },
    takeaway: 'A powerful reminder that diversification beyond equities matters enormously. Bonds and cash thrived as stocks collapsed. Portfolios balanced with fixed income would have navigated this period far more comfortably.'
  },
  // ── BULL MARKET SCENARIOS ──
  'bull2009': {
    label: '2009 Recovery Rally',
    period: 'Jan 2009 – Dec 2009',
    duration: '12 months',
    recovery: 'N/A — the rebound year after 2008',
    description: 'The other side of the 2008 story. After the March 2009 bottom, markets staged one of the most powerful rallies in history — the S&P 500 finished the year up over 26%, and more than 65% above its March low. Investors who stayed the course captured the recovery in full.',
    bull: true,
    impacts: {
      'US Large Cap Equity':       +26,
      'US Mid Cap':                +37,
      'US Small Cap':              +27,
      'International Developed':   +32,
      'Emerging Markets':          +79,
      'Equity Income / Options':   +20,
      'Balanced / Target Date':    +20,
      'Investment Grade Bonds':    +6,
      'US Treasuries':             -4,
      'Municipal Bonds':           +13,
      'High Yield Bonds':          +58,
      'International Bonds':       +7,
      'Cash & Money Market':       0,
      'CDs':                       +2,
      'Real Estate':               +28,
      'Commodities & Real Assets': +19,
      'Crypto / Digital Assets':   0,
      'Structured Notes':          +10,
      'Annuities':                 0,
      'Other':                     +22,
    },
    takeaway: 'The best days in the market tend to arrive when things feel worst. Investors who sold near the 2008 bottom locked in their losses and missed this rally entirely — those who stayed invested began recovering almost immediately. Pair this scenario with the 2008 stress test to show clients both halves of the story.'
  },
  'bull2013': {
    label: 'Post-Crisis Bull (2013)',
    period: 'Jan 2013 – Dec 2013',
    duration: '12 months',
    recovery: 'N/A — sustained bull run',
    description: 'One of the strongest single-year equity rallies of the post-2008 recovery. The Federal Reserve\'s quantitative easing fueled broad risk-on appetite, with the S&P 500 returning over 32%.',
    bull: true,
    impacts: {
      'US Large Cap Equity':       +32,
      'US Mid Cap':                +34,
      'US Small Cap':              +38,
      'International Developed':   +23,
      'Emerging Markets':          -5,
      'Equity Income / Options':   +28,
      'Balanced / Target Date':    +16,
      'Investment Grade Bonds':    -2,
      'US Treasuries':             -8,
      'Municipal Bonds':           -3,
      'High Yield Bonds':          +7,
      'International Bonds':       -5,
      'Cash & Money Market':       0,
      'CDs':                       +1,
      'Real Estate':               +2,
      'Commodities & Real Assets': -8,
      'Crypto / Digital Assets':   +5500,
      'Structured Notes':          +12,
      'Annuities':                 0,
      'Other':                     +22,
    },
    takeaway: 'A powerful reminder of the cost of sitting on the sidelines. Equity-heavy portfolios thrived while bonds lagged. Diversified investors captured meaningful gains while still managing downside risk.'
  },
  'bull2017': {
    label: 'Low-Vol Bull (2017)',
    period: 'Jan 2017 – Dec 2017',
    duration: '12 months',
    recovery: 'N/A — sustained bull run',
    description: 'An unusually calm and consistent rally — the S&P 500 gained over 21% with record-low volatility and not a single 3% pullback all year. International and emerging markets led the way.',
    bull: true,
    impacts: {
      'US Large Cap Equity':       +22,
      'US Mid Cap':                +18,
      'US Small Cap':              +15,
      'International Developed':   +25,
      'Emerging Markets':          +37,
      'Equity Income / Options':   +16,
      'Balanced / Target Date':    +14,
      'Investment Grade Bonds':    +4,
      'US Treasuries':             +2,
      'Municipal Bonds':           +5,
      'High Yield Bonds':          +7,
      'International Bonds':       +10,
      'Cash & Money Market':       +1,
      'CDs':                       +1,
      'Real Estate':               +5,
      'Commodities & Real Assets': +6,
      'Crypto / Digital Assets':   +1400,
      'Structured Notes':          +10,
      'Annuities':                 0,
      'Other':                     +16,
    },
    takeaway: 'Nearly every asset class delivered positive returns — a rare rising-tide environment. International diversification was particularly rewarded. Annuities and cash provided stability but lagged the broad market significantly.'
  },
  'bull2021': {
    label: 'Post-COVID Boom (2021)',
    period: 'Jan 2021 – Dec 2021',
    duration: '12 months',
    recovery: 'N/A — pandemic rebound bull run',
    description: 'Fiscal stimulus, vaccine rollouts, and reopening euphoria drove one of the most powerful economic rebounds in history. Growth, tech, and crypto soared while supply chain pressures began building.',
    bull: true,
    impacts: {
      'US Large Cap Equity':       +29,
      'US Mid Cap':                +24,
      'US Small Cap':              +15,
      'International Developed':   +11,
      'Emerging Markets':          -3,
      'Equity Income / Options':   +26,
      'Balanced / Target Date':    +13,
      'Investment Grade Bonds':    -2,
      'US Treasuries':             -3,
      'Municipal Bonds':           +1,
      'High Yield Bonds':          +5,
      'International Bonds':       -2,
      'Cash & Money Market':       0,
      'CDs':                       0,
      'Real Estate':               +43,
      'Commodities & Real Assets': +27,
      'Crypto / Digital Assets':   +60,
      'Structured Notes':          +12,
      'Annuities':                 0,
      'Other':                     +20,
    },
    takeaway: 'A broad risk-on environment rewarded equities, real assets, and alternatives. Bonds were essentially flat to slightly negative as inflation expectations rose. Real estate and commodities were standout performers alongside equities.'
  }
};

let _stActiveScenario = '2008';
let _stCustomResult = null;

// ── Income Bridge (stability cushion) ──
const STABLE_CATEGORIES = [
  'Cash & Money Market', 'CDs', 'US Treasuries', 'Investment Grade Bonds',
  'Municipal Bonds', 'International Bonds', 'Annuities'
];
let _stDistAmount = '';      // persists across scenario tabs
let _stDistFreq   = 'monthly';
let _stBridgeData = null;    // computed per rendered scenario

function parseRecoveryYears(scenario) {
  if (!scenario || !scenario.recovery) return { years: null, label: null };
  const m = scenario.recovery.match(/(\d+(?:\.\d+)?)\s*(year|month)/i);
  if (!m) return { years: null, label: null };
  const n = parseFloat(m[1]);
  const isMonths = /month/i.test(m[2]);
  return { years: isMonths ? n / 12 : n, label: isMonths ? n + ' months' : n + (n === 1 ? ' year' : ' years') };
}

function buildBridgeSection(assetImpacts, totalMV, scenario) {
  const fmt$ = n => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  let stableNow = 0;
  const stableRows = [];
  assetImpacts.forEach(a => {
    if (STABLE_CATEGORIES.includes(a.cat)) {
      stableNow += a.mv;
      stableRows.push({ cat: a.cat, mv: a.mv });
    }
  });
  const stablePct = totalMV > 0 ? (stableNow / totalMV * 100) : 0;
  const rec = parseRecoveryYears(scenario);
  _stBridgeData = { stableNow, recoveryYears: rec.years, recoveryLabel: rec.label };

  // No stable assets at all — turn it into the planning conversation
  if (stableNow <= 0) {
    _stBridgeData = null;
    return `
    <div class="st-bridge">
      <div class="st-bridge-title">🛡️ The Calm Side of the Portfolio</div>
      <div class="st-bridge-sub">Not everything falls in a downturn — cash, bonds, CDs, and annuities historically hold steady while stocks recover.</div>
      <div class="st-bridge-msg partial">This portfolio currently holds <strong>no allocation to stable assets</strong> (cash, money market, bonds, CDs, or annuities). In a scenario like this, any income need would have to be met by selling investments at depressed prices. That is the strongest reason to carve out a stability sleeve now, while markets are calm — before the next downturn arrives.</div>
    </div>`;
  }

  const rowsHTML = stableRows.sort((a,b) => b.mv - a.mv)
    .map(r => `${r.cat}: ${fmt$(r.mv)}`)
    .join(' &nbsp;·&nbsp; ');

  return `
    <div class="st-bridge">
      <div class="st-bridge-title">🛡️ The Calm Side of the Portfolio</div>
      <div class="st-bridge-sub">While the numbers above show the storm, this is the shelter — the portion of the portfolio in stable assets, valued as-is with no growth assumed.</div>

      <div class="st-scenario-header" style="margin-bottom:14px">
        <div class="st-stat-card" style="border-top:3px solid #16a34a;background:#fff">
          <div class="st-stat-label">Balance in Stable Assets</div>
          <div class="st-stat-value neutral">${fmt$(stableNow)}</div>
          <div class="st-stat-sub">cash · money market · bonds · CDs · annuities</div>
        </div>
        <div class="st-stat-card" style="border-top:3px solid #16a34a;background:#fff">
          <div class="st-stat-label">% of Portfolio</div>
          <div class="st-stat-value neutral">${stablePct.toFixed(0)}%</div>
          <div class="st-stat-sub">held in stable assets</div>
        </div>
        <div class="st-stat-card" style="border-top:3px solid var(--teal);background:#fff">
          <div class="st-stat-label">Distribution Bridge</div>
          <div class="st-stat-value recovery" id="st-bridge-years">—</div>
          <div class="st-stat-sub" id="st-bridge-years-sub">enter distributions below</div>
        </div>
      </div>

      <div class="st-bridge-rows">${rowsHTML}</div>
      <div class="st-bridge-input-row">
        <label>💵 Client distributions:</label>
        <span style="font-size:.78rem;color:#3d6b52;font-weight:600">$</span>
        <input id="st-bridge-amt" type="number" step="100" min="0" placeholder="e.g. 4,000" value="${_stDistAmount}" oninput="updateStressBridge()">
        <select id="st-bridge-freq" onchange="updateStressBridge()">
          <option value="monthly" ${_stDistFreq === 'monthly' ? 'selected' : ''}>per month</option>
          <option value="annual" ${_stDistFreq === 'annual' ? 'selected' : ''}>per year</option>
        </select>
      </div>
      <div id="st-bridge-result"></div>
    </div>`;
}

function updateStressBridge() {
  const box = document.getElementById('st-bridge-result');
  if (!box || !_stBridgeData) return;
  const amtEl  = document.getElementById('st-bridge-amt');
  const freqEl = document.getElementById('st-bridge-freq');
  if (amtEl)  _stDistAmount = amtEl.value;
  if (freqEl) _stDistFreq   = freqEl.value;

  const fmt$ = n => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  const amt = parseFloat(_stDistAmount);
  const { stableNow, recoveryYears, recoveryLabel } = _stBridgeData;
  const yearsCard = document.getElementById('st-bridge-years');
  const yearsSub  = document.getElementById('st-bridge-years-sub');

  if (!amt || amt <= 0) {
    if (yearsCard) yearsCard.textContent = '—';
    if (yearsSub)  yearsSub.textContent  = 'enter distributions below';
    box.innerHTML = `<div class="st-bridge-msg info">Enter the client's regular distributions above to see how long their stable holdings alone could carry their income through a downturn like this.</div>`;
    return;
  }

  const annual = _stDistFreq === 'monthly' ? amt * 12 : amt;
  const years  = stableNow / annual;
  const yrsTxt = years >= 40 ? '40+ yrs' : (years >= 10 ? Math.round(years) + ' yrs' : years.toFixed(1) + ' yrs');
  const yrsTxtLong = years >= 40 ? '40+ years' : (years >= 10 ? Math.round(years) + ' years' : years.toFixed(1) + ' years');
  const monthsTxt = Math.round(years * 12);

  if (yearsCard) yearsCard.textContent = yrsTxt;
  if (yearsSub)  yearsSub.textContent  = 'of distributions covered at ' + fmt$(annual) + '/yr';

  let barHTML = '', cls, msg;

  if (recoveryYears) {
    const covPct = Math.min(years / recoveryYears * 100, 100);
    barHTML = `
      <div style="margin-top:14px">
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#3d6b52;margin-bottom:5px;flex-wrap:wrap">
          <span>Income covered by stable assets: ${yrsTxtLong}</span>
          <span>Historical recovery: ~${recoveryLabel}</span>
        </div>
        <div style="height:12px;background:#d5e6da;border-radius:6px;overflow:hidden">
          <div style="height:100%;width:${covPct.toFixed(0)}%;background:linear-gradient(90deg,#1a6b4a,#16a34a);border-radius:6px;transition:width .6s cubic-bezier(.4,0,.2,1)"></div>
        </div>
      </div>`;
    if (years >= recoveryYears) {
      cls = 'ok';
      msg = `<strong>✓ Fully bridged.</strong> At ${fmt$(annual)} per year, the stable side of the portfolio alone — assuming no growth at all — could cover roughly <strong>${yrsTxtLong}</strong> of distributions. That is longer than the ~${recoveryLabel} it historically took markets to reach new highs after this event. In a downturn like this, income could come entirely from stable assets while the growth side is given the time it needs to recover. Nothing would have to be sold at depressed prices.`;
    } else {
      cls = 'partial';
      msg = `At ${fmt$(annual)} per year, stable holdings could cover roughly <strong>${yrsTxtLong}</strong> of distributions (about ${monthsTxt} months) against a historical recovery of ~${recoveryLabel} — assuming no growth at all on those assets. That is a meaningful head start, and a good reason to talk now, while markets are calm, about setting aside a bit more on the stable side so income never has to come from selling stocks at low prices.`;
    }
  } else {
    cls = 'ok';
    msg = `At ${fmt$(annual)} per year, the stable side of the portfolio alone — assuming no growth at all — could cover roughly <strong>${yrsTxtLong}</strong> of distributions, a real cushion that lets the rest of the portfolio ride out an extended downturn without being sold at the wrong time.`;
  }

  box.innerHTML = barHTML + `<div class="st-bridge-msg ${cls}">${msg}</div>`;
}

function exportStressTest(btn) {
  const contentEl = document.getElementById('st-scenario-content');
  if (!contentEl || !contentEl.innerHTML.trim()) return;
  if (btn) btn.innerHTML = '⏳ Opening...';

  const scenario = _stActiveScenario === 'custom' ? null : STRESS_SCENARIOS[_stActiveScenario];
  const scenarioLabel = scenario ? scenario.label : 'Custom Scenario';

  // Clone the rendered scenario and strip interactive elements for print
  const clone = contentEl.cloneNode(true);
  clone.querySelectorAll('.st-bridge-input-row, .st-bridge-msg.info, .st-custom-grid, .st-run-btn').forEach(el => el.remove());
  if (_stActiveScenario === 'custom') {
    const first = clone.firstElementChild;
    if (first && !first.id && !first.className) first.remove(); // instruction text
  }
  // Static distribution line in place of the input row
  const amt = parseFloat(_stDistAmount);
  const bridge = clone.querySelector('.st-bridge');
  const resultDiv = clone.querySelector('#st-bridge-result');
  if (amt > 0 && bridge && resultDiv) {
    const line = document.createElement('div');
    line.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px dashed #cfe6d8;font-size:.75rem;font-weight:700;color:#14432e';
    line.textContent = '💵 Client distributions: $' + Math.round(amt).toLocaleString('en-US') + (_stDistFreq === 'monthly' ? ' per month' : ' per year');
    bridge.insertBefore(line, resultDiv);
  }
  clone.querySelectorAll('.st-asset-bar-fill').forEach(el => { el.style.transition = 'none'; });

  // Resolve CSS variables to literal values (same palette as the main export)
  const allCSS = collectAllCSS();
  const resolvedCSS = allCSS
    .replace(/var\(--navy-panel\)/g,  '#141e28')
    .replace(/var\(--navy-mid\)/g,    '#202e3b')
    .replace(/var\(--navy-light\)/g,  '#2d3f4f')
    .replace(/var\(--navy\)/g,        '#1b2b3a')
    .replace(/var\(--gold-light\)/g,  '#dbb97a')
    .replace(/var\(--gold-pale\)/g,   '#f5eed8')
    .replace(/var\(--gold\)/g,        '#cda561')
    .replace(/var\(--cream\)/g,       '#f9f7f3')
    .replace(/var\(--white\)/g,       '#ffffff')
    .replace(/var\(--slate-lt\)/g,    '#a8b8cc')
    .replace(/var\(--slate\)/g,       '#6b7e96')
    .replace(/var\(--green-pale\)/g,  '#e6f4ed')
    .replace(/var\(--green\)/g,       '#1d7a50')
    .replace(/var\(--blue-pale\)/g,   '#e8f0fa')
    .replace(/var\(--blue\)/g,        '#2563a8')
    .replace(/var\(--amber\)/g,       '#d4820a')
    .replace(/var\(--red\)/g,         '#c0392b')
    .replace(/var\(--border-dark\)/g, 'rgba(255,255,255,.1)')
    .replace(/var\(--border\)/g,      '#dde4ef')
    .replace(/var\(--text\)/g,        '#1a2a3a');

  const fontLink = document.querySelector('link[href*="fonts.googleapis"]');
  const fontTag  = fontLink ? fontLink.outerHTML : '';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const subLine = scenario ? scenario.period + ' · ' + scenario.duration : 'Advisor-defined assumptions';

  const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Portfolio Stress Test — ${scenarioLabel}</title>
${fontTag}
<style>${resolvedCSS}</style>
<style>
  html, body { background:#ffffff !important; margin:0; }
  body { padding:36px 44px; font-family:'Nunito Sans', sans-serif; max-width:840px; margin:0 auto; }
  .stx-letterhead { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #1b2b3a; padding-bottom:14px; margin-bottom:8px; }
  .stx-firm { font-family:'Playfair Display', serif; font-size:1.25rem; font-weight:700; color:#1b2b3a; }
  .stx-firm-sub { font-size:.6rem; letter-spacing:.14em; text-transform:uppercase; color:#cda561; font-weight:700; margin-top:2px; }
  .stx-date { font-size:.68rem; color:#6b7e96; text-align:right; }
  .stx-title-block { margin:18px 0 20px; }
  .stx-doc-title { font-family:'Playfair Display', serif; font-size:1.5rem; font-weight:700; color:#1b2b3a; }
  .stx-doc-sub { font-size:.72rem; color:#6b7e96; margin-top:4px; }
  .stx-footer { margin-top:28px; border-top:1px solid #dde4ef; padding-top:14px; font-size:.6rem; color:#6b7e96; line-height:1.7; }
  .st-asset-bar-fill { transition:none !important; }
  @media print {
    body { padding:0; }
    * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    .st-bridge, .st-takeaway, .st-scenario-header { break-inside:avoid; }
  }
</style>
</head>
<body>
  <div class="stx-letterhead">
    <div>
      <div class="stx-firm">Capital Planning Wealth Management</div>
      <div class="stx-firm-sub">Portfolio Stress Test</div>
    </div>
    <div class="stx-date">Prepared ${date}</div>
  </div>
  <div class="stx-title-block">
    <div class="stx-doc-title">${scenarioLabel}</div>
    <div class="stx-doc-sub">${subLine}</div>
  </div>
  ${clone.innerHTML}
  <div class="stx-footer">
    <strong>Disclosure:</strong> This stress test is for illustrative and advisory discussion purposes only. Estimates are based on historical asset class index returns; actual portfolio performance will vary. It does not constitute a formal suitability determination, investment advice, or a guarantee of future results. Securities and advisory services offered through LPL Financial, Member FINRA/SIPC. Capital Planning Wealth Management and LPL Financial are separate entities.
  </div>
  <script>window.addEventListener('load', function(){ setTimeout(function(){ window.print(); }, 450); });<\/script>
</body>
</html>`;

  try {
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const tab  = window.open(url, '_blank');
    if (tab) {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (btn) btn.innerHTML = '✓ Print dialog opened';
    } else {
      // Popup blocked — download as HTML instead
      const a = document.createElement('a');
      a.href = url; a.download = 'Stress-Test-' + scenarioLabel.replace(/[^a-zA-Z0-9]+/g, '-') + '.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (btn) btn.innerHTML = '✓ Downloaded — open & print';
    }
  } catch (e) {
    alert('Please allow popups for this page and try again.');
  }
  setTimeout(() => { if (btn) btn.innerHTML = '📄 Save as PDF / Print'; }, 4000);
}

function openStressTest() {
  const overlay = document.getElementById('st-modal-overlay');
  if (!overlay) return;
  overlay.classList.add('open');
  switchScenario('2008');
}

function closeStressTest() {
  document.getElementById('st-modal-overlay')?.classList.remove('open');
}

function closeStressModal(e) {
  if (e.target === document.getElementById('st-modal-overlay')) closeStressTest();
}

function switchScenario(key) {
  _stActiveScenario = key;
  // Update tabs
  document.querySelectorAll('.st-tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.st-tab');
  const keys = ['2008','covid','2022','dotcom','bull2009','bull2013','bull2017','bull2021','custom'];
  const idx = keys.indexOf(key);
  if (tabs[idx]) tabs[idx].classList.add('active');

  if (key === 'custom') {
    renderCustomScenario();
  } else {
    renderScenario(key);
  }
}

function computeScenarioImpact(scenarioKey) {
  const scenario = STRESS_SCENARIOS[scenarioKey];
  const holdings = getActiveDDHoldings();
  const totalMV = holdings.reduce((s,h) => s + (parseFloat(h.market_value)||0), 0);
  if (totalMV === 0) return null;

  // Tally by sub-category
  const cats = {};
  holdings.forEach(h => {
    const mv  = parseFloat(h.market_value) || 0;
    const cat = inferSubCategory(h);
    cats[cat] = (cats[cat] || 0) + mv;
  });

  // Weighted drawdown
  let weightedDrawdown = 0;
  const assetImpacts = [];

  Object.entries(cats).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).forEach(([cat, mv]) => {
    const impact = scenario.impacts[cat] ?? scenario.impacts['Other'] ?? -25;
    const weight = mv / totalMV;
    weightedDrawdown += weight * impact;
    assetImpacts.push({ cat, mv, pct: mv/totalMV*100, impact });
  });

  const dollarImpact = totalMV * (weightedDrawdown / 100);
  return {
    totalMV,
    drawdownPct: weightedDrawdown,
    dollarImpact,
    assetImpacts,
    scenario
  };
}

function renderScenario(key) {
  const content = document.getElementById('st-scenario-content');
  if (!content) return;
  const result = computeScenarioImpact(key);

  if (!result) {
    content.innerHTML = '<p style="color:var(--slate);font-size:.8rem">Load a portfolio first to run stress tests.</p>';
    return;
  }

  const { totalMV, drawdownPct, dollarImpact, assetImpacts, scenario } = result;
  const isBull = scenario.bull === true || drawdownPct > 0;
  const fmt$ = n => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  const endValue = totalMV + dollarImpact;
  const gainLossSign = dollarImpact >= 0 ? '+' : '−';

  // Accent color flips for bull vs bear
  const accentColor   = isBull ? '#16a34a' : '#c0392b';
  const accentBg      = isBull ? '#e6f4ed' : '#fde8e8';
  const scenarioBadge = isBull
    ? `<span style="font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#16a34a;padding:3px 10px;background:#e6f4ed;border-radius:20px">📈 Bull Market</span>`
    : `<span style="font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#c0392b;padding:3px 10px;background:#fde8e8;border-radius:20px">📉 Bear Market</span>`;

  // Asset impact bars — max bar = largest absolute impact; skip absurd crypto outliers for scale
  const cappedImpacts = assetImpacts.map(a => ({...a, impactForScale: Math.min(Math.abs(a.impact), 100)}));
  const maxAbs = Math.max(...cappedImpacts.map(a => a.impactForScale), 1);
  const barsHTML = assetImpacts.map((a, i) => {
    const barWidth = (Math.min(Math.abs(a.impact), 100) / maxAbs * 100).toFixed(1);
    const barColor = a.impact >= 0 ? '#16a34a' : (a.impact > -20 ? '#e67e22' : '#c0392b');
    const sign = a.impact >= 0 ? '+' : '';
    const displayPct = Math.abs(a.impact) > 999 ? sign + a.impact.toLocaleString() + '%' : sign + a.impact + '%';
    return `<div class="st-asset-row">
      <div class="st-asset-label">${a.cat}</div>
      <div class="st-asset-bar-bg">
        <div class="st-asset-bar-fill" style="width:0%;background:${barColor}" data-w="${barWidth}"></div>
      </div>
      <div class="st-asset-pct ${a.impact >= 0 ? 'pos' : 'neg'}">${displayPct}</div>
    </div>`;
  }).join('');

  const stat1Label = isBull ? 'Estimated Gain'        : 'Estimated Drawdown';
  const stat1Value = isBull ? '+' + drawdownPct.toFixed(1) + '%' : drawdownPct.toFixed(1) + '%';
  const stat1Class = isBull ? 'gain' : 'loss';
  const stat2Label = isBull ? 'Estimated Dollar Gain'  : 'Estimated Dollar Loss';
  const stat2Value = isBull ? '+' + fmt$(dollarImpact) : '−' + fmt$(dollarImpact);
  const stat3Label = isBull ? 'Market Character'       : 'Historical Recovery';
  const stat3Value = isBull ? scenario.duration        : scenario.recovery;
  const stat3Sub   = isBull ? scenario.period          : 'for diversified portfolios';
  const bridgeHTML = isBull ? '' : buildBridgeSection(assetImpacts, totalMV, scenario);
  if (isBull) _stBridgeData = null;

  content.innerHTML = `
    <div style="margin-bottom:18px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
      <div>
        <div style="font-size:.95rem;font-weight:700;color:var(--navy);font-family:'Playfair Display',serif;margin-bottom:4px">${scenario.label}</div>
        <div style="font-size:.7rem;color:var(--slate)">${scenario.period} · ${scenario.duration}</div>
      </div>
      ${scenarioBadge}
    </div>
    <div style="font-size:.75rem;color:var(--slate);margin-bottom:18px;line-height:1.6">${scenario.description}</div>

    <div class="st-scenario-header">
      <div class="st-stat-card" style="border-top:3px solid ${accentColor}">
        <div class="st-stat-label">${stat1Label}</div>
        <div class="st-stat-value ${stat1Class}">${stat1Value}</div>
        <div class="st-stat-sub">vs. current value</div>
      </div>
      <div class="st-stat-card" style="border-top:3px solid ${accentColor}">
        <div class="st-stat-label">${stat2Label}</div>
        <div class="st-stat-value ${stat1Class}">${stat2Value}</div>
        <div class="st-stat-sub">portfolio value → ${fmt$(endValue)}</div>
      </div>
      <div class="st-stat-card" style="border-top:3px solid var(--teal)">
        <div class="st-stat-label">${stat3Label}</div>
        <div class="st-stat-value recovery">${stat3Value}</div>
        <div class="st-stat-sub">${stat3Sub}</div>
      </div>
    </div>

    <div style="font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin-bottom:12px">Asset Class Impact</div>
    <div class="st-asset-grid">${barsHTML}</div>

    <div class="st-takeaway" style="border-left:3px solid ${accentColor}"><strong>Key Takeaway:</strong> ${scenario.takeaway}</div>
    ${bridgeHTML}
    <div style="font-size:.6rem;color:var(--slate);margin-top:12px;line-height:1.5">* Estimates based on historical asset class index returns. Actual portfolio performance will vary. This analysis is for illustrative and advisory discussion purposes only and does not constitute investment advice.</div>
  `;

  // Animate bars
  setTimeout(() => {
    content.querySelectorAll('.st-asset-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 60);
  updateStressBridge();
}

function renderCustomScenario() {
  const content = document.getElementById('st-scenario-content');
  if (!content) return;

  content.innerHTML = `
    <div style="font-size:.8rem;color:var(--slate);margin-bottom:20px;line-height:1.6">
      Define your own scenario by setting estimated returns for each asset class. Use negative numbers for losses (e.g. -20) and positive for gains (e.g. +5).
    </div>
    <div class="st-custom-grid" id="st-custom-inputs">
      ${Object.keys(STRESS_SCENARIOS['2008'].impacts).map(cat => `
        <div class="st-custom-field">
          <label>${cat}</label>
          <input type="number" id="custom-${cat.replace(/[^a-zA-Z0-9]/g,'_')}" value="-20" min="-100" max="100" placeholder="e.g. -25">
        </div>`).join('')}
    </div>
    <button class="st-run-btn" onclick="runCustomScenario()">▶ Run Custom Scenario</button>
    <div id="st-custom-result" style="margin-top:24px"></div>
  `;
}

function runCustomScenario() {
  const holdings = getActiveDDHoldings();
  const totalMV = holdings.reduce((s,h) => s + (parseFloat(h.market_value)||0), 0);
  if (totalMV === 0) return;

  const cats = {};
  holdings.forEach(h => {
    const mv  = parseFloat(h.market_value) || 0;
    const cat = inferSubCategory(h);
    cats[cat] = (cats[cat] || 0) + mv;
  });

  let weightedDrawdown = 0;
  const assetImpacts = [];

  Object.entries(cats).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).forEach(([cat, mv]) => {
    const inputId = 'custom-' + cat.replace(/[^a-zA-Z0-9]/g,'_');
    const el = document.getElementById(inputId);
    const impact = el ? (parseFloat(el.value) || 0) : -20;
    const weight = mv / totalMV;
    weightedDrawdown += weight * impact;
    assetImpacts.push({ cat, mv, pct: mv/totalMV*100, impact });
  });

  const dollarImpact = totalMV * (weightedDrawdown / 100);
  const endValue = totalMV + dollarImpact;
  const fmt$ = n => '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  const maxAbs = Math.max(...assetImpacts.map(a => Math.abs(a.impact)), 1);

  const barsHTML = assetImpacts.map(a => {
    const barWidth = (Math.abs(a.impact) / maxAbs * 100).toFixed(1);
    const barColor = a.impact >= 0 ? '#16a34a' : (a.impact > -20 ? '#e67e22' : '#c0392b');
    const sign = a.impact >= 0 ? '+' : '';
    return `<div class="st-asset-row">
      <div class="st-asset-label">${a.cat}</div>
      <div class="st-asset-bar-bg">
        <div class="st-asset-bar-fill" style="width:0%;background:${barColor}" data-w="${barWidth}"></div>
      </div>
      <div class="st-asset-pct ${a.impact >= 0 ? 'pos' : 'neg'}">${sign}${a.impact.toFixed(0)}%</div>
    </div>`;
  }).join('');

  const customBridgeHTML = weightedDrawdown < 0 ? buildBridgeSection(assetImpacts, totalMV, null) : '';
  if (weightedDrawdown >= 0) _stBridgeData = null;
  const result = document.getElementById('st-custom-result');
  result.innerHTML = `
    <div class="st-scenario-header" style="margin-bottom:20px">
      <div class="st-stat-card">
        <div class="st-stat-label">Estimated Drawdown</div>
        <div class="st-stat-value ${weightedDrawdown < 0 ? 'loss' : 'recovery'}">${weightedDrawdown > 0 ? '+' : ''}${weightedDrawdown.toFixed(1)}%</div>
      </div>
      <div class="st-stat-card">
        <div class="st-stat-label">Estimated ${dollarImpact < 0 ? 'Loss' : 'Gain'}</div>
        <div class="st-stat-value ${dollarImpact < 0 ? 'loss' : 'recovery'}">${dollarImpact < 0 ? '−' : '+'}${fmt$(dollarImpact)}</div>
        <div class="st-stat-sub">portfolio → ${fmt$(endValue)}</div>
      </div>
      <div class="st-stat-card">
        <div class="st-stat-label">Holdings Analyzed</div>
        <div class="st-stat-value neutral">${assetImpacts.length}</div>
        <div class="st-stat-sub">asset categories</div>
      </div>
    </div>
    <div style="font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin-bottom:12px">Asset Class Impact</div>
    <div class="st-asset-grid">${barsHTML}</div>
    ${customBridgeHTML}
    <div style="font-size:.6rem;color:var(--slate);margin-top:12px;line-height:1.5">* Custom scenario using your defined inputs. For illustrative and advisory discussion purposes only.</div>
  `;

  setTimeout(() => {
    result.querySelectorAll('.st-asset-bar-fill').forEach(el => {
      el.style.width = el.dataset.w + '%';
    });
  }, 60);
  updateStressBridge();
}



function copyEmailText(btn) {
  const subject = btn.dataset.subject || '';
  const body = decodeURIComponent(btn.dataset.body || '');
  const full = subject ? 'Subject: ' + subject + '\n\n' + body : body;
  navigator.clipboard.writeText(full).then(() => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '📋 Copy Email'; btn.classList.remove('copied'); }, 2200);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = full; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = '📋 Copy Email'; btn.classList.remove('copied'); }, 2200);
  });
}

function resetAnalyzer() {
  uploadedFile = null; uploadedFileData = null;
  _ddOpen = false; _ddExcluded = new Set(); _ddNarrativeGenerated = false;
  document.getElementById('ua-file-name').textContent = '';
  document.getElementById('file-input').value = '';
  document.getElementById('btn-analyze').disabled = true;
  document.getElementById('upload-area').style.display = '';
  document.getElementById('analyzing-state').style.display = 'none';
  document.getElementById('az-results').style.display = 'none';
  document.getElementById('az-results').innerHTML = '';
}

