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

// ── Formatting helpers shared by the bridge visual ──
function _bridgeFmt$(n) { return '$' + Math.abs(Math.round(n)).toLocaleString('en-US'); }
function _bridgeTrim(y) { const s = Math.round(y * 10) / 10; return Number.isInteger(s) ? String(s) : s.toFixed(1); }
function _bridgeYearsLabel(y) {
  if (y == null) return '—';
  if (y >= 40) return '40+ years';
  if (y >= 10) return Math.round(y) + ' years';
  if (y >= 1)  { const s = _bridgeTrim(y); return s + (s === '1' ? ' year' : ' years'); }
  const m = Math.round(y * 12);
  return m + (m === 1 ? ' month' : ' months');
}
function _bridgeYearsShort(y) {
  if (y == null) return '—';
  if (y >= 40) return '40+ yr';
  if (y >= 10) return Math.round(y) + ' yr';
  if (y >= 1)  return _bridgeTrim(y) + ' yr';
  return Math.round(y * 12) + ' mo';
}

// Green / dark-orange / red resolver based on how far the client's bridge reaches.
// ratio = years the stable side can cover  ÷  years the market historically took to recover.
function bridgeStatus(ratio) {
  if (ratio == null || ratio >= 1.10) {
    return { key:'ok',    deck:'#1d7a50', deck2:'#16a34a', accent:'#1d7a50', pale:'#e9f6ef',
             sky1:'#eaf5ee', sky2:'#f7fbf8', label:'More than enough', tag:'Well prepared', icon:'✓' };
  }
  if (ratio >= 0.90) {
    return { key:'close', deck:'#c2410c', deck2:'#ea6a1f', accent:'#c2410c', pale:'#fdecdf',
             sky1:'#fdf0e6', sky2:'#fdf9f5', label:'Right on the edge', tag:'Barely reaches', icon:'!' };
  }
  return { key:'short',   deck:'#c0392b', deck2:'#e05242', accent:'#c0392b', pale:'#fdeaea',
           sky1:'#fdeeee', sky2:'#fdf8f8', label:'Short of what\'s needed', tag:'Falls short', icon:'✕' };
}

// One-time injection of the styles the bridge scene relies on (so it renders
// even if the host page's stylesheet is missing these rules).
function injectBridgeStyles() {
  if (document.getElementById('st-bridge-scene-styles')) return;
  const s = document.createElement('style');
  s.id = 'st-bridge-scene-styles';
  s.textContent = `
    .st-bridge-scene{width:100%;border-radius:14px;overflow:hidden;border:1px solid #e4e9f0;background:#fff;box-shadow:0 2px 12px rgba(20,40,70,.06)}
    .st-bridge-scene svg{display:block;width:100%;height:auto}
    .st-bridge-scene .deck-draw{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);animation:stDeckDraw 1.1s cubic-bezier(.4,0,.2,1) forwards}
    @keyframes stDeckDraw{to{stroke-dashoffset:0}}
    .st-bridge-verdict{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px}
    .st-bridge-chip{display:inline-flex;align-items:center;gap:7px;font-size:.72rem;font-weight:800;letter-spacing:.02em;padding:7px 14px;border-radius:30px;color:#fff}
    .st-bridge-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-size:.64rem;color:#5a6a80;font-weight:600}
    .st-bridge-legend span{display:inline-flex;align-items:center;gap:6px}
    .st-bridge-legend i{width:12px;height:12px;border-radius:3px;display:inline-block}
    @media print{.st-bridge-scene .deck-draw{animation:none;stroke-dashoffset:0}}
  `;
  document.head.appendChild(s);
}

/* Builds the SVG bridge scene.
   The x-axis is TIME. The "storm zone" (todayX -> recX) is the recovery period
   the market needed. A short bridge stops inside the storm (gap shown). A strong
   bridge crosses onto safe green land and KEEPS GOING — surplus is exaggerated on
   a compressed scale so a huge cushion visibly dwarfs what was required.
   opts = { ratio, coverageYears, recoveryYears, recoveryLabel, coverageLabel,
            neededDollars, haveDollars, shortfallDollars, shortfallYears, st } */
let _stSceneSeq = 0;
function buildBridgeScene(opts) {
  const { ratio, coverageYears, recoveryYears, recoveryLabel, coverageLabel, st } = opts;
  const uid = 'brg' + (++_stSceneSeq);

  // Canvas
  const W = 760, H = 330;
  const deckY   = 150;      // bridge deck
  const todayX  = 92;       // "today" — bridge origin
  const rightX  = 726;      // drawable right edge
  const stripTop = 168, stripBot = 250;   // ground/water strip
  const baseY   = stripBot;

  // Storm zone = the recovery period. Fixed slice of the canvas so it reads the same
  // scenario to scenario; surplus lives in the remaining space to the right.
  const stormFrac = 0.42;
  const recX   = todayX + (rightX - todayX) * stormFrac;   // "new highs" point
  const surplusW = rightX - recX;

  const r = (ratio == null) ? 6 : ratio;   // treat "no recovery data" as very strong
  const complete = r >= 1;

  // Where the client's bridge ends.
  //  ratio <= 1  -> linear inside the storm zone (short of new highs)
  //  ratio  > 1  -> crosses onto land, extends via 1 - 1/ratio (asymptotic, exaggerated)
  let beamEndX;
  if (r <= 1) beamEndX = todayX + (recX - todayX) * Math.max(r, 0.04);
  else        beamEndX = recX + surplusW * (1 - 1 / r);
  beamEndX = Math.min(beamEndX, rightX - 3);

  const surplusYears = (recoveryYears != null && coverageYears > recoveryYears) ? coverageYears - recoveryYears : 0;
  const cushionLbl = surplusYears > 0 ? _bridgeYearsShort(surplusYears) : '';
  const multiple = (recoveryYears && recoveryYears > 0) ? coverageYears / recoveryYears : null;
  const multipleLbl = (multiple && multiple >= 1.3) ? (multiple >= 10 ? Math.round(multiple) : multiple.toFixed(1)) + '×' : null;

  // ---- ground strip: storm water (left) + safe green land (right) ----
  const wave = (x0, x1, y) => {
    let d = `M${x0},${y}`;
    const seg = 22; let up = true;
    for (let x = x0; x < x1; x += seg) { d += ` Q${(x+seg/2).toFixed(1)},${(y+(up?-6:6))} ${Math.min(x+seg,x1).toFixed(1)},${y}`; up = !up; }
    return d;
  };
  const stormWater = `${wave(todayX, recX, stripTop)} L${recX},${stripBot} L${todayX},${stripBot} Z`;
  const safeLand   = `M${recX},${stripTop} L${rightX},${stripTop} L${rightX},${stripBot} L${recX},${stripBot} Z`;

  // ---- support piers under the built portion that sits over water ----
  const overWaterEnd = Math.min(beamEndX, recX);
  let piers = '';
  const nP = Math.max(1, Math.round((overWaterEnd - todayX) / 95));
  for (let i = 1; i <= nP; i++) {
    const px = todayX + (overWaterEnd - todayX) * (i / (nP + 1));
    piers += `<line x1="${px.toFixed(1)}" y1="${deckY+6}" x2="${px.toFixed(1)}" y2="${stripBot-4}" stroke="#9fb0c4" stroke-width="2.5" opacity=".5"/>`;
  }

  // ---- year ticks: linear only inside the storm zone (0..recovery) ----
  let ticks = '';
  if (recoveryYears && recoveryYears >= 1.5) {
    const R = Math.round(recoveryYears), step = R > 6 ? 2 : 1;
    for (let t = 0; t <= R; t += step) {
      const x = todayX + (recX - todayX) * (t / recoveryYears);
      ticks += `<line x1="${x.toFixed(1)}" y1="${stripBot}" x2="${x.toFixed(1)}" y2="${stripBot+7}" stroke="#b9c4d4" stroke-width="1"/>` +
               `<text x="${x.toFixed(1)}" y="${stripBot+19}" text-anchor="middle" font-size="9.5" fill="#8494a8" font-weight="700">${t}y</text>`;
    }
  } else {
    ticks = `<text x="${todayX}" y="${stripBot+19}" text-anchor="middle" font-size="9.5" fill="#8494a8" font-weight="700">now</text>` +
            `<text x="${recX.toFixed(1)}" y="${stripBot+19}" text-anchor="middle" font-size="9.5" fill="#8494a8" font-weight="700">${recoveryLabel||''}</text>`;
  }

  // ---- cushion (surplus) highlight beyond new highs ----
  let cushion = '', cushionBanner = '';
  if (complete && beamEndX > recX + 4) {
    // chevrons marching into the safe zone
    let chev = '';
    for (let x = recX + 14; x < beamEndX - 8; x += 26) {
      chev += `<path d="M${x.toFixed(1)},${deckY-6} l7,6 l-7,6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/>`;
    }
    cushion = `<rect x="${recX.toFixed(1)}" y="${deckY-9}" width="${(beamEndX-recX).toFixed(1)}" height="18" rx="9" fill="#12833f" opacity=".18"/>` + chev;
    // green bracket + label under the surplus run
    const midC = (recX + beamEndX) / 2;
    cushionBanner =
      `<line x1="${recX.toFixed(1)}" y1="${deckY+22}" x2="${beamEndX.toFixed(1)}" y2="${deckY+22}" stroke="#12833f" stroke-width="1.5"/>` +
      `<line x1="${recX.toFixed(1)}" y1="${deckY+18}" x2="${recX.toFixed(1)}" y2="${deckY+26}" stroke="#12833f" stroke-width="1.5"/>` +
      `<line x1="${beamEndX.toFixed(1)}" y1="${deckY+18}" x2="${beamEndX.toFixed(1)}" y2="${deckY+26}" stroke="#12833f" stroke-width="1.5"/>` +
      `<g transform="translate(${midC.toFixed(1)},${deckY+40})"><rect x="-92" y="-13" width="184" height="24" rx="12" fill="#12833f"/>` +
      `<text x="0" y="4" text-anchor="middle" font-size="11.5" fill="#fff" font-weight="800">+${cushionLbl} of cushion${multipleLbl ? ' · ' + multipleLbl : ''}</text></g>`;
  }

  // ---- shortfall gap (bridge stops over water) ----
  let gap = '';
  if (!complete) {
    const midG = (beamEndX + recX) / 2;
    gap = `<line x1="${beamEndX.toFixed(1)}" y1="${deckY}" x2="${recX.toFixed(1)}" y2="${deckY}" stroke="${st.accent}" stroke-width="3" stroke-dasharray="3 7" opacity=".9"/>` +
          `<g transform="translate(${midG.toFixed(1)},${deckY+40})"><rect x="-70" y="-13" width="140" height="24" rx="12" fill="${st.accent}"/>` +
          `<text x="0" y="4" text-anchor="middle" font-size="11.5" fill="#fff" font-weight="800">${opts.shortfallYears||''} short</text></g>`;
  }

  const deckLen = (beamEndX - todayX).toFixed(1);

  // ---- end pill (client's total bridge) ----
  const pillTxt = `Your bridge · ${coverageLabel}`;
  const pillW = Math.max(104, pillTxt.length * 6.7);
  let pillX = beamEndX;
  pillX = Math.max(todayX + pillW/2 - 20, Math.min(pillX, rightX - pillW/2 + 20));
  const endPill =
    `<g transform="translate(${pillX.toFixed(1)},${deckY-40})">` +
    `<rect x="${(-pillW/2).toFixed(1)}" y="-16" width="${pillW.toFixed(1)}" height="27" rx="13.5" fill="${st.deck}"/>` +
    `<text x="0" y="3" text-anchor="middle" font-size="12" fill="#fff" font-weight="800">${pillTxt}</text>` +
    `<path d="M${(beamEndX-pillX).toFixed(1)},11 l-6,0 l6,8 l6,-8 Z" fill="${st.deck}"/></g>`;

  return `
  <div class="st-bridge-scene" role="img" aria-label="Bridge across the downturn: your stable assets cover ${coverageLabel} against a recovery of ${recoveryLabel||'the downturn'}.">
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="'Nunito Sans',system-ui,sans-serif">
    <defs>
      <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${st.sky1}"/><stop offset="1" stop-color="${st.sky2}"/></linearGradient>
      <linearGradient id="${uid}-deck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${st.deck}"/><stop offset="1" stop-color="${st.deck2}"/></linearGradient>
    </defs>

    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#${uid}-sky)"/>

    <!-- ground: storm water + safe land -->
    <path d="${stormWater}" fill="#f7dcd5"/>
    <path d="${wave(todayX, recX, stripTop)}" fill="none" stroke="#e4a89b" stroke-width="1.5" opacity=".8"/>
    <path d="${safeLand}" fill="#e2f2e8"/>
    <line x1="${recX.toFixed(1)}" y1="${stripTop}" x2="${rightX}" y2="${stripTop}" stroke="#bfe3cd" stroke-width="1.5"/>
    <text x="${(todayX+(recX-todayX)/2).toFixed(1)}" y="${stripBot-14}" text-anchor="middle" font-size="10" fill="#b06a5c" font-weight="700">market underwater</text>
    <text x="${(recX+surplusW/2).toFixed(1)}" y="${stripBot-14}" text-anchor="middle" font-size="10" fill="#2f8256" font-weight="700">recovered · new highs & beyond</text>

    <!-- needed bracket (top) -->
    <line x1="${todayX}" y1="46" x2="${recX.toFixed(1)}" y2="46" stroke="#9aa7b8" stroke-width="1.5"/>
    <line x1="${todayX}" y1="40" x2="${todayX}" y2="52" stroke="#9aa7b8" stroke-width="1.5"/>
    <line x1="${recX.toFixed(1)}" y1="40" x2="${recX.toFixed(1)}" y2="52" stroke="#9aa7b8" stroke-width="1.5"/>
    <g transform="translate(${(todayX+(recX-todayX)/2).toFixed(1)},46)"><rect x="-118" y="-15" width="236" height="23" rx="11.5" fill="#1b2b3a"/>
      <text x="0" y="1" text-anchor="middle" font-size="11" fill="#fff" font-weight="800">Bridge this event needed · ~${recoveryLabel||'—'}</text></g>

    ${piers}

    <!-- bridge deck -->
    <line class="deck-draw" x1="${todayX}" y1="${deckY}" x2="${beamEndX.toFixed(1)}" y2="${deckY}" stroke="url(#${uid}-deck)" stroke-width="12" stroke-linecap="round" style="--len:${deckLen}"/>
    <line x1="${todayX}" y1="${(deckY-6).toFixed(1)}" x2="${beamEndX.toFixed(1)}" y2="${(deckY-6).toFixed(1)}" stroke="#fff" stroke-width="1.5" opacity=".35"/>
    ${cushion}
    ${gap}

    <!-- today pillar -->
    <circle cx="${todayX}" cy="${deckY}" r="6" fill="#1b2b3a"/>
    <g transform="translate(${todayX},${deckY-58})"><text x="0" y="0" text-anchor="middle" font-size="11" fill="#1b2b3a" font-weight="800">TODAY</text>
      <text x="0" y="13" text-anchor="middle" font-size="9" fill="#6b7e96" font-weight="600">market peak</text></g>

    <!-- new-highs flag -->
    <line x1="${recX.toFixed(1)}" y1="${deckY+2}" x2="${recX.toFixed(1)}" y2="${stripTop}" stroke="#2f8256" stroke-width="1.5" stroke-dasharray="2 4" opacity=".8"/>
    <line x1="${recX.toFixed(1)}" y1="${deckY-2}" x2="${recX.toFixed(1)}" y2="${deckY-30}" stroke="#1b2b3a" stroke-width="2"/>
    <path d="M${recX.toFixed(1)},${deckY-30} l17,5 l-17,6 Z" fill="#2f8256"/>
    <g transform="translate(${recX.toFixed(1)},${deckY-58})"><text x="0" y="0" text-anchor="middle" font-size="10.5" fill="#1b2b3a" font-weight="800">NEW HIGHS</text>
      <text x="0" y="13" text-anchor="middle" font-size="9" fill="#6b7e96" font-weight="600">~${recoveryLabel||''}</text></g>

    ${ticks}
    ${cushionBanner}
    ${endPill}
  </svg>
  </div>`;
}

function buildBridgeSection(assetImpacts, totalMV, scenario) {
  const fmt$ = _bridgeFmt$;
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
  _stBridgeData = { stableNow, stablePct, recoveryYears: rec.years, recoveryLabel: rec.label };

  // No stable assets at all — turn it into the planning conversation
  if (stableNow <= 0) {
    _stBridgeData = null;
    return `
    <div class="st-bridge">
      <div class="st-bridge-title">🛡️ The Calm Side of the Portfolio</div>
      <div class="st-bridge-sub">Every downturn eventually passes. The plan is to lean on the calm, stable side of the portfolio — cash, bonds, CDs, annuities — to keep the client's income steady while stocks recover, so nothing has to be sold at the bottom.</div>
      <div class="st-bridge-msg partial">This portfolio currently holds <strong>no allocation to stable assets</strong> (cash, money market, bonds, CDs, or annuities). In a scenario like this, income would have to be met by selling investments at depressed prices. That is the strongest reason to build a calm, stable side now, while markets are steady, so the client is prepared and reassured well before the next downturn arrives.</div>
    </div>`;
  }

  const rowsHTML = stableRows.sort((a,b) => b.mv - a.mv)
    .map(r => `${r.cat}: ${fmt$(r.mv)}`)
    .join(' &nbsp;·&nbsp; ');
  const recLbl = rec.label ? '~' + rec.label : 'the recovery';

  return `
    <div class="st-bridge">
      <div class="st-bridge-title">🛡️ The Calm Side of the Portfolio</div>
      <div class="st-bridge-sub">Downturns are unsettling, but they pass — and the client doesn't have to ride them out selling stocks at a low. This is the calm, stable side of the portfolio — valued as-is, with no growth assumed — and here's how far it could carry the client's income through the <strong>${recLbl}</strong> this market historically took to recover, while everything else has time to climb back.</div>

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
          <div class="st-stat-label">Bridge Needed</div>
          <div class="st-stat-value recovery">${rec.label ? '~' + (rec.years >= 1 ? Math.round(rec.years) + 'y' : Math.round(rec.years*12)+'mo') : '—'}</div>
          <div class="st-stat-sub">${rec.label ? 'to reach new highs' : 'recovery time'}</div>
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
  injectBridgeStyles();
  const amtEl  = document.getElementById('st-bridge-amt');
  const freqEl = document.getElementById('st-bridge-freq');
  if (amtEl)  _stDistAmount = amtEl.value;
  if (freqEl) _stDistFreq   = freqEl.value;

  const fmt$ = _bridgeFmt$;
  const amt = parseFloat(_stDistAmount);
  const { stableNow, recoveryYears, recoveryLabel } = _stBridgeData;

  if (!amt || amt <= 0) {
    box.innerHTML = `<div class="st-bridge-msg info">Enter the client's regular distributions above to see whether their stable holdings alone could bridge them all the way through a downturn like this.</div>`;
    return;
  }

  const annual        = _stDistFreq === 'monthly' ? amt * 12 : amt;
  const coverageYears = stableNow / annual;
  const ratio         = recoveryYears ? coverageYears / recoveryYears : null;
  const st            = bridgeStatus(ratio);
  const coverageLabel = _bridgeYearsLabel(coverageYears);

  // Needed / have / gap in dollars and years
  const neededDollars   = recoveryYears ? annual * recoveryYears : null;
  const haveDollars     = stableNow;
  const gapDollars      = neededDollars != null ? haveDollars - neededDollars : null; // + surplus / − short
  const gapYears        = recoveryYears != null ? coverageYears - recoveryYears : null;
  const shortfallYears  = (gapYears != null && gapYears < 0) ? _bridgeYearsShort(-gapYears) : null;
  const shortfallDollars= (gapDollars != null && gapDollars < 0) ? fmt$(gapDollars) : null;

  const scene = recoveryYears ? buildBridgeScene({
    ratio, coverageYears, recoveryYears, recoveryLabel, coverageLabel,
    neededDollars, haveDollars,
    shortfallDollars, shortfallYears, st
  }) : '';

  // Plain-language verdict + supporting numbers
  let headline, msg;
  if (recoveryYears == null) {
    headline = 'A real cushion';
    msg = `At ${fmt$(annual)} per year, the stable side of the portfolio alone — with no growth assumed — could fund about <strong>${coverageLabel}</strong> of the client's income. That lets the rest of the portfolio ride out an extended downturn without being sold at the wrong time.`;
  } else if (st.key === 'ok') {
    const mult = recoveryYears > 0 ? coverageYears / recoveryYears : null;
    const multTxt = (mult && mult >= 1.5) ? ` — about <strong>${mult >= 10 ? Math.round(mult) : mult.toFixed(1)}× the bridge this event required</strong>` : '';
    const cushionTxt = gapYears > 0 ? ` That's roughly <strong>${_bridgeYearsShort(gapYears)} of cushion beyond</strong> the point the market reached new highs.` : '';
    headline = '✓ Well prepared to ride this out';
    msg = `At ${fmt$(annual)} a year, the stable assets alone could fund roughly <strong>${coverageLabel}</strong> of income with no growth at all${multTxt}, comfortably past the <strong>~${recoveryLabel}</strong> this market took to reach new highs.${cushionTxt} In a repeat of this, income could come entirely from the calm side of the portfolio while stocks are given time to recover — nothing would have to be sold at a low.`;
  } else if (st.key === 'close') {
    headline = 'Right on the edge';
    msg = `At ${fmt$(annual)} a year, the stable assets cover about <strong>${coverageLabel}</strong> — just about the <strong>~${recoveryLabel}</strong> this market took to recover. It works, but there's little room to spare. While markets are calm is the right time to talk about widening the bridge a little, so the client is never forced to sell stocks at the wrong moment.`;
  } else {
    headline = 'There\'s a gap';
    msg = `At ${fmt$(annual)} a year, the stable assets cover about <strong>${coverageLabel}</strong>, but this market historically took <strong>~${recoveryLabel}</strong> to reach new highs — leaving roughly <strong>${_bridgeYearsShort(-(gapYears))}</strong>${shortfallDollars ? ' (about ' + shortfallDollars + ')' : ''} where income would have to come from selling investments at depressed prices. That's exactly the risk we can address now, while markets are calm, by moving a bit more onto the stable side of the portfolio.`;
  }

  // Needed-vs-have readout cards
  const readout = recoveryYears ? `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px">
      <div style="background:#f7f9fc;border:1px solid #e4e9f0;border-radius:10px;padding:11px 13px">
        <div style="font-size:.56rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8494a8">Bridge needed</div>
        <div style="font-size:1.02rem;font-weight:800;color:#1b2b3a;margin-top:2px">${fmt$(neededDollars)}</div>
        <div style="font-size:.6rem;color:#6b7e96;margin-top:1px">${recoveryLabel} of income</div>
      </div>
      <div style="background:#f7f9fc;border:1px solid #e4e9f0;border-radius:10px;padding:11px 13px">
        <div style="font-size:.56rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8494a8">Bridge you have</div>
        <div style="font-size:1.02rem;font-weight:800;color:${st.deck};margin-top:2px">${fmt$(haveDollars)}</div>
        <div style="font-size:.6rem;color:#6b7e96;margin-top:1px">covers ${coverageLabel}</div>
      </div>
      <div style="background:${st.pale};border:1px solid ${st.accent}33;border-radius:10px;padding:11px 13px">
        <div style="font-size:.56rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${st.accent}">${gapDollars >= 0 ? 'Surplus' : 'Shortfall'}</div>
        <div style="font-size:1.02rem;font-weight:800;color:${st.accent};margin-top:2px">${gapDollars >= 0 ? '+' : '−'}${fmt$(gapDollars)}</div>
        <div style="font-size:.6rem;color:${st.accent};margin-top:1px">${gapYears >= 0 ? '+' : '−'}${_bridgeYearsShort(Math.abs(gapYears))} vs. needed</div>
      </div>
    </div>` : '';

  const chip = recoveryYears ? `
    <div class="st-bridge-verdict">
      <span class="st-bridge-chip" style="background:${st.deck}">${st.icon} ${st.label}</span>
      <span style="font-size:.7rem;color:#6b7e96;font-weight:600">Bridge covers ${coverageLabel} of a ~${recoveryLabel} recovery</span>
    </div>` : '';

  const legend = recoveryYears ? `
    <div class="st-bridge-legend">
      <span><i style="background:#1d7a50"></i> More than enough</span>
      <span><i style="background:#c2410c"></i> Right on the edge</span>
      <span><i style="background:#c0392b"></i> Short of what's needed</span>
    </div>` : '';

  box.innerHTML = scene + chip + readout +
    `<div class="st-bridge-msg ${st.key === 'ok' ? 'ok' : 'partial'}" style="margin-top:14px"><strong>${headline}.</strong> ${msg}</div>` +
    legend;
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

