/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — View management, risk tolerance questionnaire, save/print + copy functions
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══ VIEW MANAGEMENT ══
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  const subs = {
    welcome: 'Client & Advisor Tools',
    intro: 'Client Risk Questionnaire',
    quiz: 'Risk Questionnaire · Bucket Three',
    'quiz-results': 'Risk Assessment Results',
    analyzer: 'Portfolio Analyzer · Advisor Tool',
    models: 'Investment Model Library · Advisor Tool'
  };
  document.getElementById('hdr-sub').textContent = subs[name] || '';
  const back = document.getElementById('hdr-back');
  if (name === 'welcome') back.classList.remove('visible');
  else back.classList.add('visible');
  window.scrollTo(0,0);
}

function toggleAdvMenu() { document.getElementById('adv-dropdown').classList.toggle('open'); }
function closeAdvMenu()  { document.getElementById('adv-dropdown').classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.adv-menu-wrap')) closeAdvMenu(); });

// ══ QUESTIONNAIRE STATE ══
const QUIZ_QA_MAP = {
  q1:{ text:'When you think about investing, what matters most to you?', opts:{1:'Making sure I don\'t lose what I have',2:'Steady, reliable growth — nothing too dramatic',4:'Growing my money significantly over time, even if it\'s bumpy',5:'Maximum long-term growth — I can handle the ups and downs'} },
  q2:{ text:'Which outcome would bother you more?', opts:{2:'Losing 15% in a market downturn',3:'Both bother me equally',4:'Missing a 20% gain because I was too conservative'} },
  q3:{ text:'Your long-term portfolio drops 25% in a single year. What\'s your first instinct?', opts:{5:'Buy more — this looks like an opportunity',4:'Stay put — this is exactly what we planned for',1:'Get out — protect what\'s left'} },
  q4:{ text:'Choose the portfolio you\'d feel most comfortable owning long-term:', opts:{1:'Best: +8% / Worst: −2% / Avg: +4%',3:'Best: +18% / Worst: −12% / Avg: +8%',5:'Best: +35% / Worst: −25% / Avg: +12%'} },
  q5:{ text:'What annual return would feel like a win for your long-term portfolio?', opts:{2:'4–6% — steady, modest growth above savings',3:'7–9% — long-term market-like returns',4:'10–14% — above-average historical returns; I accept the added risk',5:'15%+ — maximum growth; comfortable with significant swings'} },
  q6:{ text:'Breaking news: analysts predict a market crash. How do you react?', opts:{1:'I move to safer investments right away',3:'I check with my advisor but don\'t make major changes',5:'I tune it out — predictions are rarely accurate'} },
  q7:{ text:'Have you been through a major market decline before (2008 or 2020)?', opts:{5:'Yes — stayed invested, it reinforced my confidence',4:'Yes — got nervous but held on, learned from it',2:'Yes — made me a lot more cautious going forward',3:'No — haven\'t been through a major downturn yet'} },
  q8:{ text:'What\'s the biggest annual loss you could absorb in Bucket Three without losing sleep?', opts:{5:'More than 25%',4:'15%–25% — significant drops are hard but I stay the course',3:'5%–15% — moderate losses, I\'d check in but not overreact',1:'As little as possible'} }
};
const QW    = { q1:12, q2:10, q3:20, q4:16, q5:12, q6:8, q7:6, q8:22 };
const Q_MAX = { q1:5,  q2:4,  q3:5,  q4:5,  q5:5,  q6:5, q7:5, q8:5  };

let coupleMode = false;
let p1Name = 'Spouse 1', p2Name = 'Spouse 2';
const A  = {};
const A2 = {};
let curQ = 1;

function toggleCoupleMode(on) {
  coupleMode = on;
  document.getElementById('couple-names').style.display = on ? 'grid' : 'none';
}

function startQuiz() {
  if (coupleMode) {
    p1Name = document.getElementById('name-p1').value.trim() || 'Spouse 1';
    p2Name = document.getElementById('name-p2').value.trim() || 'Spouse 2';
    for (let i = 1; i <= 8; i++) {
      const lbl = document.getElementById('second-ans-lbl-' + i);
      const btn = document.getElementById('btn-add-second-' + i);
      if (lbl) lbl.textContent = p2Name + "'s Response";
      if (btn) btn.classList.add('couple-active');
    }
  } else {
    for (let i = 1; i <= 8; i++) {
      const btn = document.getElementById('btn-add-second-' + i);
      if (btn) btn.classList.remove('couple-active');
    }
  }
  showView('quiz');
  qGo(1);
}

function pick(el, qKey, val) {
  el.closest('.opts').querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  A[qKey] = val;
  updateProgress();
}

function pickSecond(el, qKey, val) {
  el.closest('.opts').querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
  el.classList.add('sel');
  A2[qKey] = val;
}

function showSecondAnswer(qNum) {
  const wrap = document.getElementById('second-ans-' + qNum);
  const btn  = document.getElementById('btn-add-second-' + qNum);
  const container = document.getElementById('second-ans-opts-' + qNum);
  if (!wrap || !container) return;
  const qKey = 'q' + qNum;
  const qa   = QUIZ_QA_MAP[qKey];
  if (!qa) return;
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'opts second-ans-opts';
  Object.entries(qa.opts).forEach(([val, label]) => {
    const opt = document.createElement('div');
    opt.className = 'opt';
    opt.innerHTML = '<div class="opt-dot"></div><div><div class="opt-lbl">' + label + '</div></div>';
    opt.onclick = () => pickSecond(opt, qKey, parseInt(val));
    div.appendChild(opt);
  });
  container.appendChild(div);
  wrap.classList.add('visible');
  if (btn) btn.style.display = 'none';
}

function qGo(n) {
  document.querySelectorAll('.q-step').forEach(s => s.classList.remove('active'));
  const step = document.getElementById('q-' + n);
  if (step) step.classList.add('active');
  curQ = n;
  updateProgress();
}

function updateProgress() {
  const pct  = Math.round(((curQ - 1) / 8) * 100) + 4;
  const fill = document.getElementById('prog-fill');
  const lbl  = document.getElementById('prog-label');
  const sc   = document.getElementById('prog-score');
  if (fill) fill.style.width = pct + '%';
  if (lbl)  lbl.textContent  = 'Question ' + curQ + ' of 8';
  const s = calcQScore(A);
  if (sc) sc.textContent = s !== null ? 'Score: ' + s : 'Score: —';
}

function calcQScore(answers) {
  let total = 0, maxTotal = 0;
  for (const [qKey, weight] of Object.entries(QW)) {
    const ans = answers[qKey];
    if (ans === undefined) return null;
    total    += ans * weight;
    maxTotal += Q_MAX[qKey] * weight;
  }
  return Math.round((total / maxTotal) * 100);
}

function getEffectiveA2() {
  const eff = { ...A };
  for (const [k, v] of Object.entries(A2)) eff[k] = v;
  return eff;
}

function riskLevelLabel(s) {
  if (s <= 25) return 'Conservative';
  if (s <= 40) return 'Moderately Conservative';
  if (s <= 60) return 'Moderate';
  if (s <= 75) return 'Moderately Aggressive';
  return 'Aggressive';
}
function riskColor(s) {
  if (s <= 25) return '#2563a8';
  if (s <= 40) return '#22a06b';
  if (s <= 60) return '#6b7e96';
  if (s <= 75) return '#d4820a';
  return '#c0392b';
}

function getBucketThreeGuidance(s) {
  if (s <= 25) return { equity:'20–30%', bonds:'60–70%', alt:'5–10%', target:'4–5%', label:'Conservative', note:'Focus on capital preservation with modest growth. Primarily investment-grade bonds and dividend stocks.' };
  if (s <= 40) return { equity:'35–50%', bonds:'40–55%', alt:'5–15%', target:'5–7%', label:'Moderately Conservative', note:'A balanced approach leaning toward stability. Mix of growth-oriented equities with strong fixed-income anchor.' };
  if (s <= 60) return { equity:'50–65%', bonds:'25–40%', alt:'5–20%', target:'7–9%', label:'Moderate', note:'True balance between growth and stability. Positioned to capture meaningful market upside while limiting drawdowns.' };
  if (s <= 75) return { equity:'65–80%', bonds:'10–25%', alt:'5–20%', target:'9–11%', label:'Moderately Aggressive', note:'Growth-oriented with meaningful equity exposure. Accepts higher short-term volatility in pursuit of long-term wealth building.' };
  return { equity:'80–100%', bonds:'0–10%', alt:'0–20%', target:'10–13%', label:'Aggressive', note:'Maximum long-term growth orientation. Fully committed to equity markets through complete market cycles.' };
}

function renderGuidanceAndFlags(s) {
  const g = getBucketThreeGuidance(s);
  const el = document.getElementById('qr-guidance');
  if (!el) return;
  el.innerHTML = `
    <div class="b3g-ey">Bucket Three Guidance · Based on Score of ${s}</div>
    <div class="b3g-title">${g.label} Risk Profile — Suggested Allocation</div>
    <div class="b3g-cards">
      <div class="b3g-card hi"><div class="b3g-clbl">Risk Score</div><div class="b3g-cval">${s}</div><div class="b3g-cdet">out of 100</div></div>
      <div class="b3g-card"><div class="b3g-clbl">Suggested Equity</div><div class="b3g-cval">${g.equity}</div><div class="b3g-cdet">of Bucket Three</div></div>
      <div class="b3g-card"><div class="b3g-clbl">Fixed Income</div><div class="b3g-cval">${g.bonds}</div><div class="b3g-cdet">of Bucket Three</div></div>
      <div class="b3g-card"><div class="b3g-clbl">Alternatives</div><div class="b3g-cval">${g.alt}</div><div class="b3g-cdet">of Bucket Three</div></div>
      <div class="b3g-card"><div class="b3g-clbl">Target Return</div><div class="b3g-cval">${g.target}</div><div class="b3g-cdet">annualized long-term</div></div>
    </div>
    <div class="b3g-note">${g.note}</div>`;
}

function showQuizResults() {
  const s1  = calcQScore(A) || 50;
  const date = new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  document.getElementById('qr-date').textContent = 'Completed: ' + date;
  showView('quiz-results');

  if (coupleMode) {
    const anyDiffering = Object.keys(A2).length > 0 && Object.keys(A2).some(k => A2[k] !== A[k]);
    if (!anyDiffering) {
      document.getElementById('qr-single-hero').style.display = '';
      document.getElementById('qr-couple-hero').style.display = 'none';
      document.getElementById('qr-score').textContent = s1;
      setTimeout(() => {
        document.getElementById('qr-bar').style.width = s1 + '%';
        document.getElementById('qr-pin').style.left  = s1 + '%';
      }, 120);
      renderGuidanceAndFlags(s1);
      renderComplianceBlock(s1, null);
      if (typeof cpCaptureTolerance === 'function') cpCaptureTolerance(s1, null);
      return;
    }
    const s2raw = calcQScore(getEffectiveA2());
    const s2    = s2raw !== null ? s2raw : null;
    document.getElementById('qr-single-hero').style.display = 'none';
    document.getElementById('qr-couple-hero').style.display = 'grid';
    document.getElementById('csc-name-1').textContent  = p1Name;
    document.getElementById('csc-score-1').textContent = s1;
    document.getElementById('csc-level-1').textContent = riskLevelLabel(s1);
    setTimeout(() => {
      document.getElementById('csc-bar-1').style.width      = s1 + '%';
      document.getElementById('csc-bar-1').style.background = riskColor(s1);
    }, 120);
    document.getElementById('csc-name-2').textContent = p2Name;
    const scoreToShow = s2 !== null ? s2 : s1;
    document.getElementById('csc-score-2').textContent = scoreToShow;
    document.getElementById('csc-level-2').textContent = riskLevelLabel(scoreToShow) + (s2 === null ? ' (same as ' + p1Name + ')' : '');
    setTimeout(() => {
      document.getElementById('csc-bar-2').style.width      = scoreToShow + '%';
      document.getElementById('csc-bar-2').style.background = riskColor(scoreToShow);
    }, 120);
    const avg = Math.round((s1 + (s2 || s1)) / 2);
    setTimeout(() => {
      document.getElementById('qr-pin').style.left = avg + '%';
    }, 120);
    renderGuidanceAndFlags(avg);
    renderComplianceBlock(s1, s2);
    if (typeof cpCaptureTolerance === 'function') cpCaptureTolerance(s1, s2);
  } else {
    document.getElementById('qr-single-hero').style.display = '';
    document.getElementById('qr-couple-hero').style.display = 'none';
    document.getElementById('qr-score').textContent = s1;
    setTimeout(() => {
      document.getElementById('qr-bar').style.width = s1 + '%';
      document.getElementById('qr-pin').style.left  = s1 + '%';
    }, 120);
    renderGuidanceAndFlags(s1);
    renderComplianceBlock(s1, null);
    if (typeof cpCaptureTolerance === 'function') cpCaptureTolerance(s1, null);
  }
}

function renderComplianceBlock(s1, s2) {
  const date    = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const anyDiff = s2 !== null && s2 !== s1;
  let text = '';
  text += '═══════════════════════════════════════════════════════════\n';
  text += 'CAPITAL PLANNING WEALTH MANAGEMENT\n';
  text += 'Bucket Three Risk Assessment · Compliance Record\n';
  text += '═══════════════════════════════════════════════════════════\n';
  text += 'Date: ' + date + '\n';
  if (coupleMode && anyDiff) {
    text += 'Respondents: ' + p1Name + ' (Score: ' + s1 + ') and ' + p2Name + ' (Score: ' + s2 + ')\n';
    text += 'Note: Individual scores were determined. Where responses differed, both answers are documented below.\n';
  } else if (coupleMode) {
    text += 'Respondents: ' + p1Name + ' and ' + p2Name + '\n';
    text += 'Shared Score: ' + s1 + ' — both ' + p1Name + ' and ' + p2Name + ' were in agreement on all responses.\n';
  } else {
    text += 'Risk Score: ' + s1 + ' / 100 — ' + riskLevelLabel(s1) + '\n';
  }
  text += '───────────────────────────────────────────────────────────\n\n';
  text += 'QUESTION & ANSWER RECORD\n\n';

  for (let i = 1; i <= 8; i++) {
    const qKey = 'q' + i;
    const qa   = QUIZ_QA_MAP[qKey];
    const a1v  = A[qKey];
    const a2v  = coupleMode ? (A2[qKey] !== undefined ? A2[qKey] : a1v) : undefined;
    const a1txt = qa.opts[a1v]  || '(not answered)';
    const a2txt = qa.opts[a2v]  || '(not answered)';
    text += 'Q' + i + ': ' + qa.text + '\n';
    if (coupleMode && anyDiff) {
      if (a1v === a2v) {
        text += '   → Both (' + p1Name + ' & ' + p2Name + '): ' + a1txt + ' (agreed)\n';
      } else {
        text += '   → ' + p1Name + ': ' + a1txt + '\n';
        text += '   → ' + p2Name + ': ' + a2txt + '\n';
        text += '   ⚑ Differing responses — discussed during meeting\n';
      }
    } else if (coupleMode) {
      text += '   → Both (' + p1Name + ' & ' + p2Name + '): ' + a1txt + ' (agreed)\n';
    } else {
      text += '   → ' + a1txt + '\n';
    }
    text += '\n';
  }
  text += '───────────────────────────────────────────────────────────\n';
  const g = getBucketThreeGuidance(coupleMode && s2 ? Math.round((s1+(s2||s1))/2) : s1);
  if (coupleMode && anyDiff) {
    text += 'INDIVIDUAL SCORES:\n';
    text += '  ' + p1Name + ': ' + s1 + ' / 100 — ' + riskLevelLabel(s1) + '\n';
    text += '  ' + p2Name + ': ' + s2 + ' / 100 — ' + riskLevelLabel(s2) + '\n';
    text += '  Combined Average: ' + Math.round((s1+s2)/2) + ' / 100\n';
  } else {
    text += 'FINAL SCORE: ' + s1 + ' / 100 — ' + riskLevelLabel(s1) + '\n';
  }
  text += 'SUGGESTED EQUITY ALLOCATION: ' + g.equity + ' of Bucket Three\n';
  text += 'TARGET RETURN: ' + g.target + ' annualized\n';
  text += '───────────────────────────────────────────────────────────\n';
  text += 'Securities & Advisory Services offered through LPL Financial, Member FINRA/SIPC.\n';
  text += 'Capital Planning Wealth Management and LPL Financial are separate entities.\n';

  const ccBody = document.getElementById('cc-body');
  if (ccBody) ccBody.textContent = text;
}

function resetQuiz() {
  for (const k in A)  delete A[k];
  for (const k in A2) delete A2[k];
  document.querySelectorAll('.opt').forEach(o => o.classList.remove('sel'));
  document.querySelectorAll('.second-ans-wrap').forEach(w => w.classList.remove('visible'));
  document.querySelectorAll('.btn-add-second').forEach(b => b.style.display = '');
  const toggle = document.getElementById('couple-mode-toggle');
  if (toggle) { toggle.checked = false; toggleCoupleMode(false); }
  showView('intro');
}

// ══ SAVE / PRINT — open clean styled page in new tab ══
function downloadHtml(filename) {
  // Reuse the same export logic as saveAsImage but trigger download directly
  saveAsImage('view-analyzer', 'az-html-btn', filename, true);
}

function saveAsImage(viewId, btnId, filename, forceDownload) {
  const btn = document.getElementById(btnId);
  if (btn) { btn.innerHTML = '⏳ Opening...'; btn.classList.add('saving'); }

  // Build a fully self-contained HTML page with all colors hardcoded (no CSS vars)
  const allCSS = collectAllCSS();
  // Resolve CSS variables by replacing them with literal hex values
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

  const printCSS = `
    body { background:#f9f7f3 !important; margin:0; padding:24px; }
    .hdr, .r-actions, .btn-add-second, .cc-copy-btn, .mode-tabs,
    .action-row, .upload-area, .stock-form, .analyzing-state,
    .b3-banner, .progress-wrap, .q-nav, .cash-input-wrap,
    #cash-totals-row, .cta-note, .adv-badge, .second-ans-wrap,
    .couple-toggle-wrap, .disclaimer, .pb-no-export,
    .cp-client-bar, .cp-client-modal { display:none !important; }
    .view { display:none !important; }
    .print-target { display:block !important; }
    @media print {
      body { padding:0; }
      * { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
  `;

  const fontLink = document.querySelector('link[href*="fonts.googleapis"]');
  const fontTag  = fontLink ? fontLink.outerHTML : '';

  // For the portfolio analyzer, rebuild from live data so added cash is included
  let exportBody = '';
  if (viewId === 'view-analyzer' && _portfolioAccounts && _portfolioAccounts.length) {
    const scoreEl = document.getElementById('az-score');
    const levelEl = document.getElementById('az-level');
    const allocGrid = document.getElementById('az-alloc-grid');
    const overallScore = scoreEl ? scoreEl.textContent : '—';
    const overallLevel = levelEl ? levelEl.textContent : '—';
    const rCol = riskColor(parseInt(overallScore) || 50);

    // Rebuild account cards with cash rows injected
    let accountsHtml = '';
    _portfolioAccounts.forEach((acct, ai) => {
      const id = 'acct-' + ai;
      const scoreEl2 = document.getElementById(id + '-score');
      const levelEl2 = document.getElementById(id + '-level');
      const acctScore = scoreEl2 ? scoreEl2.textContent : '—';
      const acctLevel = levelEl2 ? levelEl2.textContent : '—';
      const acctScoreCol = riskColor(parseInt(acctScore) || 50);
      const cashAdded = acct.cash_added || 0;

      // Holdings rows
      let rowsHtml = (acct.holdings || []).map(h => renderHoldingRow(h)).join('');

      // Inject cash row at bottom if cash was added
      if (cashAdded > 0) {
        const cashMv = '$' + cashAdded.toLocaleString('en-US', {maximumFractionDigits:0});
        // Recalc alloc_pct of cash vs total account value
        const acctTotal = (acct.holdings || []).reduce((s, h) => s + (parseFloat(h.market_value)||0), 0) + cashAdded;
        const cashPct = acctTotal > 0 ? (cashAdded / acctTotal * 100).toFixed(1) + '%' : '—';
        rowsHtml += `<tr>
          <td><span class="ticker-badge">CASH</span></td>
          <td style="font-weight:600;font-size:.79rem">Cash Added</td>
          <td style="font-size:.71rem;color:#6b7e96">Cash / Money Market</td>
          <td style="text-align:center;font-size:.75rem;color:#1b2b3a;font-weight:600">${cashMv}</td>
          <td style="text-align:center">
            <div class="risk-bar-wrap"><div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${cashPct};background:#2563a8"></div></div></div>
            <div style="font-size:.68rem;color:#6b7e96">${cashPct}</div>
          </td>
          <td style="text-align:center"><span class="risk-num" style="color:#2563a8">5</span></td>
          <td><span class="risk-badge" style="background:#e8f0fa;color:#2563a8">● Low Risk</span></td>
        </tr>`;
      }

      accountsHtml += `<div class="holdings-card" style="margin-bottom:20px">
        <div class="hc-head">
          <div>
            <div class="hc-title">${acct.account_name || 'Account ' + (ai+1)}</div>
            <div class="hc-count">${(acct.holdings||[]).length} positions${cashAdded > 0 ? ' + cash' : ''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:.6rem;color:#a8b8cc;text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Account Risk Score</div>
            <div style="font-size:1.4rem;font-weight:700;color:${acctScoreCol}">${acctScore}</div>
            <div style="font-size:.65rem;color:#6b7e96">${acctLevel}</div>
          </div>
        </div>
        <table class="htable">
          <thead><tr><th>Ticker</th><th>Holding</th><th>Type</th><th style="text-align:center">Value</th><th style="text-align:center">Alloc</th><th style="text-align:center">Risk</th><th>Level</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>`;
    });

    const portfolioName = document.getElementById('az-score') ? (document.querySelector('.az-score-title') || {}).textContent || 'Client Portfolio' : 'Client Portfolio';
    exportBody = `
      <div class="az-score-banner" style="background:#1b2b3a;color:#fff;border-radius:14px;padding:24px 28px;display:flex;align-items:center;gap:24px;margin-bottom:20px">
        <div style="flex:1">
          <div style="font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-bottom:4px">AI-Powered Portfolio Risk Analysis</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#fff;margin-bottom:12px">${portfolioName}</div>
          <div style="background:rgba(255,255,255,.15);border-radius:6px;height:10px;margin-bottom:4px"><div style="height:10px;border-radius:6px;width:${overallScore}%;background:${rCol}"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:.6rem;color:rgba(255,255,255,.4)"><span>Conservative (0)</span><span>Moderate (50)</span><span>Aggressive (100)</span></div>
        </div>
        <div style="text-align:center;flex-shrink:0">
          <div style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;color:#fff;line-height:1">${overallScore}</div>
          <div style="font-size:.75rem;color:rgba(255,255,255,.7)">${overallLevel}</div>
          <div style="font-size:.55rem;color:rgba(255,255,255,.4);margin-top:2px">out of 100</div>
        </div>
      </div>
      <div style="font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7e96;margin-bottom:12px">Asset Allocation Breakdown</div>
      ${(typeof buildAlignmentExportHTML === 'function') ? buildAlignmentExportHTML() : ''}
      <div class="alloc-grid" style="margin-bottom:24px">${allocGrid ? allocGrid.innerHTML : ''}</div>
      ${accountsHtml}
      <div class="footer-bar">
        <div><div class="fb-firm">Capital Planning Wealth Management</div><div class="fb-sub">Portfolio Risk Analyzer · Advisor Use Only · Confidential</div></div>
        <div><div class="fb-lpl-note">Securities &amp; Advisory Services offered through</div><div class="fb-lpl-name">LPL Financial · Member FINRA / SIPC</div></div>
      </div>
      <div class="disclaimer"><strong>Disclosure:</strong> This portfolio risk analysis is generated by artificial intelligence and is for informational and advisor discussion purposes only. It does not constitute a formal suitability determination, investment advice, or guarantee of future results. Securities and advisory services offered through LPL Financial, Member FINRA/SIPC.</div>`;
  } else {
    const activeEl = document.getElementById(viewId);
    exportBody = activeEl ? activeEl.innerHTML : '';
  }

  const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Capital Planning Wealth Management</title>
${fontTag}
<style>${resolvedCSS}</style>
<style>${printCSS}
/* ── SLEEVE SELECTOR PILLS ── */
.mdl-sleeve-pills{
  display:flex;flex-wrap:wrap;gap:5px;
  padding:10px 16px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(to bottom, #202e3b, #1b2b3a);
}
.mdl-sleeve-pill{
  padding:5px 13px;border-radius:999px;
  border:1.5px solid rgba(255,255,255,.15);
  background:rgba(255,255,255,.07);
  font-size:.62rem;font-weight:700;
  color:rgba(255,255,255,.6);
  cursor:pointer;transition:all .2s;
  letter-spacing:.04em;white-space:nowrap;
}
.mdl-sleeve-pill:hover{
  border-color:rgba(184,146,42,.6);
  color:var(--gold-light);
  background:rgba(184,146,42,.1);
}
.mdl-sleeve-pill.active{
  background:var(--gold);
  border-color:var(--gold);
  color:var(--navy);
  font-weight:800;
}

/* ── RETURNS TOGGLE LINK ── */
.mdl-returns-toggle{
  display:flex;align-items:center;gap:5px;
  padding:8px 16px;
  font-size:.65rem;font-weight:700;
  color:var(--slate);letter-spacing:.04em;
  cursor:pointer;border-top:1px solid var(--border);
  background:var(--cream);
  transition:color .15s,background .15s;
  user-select:none;
}
.mdl-returns-toggle:hover{color:var(--navy);background:#f0ede6;}
.mdl-returns-toggle .rt-chevron{font-size:.55rem;transition:transform .25s;margin-left:auto;opacity:.5;}
.mdl-returns-toggle.open .rt-chevron{transform:rotate(180deg);}

/* ── RETURNS PANEL ── */
.mdl-returns-panel{
  max-height:0;overflow:hidden;
  transition:max-height .35s cubic-bezier(.4,0,.2,1);
  background:#fff;border-top:none;
}
.mdl-returns-panel.open{max-height:600px;}
.mdl-returns-inner{padding:16px 18px 18px;}

/* Chart bars */
.mdl-ret-chart{display:flex;flex-direction:column;gap:5px;}
.mdl-ret-row{display:grid;grid-template-columns:36px 1fr 48px;gap:6px;align-items:center;}
.mdl-ret-yr{font-size:.62rem;font-weight:700;color:var(--slate);text-align:right;}
.mdl-ret-bars{position:relative;height:18px;}
.mdl-ret-bar-model{position:absolute;top:1px;height:8px;border-radius:3px;transition:width .5s ease;min-width:2px;}
.mdl-ret-bar-bench{position:absolute;bottom:1px;height:8px;border-radius:3px;opacity:.45;transition:width .5s ease;min-width:2px;}
.mdl-ret-val{font-size:.65rem;font-weight:700;text-align:right;}
.mdl-ret-legend{display:flex;gap:12px;margin-bottom:10px;}
.mdl-ret-leg-item{display:flex;align-items:center;gap:5px;font-size:.6rem;font-weight:600;color:var(--slate);}
.mdl-ret-leg-dot{width:10px;height:6px;border-radius:2px;}
.ret-pos{color:var(--green);}
.ret-neg{color:var(--red);}


/* ── Generate perf button on card ── */
.mdl-gen-btn{
  background:transparent;
  border:1.5px solid var(--border);
  border-radius:7px;
  padding:5px 10px;
  font-family:'Nunito Sans',sans-serif;
  font-size:.65rem;font-weight:700;
  color:var(--slate);cursor:pointer;
  transition:all .18s;white-space:nowrap;
}
.mdl-gen-btn:hover{
  background:var(--navy);color:#fff;border-color:var(--navy);
}
.mdl-gen-btn:disabled{opacity:.5;pointer-events:none;}

</style>
</head>
<body>
<div class="print-target" style="display:block">
${exportBody}
</div>
<p style="font-family:'Nunito Sans',sans-serif;font-size:11px;color:#aaa;text-align:center;margin:32px 0 16px;padding-top:16px;border-top:1px solid #eee">
  To save as PDF: press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) and choose <strong>Save as PDF</strong>
</p>

<!-- ADD ACCOUNT MODAL -->
<div class="aa-overlay" id="aa-overlay" style="display:none" onclick="if(event.target===this)closeAddAccountModal()">
  <div class="aa-modal">
    <div class="aa-modal-head">
      <div class="aa-modal-title">Add Account to Portfolio</div>
      <button class="aa-modal-close" onclick="closeAddAccountModal()">✕</button>
    </div>
    <div class="aa-modal-body">
      <div class="aa-field-label">Account Name</div>
      <input class="aa-input" id="aa-acct-name" placeholder="e.g. Joint Brokerage (1234)" style="margin-bottom:16px">

      <div class="aa-field-label">Holdings <span style="font-weight:400;text-transform:none;letter-spacing:0;color:var(--slate-lt)">(enter ticker + description + value, then score)</span></div>
      <div style="display:grid;grid-template-columns:110px 1fr 110px 32px;gap:8px;margin-bottom:6px;">
        <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--slate)">Ticker</div>
        <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--slate)">Name / Description</div>
        <div style="font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--slate)">Market Value ($)</div>
        <div></div>
      </div>
      <div class="aa-holdings-list" id="aa-holdings-list"></div>
      <button class="aa-add-row-btn" onclick="addHoldingRow()">＋ Add Holding</button>

      <div style="margin-top:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <button class="aa-score-btn" id="aa-score-btn" onclick="scoreNewHoldings()">🔍 Score Holdings with AI</button>
        <span class="aa-scoring-note" id="aa-score-status"></span>
      </div>

      <div style="margin-top:16px;padding-top:16px;border-top:1px dashed var(--border);display:flex;align-items:center;gap:10px">
        <span class="aa-field-label" style="margin:0;white-space:nowrap">💵 Cash / Debit Balance:</span>
        <span style="font-size:.78rem;color:var(--slate);font-weight:600">$</span>
        <input class="aa-input" id="aa-cash" type="number" step="1000" placeholder="0 (negative for debit balance)" style="max-width:160px">
      </div>
    </div>
    <div class="aa-modal-footer">
      <button class="aa-cancel-btn" onclick="closeAddAccountModal()">Cancel</button>
      <button class="aa-confirm-btn" id="aa-confirm-btn" onclick="confirmAddAccount()">Add Account</button>
    </div>
  </div>
</div>

<!-- ══ STRESS TEST MODAL ══ -->
<div class="st-modal-overlay" id="st-modal-overlay" onclick="closeStressModal(event)">
  <div class="st-modal">
    <div class="st-modal-head">
      <div>
        <div class="st-modal-title">⚡ Portfolio Stress Test</div>
        <div class="st-modal-sub">Estimated impact based on historical asset class behavior · For advisor discussion only</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="st-print-btn" id="st-print-btn" onclick="exportStressTest(this)">📄 Save as PDF / Print</button>
        <button class="st-modal-close" onclick="closeStressTest()">✕</button>
      </div>
    </div>
    <div class="st-modal-body">

      <div class="st-tabs" id="st-tabs">
        <div style="display:flex;align-items:center;gap:6px;width:100%;flex-wrap:wrap">
          <span style="font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#c0392b;padding:3px 8px;background:#fde8e8;border-radius:20px;white-space:nowrap">📉 Bear Markets</span>
          <div class="st-tab active" onclick="switchScenario('2008')">2008 Crisis</div>
          <div class="st-tab" onclick="switchScenario('covid')">2020 COVID</div>
          <div class="st-tab" onclick="switchScenario('2022')">2022 Rate Hike</div>
          <div class="st-tab" onclick="switchScenario('dotcom')">2000 Dot Com Bubble</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;width:100%;flex-wrap:wrap;margin-top:4px">
          <span style="font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#22a06b;padding:3px 8px;background:#e6f4ed;border-radius:20px;white-space:nowrap">📈 Bull Markets</span>
          <div class="st-tab" onclick="switchScenario('bull2009')">2009 Rebound</div>
          <div class="st-tab" onclick="switchScenario('bull2013')">2013 Post-Crisis</div>
          <div class="st-tab" onclick="switchScenario('bull2017')">2017 Low-Vol</div>
          <div class="st-tab" onclick="switchScenario('bull2021')">2021 Post-COVID</div>
          <div class="st-tab" onclick="switchScenario('custom')">⚙️ Custom</div>
        </div>
      </div>

      <div id="st-scenario-content"><!-- filled by JS --></div>

    </div>
  </div>
</div>

</body>
</html>`;

  try {
    const blob = new Blob([doc], { type: 'text/html;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    if (forceDownload) {
      // Direct download as .html file
      const a = document.createElement('a');
      a.href = url; a.download = filename + '.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (btn) { btn.innerHTML = '✓ Downloaded!'; btn.style.color = '#1d7a50'; }
      setTimeout(() => { if (btn) { btn.innerHTML = '💾 Save as HTML'; btn.style.color = ''; } }, 3000);
      return;
    }
    const tab  = window.open(url, '_blank');
    if (tab) {
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (btn) {
        btn.innerHTML = '✓ Opened — use Ctrl+P → Save as PDF';
        btn.style.background = '#1d7a50'; btn.style.color = '#fff'; btn.style.borderColor = '#1d7a50';
      }
    } else {
      // Popup blocked — download as HTML file instead
      const a = document.createElement('a');
      a.href = url; a.download = filename + '.html';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      if (btn) { btn.innerHTML = '✓ Downloaded — open in browser then Ctrl+P'; btn.style.background = '#1d7a50'; btn.style.color = '#fff'; btn.style.borderColor = '#1d7a50'; }
    }
  } catch(e) {
    if (btn) { btn.innerHTML = '📄 Save as PDF'; }
    alert('Please allow popups for this page and try again.');
  }
  setTimeout(() => {
    if (btn) { btn.innerHTML = '📄 Save as PDF'; btn.style.background = btn.style.color = btn.style.borderColor = ''; btn.classList.remove('saving'); }
  }, 5000);
}

// ══ COPY FUNCTIONS ══
function copyQuizSummary() {
  const complianceText = document.getElementById('cc-body') ? document.getElementById('cc-body').textContent : '';
  const guidance = document.getElementById('qr-guidance');
  let summary = complianceText;
  if (guidance) {
    const cards = guidance.querySelectorAll('.b3g-card');
    summary += '\n─────────────────────────────────────────────────\nBUCKET THREE GUIDANCE\n─────────────────────────────────────────────────\n';
    cards.forEach(c => {
      const lbl = c.querySelector('.b3g-clbl'), val = c.querySelector('.b3g-cval'), det = c.querySelector('.b3g-cdet');
      if (lbl && val) summary += lbl.textContent + ': ' + val.textContent + (det ? ' — ' + det.textContent : '') + '\n';
    });
  }
  doCopy(summary, 'quiz-copy-btn');
}

function copyAnalyzerSummary() {
  const date = new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  let summary = 'PORTFOLIO RISK ANALYSIS\nCapital Planning Wealth Management · LPL Financial · Member FINRA/SIPC\nDate: ' + date + '\n';
  summary += '─────────────────────────────────────────────────\n\n';
  const score = document.getElementById('az-score');
  const level = document.getElementById('az-level');
  if (score) summary += 'OVERALL RISK SCORE: ' + score.textContent + (level ? ' — ' + level.textContent : '') + '\n\n';
  const rows = document.querySelectorAll('.htable tbody tr');
  if (rows.length) {
    summary += 'HOLDINGS BREAKDOWN\n' + '─'.repeat(80) + '\n';
    summary += padCol('Ticker',8) + padCol('Name',34) + padCol('Type',26) + padCol('Alloc',8) + 'Score\n' + '─'.repeat(80) + '\n';
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) summary += padCol(cells[0].textContent.trim(),8) + padCol(cells[1].textContent.trim().substring(0,32),34) + padCol(cells[2].textContent.trim().substring(0,24),26) + padCol(cells[3].textContent.trim(),8) + cells[4].textContent.trim() + '\n';
    });
  }
  summary += '\n─────────────────────────────────────────────────\nDisclosure: Analysis is AI-generated for advisor discussion only. Not investment advice.\n';
  doCopy(summary, 'az-copy-btn');
}

function padCol(str, w) { return (str + ' '.repeat(w)).substring(0, w); }

function doCopy(text, btnId) {
  const btn = document.getElementById(btnId);
  const done = () => {
    if (btn) { btn.innerHTML = '✓ Copied!'; btn.style.background='#1d7a50'; btn.style.color='#fff'; btn.style.borderColor='#1d7a50'; }
    setTimeout(() => { if (btn) { btn.innerHTML='📋 Copy Full Summary'; btn.style.background=btn.style.color=btn.style.borderColor=''; } }, 2500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else { fallbackCopy(text, done); }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); cb(); } catch(e) {}
  document.body.removeChild(ta);
}

function copyComplianceText() {
  const text = document.getElementById('cc-body').textContent;
  const btn  = document.getElementById('cc-copy-btn');
  const done = () => {
    btn.classList.add('copied'); btn.innerHTML = '✓ Copied!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<span>📋</span> Copy to Clipboard'; }, 2500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else { fallbackCopy(text, done); }
}

