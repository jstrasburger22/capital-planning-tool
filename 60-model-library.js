/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — House model manager — 15 firm models, trade log, performance
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══ HOUSE MODEL MANAGER ══

let _models = [];         // Array of model objects
let _editingModelId = null; // null = new, string = editing existing

// ── Data structure per model ──
// { id, name, inception, benchmark, target, profile, notes,
//   holdings: [{ticker,name,weight,risk_score,exp_ratio,yield}],
//   events:   [{id,date,type,ticker,notes}],
//   perf:     {ytd,oneYear,ytd_bench,oneYear_bench}  // stored manually or AI-estimated
// }

// ── Render model grid ──
function renderMdlGrid() {
  const grid = document.getElementById('mdl-grid');
  if (!grid) return;
  if (!_models.length) {
    grid.innerHTML = `<div class="mdl-empty" style="grid-column:1/-1">
      <div class="mdl-empty-icon">🏛️</div>
      <div class="mdl-empty-title">No models yet</div>
      <div class="mdl-empty-sub">Create your first house model to start tracking performance and managing your custom allocations.</div>
      <button class="btn-new-model" style="margin:0 auto" onclick="openModelModal()">＋ Create First Model</button>
    </div>`;
    return;
  }
  grid.innerHTML = _models.map(m => renderMdlCard(m)).join('');
}

function renderMdlCard(m) {
  // ── Active sleeve ──
  const sleeveIdx  = _activeSleeveIndex[m.id] || 0;
  const sleeve     = m.sleeves ? m.sleeves[Math.min(sleeveIdx, m.sleeves.length-1)] : null;
  const holdings   = sleeve ? (sleeve.holdings || []) : (m.holdings || []);
  const riskScore  = sleeve && sleeve.risk_score ? sleeve.risk_score : mdlCalcRisk(holdings);
  const er         = sleeve && sleeve.exp_ratio  ? sleeve.exp_ratio  : mdlCalcER(holdings);
  const yld        = sleeve && sleeve.div_yield  ? sleeve.div_yield  : mdlCalcYield(holdings);
  // Use model's stated benchmark if named; otherwise blend by equity/bond split
  const _dispBench = (m.benchmark || '').toLowerCase();
  const benchEquityPct = holdings.filter(h => (parseFloat(h.risk_score)||50) >= 55)
    .reduce((s,h) => s + (parseFloat(h.weight)||0), 0);
  const benchBondPct = holdings.filter(h => (parseFloat(h.risk_score)||50) < 55 && (parseFloat(h.risk_score)||50) > 6)
    .reduce((s,h) => s + (parseFloat(h.weight)||0), 0);
  const totalBenchPct = benchEquityPct + benchBondPct || 100;
  const eqFrac = benchEquityPct / totalBenchPct;
  const bdFrac = benchBondPct / totalBenchPct;
  const bench = _dispBench.includes('acwi') ? 'MSCI ACWI'
    : _dispBench.includes('world') ? 'MSCI World'
    : _dispBench.includes('60') || _dispBench.includes('blend') ? '60/40 Blend'
    : _dispBench.includes('agg') || _dispBench.includes('bond') ? 'Bloomberg Agg'
    : eqFrac >= 0.85 ? 'S&P 500'
    : eqFrac <= 0.20 ? 'Bloomberg Agg'
    : `${Math.round(eqFrac*100)}% S&P 500 / ${Math.round(bdFrac*100)}% Bloomberg Agg`;
  const rCol       = riskScore <= 25 ? '#2563a8' : riskScore <= 40 ? '#22a06b' : riskScore <= 60 ? '#6b7e96' : riskScore <= 75 ? '#d4820a' : '#c0392b';
  const rBg        = riskScore <= 25 ? '#e8f0fa' : riskScore <= 40 ? '#e6f4ed' : riskScore <= 60 ? '#f0f2f6' : riskScore <= 75 ? '#fff3e0' : '#fde8e8';
  const rLabel     = riskScore <= 25 ? 'Conservative' : riskScore <= 40 ? 'Mod. Conservative' : riskScore <= 60 ? 'Moderate' : riskScore <= 75 ? 'Mod. Aggressive' : 'Aggressive';

  // ── Performance ──
  const perf      = (sleeve && sleeve.perf) || m.perf || {};
  const ytd       = perf.ytd       != null ? perf.ytd       : null;
  const oneY      = perf.oneYear   != null ? perf.oneYear   : null;
  const ytdBench  = perf.ytd_bench  != null ? perf.ytd_bench  : null;
  const oneYBench = perf.oneYear_bench != null ? perf.oneYear_bench : null;
  const fmtP = v => v != null ? (v>=0?'+':'')+parseFloat(v).toFixed(2)+'%' : '—';
  const pCls = v => v == null ? 'mdl-perf-val' : v >= 0 ? 'mdl-perf-val pos' : 'mdl-perf-val neg';
  const diffSpan = (a, b) => {
    if (a==null||b==null) return '';
    const d = a-b;
    return `<span style="font-size:.52rem;margin-left:3px;color:${d>=0?'#1d7a50':'#c0392b'};opacity:.85">${d>=0?'+':''}${d.toFixed(1)}%</span>`;
  };

  // ── Combo / sleeve meta ──
  const isCombo       = !!(m.combo_components && m.combo_components.length);
  const multiSleeve   = m.sleeves && m.sleeves.length > 1;
  const inception     = m.inception ? new Date(m.inception).toLocaleDateString('en-US',{month:'short',year:'numeric'}) : '—';
  const eventCount    = (m.events||[]).length;
  const detailPanelId = 'det-' + m.id.replace(/[^a-z0-9]/gi,'_') + '-' + sleeveIdx;

  // ── Combo core label ──
  let comboCoreName = '', comboFixedParts = [];
  if (isCombo) {
    m.combo_components.forEach(c => {
      const cm = CAPITAL_PLANNING_MODELS.find(x=>x.id===c.modelId) || _models.find(x=>x.id===c.modelId);
      if (!cm) return;
      if (cm.sleeves && cm.sleeves.length > 1) comboCoreName = cm.name;
      else comboFixedParts.push(`${cm.name} ${c.weight}%`);
    });
  }

  // ── Sleeve pills ──
  let sleevePillsHtml = '';
  if (multiSleeve) {
    const subLabel = isCombo && comboCoreName
      ? `<div style="width:100%;text-align:center;font-size:.5rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:6px">${comboCoreName} sleeve${comboFixedParts.length?' · '+comboFixedParts.join(' + '):''}</div>`
      : '';
    const pills = m.sleeves.map((s,i) => {
      const act = i === sleeveIdx;
      return `<div onclick="event.stopPropagation();selectSleeve('${m.id}',${i})" title="${s.name}"
        style="padding:6px 14px;border-radius:999px;border:1.5px solid ${act?'#cda561':'rgba(255,255,255,.2)'};
               background:${act?'#cda561':'rgba(255,255,255,.06)'};
               color:${act?'#1b2b3a':'rgba(255,255,255,.7)'};font-weight:${act?'800':'600'};
               font-size:.62rem;letter-spacing:.03em;white-space:nowrap;cursor:pointer;
               transition:all .2s;font-family:inherit">${s.name}</div>`;
    }).join('');
    sleevePillsHtml = `
      <div style="background:linear-gradient(135deg,#202e3b,#1b2b3a);padding:10px 16px;border-bottom:1px solid rgba(255,255,255,.06)">
        ${subLabel}
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center">${pills}</div>
      </div>`;
  }

  // ── Holdings rows for detail panel ──
  // Check if any holding has current_weight set (for drift detection)
  const hasDrift = holdings.some(h => h.current_weight != null);
  const holdingRows = holdings.map(h => {
    const s   = parseFloat(h.risk_score)||0;
    const col = s<=25?'#2563a8':s<=40?'#22a06b':s<=60?'#6b7e96':s<=75?'#d4820a':'#c0392b';
    const bg  = s<=25?'#e8f0fa':s<=40?'#e6f4ed':s<=60?'#f0f2f6':s<=75?'#fff3e0':'#fde8e8';
    const w   = parseFloat(h.weight)||0;
    const cw  = parseFloat(h.current_weight);
    const drift = !isNaN(cw) ? (cw - w) : null;
    const driftCol = drift == null ? '' : Math.abs(drift) >= 3 ? '#c0392b' : Math.abs(drift) >= 1.5 ? '#d4820a' : '#1d7a50';
    const driftTxt = drift == null ? '' : (drift >= 0 ? '+' : '') + drift.toFixed(1) + '%';
    const driftBadge = drift == null ? '' : `<span style="font-size:.58rem;font-weight:700;color:${driftCol};background:${Math.abs(drift)>=3?'#fde8e8':Math.abs(drift)>=1.5?'#fff3e0':'#e6f4ed'};border-radius:4px;padding:1px 5px;white-space:nowrap">${driftTxt}</span>`;
    return `<div style="display:grid;grid-template-columns:52px 1fr ${hasDrift?'50px ':''} 42px 36px 46px;gap:6px;align-items:center;padding:7px 0;border-bottom:1px solid #f0eee8">
      <div style="font-family:'JetBrains Mono',monospace;font-size:.68rem;font-weight:700;color:#1b2b3a;background:#f5f0ec;border-radius:5px;padding:2px 6px;text-align:center">${h.ticker||'—'}</div>
      <div style="font-size:.73rem;font-weight:600;color:#1a2a3a;line-height:1.3">${h.name||'—'}</div>
      ${hasDrift ? `<div style="text-align:center">${driftBadge}</div>` : ''}
      <div style="font-size:.7rem;font-weight:700;color:#1a2a3a;text-align:right">${w>0?w.toFixed(1)+'%':'—'}</div>
      <div style="font-size:.68rem;font-weight:700;color:${col};text-align:center;background:${bg};border-radius:5px;padding:1px 4px">${s||'—'}</div>
      <div style="font-size:.65rem;color:#6b7e96;text-align:right">${h.exp_ratio?h.exp_ratio.toFixed(2)+'%':'—'}</div>
    </div>`;
  }).join('');

  // ── Annual returns year picker ──
  const returns    = m.annualReturns || [];
  const retPanelId = 'ret-' + m.id.replace(/[^a-z0-9]/gi,'_');
  let returnsHtml  = '';
  if (returns.length) {
    const yearPills = returns.map((r, i) => {
      const pos = r.model >= 0;
      return `<div id="${retPanelId}-yr-${i}"
        onclick="event.stopPropagation();mdlSelectYear('${retPanelId}',${i},${returns.length})"
        style="padding:5px 11px;border-radius:999px;border:1.5px solid ${pos?'rgba(29,122,80,.25)':'rgba(192,57,43,.25)'};
               background:${pos?'rgba(29,122,80,.07)':'rgba(192,57,43,.07)'};
               font-size:.67rem;font-weight:700;color:${pos?'#1d7a50':'#c0392b'};
               cursor:pointer;white-space:nowrap;user-select:none;transition:all .18s">${r.year}</div>`;
    }).join('');
    const detailCards = returns.map((r, i) => {
      const diff = r.model-r.bench;
      const mFmt = (r.model>=0?'+':'')+r.model.toFixed(2)+'%';
      const bFmt = (r.bench>=0?'+':'')+r.bench.toFixed(2)+'%';
      const dFmt = (diff>=0?'+':'')+diff.toFixed(2)+'%';
      const mCol = r.model>=0?'#1d7a50':'#c0392b';
      const bCol = r.bench>=0?'#2563a8':'#d4820a';
      const dCol = diff>=0?'#1d7a50':'#c0392b';
      const maxA = Math.max(Math.abs(r.model),Math.abs(r.bench),1);
      const mW = (Math.abs(r.model)/maxA*86).toFixed(1);
      const bW = (Math.abs(r.bench)/maxA*86).toFixed(1);
      return `<div id="${retPanelId}-detail-${i}" style="display:none;padding:14px 0 4px">
        <div style="font-size:.56rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8b8cc;margin-bottom:10px">${r.year} · vs ${bench}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
          <div style="background:#fff;border:1.5px solid #e8e4dc;border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:.5rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:4px">Model</div>
            <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:${mCol}">${mFmt}</div>
          </div>
          <div style="background:#fff;border:1.5px solid #e8e4dc;border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:.5rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:4px">Benchmark</div>
            <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:${bCol}">${bFmt}</div>
          </div>
          <div style="background:#fff;border:1.5px solid #e8e4dc;border-radius:10px;padding:10px;text-align:center">
            <div style="font-size:.5rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:4px">Spread</div>
            <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:${dCol}">${dFmt}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div style="display:grid;grid-template-columns:54px 1fr 44px;gap:6px;align-items:center">
            <div style="font-size:.6rem;font-weight:700;color:#1a2a3a">Model</div>
            <div style="background:#e8ecf2;border-radius:4px;height:8px;overflow:hidden"><div style="height:100%;border-radius:4px;width:${mW}%;background:${mCol}"></div></div>
            <div style="font-size:.62rem;font-weight:700;color:${mCol};text-align:right">${mFmt}</div>
          </div>
          <div style="display:grid;grid-template-columns:54px 1fr 44px;gap:6px;align-items:center">
            <div style="font-size:.6rem;font-weight:700;color:#1a2a3a">${bench.split(' ')[0]}</div>
            <div style="background:#e8ecf2;border-radius:4px;height:8px;overflow:hidden"><div style="height:100%;border-radius:4px;width:${bW}%;background:${bCol}"></div></div>
            <div style="font-size:.62rem;font-weight:700;color:${bCol};text-align:right">${bFmt}</div>
          </div>
        </div>
      </div>`;
    }).join('');
    returnsHtml = `
      <div style="margin-bottom:18px">
        <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:8px">Select a Year · vs ${bench}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${yearPills}</div>
        ${detailCards}
      </div>`;
  }

  // ── Trade events snippet ──
  const evts = (m.events||[]).slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  const evtRows = evts.map(e => {
    const typeStyle = e.type==='add'
      ? 'background:#e6f4ed;color:#1d7a50'
      : e.type==='remove'
      ? 'background:#fde8e8;color:#c0392b'
      : 'background:#e8f0fa;color:#2563a8';
    return `<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #f0eee8">
      <div style="font-size:.62rem;color:#a8b8cc;white-space:nowrap;min-width:68px">${e.date}</div>
      <div style="font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:5px;white-space:nowrap;${typeStyle}">${e.type}</div>
      <div style="flex:1;font-size:.7rem;color:#1a2a3a;font-weight:600">${e.ticker||''} <span style="color:#6b7e96;font-weight:400">${e.notes||''}</span></div>
    </div>`;
  }).join('');
  const evtSection = evts.length ? `
    <div style="margin-bottom:18px">
      <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:8px">Recent Trade Events${eventCount>8?' (showing last 8 of '+eventCount+')':''}</div>
      ${evtRows}
    </div>` : '';

  return `<div class="mdl-card">

    <!-- ── HEADER ── -->
    <div style="background:linear-gradient(135deg,#202e3b 0%,#1b2b3a 100%);padding:18px 20px 16px;border-radius:14px 14px 0 0">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="font-size:.56rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-bottom:5px">${m.profile||'Model'}</div>
          <div style="font-family:'Playfair Display',serif;font-size:1.05rem;font-weight:700;color:#fff;line-height:1.25;margin-bottom:6px">${m.name||'Unnamed Model'}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
            <span style="font-size:.58rem;color:rgba(255,255,255,.45)">Benchmark: <strong style="color:rgba(255,255,255,.7)">${bench}</strong></span>
            <span style="font-size:.55rem;color:rgba(255,255,255,.25)">·</span>
            <span style="font-size:.58rem;color:rgba(255,255,255,.45)">Since <strong style="color:rgba(255,255,255,.7)">${inception}</strong></span>
            ${multiSleeve ? `<span style="font-size:.55rem;color:rgba(255,255,255,.25)">·</span><span style="font-size:.58rem;color:rgba(255,255,255,.45)">${m.sleeves.length} Sleeves</span>` : ''}
          </div>
        </div>
        <!-- Risk score circle -->
        <div style="flex-shrink:0;width:58px;height:58px;border-radius:50%;border:2.5px solid ${rCol};background:rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#fff;line-height:1">${riskScore||'—'}</div>
          <div style="font-size:.4rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.45);margin-top:1px">${riskScore?rLabel:''}</div>
        </div>
      </div>
    </div>

    <!-- ── SLEEVE PILLS ── -->
    ${sleevePillsHtml}

    <!-- ── STATS ROW ── -->
    <div style="display:flex;gap:0;padding:13px 20px;border-bottom:1px solid #f0eee8;background:#fff">
      <div style="flex:1;text-align:center;padding:4px 0">
        <div style="font-size:.52rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:3px">Exp. Ratio</div>
        <div style="font-size:.9rem;font-weight:700;color:#1a2a3a">${er>0?er.toFixed(2)+'%':'—'}</div>
      </div>
      <div style="width:1px;background:#f0eee8;margin:4px 0"></div>
      <div style="flex:1;text-align:center;padding:4px 0">
        <div style="font-size:.52rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:3px">Yield</div>
        <div style="font-size:.9rem;font-weight:700;color:#1a2a3a">${yld>0?yld.toFixed(2)+'%':'—'}</div>
      </div>
      <div style="width:1px;background:#f0eee8;margin:4px 0"></div>
      <div style="flex:1;text-align:center;padding:4px 0">
        <div style="font-size:.52rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:3px">Holdings</div>
        <div style="font-size:.9rem;font-weight:700;color:#1a2a3a">${holdings.length}</div>
      </div>
    </div>

    <!-- ── PERFORMANCE ── -->
    <div style="background:linear-gradient(180deg,#f9f7f3 0%,#fff 100%);padding:16px 20px 14px;border-bottom:1px solid #eee8e0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="font-size:.52rem;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#a8b8cc">Performance</div>
        <div style="font-size:.56rem;color:#a8b8cc;font-style:italic">vs ${bench}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <!-- YTD -->
        <div style="background:#fff;border:1.5px solid #eee8e0;border-radius:12px;padding:12px 14px;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${ytd==null?'#e8e4dc':ytd>=0?'linear-gradient(90deg,#1d7a50,#22c07a)':'linear-gradient(90deg,#c0392b,#e74c3c)'}"></div>
          <div style="font-size:.5rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8b8cc;margin-bottom:6px">YTD Return</div>
          <div id="ytd-${m.id}-${sleeveIdx}" style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:${ytd==null?'#c8c0b8':ytd>=0?'#1d7a50':'#c0392b'};line-height:1">${fmtP(ytd)}</div>
          ${ytdBench!=null?`<div style="font-size:.56rem;color:#a8b8cc;margin-top:5px;display:flex;align-items:center;gap:3px">
            <span>Bench ${fmtP(ytdBench)}</span>
            <span style="font-weight:700;color:${(ytd-ytdBench)>=0?'#1d7a50':'#c0392b'}">${(ytd-ytdBench)>=0?'▲':'▼'} ${Math.abs(ytd-ytdBench).toFixed(1)}%</span>
          </div>`:`<div style="font-size:.56rem;color:#c8c0b8;margin-top:5px;font-style:italic">click generate</div>`}
        </div>
        <!-- 1 Year -->
        <div style="background:#fff;border:1.5px solid #eee8e0;border-radius:12px;padding:12px 14px;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${oneY==null?'#e8e4dc':oneY>=0?'linear-gradient(90deg,#2563a8,#3b82f6)':'linear-gradient(90deg,#c0392b,#e74c3c)'}"></div>
          <div style="font-size:.5rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8b8cc;margin-bottom:6px">1-Year Return</div>
          <div id="oney-${m.id}-${sleeveIdx}" style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:${oneY==null?'#c8c0b8':oneY>=0?'#2563a8':'#c0392b'};line-height:1">${fmtP(oneY)}</div>
          ${oneYBench!=null?`<div style="font-size:.56rem;color:#a8b8cc;margin-top:5px;display:flex;align-items:center;gap:3px">
            <span>Bench ${fmtP(oneYBench)}</span>
            <span style="font-weight:700;color:${(oneY-oneYBench)>=0?'#1d7a50':'#c0392b'}">${(oneY-oneYBench)>=0?'▲':'▼'} ${Math.abs(oneY-oneYBench).toFixed(1)}%</span>
          </div>`:`<div style="font-size:.56rem;color:#c8c0b8;margin-top:5px;font-style:italic">click generate</div>`}
        </div>
      </div>
      <!-- Generate button — polished CTA -->
      <button id="gen-${m.id}-${sleeveIdx}"
        onclick="event.stopPropagation();mdlGeneratePerf('${m.id}',${sleeveIdx})"
        style="width:100%;padding:10px 16px;border-radius:10px;
               border:1.5px solid #cda561;
               background:linear-gradient(135deg,#1b2b3a,#2d3f4f);
               font-family:'Nunito Sans',sans-serif;font-size:.72rem;font-weight:700;
               color:#cda561;letter-spacing:.05em;cursor:pointer;transition:all .22s;
               display:flex;align-items:center;justify-content:center;gap:8px;
               box-shadow:0 2px 8px rgba(27,43,58,.15)">
        <span style="font-size:.85rem">⚡</span> Generate Performance
      </button>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
        <button onclick="event.stopPropagation();openCompareModal('${m.id}',${sleeveIdx})"
          style="padding:8px;border-radius:8px;border:1.5px solid #e8e4dc;background:#fff;
                 font-family:'Nunito Sans',sans-serif;font-size:.68rem;font-weight:700;
                 color:#6b7e96;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px">
          ⚖️ Compare
        </button>
        <button onclick="event.stopPropagation();generateProposal('${m.id}',${sleeveIdx})"
          style="padding:8px;border-radius:8px;border:1.5px solid #e8e4dc;background:#fff;
                 font-family:'Nunito Sans',sans-serif;font-size:.68rem;font-weight:700;
                 color:#6b7e96;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:5px">
          📄 Proposal
        </button>
      </div>
    </div>

    <!-- ── ADDITIONAL DETAILS (expandable) ── -->
    <div>
      <div onclick="event.stopPropagation();toggleMdlDetails('${detailPanelId}')"
        style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px;
               background:#f9f7f4;border-top:1px solid #f0eee8;cursor:pointer;transition:background .15s;
               font-size:.65rem;font-weight:700;letter-spacing:.06em;color:#6b7e96"
        id="tog-${detailPanelId}">
        <span>Additional Details</span>
        <span id="chev-${detailPanelId}" style="font-size:.55rem;transition:transform .25s;opacity:.5">▼</span>
      </div>
      <div id="${detailPanelId}" style="max-height:0;overflow:hidden;transition:max-height .4s cubic-bezier(.4,0,.2,1)">
        <div style="padding:16px 20px 20px;background:#f9f7f4;border-top:1px solid #f0eee8">

          <!-- Holdings table -->
          <div style="margin-bottom:18px">
            <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:8px">Holdings — ${sleeve?sleeve.name:'Current'}</div>
            <div style="display:grid;grid-template-columns:52px 1fr 42px 36px 46px;gap:6px;padding-bottom:6px;border-bottom:2px solid #e8e4dc;margin-bottom:2px">
              <div style="font-size:.52rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc">Ticker</div>
              <div style="font-size:.52rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc">Name</div>
              <div style="font-size:.52rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc;text-align:right">Wt.</div>
              <div style="font-size:.52rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc;text-align:center">Risk</div>
              <div style="font-size:.52rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc;text-align:right">ER</div>
            </div>
            ${holdingRows || '<div style="font-size:.75rem;color:#a8b8cc;font-style:italic;padding:8px 0">No holdings entered</div>'}
          </div>

          <!-- Annual returns -->
          ${returnsHtml}

          <!-- Trade log -->
          ${evtSection}

          <!-- Edit / Delete / Manual perf entry -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding-top:10px;border-top:1px solid #e8e4dc">
            <button onclick="event.stopPropagation();openModelModal('${m.id}')"
              style="flex:1;padding:9px 18px;border-radius:8px;border:1.5px solid rgba(40,0,6,.2);background:#fff;font-family:'Nunito Sans',sans-serif;font-size:.72rem;font-weight:700;color:#1b2b3a;cursor:pointer;transition:all .18s">
              ✏️ Edit Model
            </button>
            <button onclick="event.stopPropagation();mdlDeleteModel('${m.id}')"
              style="padding:9px 16px;border-radius:8px;border:1.5px solid rgba(192,57,43,.25);background:#fff;font-family:'Nunito Sans',sans-serif;font-size:.72rem;font-weight:700;color:#c0392b;cursor:pointer;transition:all .18s">
              🗑 Delete
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>`;
}

// ── Calculated stats ──
function mdlCalcRisk(holdings) {
  if (!holdings.length) return 0;
  let wSum = 0, total = 0;
  holdings.forEach(h => {
    const w = parseFloat(h.weight) || 0;
    const r = parseFloat(h.risk_score) || 0;
    if (r > 0) { wSum += w * r; total += w; }
  });
  return total > 0 ? Math.round(wSum / total) : 0;
}
function mdlCalcER(holdings) {
  if (!holdings.length) return 0;
  let wSum = 0, total = 0;
  holdings.forEach(h => {
    const w = parseFloat(h.weight) || 0;
    const er = parseFloat(h.exp_ratio) || 0;
    if (er > 0) { wSum += w * er; total += w; }
  });
  return total > 0 ? wSum / total : 0;
}
function mdlCalcYield(holdings) {
  if (!holdings.length) return 0;
  let wSum = 0, total = 0;
  holdings.forEach(h => {
    const w = parseFloat(h.weight) || 0;
    const y = parseFloat(h.div_yield) || 0;
    if (y > 0) { wSum += w * y; total += w; }
  });
  return total > 0 ? wSum / total : 0;
}

// ── Open / close modal ──
function openModelModal(id) {
  _editingModelId = id || null;
  switchMdlTab('info');
  if (id) {
    const m = _models.find(x => x.id === id);
    if (!m) return;
    document.getElementById('mdl-modal-title').textContent = 'Edit Model — ' + m.name;
    document.getElementById('mdl-name').value = m.name || '';
    document.getElementById('mdl-inception').value = m.inception || '';
    document.getElementById('mdl-benchmark').value = m.benchmark || '';
    document.getElementById('mdl-target').value = m.target || '';
    document.getElementById('mdl-profile').value = m.profile || '';
    document.getElementById('mdl-notes').value = m.notes || '';
    const _activeSleeve = m.sleeves ? m.sleeves[_activeSleeveIndex[m.id]||0] : null;
    mdlRenderHoldingRows((_activeSleeve ? _activeSleeve.holdings : m.holdings) || []);
    mdlRenderEventList(m.events || []);
    mdlUpdateInfoStats(m.holdings || []);
    // Clear optimizer and research
    document.getElementById('mdl-opt-results').innerHTML = '';
    document.getElementById('mdl-research-result').innerHTML = '';
    document.getElementById('mdl-research-result').classList.remove('visible');
  } else {
    document.getElementById('mdl-modal-title').textContent = 'New Model';
    document.getElementById('mdl-name').value = '';
    document.getElementById('mdl-inception').value = new Date().toISOString().split('T')[0];
    document.getElementById('mdl-benchmark').value = '';
    document.getElementById('mdl-target').value = '';
    document.getElementById('mdl-profile').value = '';
    document.getElementById('mdl-notes').value = '';
    mdlRenderHoldingRows([]);
    mdlAddHoldingRow(); mdlAddHoldingRow(); mdlAddHoldingRow();
    mdlRenderEventList([]);
    document.getElementById('mdl-info-stats').style.display = 'none';
    document.getElementById('mdl-opt-results').innerHTML = '';
    document.getElementById('mdl-research-result').innerHTML = '';
    document.getElementById('mdl-research-result').classList.remove('visible');
  }
  document.getElementById('mdl-overlay').style.display = 'flex';
  document.getElementById('mdl-score-status').textContent = '';
}

function closeMdlModal() {
  document.getElementById('mdl-overlay').style.display = 'none';
  _editingModelId = null;
}

// ── Tab switching ──
function switchMdlTab(tab) {
  ['info','holdings','events','optimizer','research'].forEach(t => {
    const el = document.getElementById('mdl-tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
  });
  document.querySelectorAll('#mdl-modal-tabs .mdl-tab').forEach((el,i) => {
    el.classList.toggle('active', ['info','holdings','events','optimizer','research'][i] === tab);
  });
}

// ── Holdings rows ──
function mdlRenderHoldingRows(holdings) {
  const tbody = document.getElementById('mdl-holdings-tbody');
  tbody.innerHTML = '';
  holdings.forEach(h => mdlAddHoldingRow(h.ticker,h.name,h.weight,h.risk_score,h.exp_ratio,h.div_yield));
}

function mdlAddHoldingRow(ticker='',name='',weight='',risk='',er='',yld='') {
  const tbody = document.getElementById('mdl-holdings-tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="mdl-h-input" placeholder="TICKER" value="${ticker}" style="text-transform:uppercase;font-weight:700"></td>
    <td><input class="mdl-h-input" placeholder="Name / Description" value="${name}"></td>
    <td><input class="mdl-h-input" type="number" placeholder="%" value="${weight}" min="0" max="100" step="0.1"></td>
    <td><input class="mdl-h-input" type="number" placeholder="0–100" value="${risk}" min="0" max="100" step="1" style="color:${risk?riskColor(parseFloat(risk)):'inherit'}"></td>
    <td><input class="mdl-h-input" type="number" placeholder="0.05" value="${er}" min="0" step="0.01"></td>
    <td><input class="mdl-h-input" type="number" placeholder="2.1" value="${yld}" min="0" step="0.01"></td>
    <td><button class="mdl-h-remove" onclick="this.closest('tr').remove();mdlUpdateInfoStats(mdlGetCurrentHoldings())" title="Remove">✕</button></td>`;
  tbody.appendChild(tr);
  // Color risk input on change
  tr.querySelectorAll('input')[3].addEventListener('input', function() {
    this.style.color = this.value ? riskColor(parseFloat(this.value)) : 'inherit';
  });
}

function mdlGetCurrentHoldings() {
  const rows = document.querySelectorAll('#mdl-holdings-tbody tr');
  const holdings = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const ticker = inputs[0].value.trim().toUpperCase();
    const name   = inputs[1].value.trim();
    if (!ticker && !name) return;
    holdings.push({
      ticker, name,
      weight:    parseFloat(inputs[2].value) || 0,
      risk_score:parseFloat(inputs[3].value) || 0,
      exp_ratio: parseFloat(inputs[4].value) || 0,
      div_yield: parseFloat(inputs[5].value) || 0,
    });
  });
  return holdings;
}

function mdlUpdateInfoStats(holdings) {
  const risk  = mdlCalcRisk(holdings);
  const er    = mdlCalcER(holdings);
  const yld   = mdlCalcYield(holdings);
  const statsEl = document.getElementById('mdl-info-stats');
  if (statsEl) statsEl.style.display = holdings.length ? '' : 'none';
  const rEl = document.getElementById('mdl-stat-risk');
  if (rEl) { rEl.textContent = risk || '—'; rEl.style.color = risk ? riskColor(risk) : 'var(--navy)'; }
  const erEl = document.getElementById('mdl-stat-er');
  if (erEl) erEl.textContent = er > 0 ? er.toFixed(2) + '%' : '—';
  const yldEl = document.getElementById('mdl-stat-yield');
  if (yldEl) yldEl.textContent = yld > 0 ? yld.toFixed(2) + '%' : '—';
  const cntEl = document.getElementById('mdl-stat-count');
  if (cntEl) cntEl.textContent = holdings.length || '—';
}

// ── AI Score holdings ──
async function mdlScoreHoldings() {
  const holdings = mdlGetCurrentHoldings();
  if (!holdings.length) { document.getElementById('mdl-score-status').textContent = 'Add holdings first.'; return; }
  const btn = document.getElementById('mdl-score-btn');
  btn.disabled = true; btn.textContent = '⏳ Scoring…';
  document.getElementById('mdl-score-status').textContent = '';

  const list = holdings.map((h,i) => (i+1) + '. Ticker: ' + (h.ticker||'(none)') + ' | Name: ' + (h.name||'(none)')).join('\n');
  const knownLines = holdings
    .filter(h => TICKER_SCORES[h.ticker] !== undefined)
    .map(h => h.ticker + ': ' + TICKER_SCORES[h.ticker]).join(', ');

  const prompt = `You are a financial risk analyst. For each ETF/fund/stock below, provide:
1. Risk score (0-100, Nitrogen/Riskalyze scale)
2. Expense ratio (as decimal percent, e.g. 0.03 for 0.03%)
3. Dividend yield (as decimal percent, e.g. 2.1 for 2.1%)

Known calibration scores (use as reference): ${knownLines || 'SPY:74, AGG:28, QQQ:85'}

HOLDINGS:
${list}

Return ONLY a JSON array (no markdown), one object per holding in order:
[{"ticker":"X","risk_score":74,"exp_ratio":0.03,"yield":1.8,"name":"Full Name"},...]`;

  try {
    const resp = await fetch('/api/proxy', {
      method:'POST', headers: getApiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:2000,
        messages:[{role:'user',content:prompt}]
      })
    });
    const data = await resp.json();
    const text = (data.content||[]).map(b=>b.text||'').join('').replace(/```json|```/g,'').trim();
    const arr  = JSON.parse(text.match(/\[.*\]/s)?.[0] || text);
    const rows = document.querySelectorAll('#mdl-holdings-tbody tr');
    arr.forEach((scored, i) => {
      if (!rows[i]) return;
      const inputs = rows[i].querySelectorAll('input');
      if (scored.risk_score) { inputs[3].value = scored.risk_score; inputs[3].style.color = riskColor(scored.risk_score); }
      if (scored.exp_ratio != null) inputs[4].value = scored.exp_ratio;
      if (scored.yield != null)     inputs[5].value = scored.yield;
      if (scored.name && !inputs[1].value) inputs[1].value = scored.name;
    });
    const updated = mdlGetCurrentHoldings();
    mdlUpdateInfoStats(updated);
    document.getElementById('mdl-score-status').textContent = '✓ ' + arr.length + ' holdings scored';
    btn.textContent = '↺ Re-Score';
  } catch(e) {
    document.getElementById('mdl-score-status').textContent = 'Error: ' + (e.message||'Try again');
    btn.textContent = '🔍 Score Holdings with AI';
  }
  btn.disabled = false;
}

// ── File upload for holdings ──
function mdlHandleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) mdlProcessFile(file);
}
function mdlHandleFileUpload(e) {
  const file = e.target.files[0];
  if (file) mdlProcessFile(file);
}
async function mdlProcessFile(file) {
  const status = document.getElementById('mdl-upload-status');
  status.textContent = '⏳ Reading ' + file.name + '…';
  const ext = file.name.split('.').pop().toLowerCase();
  let text = '';
  try {
    if (ext === 'csv') {
      text = await file.text();
    } else if (ext === 'xlsx' || ext === 'xls') {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:'array'});
      text = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
    } else if (ext === 'pdf') {
      // Use AI to extract from PDF
      const reader = new FileReader();
      const b64 = await new Promise(res => { reader.onload = e => res(e.target.result.split(',')[1]); reader.readAsDataURL(file); });
      const resp = await fetch('/api/proxy', {
        method:'POST', headers: getApiHeaders(),
        body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:3000,
          messages:[{role:'user',content:[
            {type:'document',source:{type:'base64',media_type:'application/pdf',data:b64}},
            {type:'text',text:'Extract all holdings. Return JSON array: [{"ticker":"","name":"","weight":0},...]. Only JSON, no markdown.'}
          ]}]
        })
      });
      const d = await resp.json();
      const t = (d.content||[]).map(b=>b.text||'').join('').replace(/```json|```/g,'').trim();
      const arr = JSON.parse(t.match(/\[.*\]/s)?.[0]||t);
      mdlRenderHoldingRows(arr);
      status.textContent = '✓ ' + arr.length + ' holdings imported from PDF';
      return;
    }
    // Parse CSV rows
    const rows = text.split('\n').filter(r=>r.trim()).slice(1); // skip header
    const holdings = rows.map(row => {
      const cols = row.split(',').map(c => c.replace(/["\']/g,'').trim());
      return { ticker: (cols[0]||cols[1]||'').toUpperCase(), name: cols[1]||cols[0]||'', weight: parseFloat(cols[2]||cols[3])||0 };
    }).filter(h => h.ticker || h.name);
    mdlRenderHoldingRows(holdings);
    status.textContent = '✓ ' + holdings.length + ' holdings imported';
  } catch(e) {
    status.textContent = '✗ Error reading file: ' + e.message;
  }
}

// ── Trade events ──
function mdlGetCurrentEvents() {
  const m = _editingModelId ? _models.find(x=>x.id===_editingModelId) : null;
  return (m && m.events) ? [...m.events] : [];
}

function mdlRenderEventList(events) {
  const list = document.getElementById('mdl-event-list');
  const none = document.getElementById('mdl-no-events');
  if (!events.length) { list.innerHTML = ''; none.style.display = ''; return; }
  none.style.display = 'none';
  const typeLabel = {add:'Added',remove:'Removed',swap:'Swapped',rebalance:'Rebalanced',weightchange:'Wt. Change'};
  list.innerHTML = [...events].reverse().map(evt => `
    <div style="display:grid;grid-template-columns:100px 90px 1fr 28px;gap:8px;align-items:center;padding:10px 12px;background:#fff;border:1.5px solid var(--border);border-radius:10px;">
      <div style="font-size:.7rem;font-weight:700;color:var(--navy)">${evt.date || '—'}</div>
      <div><span class="mdl-event-type ${evt.type}">${typeLabel[evt.type]||evt.type}</span></div>
      <div>
        ${evt.ticker ? '<div style="font-size:.75rem;font-weight:700;color:var(--navy)">' + evt.ticker + '</div>' : ''}
        ${evt.notes  ? '<div style="font-size:.68rem;color:var(--slate)">' + evt.notes + '</div>' : ''}
      </div>
      <button class="mdl-h-remove" onclick="mdlRemoveEvent('${evt.id}')" title="Remove">✕</button>
    </div>`).join('');
}

function mdlAddEvent() {
  const date   = document.getElementById('mdl-evt-date').value;
  const type   = document.getElementById('mdl-evt-type').value;
  const ticker = document.getElementById('mdl-evt-ticker').value.trim();
  const notes  = document.getElementById('mdl-evt-notes').value.trim();
  if (!date) { alert('Please select a date for this event.'); return; }
  const evt = { id: 'evt_' + Date.now(), date, type, ticker, notes };
  // Store in the model being edited (or temp if new)
  if (_editingModelId) {
    const m = _models.find(x=>x.id===_editingModelId);
    if (m) { m.events = m.events || []; m.events.push(evt); m.events.sort((a,b)=>a.date.localeCompare(b.date)); mdlRenderEventList(m.events); }
  } else {
    // Store in a temp array on window
    window._tempMdlEvents = window._tempMdlEvents || [];
    window._tempMdlEvents.push(evt);
    window._tempMdlEvents.sort((a,b)=>a.date.localeCompare(b.date));
    mdlRenderEventList(window._tempMdlEvents);
  }
  // Clear inputs
  document.getElementById('mdl-evt-ticker').value = '';
  document.getElementById('mdl-evt-notes').value  = '';
}

function mdlRemoveEvent(evtId) {
  if (_editingModelId) {
    const m = _models.find(x=>x.id===_editingModelId);
    if (m) { m.events = (m.events||[]).filter(e=>e.id!==evtId); mdlRenderEventList(m.events); }
  } else {
    window._tempMdlEvents = (window._tempMdlEvents||[]).filter(e=>e.id!==evtId);
    mdlRenderEventList(window._tempMdlEvents||[]);
  }
}

// ── Save model ──
function mdlSaveModel() {
  const name = document.getElementById('mdl-name').value.trim();
  if (!name) { document.getElementById('mdl-name').focus(); document.getElementById('mdl-name').style.borderColor='var(--red)'; return; }
  document.getElementById('mdl-name').style.borderColor = '';

  const holdings = mdlGetCurrentHoldings();
  const m = {
    id:        _editingModelId || ('mdl_' + Date.now()),
    name,
    inception: document.getElementById('mdl-inception').value,
    benchmark: document.getElementById('mdl-benchmark').value.trim().toUpperCase(),
    target:    document.getElementById('mdl-target').value.trim(),
    profile:   document.getElementById('mdl-profile').value.trim(),
    notes:     document.getElementById('mdl-notes').value.trim(),
    holdings,
    events:    _editingModelId
      ? (_models.find(x=>x.id===_editingModelId)?.events || [])
      : (window._tempMdlEvents || []),
    perf: _editingModelId ? (_models.find(x=>x.id===_editingModelId)?.perf || {}) : {},
  };
  window._tempMdlEvents = [];

  if (_editingModelId) {
    const idx = _models.findIndex(x=>x.id===_editingModelId);
    if (idx !== -1) _models[idx] = m;
  } else {
    _models.push(m);
  }
  closeMdlModal();
  renderMdlGrid();
}

function mdlDeleteModel(id) {
  const m = _models.find(x=>x.id===id);
  if (!m) return;
  if (!confirm('Delete "'+ m.name +'"? This cannot be undone.')) return;
  _models = _models.filter(x=>x.id!==id);
  renderMdlGrid();
}

// ── Toggle additional details panel on model cards ──
function toggleMdlDetails(panelId) {
  const panel = document.getElementById(panelId);
  const chev  = document.getElementById('chev-' + panelId);
  const tog   = document.getElementById('tog-' + panelId);
  if (!panel) return;
  const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';
  panel.style.maxHeight = isOpen ? '0px' : '2000px';
  if (chev) chev.style.transform = isOpen ? '' : 'rotate(180deg)';
  if (tog)  tog.style.background = isOpen ? '' : '#f0ede6';
}

// ── Toggle annual returns panel ──
function toggleReturnsPanel(panelId) {
  const panel = document.getElementById(panelId);
  const tog   = document.getElementById('tog-' + panelId);
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  if (tog) tog.classList.toggle('open', isOpen);
  // Collapse any open year detail when closing the panel
  if (!isOpen) {
    for (let i = 0; i < 20; i++) {
      const d = document.getElementById(panelId + '-detail-' + i);
      const y = document.getElementById(panelId + '-yr-' + i);
      if (!d) break;
      d.style.display = 'none';
      if (y) y.style.outline = '';
    }
  }
}

// ── Select a year pill to show its detail card ──
function mdlSelectYear(panelId, idx, total) {
  for (let i = 0; i < total; i++) {
    const detail = document.getElementById(panelId + '-detail-' + i);
    const pill   = document.getElementById(panelId + '-yr-' + i);
    if (!detail) continue;
    const isThis = i === idx;
    detail.style.display = isThis && detail.style.display === 'none' ? 'block' : isThis ? 'none' : 'none';
    if (pill) {
      pill.style.outline      = (isThis && detail.style.display === 'block') ? '2px solid #1b2b3a' : '';
      pill.style.outlineOffset = '2px';
    }
  }
  // If we just opened this one, re-show it (toggle logic above closes it if already open)
  const target = document.getElementById(panelId + '-detail-' + idx);
  const pill   = document.getElementById(panelId + '-yr-' + idx);
  if (target) {
    const nowOpen = target.style.display === 'block';
    if (pill) { pill.style.outline = nowOpen ? '2px solid #1b2b3a' : ''; pill.style.outlineOffset = '2px'; }
  }
}

// ── Generate YTD + 1-Year via AI for a specific sleeve ──
async function mdlGeneratePerf(modelId, sleeveIdx) {
  const m = _models.find(x => x.id === modelId);
  if (!m) return;
  const btnId  = `gen-${modelId}-${sleeveIdx}`;
  const btn    = document.getElementById(btnId);
  const ytdEl  = document.getElementById(`ytd-${modelId}-${sleeveIdx}`);
  const oneyEl = document.getElementById(`oney-${modelId}-${sleeveIdx}`);

  if (btn) { btn.innerHTML = '<span style="font-size:.85rem">⏳</span> Searching live data…'; btn.disabled = true; btn.style.opacity = '0.75'; }
  if (ytdEl)  { ytdEl.style.color = '#a8b8cc'; ytdEl.textContent = '…'; }
  if (oneyEl) { oneyEl.style.color = '#a8b8cc'; oneyEl.textContent = '…'; }

  // Determine which sleeve / holdings to use
  const sleeve   = m.sleeves ? m.sleeves[sleeveIdx] : null;
  const holdings = sleeve ? (sleeve.holdings || []) : (m.holdings || []);

  // For combo models, look up component model data
  // Variable component (Strategic Core / Invesco Core) uses the selected sleeveIdx
  // Fixed components (All Cap World 2, T.Rowe Focused 5) always use sleeveIdx 0
  let comboContext = '';
  if (m.combo_components && m.combo_components.length) {
    const lines = m.combo_components.map(c => {
      const cm = _models.find(x => x.id === c.modelId) || CAPITAL_PLANNING_MODELS.find(x => x.id === c.modelId);
      if (!cm) return '';
      // Fixed = single-sleeve model (All Cap World 2, T.Rowe Focused 5)
      const isFixed = !cm.sleeves || cm.sleeves.length <= 1;
      const resolvedIdx = isFixed ? 0 : sleeveIdx;
      const cs = cm.sleeves ? cm.sleeves[Math.min(resolvedIdx, cm.sleeves.length-1)] : null;
      const ch = cs ? (cs.holdings || []) : (cm.holdings || []);
      const chList = ch.map(h => `${h.ticker||h.name} (${h.weight}%)`).join(', ');
      const fixedNote = isFixed ? ' [FIXED — does not change with sleeve selection]' : ` [${(cs||{}).name||'Current'} sleeve]`;
      // Include trade events for this component model
      const cEvents = (cm.events || []).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15)
        .map(e=>`  ${e.date}: ${e.type} ${e.ticker}${e.notes?' — '+e.notes:''}`).join('\n');
      return `${c.weight}% — ${cm.name}${fixedNote}\n  Holdings: ${chList}${cEvents ? '\n  Recent trades:\n'+cEvents : ''}`;
    });
    comboContext = `\n\nCOMBO MODEL BREAKDOWN for "${sleeve ? sleeve.name : 'Current'}" sleeve:\n${lines.join('\n\n')}`;
  }

  const holdingsList = holdings.map(h => `${h.ticker||h.name} (${h.weight}%)`).join(', ');
  const eventsText   = (m.events || []).sort((a,b) => b.date.localeCompare(a.date)).slice(0,30)
    .map(e => `${e.date}: ${e.type} ${e.ticker}${e.notes?' — '+e.notes:''}`).join('\n');
  const today    = new Date().toISOString().split('T')[0];
  const ytdStart = new Date().getFullYear() + '-01-01';
  const sName    = sleeve ? sleeve.name : 'Current';
  // Use model's stated benchmark if it's a named index; otherwise blend S&P 500 + Agg by equity%
  const _modelBench = (m.benchmark || '').toLowerCase();
  const _holdings4bench = sleeve ? (sleeve.holdings || []) : (m.holdings || []);
  const _eqPct = _holdings4bench.filter(h => (parseFloat(h.risk_score)||50) >= 55)
    .reduce((s,h) => s + (parseFloat(h.weight)||0), 0);
  const _bdPct = _holdings4bench.filter(h => (parseFloat(h.risk_score)||50) < 55 && (parseFloat(h.risk_score)||50) > 6)
    .reduce((s,h) => s + (parseFloat(h.weight)||0), 0);
  const _tot = _eqPct + _bdPct || 100;
  const _ef = _eqPct / _tot;
  // Honour specific named benchmarks; only compute blend when model uses generic "S&P 500"
  const bench = _modelBench.includes('acwi') ? 'MSCI ACWI'
    : _modelBench.includes('world') ? 'MSCI World'
    : _modelBench.includes('60') || _modelBench.includes('blend') ? '60/40 Blend (S&P 500 / Bloomberg Agg)'
    : _modelBench.includes('agg') || _modelBench.includes('bond') ? 'Bloomberg Aggregate Bond Index'
    : _ef >= 0.85 ? 'S&P 500'
    : _ef <= 0.20 ? 'Bloomberg Aggregate Bond Index'
    : `${Math.round(_ef*100)}% S&P 500 / ${Math.round((1-_ef)*100)}% Bloomberg Aggregate Bond Index`;

  // For combo models, expand placeholder holdings into real underlying tickers
  // scaled by the combo allocation (e.g. Strategic Core 75% × SPYM 9% = 6.75%)
  function expandHoldings(holdingsList, comboComponents, targetSleeveIdx) {
    const isComboPlaceholder = holdingsList.every(h => h.ticker === '—' || h.ticker === '' || h.type === 'Model Allocation');
    if (!isComboPlaceholder || !comboComponents || !comboComponents.length) {
      return holdingsList.slice(0, 20);
    }
    const expanded = [];
    comboComponents.forEach(c => {
      const cm = CAPITAL_PLANNING_MODELS.find(x => x.id === c.modelId) || _models.find(x => x.id === c.modelId);
      if (!cm) return;
      const comboWeight = c.weight / 100; // e.g. 0.75
      // Fixed single-sleeve models always use sleeve 0; variable models use the selected sleeve
      const isFixed = !cm.sleeves || cm.sleeves.length <= 1;
      const resolvedIdx = isFixed ? 0 : Math.min(targetSleeveIdx, (cm.sleeves||[]).length - 1);
      const cs = cm.sleeves ? cm.sleeves[resolvedIdx] : null;
      const ch = cs ? (cs.holdings || []) : (cm.holdings || []);
      // Recursively expand if this component is also a combo model
      const subHoldings = expandHoldings(ch, cm.combo_components, resolvedIdx);
      subHoldings.forEach(h => {
        if (!h.ticker || h.ticker === '—') return;
        const scaledWeight = ((parseFloat(h.weight) || 0) * comboWeight).toFixed(2);
        expanded.push({ ...h, weight: parseFloat(scaledWeight) });
      });
    });
    // Merge duplicate tickers by summing weights
    const merged = {};
    expanded.forEach(h => {
      const key = h.ticker.toUpperCase();
      if (merged[key]) merged[key].weight = parseFloat((merged[key].weight + h.weight).toFixed(2));
      else merged[key] = { ...h };
    });
    return Object.values(merged).sort((a,b) => b.weight - a.weight).slice(0, 20);
  }

  const expandedHoldings = expandHoldings(holdings, m.combo_components, sleeveIdx);
  const allHoldings = expandedHoldings.map(h => `${h.ticker}(${h.weight}%)`).join(', ');

  const prompt = `You are a financial performance analyst. Estimate weighted-average YTD and 1-year returns for this portfolio. Internal advisor use only — you MUST provide numeric estimates.

Model: ${m.name} — ${sName} sleeve
Benchmark: ${bench}
Holdings (ticker, weight): ${allHoldings}
YTD: ${ytdStart} to ${today} | 1-Year: ${new Date(new Date().setFullYear(new Date().getFullYear()-1)).toISOString().split('T')[0]} to ${today}

YTD reference returns as of 3/31/2026 (use these exactly):
US large cap growth: QQQM/QQQ=-8.2, XLG=-6.2, SPGP=-3.1, ILCG=-7.8, IMCG=-6.9, MTUM=-5.4, RPG=-9.2
US large cap blend/value: SPYM/SPY=-4.6, SPYV=-1.8, XMHQ=-3.4, RSP=-5.8, ILCB=-4.1
US small/mid cap: JSML=-9.1, XSVM=-4.2, VFLO=-2.8
International developed: JIVE=+4.2, CWI=+3.8, EFA=+4.1, IMFL=+3.6, SCZ=+3.9, IDLV=+5.1, EEM=+2.4, IEMG=+2.8
Pure value: RPV=+1.4, SPYV=-1.8
Gold/commodities: GLD/IAU=+18.5
Crypto: IBIT=-15.2, GBTC=-18.0, FBTC=-14.8
Liquid alts/low vol: QLEIX=+2.1, WTMF=+1.8
Short bonds: JMST=+0.9, VNLA=+1.1, CGMU=+1.4, FTCB=+1.5, JMUIX=+1.8, JSI=+1.2, GOVI=+0.8, GSY=+1.0, GTO=+1.3, JMBS=+1.1
Invesco thematic: PPA=-3.8, PSI=-7.2, PKB=-5.1, PBD=+2.8, PJP=-2.4, PXJ=-8.1, PXH=+3.2, PCY=+3.9, PZA=+1.2
DFA funds: DFAC=-5.1, DFAI=+3.8, DFAE=+2.9, DFAR=-3.2, DFSU/DFSE=-5.4, DFAU=-4.8, DFAX=-4.6, DFCF=-2.1, DFIV=+4.0, DFNM=-4.3, DFSB=+1.0, DFSD=+0.8, DFSI=+1.1
Invesco Core: PBUS=-4.2, OMFL=-3.8, RWL=-3.1, OMFS=-5.4
T.Rowe funds: TRIGX=+5.2, PRDSX=+3.1, PIEQX=+6.3, PSILX=+4.1, PRNEX=-2.8, PRSCX=-6.4, PRASX=+3.9, TRBCX=-5.1, PRGSX=-7.2, TROSX=+2.1, PRWAX=-4.3, PRGTX=-6.8, TRVLX=+1.8, TRULX=+2.4
Benchmark YTDs: S&P500=-4.6, MSCI_ACWI=+1.2, MSCI_World=-2.1, Bloomberg_Agg=+2.1, 60_40_blend=-1.8

For each holding: weight% × its return from table above. Sum = weighted avg. MUST return numbers. Do NOT refuse.

Calculate the weighted average YTD and 1-year return for this specific sleeve, then return a JSON object like:
{"ytd":12.3,"oneYear":18.5,"ytd_bench":8.1,"oneYear_bench":22.4,"method":"brief note"}`;

  try {
    // Retry up to 5 times on overload with exponential backoff
    async function fetchWithRetry(body, attempts = 5) {
      for (let i = 0; i < attempts; i++) {
        if (i > 0) {
          const delay = [3000, 6000, 10000, 15000][i - 1] || 15000;
          if (btn) btn.innerHTML = `<span style="font-size:.85rem">⏳</span> Busy — retrying (${i}/${attempts-1})…`;
          await new Promise(r => setTimeout(r, delay));
        }
        let r;
        try {
          r = await fetch('/api/proxy', { method:'POST', headers:getApiHeaders(), body:JSON.stringify(body) });
        } catch(e) {
          if (i === attempts - 1) throw new Error('Network error — check connection');
          continue;
        }
        if (r.status === 529 || r.status === 500 || r.status === 503) {
          if (i === attempts - 1) throw new Error('Server busy — please try again in a minute');
          continue;
        }
        if (!r.ok) {
          const errBody = await r.json().catch(() => ({}));
          throw new Error('API ' + r.status + ': ' + (errBody?.error?.message || r.statusText));
        }
        return await r.json();
      }
    }

    // Two-turn conversation: let AI calculate freely, then extract JSON
    const firstResp = await fetchWithRetry({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    if (firstResp.error) throw new Error(firstResp.error.message || 'API returned error');

    const firstTxt = (firstResp.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('').trim();
    console.log('Generate perf first response:', firstTxt);

    // Try to extract JSON from first response directly
    const directMatch = firstTxt.replace(/```json|```/g, '').match(/\{[\s\S]*"ytd"[\s\S]*\}/);
    let perf;
    if (directMatch) {
      try { perf = JSON.parse(directMatch[0]); } catch(e) {}
    }

    // If no JSON found, send a follow-up asking just for the JSON
    if (!perf || perf.ytd == null) {
      const secondResp = await fetchWithRetry({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: firstTxt },
          { role: 'user', content: 'Now output ONLY the JSON object with your calculated values. Nothing else.' }
        ]
      });
      if (secondResp.error) throw new Error(secondResp.error.message || 'API error on follow-up');
      const secondTxt = (secondResp.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
      console.log('Generate perf second response:', secondTxt);
      const secondMatch = secondTxt.match(/\{[\s\S]*\}/);
      if (!secondMatch) throw new Error('No JSON found in response. Raw: ' + secondTxt.slice(0, 60));
      perf = JSON.parse(secondMatch[0]);
    }

    // If AI refused and returned nulls, use asset-class proxy estimates
    if (perf.ytd == null || perf.oneYear == null) {
      // Simple fallback using equity/bond split per sleeve
      const equityPct = holdings.filter(h => (h.risk_score||50) >= 55).reduce((s,h) => s + (parseFloat(h.weight)||0), 0) / 100;
      const bondPct   = holdings.filter(h => (h.risk_score||50) < 55 && (h.risk_score||50) > 6).reduce((s,h) => s + (parseFloat(h.weight)||0), 0) / 100;
      const estYtd    = parseFloat(((equityPct * -4.6) + (bondPct * 2.0)).toFixed(2));
      const estOneY   = parseFloat(((equityPct * 8.2)  + (bondPct * 3.5)).toFixed(2));
      perf.ytd        = estYtd;
      perf.oneYear    = estOneY;
      perf.ytd_bench  = perf.ytd_bench  || -4.6;
      perf.oneYear_bench = perf.oneYear_bench || 8.2;
      perf.method     = 'Asset-class proxy estimate';
    }

    if (sleeve) { sleeve.perf = perf; } else { m.perf = perf; }
    renderMdlGrid();

  } catch(e) {
    console.error('Generate perf error:', e);
    const msg = e.message || 'Unknown error';
    if (btn) { btn.innerHTML = '⚠️ ' + msg.slice(0,60); btn.disabled = false; btn.style.opacity = '1'; btn.style.fontSize = '.6rem'; }
    if (ytdEl)  ytdEl.innerHTML = '—';
    if (oneyEl) oneyEl.innerHTML = '—';
  }
}


// ── Performance Estimator (AI) ──
async function mdlEstimatePerf(id) {
  const m = _models.find(x=>x.id===id);
  if (!m) return;
  const card = Array.from(document.querySelectorAll('.mdl-card-btn')).find(b => b.textContent.includes('Perf') && (b.getAttribute('onclick')||'').includes(id));
  if (card) { card.textContent = '⏳'; card.disabled = true; }

  const holdingsList = (m.holdings||[]).map(h => h.ticker + ' (' + h.weight + '%)').join(', ');
  const eventsText = (m.events||[]).map(e => e.date + ': ' + e.type + ' ' + e.ticker + (e.notes?' — '+e.notes:'')).join('\n');
  const today = new Date().toISOString().split('T')[0];
  const ytdStart = new Date().getFullYear() + '-01-01';

  const prompt = `You are a financial analyst. Estimate performance for this investment model.

Model: ${m.name}
Current holdings: ${holdingsList || 'None entered'}
Benchmark: ${m.benchmark || 'SPY'}
Inception: ${m.inception || 'unknown'}
Trade events:
${eventsText || '(No changes logged)'}

Today: ${today}
YTD start: ${ytdStart}

Using your knowledge of these ETFs/funds and their actual historical returns:
1. Estimate YTD return for the model (accounting for any holding changes in the trade log)
2. Estimate 1-year return for the model
3. Estimate YTD and 1-year returns for the benchmark: ${m.benchmark || 'SPY'}

IMPORTANT: The trade log documents when holdings changed. If SPY was held Jan-Jun and QQQ was added Jul-Dec, calculate a blended time-weighted return for that period, NOT just the current portfolio's full-year return.

Return ONLY JSON (no markdown):
{"ytd": 12.3, "oneYear": 18.5, "ytd_bench": 10.1, "oneYear_bench": 22.4, "note": "brief explanation of methodology"}`;

  try {
    const resp = await fetch('/api/proxy', {
      method:'POST', headers: getApiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:600,
        messages:[{role:'user',content:prompt}]
      })
    });
    const data = await resp.json();
    const text = (data.content||[]).map(b=>b.text||'').join('').replace(/```json|```/g,'').trim();
    const perf = JSON.parse(text.match(/\{.*\}/s)?.[0]||text);
    m.perf = perf;
    renderMdlGrid();
  } catch(e) {
    alert('Could not estimate performance. Try again.\n' + e.message);
    if (card) { card.textContent = '📈 Perf'; card.disabled = false; }
  }
}

// ── Optimizer ──
async function mdlRunOptimizer() {
  const holdings = mdlGetCurrentHoldings();
  if (!holdings.length) { document.getElementById('mdl-opt-results').innerHTML = '<p style="color:var(--slate);font-size:.78rem">Add holdings on the Holdings tab first, then run the optimizer.</p>'; return; }

  const btn = document.getElementById('mdl-opt-btn');
  btn.disabled = true; btn.textContent = '⏳ Analyzing…';
  const lowerEr   = document.getElementById('opt-lower-er').checked;
  const betterPerf= document.getElementById('opt-better-perf').checked;
  const sharpe    = document.getElementById('opt-sharpe').checked;

  const holdingsList = holdings.map(h => `${h.ticker||'Unknown'} (${h.weight}% weight, risk: ${h.risk_score||'?'}, ER: ${h.exp_ratio||'?'}, yield: ${h.div_yield||'?'}, name: ${h.name||''})` ).join('\n');

  const goals = [lowerEr&&'lower expense ratio',betterPerf&&'similar/better historical returns',sharpe&&'better risk-adjusted return (Sharpe)'].filter(Boolean).join(', ');

  const prompt = `You are a senior ETF analyst and portfolio optimizer for a financial advisor.

The advisor is using these holdings in their house model:
${holdingsList}

Optimization goals: ${goals || 'lower cost and better returns'}

For each holding that could be improved, suggest 1-2 alternative ETFs that:
- Achieve the stated optimization goals
- Track a similar index or asset class (so it's a genuine like-for-like comparison)
- Are liquid, widely available, and appropriate for retail investors

For each suggestion include:
- Current ticker and its expense ratio
- Suggested ticker, full name, expense ratio, 3-year annualized return estimate, and Sharpe ratio estimate
- Annual savings per $100,000 invested if ER is lower
- Brief 1-sentence rationale

Return ONLY a JSON array (no markdown):
[{
  "current_ticker": "X",
  "current_er": 0.20,
  "suggestions": [{
    "ticker": "Y",
    "name": "Full Fund Name",
    "er": 0.03,
    "return_3yr": 12.5,
    "sharpe": 0.95,
    "savings_per_100k": 170,
    "rationale": "..."
  }]
}]

Only include holdings where you can genuinely suggest a better alternative. Skip holdings that are already optimal.`;

  const results = document.getElementById('mdl-opt-results');
  results.innerHTML = '<div style="padding:20px;text-align:center;color:var(--slate);font-size:.8rem">⏳ Analyzing holdings and searching for alternatives…</div>';

  try {
    const resp = await fetch('/api/proxy', {
      method:'POST', headers: getApiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:3000,
        messages:[{role:'user',content:prompt}]
      })
    });
    const data = await resp.json();
    const text = (data.content||[]).map(b=>b.text||'').join('').replace(/```json|```/g,'').trim();
    const arr  = JSON.parse(text.match(/\[.*\]/s)?.[0]||text);

    if (!arr.length) { results.innerHTML = '<div style="padding:16px;background:var(--green-pale);border-radius:10px;font-size:.8rem;color:var(--green)">✅ All holdings appear well-optimized for the selected goals. No significant improvements found.</div>'; }
    else {
      results.innerHTML = arr.map(item => {
        const sugs = (item.suggestions||[]).map(s => {
          const erSaving = ((item.current_er||0) - (s.er||0)).toFixed(2);
          const cheaper = parseFloat(erSaving) > 0;
          return `<div class="mdl-opt-row">
            <div class="mdl-opt-ticker">${s.ticker}</div>
            <div>
              <div class="mdl-opt-name">${s.name}</div>
              <div style="font-size:.65rem;color:var(--slate);margin-top:2px">${s.rationale}</div>
            </div>
            <div class="mdl-opt-er">ER: ${s.er != null ? s.er.toFixed(2) + '%' : '—'}</div>
            <div class="mdl-opt-saving" style="${cheaper?'color:var(--green)':'color:var(--slate)'}">
              ${s.return_3yr ? '3yr: ' + (s.return_3yr>0?'+':'') + s.return_3yr.toFixed(1) + '%' : ''}<br>
              ${cheaper ? 'Save $' + Math.round(s.savings_per_100k||0).toLocaleString() + '/100k' : ''}
            </div>
            <button class="mdl-opt-apply" onclick="mdlApplySuggestion('${item.current_ticker}',${JSON.stringify(s).replace(/"/g,'&quot;')})">Apply →</button>
          </div>`;
        }).join('');
        return `<div class="mdl-opt-card">
          <div class="mdl-opt-current">
            <div>
              <span style="font-weight:700;font-size:.85rem;color:var(--navy)">${item.current_ticker}</span>
              <span style="font-size:.72rem;color:var(--slate);margin-left:8px">Current ER: ${item.current_er != null ? item.current_er.toFixed(2) + '%' : '—'}</span>
            </div>
            <div style="font-size:.65rem;color:var(--gold);font-weight:700">${(item.suggestions||[]).length} suggestion${(item.suggestions||[]).length!==1?'s':''}</div>
          </div>
          <div class="mdl-opt-suggestion">${sugs}</div>
        </div>`;
      }).join('');
    }
  } catch(e) {
    results.innerHTML = `<p style="color:var(--red);font-size:.78rem">Optimizer error: ${e.message}</p>`;
  }
  btn.disabled = false; btn.textContent = '✨ Re-Run Optimizer';
}

function mdlApplySuggestion(currentTicker, suggestion) {
  // Switch to holdings tab and update the row
  switchMdlTab('holdings');
  const rows = document.querySelectorAll('#mdl-holdings-tbody tr');
  for (const row of rows) {
    const tickerInput = row.querySelectorAll('input')[0];
    if (tickerInput && tickerInput.value.toUpperCase() === currentTicker.toUpperCase()) {
      tickerInput.value = suggestion.ticker;
      const nameInput = row.querySelectorAll('input')[1];
      if (nameInput) nameInput.value = suggestion.name;
      const erInput = row.querySelectorAll('input')[4];
      if (erInput && suggestion.er != null) erInput.value = suggestion.er;
      row.style.background = '#e6f4ed';
      setTimeout(() => row.style.background = '', 2000);
      mdlUpdateInfoStats(mdlGetCurrentHoldings());
      return;
    }
  }
  alert('Could not find ' + currentTicker + ' in the holdings table. Please apply manually.');
}

// ── Research ──
async function mdlResearch() {
  const ticker = document.getElementById('mdl-research-ticker').value.trim().toUpperCase();
  if (!ticker) return;
  const box = document.getElementById('mdl-research-result');
  box.classList.add('visible');
  box.innerHTML = '<span style="color:var(--slate)">⏳ Researching ' + ticker + '…</span>';

  const prompt = `Research this ETF/fund/stock for a financial advisor: ${ticker}

Provide a concise but complete summary covering:
1. Full name and what it tracks or invests in
2. Expense ratio (exact current figure)
3. Dividend/distribution yield (current approximate)
4. Trailing returns: YTD, 1-year, 3-year, 5-year (approximate)
5. Risk profile (Nitrogen 0-100 style, where SPY=74, AGG=28, QQQ=85)
6. Key strengths and risks
7. Who it's best suited for (what type of client/portfolio)

Keep it concise and advisor-focused. Use specific numbers. Write in plain prose, no bullet points.`;

  try {
    const resp = await fetch('/api/proxy', {
      method:'POST', headers: getApiHeaders(),
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:600,
        messages:[{role:'user',content:prompt}]
      })
    });
    const data = await resp.json();
    const text = (data.content||[]).map(b=>b.text||'').join('').trim();
    const paras = text.split(/\n\n+/).filter(p=>p.trim()).map(p=>`<p style="margin:0 0 10px">${p.trim()}</p>`).join('');
    box.innerHTML = `<div style="font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--green);margin-bottom:10px">${ticker} · AI Research Summary</div>${paras}`;
  } catch(e) {
    box.innerHTML = `<p style="color:var(--red)">Research error: ${e.message}</p>`;
  }
}

// ── Compare Modal ──
function openCompareModal(modelId, sleeveIdx) {
  const m = _models.find(x => x.id === modelId);
  if (!m) return;
  const sleeve = m.sleeves ? m.sleeves[Math.min(sleeveIdx, m.sleeves.length-1)] : null;
  const holdings = sleeve ? (sleeve.holdings||[]) : (m.holdings||[]);
  const sName = sleeve ? sleeve.name : 'Current';
  const perf = (sleeve && sleeve.perf) || m.perf || {};

  // Build list of all models for comparison selector
  const allModels = [...CAPITAL_PLANNING_MODELS, ..._models.filter(x => !CAPITAL_PLANNING_MODELS.find(c=>c.id===x.id))];
  const opts = allModels.map(cm => {
    const sleeves = cm.sleeves || [];
    if (sleeves.length > 1) {
      return sleeves.map((s,i) => `<option value="${cm.id}|${i}">${cm.name} — ${s.name}</option>`).join('');
    }
    return `<option value="${cm.id}|0">${cm.name}</option>`;
  }).join('');

  const riskScore = sleeve && sleeve.risk_score ? sleeve.risk_score : mdlCalcRisk(holdings);
  const er = sleeve && sleeve.exp_ratio ? sleeve.exp_ratio : mdlCalcER(holdings);
  const yld = sleeve && sleeve.div_yield ? sleeve.div_yield : mdlCalcYield(holdings);

  const modal = document.createElement('div');
  modal.id = 'compare-modal-overlay';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:100%;max-width:900px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.25)">
      <div style="background:linear-gradient(135deg,#1b2b3a,#2d3f4f);padding:20px 24px;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">
        <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:#fff">Model Comparison</div>
        <button onclick="document.getElementById('compare-modal-overlay').remove()" style="background:transparent;border:none;color:rgba(255,255,255,.7);font-size:1.2rem;cursor:pointer">✕</button>
      </div>
      <div style="padding:20px 24px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div style="background:#f9f7f4;border-radius:10px;padding:16px">
            <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:6px">Model A (Current)</div>
            <div style="font-family:'Playfair Display',serif;font-size:.95rem;font-weight:700;color:#1b2b3a">${m.name}</div>
            <div style="font-size:.72rem;color:#6b7e96;margin-top:2px">${sName}</div>
          </div>
          <div style="background:#f9f7f4;border-radius:10px;padding:16px">
            <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:6px">Model B (Select to compare)</div>
            <select id="compare-b-select" onchange="updateCompareB()" style="width:100%;padding:8px;border:1.5px solid #e8e4dc;border-radius:7px;font-family:'Nunito Sans',sans-serif;font-size:.75rem;background:#fff">
              <option value="">— Select a model —</option>
              ${opts}
            </select>
          </div>
        </div>
        <div id="compare-table" style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-family:'Nunito Sans',sans-serif">
            <thead>
              <tr style="border-bottom:2px solid #e8e4dc">
                <th style="text-align:left;padding:10px 12px;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc">Metric</th>
                <th style="text-align:center;padding:10px 12px;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1b2b3a">Model A</th>
                <th style="text-align:center;padding:10px 12px;font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b7e96">Model B</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #f0eee8"><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">Risk Score</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:#1b2b3a">${riskScore}</td><td id="cmp-risk" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
              <tr style="border-bottom:1px solid #f0eee8"><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">Exp. Ratio</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:#1b2b3a">${er?er.toFixed(2)+'%':'—'}</td><td id="cmp-er" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
              <tr style="border-bottom:1px solid #f0eee8"><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">Div. Yield</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:#1b2b3a">${yld?yld.toFixed(2)+'%':'—'}</td><td id="cmp-yld" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
              <tr style="border-bottom:1px solid #f0eee8"><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">Holdings</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:#1b2b3a">${holdings.length}</td><td id="cmp-hold" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
              <tr style="border-bottom:1px solid #f0eee8"><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">YTD Return</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:${perf.ytd!=null?(perf.ytd>=0?'#1d7a50':'#c0392b'):'#a8b8cc'}">${perf.ytd!=null?(perf.ytd>=0?'+':'')+perf.ytd.toFixed(2)+'%':'—'}</td><td id="cmp-ytd" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
              <tr><td style="padding:10px 12px;font-size:.72rem;color:#6b7e96">1-Year Return</td><td style="padding:10px 12px;text-align:center;font-size:.85rem;font-weight:700;color:${perf.oneYear!=null?(perf.oneYear>=0?'#1d7a50':'#c0392b'):'#a8b8cc'}">${perf.oneYear!=null?(perf.oneYear>=0?'+':'')+perf.oneYear.toFixed(2)+'%':'—'}</td><td id="cmp-oney" style="padding:10px 12px;text-align:center;color:#a8b8cc">—</td></tr>
            </tbody>
          </table>
        </div>
        <div id="compare-holdings-b" style="margin-top:16px;display:none">
          <div style="font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#a8b8cc;margin-bottom:10px">Model B Holdings</div>
          <div id="compare-holdings-b-list"></div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

window._compareModelA = null;
function updateCompareB() {
  const sel = document.getElementById('compare-b-select');
  if (!sel || !sel.value) return;
  const [mid, sidxStr] = sel.value.split('|');
  const sidx = parseInt(sidxStr) || 0;
  const allModels = [...CAPITAL_PLANNING_MODELS, ..._models.filter(x => !CAPITAL_PLANNING_MODELS.find(c=>c.id===x.id))];
  const cm = allModels.find(x => x.id === mid);
  if (!cm) return;
  const cs = cm.sleeves ? cm.sleeves[Math.min(sidx, cm.sleeves.length-1)] : null;
  const ch = cs ? (cs.holdings||[]) : (cm.holdings||[]);
  const cr = cs && cs.risk_score ? cs.risk_score : mdlCalcRisk(ch);
  const cer = cs && cs.exp_ratio ? cs.exp_ratio : mdlCalcER(ch);
  const cyl = cs && cs.div_yield ? cs.div_yield : mdlCalcYield(ch);
  const cp = (cs && cs.perf) || cm.perf || {};
  const fmt = (v,isRisk) => v != null ? (isRisk ? v : (v>=0?'+':'')+v.toFixed(2)+'%') : '—';
  const col = v => v != null ? (v >= 0 ? '#1d7a50' : '#c0392b') : '#a8b8cc';
  document.getElementById('cmp-risk').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:#6b7e96">${cr||'—'}</span>`;
  document.getElementById('cmp-er').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:#6b7e96">${cer?cer.toFixed(2)+'%':'—'}</span>`;
  document.getElementById('cmp-yld').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:#6b7e96">${cyl?cyl.toFixed(2)+'%':'—'}</span>`;
  document.getElementById('cmp-hold').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:#6b7e96">${ch.length}</span>`;
  document.getElementById('cmp-ytd').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:${col(cp.ytd)}">${fmt(cp.ytd)}</span>`;
  document.getElementById('cmp-oney').innerHTML = `<span style="font-size:.85rem;font-weight:700;color:${col(cp.oneYear)}">${fmt(cp.oneYear)}</span>`;
  // Show model B holdings
  const bHold = document.getElementById('compare-holdings-b');
  const bList = document.getElementById('compare-holdings-b-list');
  if (ch.length) {
    bHold.style.display = 'block';
    bList.innerHTML = ch.slice(0,15).map(h => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0eee8;font-size:.72rem">
        <span style="font-family:'JetBrains Mono',monospace;background:#f5f0ec;border-radius:4px;padding:2px 6px;font-size:.65rem">${h.ticker||'—'}</span>
        <span style="flex:1;margin:0 8px;color:#1a2a3a;font-weight:600">${h.name||'—'}</span>
        <span style="color:#6b7e96;font-weight:700">${h.weight||0}%</span>
      </div>`).join('');
  }
}

// ── Proposal Generator ──
async function generateProposal(modelId, sleeveIdx) {
  const m = _models.find(x => x.id === modelId);
  if (!m) return;
  const sleeve = m.sleeves ? m.sleeves[Math.min(sleeveIdx, m.sleeves.length-1)] : null;
  const holdings = sleeve ? (sleeve.holdings||[]) : (m.holdings||[]);
  const sName = sleeve ? sleeve.name : '';
  const perf = (sleeve && sleeve.perf) || m.perf || {};
  const riskScore = sleeve && sleeve.risk_score ? sleeve.risk_score : mdlCalcRisk(holdings);
  const er = sleeve && sleeve.exp_ratio ? sleeve.exp_ratio : mdlCalcER(holdings);
  const yld = sleeve && sleeve.div_yield ? sleeve.div_yield : mdlCalcYield(holdings);
  const rLabel = riskScore <= 25 ? 'Conservative' : riskScore <= 40 ? 'Moderately Conservative' : riskScore <= 60 ? 'Moderate' : riskScore <= 75 ? 'Moderately Aggressive' : 'Aggressive';

  const today = new Date().toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric'});
  const fullName = sName ? `${m.name} — ${sName}` : m.name;
  const fmtP = v => v != null ? (v>=0?'+':'')+parseFloat(v).toFixed(2)+'%' : 'N/A';

  const holdingRows = holdings.map(h => `
    <tr>
      <td style="padding:8px 12px;font-family:monospace;font-size:12px;border-bottom:1px solid #f0eee8">${h.ticker||'—'}</td>
      <td style="padding:8px 12px;font-size:13px;border-bottom:1px solid #f0eee8">${h.name||'—'}</td>
      <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:600;border-bottom:1px solid #f0eee8">${h.weight||0}%</td>
      <td style="padding:8px 12px;text-align:right;font-size:13px;border-bottom:1px solid #f0eee8">${h.risk_score||'—'}</td>
      <td style="padding:8px 12px;text-align:right;font-size:13px;border-bottom:1px solid #f0eee8">${h.exp_ratio?h.exp_ratio.toFixed(2)+'%':'—'}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><title>${fullName} — Investment Proposal</title>
  <style>
    body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;color:#1a2a3a;background:#fff}
    .header{background:linear-gradient(135deg,#1b2b3a,#2d3f4f);color:#fff;padding:40px 48px;display:flex;justify-content:space-between;align-items:flex-end}
    .header-title{font-size:28px;font-weight:700;letter-spacing:-.5px}
    .header-sub{font-size:14px;opacity:.7;margin-top:4px}
    .header-date{font-size:13px;opacity:.6;text-align:right}
    .firm{font-size:18px;font-weight:700;color:#cda561}
    .body{padding:40px 48px}
    .section{margin-bottom:32px}
    .section-title{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a8b8cc;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #f0eee8}
    .metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .metric{background:#f9f7f4;border-radius:10px;padding:16px;text-align:center}
    .metric-label{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a8b8cc;margin-bottom:6px}
    .metric-value{font-size:22px;font-weight:700;color:#1b2b3a}
    .metric-sub{font-size:11px;color:#a8b8cc;margin-top:3px}
    table{width:100%;border-collapse:collapse}
    th{background:#f9f7f4;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7e96}
    th:not(:first-child){text-align:right}
    .perf-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .perf-card{background:#f9f7f4;border-radius:10px;padding:20px;text-align:center;position:relative;overflow:hidden}
    .perf-accent{position:absolute;top:0;left:0;right:0;height:4px}
    .footer{background:#f9f7f4;padding:24px 48px;font-size:11px;color:#a8b8cc;line-height:1.6;border-top:1px solid #e8e4dc}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="header">
    <div>
      <div class="firm">Capital Planning Wealth Management</div>
      <div class="header-title">${fullName}</div>
      <div class="header-sub">Investment Model Proposal</div>
    </div>
    <div class="header-date">Prepared: ${today}<br>Benchmark: ${m.benchmark||'S&P 500'}</div>
  </div>
  <div class="body">
    <div class="section">
      <div class="section-title">Model Overview</div>
      <div class="metric-grid">
        <div class="metric"><div class="metric-label">Risk Score</div><div class="metric-value">${riskScore}</div><div class="metric-sub">${rLabel}</div></div>
        <div class="metric"><div class="metric-label">Exp. Ratio</div><div class="metric-value">${er?er.toFixed(2)+'%':'—'}</div><div class="metric-sub">Weighted avg</div></div>
        <div class="metric"><div class="metric-label">Div. Yield</div><div class="metric-value">${yld?yld.toFixed(2)+'%':'—'}</div><div class="metric-sub">Estimated</div></div>
        <div class="metric"><div class="metric-label">Holdings</div><div class="metric-value">${holdings.length}</div><div class="metric-sub">Positions</div></div>
      </div>
    </div>
    ${perf.ytd != null ? `
    <div class="section">
      <div class="section-title">Performance</div>
      <div class="perf-grid">
        <div class="perf-card"><div class="perf-accent" style="background:${perf.ytd>=0?'#1d7a50':'#c0392b'}"></div>
          <div class="metric-label">YTD Return</div>
          <div style="font-size:28px;font-weight:700;color:${perf.ytd>=0?'#1d7a50':'#c0392b'};margin:8px 0">${fmtP(perf.ytd)}</div>
          ${perf.ytd_bench!=null?`<div style="font-size:12px;color:#a8b8cc">Benchmark: ${fmtP(perf.ytd_bench)} &nbsp;|&nbsp; <span style="color:${(perf.ytd-perf.ytd_bench)>=0?'#1d7a50':'#c0392b'};font-weight:700">${(perf.ytd-perf.ytd_bench)>=0?'▲':'▼'} ${Math.abs(perf.ytd-perf.ytd_bench).toFixed(2)}% vs bench</span></div>`:''}
        </div>
        <div class="perf-card"><div class="perf-accent" style="background:${perf.oneYear>=0?'#2563a8':'#c0392b'}"></div>
          <div class="metric-label">1-Year Return</div>
          <div style="font-size:28px;font-weight:700;color:${perf.oneYear>=0?'#2563a8':'#c0392b'};margin:8px 0">${fmtP(perf.oneYear)}</div>
          ${perf.oneYear_bench!=null?`<div style="font-size:12px;color:#a8b8cc">Benchmark: ${fmtP(perf.oneYear_bench)} &nbsp;|&nbsp; <span style="color:${(perf.oneYear-perf.oneYear_bench)>=0?'#1d7a50':'#c0392b'};font-weight:700">${(perf.oneYear-perf.oneYear_bench)>=0?'▲':'▼'} ${Math.abs(perf.oneYear-perf.oneYear_bench).toFixed(2)}% vs bench</span></div>`:''}
        </div>
      </div>
    </div>` : ''}
    <div class="section">
      <div class="section-title">Holdings</div>
      <table>
        <thead><tr><th>Ticker</th><th style="text-align:left">Name</th><th>Weight</th><th>Risk</th><th>Exp. Ratio</th></tr></thead>
        <tbody>${holdingRows}</tbody>
      </table>
    </div>
  </div>
  <div class="footer">
    This proposal is prepared by Capital Planning Wealth Management for informational purposes only. Past performance is not indicative of future results. 
    Performance figures are AI-estimated and should be verified with actual custodian data before client presentation. 
    Investment models are subject to change. Risk scores are based on the Nitrogen (Riskalyze) methodology.
  </div>
  </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

// ── Export / Import ──
function mdlExport() {
  if (!_models.length) { alert('No models to export yet.'); return; }
  const json = JSON.stringify({ version:'1.0', exported: new Date().toISOString(), models: _models }, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'cp-models-' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function mdlImport() {
  document.getElementById('mdl-import-input').click();
}
function mdlImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      const imported = Array.isArray(data) ? data : (data.models || []);
      if (!imported.length) { alert('No models found in this file.'); return; }
      const msg = _models.length
        ? `Import ${imported.length} model(s)? Choose:\n[OK] = Merge with existing\n[Cancel] = Replace all`
        : null;
      if (msg) {
        if (confirm(msg)) { // Merge
          const existingIds = new Set(_models.map(m=>m.id));
          imported.forEach(m => { if (!existingIds.has(m.id)) _models.push(m); else { const i = _models.findIndex(x=>x.id===m.id); if(i!==-1) _models[i]=m; } });
        }
      } else {
        _models = imported;
      }
      renderMdlGrid();
      alert('✓ ' + imported.length + ' model(s) imported successfully.');
    } catch(err) {
      alert('Error reading file: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // reset so same file can be imported again
}

// Initialize grid on load
document.addEventListener('DOMContentLoaded', function() {
  renderMdlGrid();
});
// Patch: renderMdlGrid when library opens
(function() {
  const _orig = showView;
  window.showView = function(name) {
    _orig(name);
    if (name === 'models') renderMdlGrid();
  };
})();
