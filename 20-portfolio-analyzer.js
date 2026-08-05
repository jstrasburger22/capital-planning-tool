/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Portfolio Risk Analyzer — upload, AI parsing, holding scores, recalc
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */
// ══ PORTFOLIO ANALYZER ══
let uploadedFile = null;
let uploadedFileData = null;

function switchMode(mode) {
  document.getElementById('mode-portfolio').style.display = mode === 'portfolio' ? '' : 'none';
  document.getElementById('mode-stock').style.display = mode === 'stock' ? '' : 'none';
  document.getElementById('tab-portfolio').classList.toggle('active', mode === 'portfolio');
  document.getElementById('tab-stock').classList.toggle('active', mode === 'stock');
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upload-area').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  uploadedFile = file;
  uploadedFileData = null; // Reset until load completes
  document.getElementById('btn-analyze').disabled = true;
  document.getElementById('ua-file-name').textContent = '⏳ ' + file.name;

  const reader = new FileReader();
  reader.onload = ev => {
    uploadedFileData = ev.target.result;
    document.getElementById('ua-file-name').textContent = '✓ ' + file.name;
    document.getElementById('btn-analyze').disabled = false;
  };
  reader.onerror = () => {
    document.getElementById('ua-file-name').textContent = '✗ Error reading file — please try again';
  };

  const ext = file.name.split('.').pop().toLowerCase();
  if (file.type.startsWith('image/'))                  reader.readAsDataURL(file);
  else if (ext === 'csv')                              reader.readAsText(file);
  else if (ext === 'xlsx' || ext === 'xls')            reader.readAsArrayBuffer(file);
  else if (ext === 'docx' || ext === 'doc')            reader.readAsArrayBuffer(file);
  else if (file.type === 'application/pdf')            reader.readAsDataURL(file);
  else                                                 reader.readAsDataURL(file);
}

function showAnalyzing(title, sub) {
  document.getElementById('upload-area').style.display = 'none';
  document.getElementById('action-row') && (document.getElementById('action-row').style.display = 'none');
  document.getElementById('analyzing-state').style.display = 'block';
  document.getElementById('az-status-title').textContent = title || 'Analyzing Portfolio…';
  document.getElementById('az-status-sub').textContent   = sub  || 'Extracting holdings and scoring risk levels';
}

// ── Parse a CSV/Excel file locally into grouped accounts without any AI call ──
// Returns { portfolio_name, accounts } in the same shape renderPortfolio expects.
// Columns recognised (case-insensitive, any order):
//   Account, Ticker, CUSIP, Description/Name, Asset Class/Sector, Market Value
function parseCSVLocally(csvText) {
  const lines = csvText.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return null;

  // Detect delimiter
  const delim = lines[0].includes('\t') ? '\t' : ',';

  function splitRow(row) {
    // Handle quoted fields
    const cells = [];
    let cur = '', inQ = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === delim && !inQ) { cells.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    cells.push(cur.trim());
    return cells;
  }

  const headers = splitRow(lines[0]).map(h => h.replace(/^"|"$/g,'').trim().toLowerCase());

  // Column index finders
  const col = (candidates) => {
    for (const c of candidates) {
      const idx = headers.findIndex(h => h.includes(c));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const iAcct   = col(['account']);
  const iTicker = col(['ticker','symbol']);
  const iCusip  = col(['cusip']);
  const iName   = col(['description','name','security']);
  const iClass  = col(['asset class','asset_class','sector','category','type']);
  const iMV     = col(['market value','market_value','mkt value','value','amount']);

  if (iMV === -1 && iTicker === -1) return null; // can't do anything useful

  const accountMap = {};
  const accountOrder = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitRow(lines[i]);
    if (cells.every(c => !c)) continue;

    const acctName  = iAcct   >= 0 ? (cells[iAcct]  || '').replace(/^"|"$/g,'').trim() : 'Portfolio';
    const ticker    = iTicker >= 0 ? (cells[iTicker] || '').replace(/^"|"$/g,'').trim().toUpperCase() : '';
    const cusip     = iCusip  >= 0 ? (cells[iCusip]  || '').replace(/^"|"$/g,'').trim() : '';
    const rawName   = iName   >= 0 ? (cells[iName]   || '').replace(/^"|"$/g,'').trim() : '';
    const assetCls  = iClass  >= 0 ? (cells[iClass]  || '').replace(/^"|"$/g,'').trim() : '';
    const mvRaw     = iMV     >= 0 ? (cells[iMV]     || '').replace(/^"|"$/g,'').replace(/[$,]/g,'').trim() : '0';
    const mv        = parseFloat(mvRaw) || 0;

    if (!ticker && !rawName && mv === 0) continue;

    if (!accountMap[acctName]) {
      accountMap[acctName] = [];
      accountOrder.push(acctName);
    }

    // Assign score locally — classifyHolding first, then TICKER_SCORES table
    const fakeH = { ticker, name: rawName, type: assetCls, risk_score: 50 };
    const classified = classifyHolding(fakeH);
    let score, typeFinal;
    if (classified) {
      score = classified.score;
      typeFinal = classified.type;
    } else {
      const local = TICKER_SCORES[ticker] || _sessionScoreCache[ticker];
      score = local !== undefined ? local : null; // null = needs AI
      typeFinal = assetCls || '';
    }

    const holding = {
      ticker,
      cusip,
      name: rawName,
      type: typeFinal,
      market_value: mv,
      allocation_pct: 0,    // calculated later after grouping
      risk_score: score,    // null = unknown, filled by AI batch
      risk_level: score !== null ? riskLevelLabel(score) : 'Unknown',
      _needsScore: score === null,
    };
    applyHoldingOverride(holding);
    accountMap[acctName].push(holding);
  }

  if (!accountOrder.length) return null;

  // Extract client name from account labels like "Dann - MWP IRA (7473)"
  const allNames = accountOrder.map(a => {
    const m = a.match(/^([A-Z][a-z]+)\s*[-–]/);
    return m ? m[1] : null;
  }).filter(Boolean);
  const uniqueNames = [...new Set(allNames)];
  const portfolioName = uniqueNames.length >= 2
    ? uniqueNames.slice(0, 2).join(' & ') + "'s Portfolio"
    : uniqueNames.length === 1
    ? uniqueNames[0] + "'s Portfolio"
    : 'Client Portfolio';

  const accounts = accountOrder.map(acctName => {
    const holdings = accountMap[acctName];
    const total = holdings.reduce((s, h) => s + (h.market_value || 0), 0);
    holdings.forEach(h => {
      h.allocation_pct = total > 0 ? parseFloat((h.market_value / total * 100).toFixed(2)) : 0;
    });
    return { account_name: acctName, holdings };
  });

  return { portfolio_name: portfolioName, accounts };
}

// ── Score unknown tickers in batches via AI (max 40 per call) ──
async function scoreUnknownTickersBatch(unknownHoldings) {
  if (!unknownHoldings.length) return;

  // Deduplicate by ticker so we don't ask about the same ticker twice
  const tickerMap = {}; // ticker -> first holding object (for name/type hints)
  unknownHoldings.forEach(h => {
    const t = h.ticker || h.name || '?';
    if (!tickerMap[t]) tickerMap[t] = h;
  });
  const unique = Object.entries(tickerMap);

  // Split into batches of 40
  const BATCH = 40;
  for (let start = 0; start < unique.length; start += BATCH) {
    const batch = unique.slice(start, start + BATCH);
    const batchNum = Math.floor(start / BATCH) + 1;
    const totalBatches = Math.ceil(unique.length / BATCH);
    document.getElementById('az-status-sub').textContent =
      `Scoring unknown holdings… (batch ${batchNum}/${totalBatches})`;

    const listStr = batch.map(([t, h], i) =>
      `${i+1}. Ticker: ${t || '(none)'} | Name: ${h.name || '(none)'} | Type: ${h.type || '(none)'}`
    ).join('\n');

    const prompt = `You are a financial risk analyst. Score each security below on a Nitrogen/Riskalyze 0-100 risk scale.

SECURITIES TO SCORE:
${listStr}

CALIBRATION: SPY=74, QQQ=85, IWM=87, AGG=28, TLT=35, HYG=48, GLD=65, EEM=82, IBIT=95
Individual stocks score HIGHER than ETFs (concentration risk):
- Blue-chip mega-cap stable (AAPL,MSFT,JNJ,WMT): 80-86
- Large-cap growth/tech (AMZN,META,GOOGL): 88-92
- High-volatility (NVDA,TSLA,AMD): 93-97
ETFs: Large blend 72-76, Growth 78-84, Small cap 84-88, Intl developed 74-78, EM 80-84
Bonds: IG corp 28-34, HY 45-52, Short-term 15-22, Muni 20-26
Cash/MM=5, Annuity=5, Variable Annuity=50, Structured Note=30, CD=5

CRITICAL TICKER OVERRIDES — your training data may have outdated info on these tickers.
Use ONLY the names and scores below, ignoring any prior knowledge:
- SPCX = "SpaceX" (Space Exploration Technologies Corp, Nasdaq IPO June 12 2026, score 96, type "Large Cap Stock")
- PURR = "Hyperliquid Strategies" (digital asset treasury / HYPE token, Nasdaq, founded 2025, score 97, type "Small Cap Stock") — NOT a cat or meme reference
- PUR  = "Defiance 2X Long PURR ETF" (leveraged single-stock ETF on PURR, score 99)
- CRWV = "CoreWeave" (AI GPU cloud, IPO 2025, score 96, type "Large Cap Stock")
- CRCL = "Circle Internet Group" (USDC stablecoin, IPO June 2026, score 94, type "Mid Cap Stock")
- QNT  = "Quantinuum" (quantum computing, IPO June 2026, score 95, type "Small Cap Stock")
- SPCU = "Defiance 2X Long SpaceX ETF" (leveraged single-stock ETF, score 99)
- LOFF = "Direxion Daily SpaceX Bull 2X ETF" (leveraged, score 99)

Return ONLY a JSON array (no markdown), one entry per security in the same order:
[{"ticker":"X","risk_score":74,"type":"Large Cap ETF","name":"Full Security Name"},...]`;

    try {
      async function callBatchProxy(attempt = 0) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 3000 * attempt));
        const resp = await fetch('/api/proxy', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (resp.status === 529 || resp.status === 500 || resp.status === 503) {
          if (attempt >= 3) return null;
          return callBatchProxy(attempt + 1);
        }
        if (!resp.ok) return null;
        return resp.json();
      }

      const data = await callBatchProxy();
      if (!data || data.error) continue;

      const txt = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g,'').trim();
      const m = txt.match(/\[[\s\S]*\]/);
      if (!m) continue;
      const scored = JSON.parse(m[0]);

      scored.forEach((s, i) => {
        if (!batch[i]) return;
        const [ticker] = batch[i];
        const score = Math.round(parseFloat(s.risk_score) || 50);
        const type  = s.type || '';
        const name  = s.name || '';
        // Cache it
        if (ticker && ticker !== '(none)') cacheScore(ticker, score);
        // Apply to ALL holdings with this ticker across all accounts
        unknownHoldings.forEach(h => {
          if ((h.ticker || h.name || '?') === ticker) {
            h.risk_score = score;
            h.risk_level = riskLevelLabel(score);
            if (type && !h.type) h.type = type;
            // Only overwrite the name if the holding's current name looks like
            // a raw ticker or is blank — don't clobber a proper description
            if (name && (!h.name || h.name === ticker || h.name === h.ticker)) h.name = name;
            // Final safety net — override stale names the AI may have returned
            applyHoldingOverride(h);
            delete h._needsScore;
          }
        });
      });
    } catch(e) {
      console.warn('Batch scoring error:', e);
      // Don't fail — leave score as 50 fallback for this batch
    }
  }

  // Assign fallback 50 to anything still unscored
  unknownHoldings.forEach(h => {
    if (h._needsScore) {
      h.risk_score = 50;
      h.risk_level = 'Moderate';
      delete h._needsScore;
    }
  });
}

async function analyzePortfolio() {
  if (!uploadedFile || !uploadedFileData) return;
  showAnalyzing('Analyzing Portfolio…', 'Reading document…');

  try {
    const ext = uploadedFile.name.split('.').pop().toLowerCase();
    const isCSVlike = ext === 'csv' || ext === 'xlsx' || ext === 'xls';

    // ── CSV / Excel path: parse locally, only call AI for unknown tickers ──
    if (isCSVlike) {
      let csvText = '';
      if (ext === 'csv') {
        csvText = uploadedFileData;
      } else {
        // Excel → convert to CSV locally
        const wb  = XLSX.read(uploadedFileData, { type: 'array' });
        const ws  = wb.Sheets[wb.SheetNames[0]];
        csvText   = XLSX.utils.sheet_to_csv(ws);
        if (!csvText.trim()) throw new Error('Excel file appears empty or could not be parsed.');
      }

      document.getElementById('az-status-sub').textContent = 'Parsing holdings locally…';
      const parsed = parseCSVLocally(csvText);
      if (!parsed || !parsed.accounts || !parsed.accounts.flatMap(a => a.holdings).length) {
        throw new Error('No holdings found in file. Please check the format and try again.');
      }

      // Collect holdings that still need AI scoring
      const allHoldings = parsed.accounts.flatMap(a => a.holdings);
      const needsScore = allHoldings.filter(h => h._needsScore);

      if (needsScore.length > 0) {
        document.getElementById('az-status-sub').textContent =
          `Scoring ${needsScore.length} unknown holding${needsScore.length !== 1 ? 's' : ''}…`;
        await scoreUnknownTickersBatch(needsScore);
      }

      document.getElementById('az-status-sub').textContent = 'Building results…';
      renderPortfolio(parsed);
      return;
    }

    // ── Image / PDF / DOCX path: send to AI as before ──
    let fileContent = [];
    if (uploadedFile.type.startsWith('image/') || (!['pdf','docx','doc'].includes(ext))) {
      const b64 = uploadedFileData.split(',')[1];
      fileContent = [{ type:'image', source:{ type:'base64', media_type:uploadedFile.type||'image/png', data:b64 } }];
    } else if (ext === 'pdf') {
      const b64 = uploadedFileData.split(',')[1];
      fileContent = [{ type:'document', source:{ type:'base64', media_type:'application/pdf', data:b64 } }];
    } else if (ext === 'docx' || ext === 'doc') {
      const result = await mammoth.extractRawText({ arrayBuffer: uploadedFileData });
      if (!result.value.trim()) throw new Error('Word document appears empty or could not be parsed.');
      fileContent = [{ type:'text', text:'FILE CONTENT (Word doc):\n' + result.value }];
    }

    document.getElementById('az-status-sub').textContent = 'Preparing scoring data…';
    const fileText = fileContent.map(b => b.text || '').join(' ').toUpperCase();
    const knownScoresObj = {};
    for (const [ticker, score] of Object.entries({...TICKER_SCORES, ..._sessionScoreCache})) {
      const re = new RegExp('\\b' + ticker.replace('.','[.]') + '\\b');
      if (re.test(fileText)) knownScoresObj[ticker] = score;
    }
    Object.assign(knownScoresObj, {SPY:74,QQQ:85,AGG:28,IWM:87,BND:25,TLT:35,VTI:75,GLD:65,IBIT:95});
    const knownScoresJSON = JSON.stringify(knownScoresObj);
    const clientNameHint = buildClientNameHint(fileContent);
    const prompt = buildPortfolioPrompt(knownScoresJSON, clientNameHint);

    document.getElementById('az-status-sub').textContent = 'Analyzing holdings…';

    async function callProxy(tokensLimit, attempt = 0) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 3000 * attempt));
      const resp = await fetch('/api/proxy', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: tokensLimit,
          messages: [{ role: 'user', content: [...fileContent, { type:'text', text: prompt }] }]
        })
      });
      if (resp.status === 529 || resp.status === 500 || resp.status === 503) {
        if (attempt >= 3) throw new Error('Server overloaded — please wait a moment and try again');
        document.getElementById('az-status-sub').textContent = `Server busy — retrying (${attempt+1}/3)…`;
        return callProxy(tokensLimit, attempt + 1);
      }
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(`API error ${resp.status}: ${errBody?.error?.message || resp.statusText}`);
      }
      return await resp.json();
    }

    let data = await callProxy(8000);
    if (data.error) throw new Error(data.error.message || 'API returned an error');

    if (data.stop_reason === 'max_tokens') {
      document.getElementById('az-status-sub').textContent = 'Large document — retrying with higher limit…';
      data = await callProxy(16000);
      if (data.error) throw new Error(data.error.message || 'API returned an error');
    }

    document.getElementById('az-status-sub').textContent = 'Processing results…';
    const text  = (data.content || []).filter(b => b.type === 'text').map(b => b.text||'').join('');
    const clean = text.replace(/```json|```/g,'').trim();
    let parsed;

    function fixTruncatedJson(str) {
      let s = str.replace(/,\s*"[^"]*"\s*:\s*[^,\}\]]*$/, '');
      s = s.replace(/,\s*$/, '');
      let braces = 0, brackets = 0;
      for (const ch of s) {
        if (ch === '{') braces++;
        else if (ch === '}') braces--;
        else if (ch === '[') brackets++;
        else if (ch === ']') brackets--;
      }
      while (brackets > 0) { s += ']'; brackets--; }
      while (braces > 0)   { s += '}'; braces--; }
      return s;
    }

    try {
      parsed = JSON.parse(clean);
    } catch(e) {
      const m = clean.match(/\{[\s\S]*/);
      if (m) {
        try { parsed = JSON.parse(m[0]); }
        catch(e2) {
          try { parsed = JSON.parse(fixTruncatedJson(m[0])); }
          catch(e3) { throw new Error('Could not parse portfolio data. Please try again.'); }
        }
      } else throw new Error('Could not parse portfolio data. Please try again.');
    }

    const allHoldings = parsed?.accounts
      ? parsed.accounts.flatMap(a => a.holdings || [])
      : (parsed?.holdings || []);

    if (!allHoldings.length) throw new Error('No holdings were found. Please check the format and try again.');

    if (parsed.accounts) {
      parsed.accounts.forEach(acct => {
        const allZero = (acct.holdings||[]).every(h => !parseFloat(h.market_value));
        if (allZero) {
          (acct.holdings||[]).forEach(h => {
            if (!h.ticker) return;
            const pattern = new RegExp(h.ticker + '[^\n]{0,80}?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)');
            const match = fileText.match(pattern);
            if (match) {
              const val = parseFloat(match[1].replace(/,/g,''));
              if (val > 10) h.market_value = val;
            }
          });
        }
      });
    }

    allHoldings.forEach(h => {
      const t = (h.ticker||"").toUpperCase().trim();
      if (t && !TICKER_SCORES[t] && h.risk_score) cacheScore(t, Math.round(parseFloat(h.risk_score)));
      // Fix any stale names the AI returned for recently-reassigned tickers
      applyHoldingOverride(h);
    });

    renderPortfolio(parsed);

  } catch(e) {
    document.getElementById('analyzing-state').style.display = 'none';
    document.getElementById('upload-area').style.display = '';
    document.getElementById('btn-analyze').disabled = false;
    alert('Analysis failed: ' + (e.message || 'Unknown error'));
  }
}

// Build the portfolio extraction prompt dynamically — embeds known scores so AI
// can resolve them instantly without web searches, only searching unknowns.
function buildPortfolioPrompt(knownScoresJSON, clientNameHint = '') {
  return `You are a financial risk analyst. Extract every holding from this portfolio document and assign each a Nitrogen (Riskalyze) 0-100 risk score.

${clientNameHint}For the portfolio_name: use the real client name only — never use "SWM", "LPL", account numbers, or generic terms like "Client Portfolio".

CRITICAL TICKER OVERRIDES — your training data may be outdated on these. Use ONLY these values:
- SPCX = "SpaceX" (Space Exploration Technologies Corp, Nasdaq, IPO June 12 2026, risk_score: 96, type: "Large Cap Stock") — NOT the old SPAC ETF
- PURR = "Hyperliquid Strategies" (digital asset treasury / HYPE token, Nasdaq, founded 2025, risk_score: 97, type: "Small Cap Stock") — NOT a cat or meme reference
- PUR  = "Defiance 2X Long PURR ETF" (leveraged single-stock ETF on PURR, risk_score: 99)
- CRWV = "CoreWeave" (AI GPU cloud computing, IPO 2025, risk_score: 96, type: "Large Cap Stock")
- CRCL = "Circle Internet Group" (USDC stablecoin issuer, IPO June 2026, risk_score: 94, type: "Mid Cap Stock")
- QNT  = "Quantinuum" (quantum computing, IPO June 2026, risk_score: 95, type: "Small Cap Stock")
- SPCU = "Defiance 2X Long SpaceX ETF" (leveraged, risk_score: 99)
- LOFF = "Direxion Daily SpaceX Bull 2X ETF" (leveraged, risk_score: 99)

KNOWN RISK SCORES (use these directly — do NOT web search these tickers):
${knownScoresJSON}

For any ticker NOT in the list above, use your knowledge of the security type and characteristics to assign a score. Only web search if you truly cannot identify the security.

RISK SCORE CALIBRATION:
SPY=74, IVV=74, VOO=74 (S&P 500)
QQQ=85 (NASDAQ 100), IWM=87 (Russell 2000)
AGG=28, BND=25 (Core Bonds), TLT=35 (Long Treasury), SHY=15 (Short Treasury)
HYG=48, JNK=50 (High Yield), LQD=32 (IG Corp)
GLD=65 (Gold), VNQ=76 (REITs), EEM=82 (Emerging Mkts)
IBIT=95 (Bitcoin ETF), Money market/cash=5, Structured note=30, Variable annuity=50 (variable subaccounts have real market exposure), Other annuities=5 (fixed, fixed-indexed, RILA, MYGA, structured annuity, point-to-point — always 5)
Balanced 60/40 fund~55, Large cap blend~74, Small cap~85-88
Investment grade short bond~18-22

ASSET CLASS LABEL RULES — CRITICAL:
If a file labels holdings as "Multiple" or leaves the asset class blank, you MUST identify the true asset class from the ticker/name alone. NEVER classify a named ETF or mutual fund as cash just because the asset class label says "Multiple" or is missing.

SPECIFIC TICKERS — always use these exact scores regardless of how the file labels them:
- JMST (JPMorgan Ultra-Short Municipal Income ETF) = risk 18, type "Ultra-Short Bond ETF" — NOT cash
- VNLA (Janus Henderson Short Duration Income ETF) = risk 20, type "Short Duration Bond ETF" — NOT cash
- CGMU (Capital Group Municipal Income ETF) = risk 28, type "Municipal Bond ETF" — NOT cash, NOT money market
- JSI (Janus Henderson Securitized Income ETF) = risk 30, type "Securitized Bond ETF" — NOT cash
- JMUIX (Janus Henderson Multi-Sector Income Fund) = risk 35, type "Multi-Sector Bond Fund" — NOT cash
- FTCB (First Trust Core Investment Grade ETF) = risk 30, type "Investment Grade Bond ETF" — NOT cash
- JIVE (JPMorgan International Value ETF) = risk 72, type "International Value ETF" — NOT cash
- VFLO (VictoryShares Free Cash Flow ETF) = risk 76, type "Large Cap ETF" — NOT cash
- JSML (Janus Henderson Small Cap Growth Alpha ETF) = risk 85, type "Small Cap ETF" — NOT cash
- XMHQ (Invesco S&P MidCap Quality ETF) = risk 78, type "Mid Cap ETF" — NOT cash
- QQQM (Invesco NASDAQ 100 ETF) = risk 85, type "Large Cap Growth ETF" — NOT cash
- CWI (SPDR MSCI ACWI ex-US ETF) = risk 76, type "International ETF" — NOT cash
- SPYV (SPDR S&P 500 Value ETF) = risk 72, type "Large Cap Value ETF" — NOT cash
- SPYM (SPDR S&P 500 ETF) = risk 74, type "Large Cap Blend ETF" — NOT cash

GENERAL RULE — only classify as cash/money market (risk 5) if the holding is explicitly:
- A money market fund (name contains "money market", "MMKT", "sweep", or similar)
- An actual cash/sweep position with no ticker
- A T-bill or government money market fund
Short-duration bond ETFs, ultra-short bond funds, and municipal bond funds are NEVER cash.

CRITICAL — Return ONLY valid JSON, no markdown, no explanation. Be concise — short type labels, no extra text:
{"portfolio_name":"string","accounts":[{"account_name":"string","holdings":[{"ticker":"string","name":"string","type":"string","market_value":number,"allocation_pct":number,"risk_score":number,"risk_level":"string"}]}]}

Rules:
- Group by account. One account = "Portfolio" if no grouping in file.
- market_value: actual dollar value from file. Never 0 or null if file shows a value.
- allocation_pct: % of THIS account total (0-100, not decimal)
- risk_level: "Low Risk"|"Conservative"|"Moderate"|"Moderately High"|"High Risk"
- No ticker = empty string. Return ONLY the JSON object.`;
}

// Classify ticker type before sending to AI — speeds up lookup significantly
function classifyTickerType(ticker) {
  const t = ticker.toUpperCase().trim();
  // 5-letter ticker ending in X = mutual fund (industry standard convention)
  if (t.length === 5 && t.endsWith('X')) return 'mutual_fund';
  // Known crypto ETFs
  if (['IBIT','FBTC','GBTC','ETHE','BITB','BITW','BITO','BTCO'].includes(t)) return 'crypto_etf';
  // Common ETF patterns (3-4 letters, no trailing X)
  if (t.length <= 4) return 'etf_or_stock';
  return 'etf_or_stock';
}

function buildStockPrompt(ticker, securityType, knownScore) {
  const typeHint = securityType === 'mutual_fund'
    ? `This is a MUTUAL FUND (5-letter ticker ending in X). Look up its fund family, category, and holdings.`
    : securityType === 'crypto_etf'
    ? `This is a CRYPTO / BITCOIN ETF. It will have a very high risk score (90-96 range).`
    : `This could be an ETF or individual stock. Identify which it is first.`;

  const scoreInstruction = knownScore !== undefined
    ? `Use risk_score: ${knownScore} exactly — this is pre-verified. Just fill in the fund details.`
    : `Assign a Nitrogen (Riskalyze) risk score 0–100 based on the security's volatility and asset class.`;

  // Tickers whose names/identities changed after the AI's training cutoff.
  // These MUST override any web search result — the old ticker assignments no longer exist.
  const TICKER_OVERRIDES = {
    SPCX: { name: 'SpaceX (Space Exploration Technologies Corp)', type: 'Large Cap Stock', description: 'SpaceX designs, manufactures, and launches rockets and spacecraft, operates the Starlink satellite internet network, and develops AI through its xAI/Grok platform. IPO\'d on Nasdaq June 12, 2026 at $135/share — the largest IPO in history at a ~$1.75T valuation.' },
    PURR: { name: 'Hyperliquid Strategies Inc.', type: 'Small Cap Stock', description: 'Hyperliquid Strategies (Nasdaq: PURR) is a digital asset treasury company focused on accumulating and staking HYPE, the native token of the Hyperliquid blockchain. Incorporated in 2025 and added to the Russell 2000 in 2026.' },
    PUR:  { name: 'Defiance Daily Target 2X Long PURR ETF', type: 'Leveraged ETF', description: 'A 2x daily leveraged single-stock ETF seeking 200% of the daily performance of Hyperliquid Strategies (PURR). Launched July 8, 2026.' },
    SPCU: { name: 'Defiance Daily Target 2X Long SpaceX ETF', type: 'Leveraged ETF', description: 'A 2x daily leveraged single-stock ETF seeking 200% of the daily performance of SpaceX (SPCX).' },
    LOFF: { name: 'Direxion Daily SpaceX Bull 2X ETF', type: 'Leveraged ETF', description: 'A 2x daily leveraged ETF seeking 200% of the daily performance of SpaceX (SPCX).' },
    CRWV: { name: 'CoreWeave Inc.', type: 'Large Cap Stock', description: 'CoreWeave is an AI-focused cloud computing company specializing in GPU infrastructure. IPO\'d in 2025.' },
    CRCL: { name: 'Circle Internet Group Inc.', type: 'Mid Cap Stock', description: 'Circle Internet Group is the issuer of USDC, a leading US dollar stablecoin. IPO\'d June 2026.' },
  };

  const override = TICKER_OVERRIDES[ticker];
  const overrideBlock = override
    ? `\nCRITICAL OVERRIDE — Do NOT search the web for this ticker. Your training data and search results are outdated.
Use EXACTLY these values for ${ticker}:
  name: "${override.name}"
  type: "${override.type}"
  description: "${override.description}"\n`
    : '';

  return `You are a financial risk analyst. ${typeHint}
${overrideBlock}
${override ? '' : `Search the web for: "${ticker}" fund OR ETF OR stock\n`}
${scoreInstruction}

Nitrogen calibration reference:
- SPY (S&P 500 ETF): 74 | QQQ (Nasdaq-100): 85 | IWM (Russell 2000): 87
- AGG (Core Bond ETF): 28 | BND (Total Bond): 25 | TLT (Long Treasury): 35
- IBIT/GBTC (Bitcoin ETF): 95 | BITW (Crypto Index): 92 | GLD (Gold): 65
- CRITICAL — Individual stocks score HIGHER than ETFs due to concentration risk (no diversification):
  · Blue-chip / mega-cap stable (AAPL, MSFT, JNJ, WMT): 80–86
  · Large-cap growth / tech (AMZN, META, GOOGL): 88–92
  · High-volatility large-cap (NVDA, TSLA, AMD): 93–97
  · Speculative / high-growth / pre-profit single stocks: 93–98
- ETF / mutual fund ranges (diversification lowers score vs. equivalent single stock):\n  · Large cap blend ETF: 72–76 | Large cap growth ETF: 78–84 | Small cap ETF: 84–88
  · International developed: 74–78 | Emerging markets: 80–84
  · High yield bond: 45–52 | Investment grade corp: 28–34
  · Balanced 60/40: ~55 | Short-term bond: 15–22 | Money market: 3–5
- Mutual funds: score based on underlying holdings (e.g. equity fund ~74–85, bond fund ~22–35)

Return ONLY this exact JSON — no markdown, no explanation:
{"ticker":"${ticker}","name":"","type":"","risk_score":0,"risk_level":"","expense_ratio":"","dividend_yield":"","aum":"","description":"one sentence describing what this security is","analysis":"2–3 sentence advisor-focused summary of risk characteristics and suitability"}

risk_level values: "Low Risk" (0–25) | "Conservative" (26–40) | "Moderate" (41–60) | "Moderately High" (61–75) | "High Risk" (76–100)`;
}

async function searchStock() {
  const raw    = document.getElementById('stock-ticker-input').value.trim().toUpperCase();
  const ticker = raw.replace(/[^A-Z0-9.]/g, '');
  if (!ticker) return;

  document.getElementById('stock-analyzing').style.display = 'block';
  document.getElementById('stock-results').style.display   = 'none';

  try {
    const knownScore   = TICKER_SCORES[ticker] ?? _sessionScoreCache[ticker];

    // ── LOCAL OVERRIDE PATH: tickers with known stale AI data ──
    // Build the result entirely from local data — no API call needed or wanted.
    const STOCK_OVERRIDES = {
      SPCX: { name: 'SpaceX (Space Exploration Technologies Corp)', type: 'Large Cap Stock',
        expense_ratio: 'N/A', dividend_yield: '0%', aum: '~$1.6T market cap',
        description: 'SpaceX designs, manufactures, and launches rockets and spacecraft, operates the Starlink satellite internet network, and develops AI through its xAI/Grok platform. IPO\'d on Nasdaq on June 12, 2026 at $135/share — the largest IPO in history.',
        analysis: 'SpaceX carries extreme volatility with a beta near 6 and daily price swings averaging 8%+. It is a single-stock concentration play on space infrastructure, satellite internet, and AI — appropriate only for aggressive growth allocations. The dual-class share structure gives public shareholders economic exposure but minimal voting rights.' },
      PURR: { name: 'Hyperliquid Strategies Inc.', type: 'Small Cap Stock',
        expense_ratio: 'N/A', dividend_yield: '0%', aum: 'Small cap',
        description: 'Hyperliquid Strategies (Nasdaq: PURR) is a digital asset treasury company that accumulates and stakes HYPE, the native token of the Hyperliquid decentralized exchange blockchain. Incorporated in 2025, added to the Russell 2000 in 2026.',
        analysis: 'PURR is a highly speculative, crypto-adjacent single stock whose value is directly tied to the price and staking yield of the HYPE token. It carries extreme volatility comparable to leveraged crypto ETFs. Suitable only for investors with a very high risk tolerance and a small position size within a diversified portfolio.' },
      PUR:  { name: 'Defiance Daily Target 2X Long PURR ETF', type: 'Leveraged ETF',
        expense_ratio: '~1.05%', dividend_yield: 'N/A', aum: 'Recent launch',
        description: 'A 2x daily leveraged single-stock ETF seeking 200% of the daily performance of Hyperliquid Strategies (PURR). Launched July 8, 2026 by Defiance ETFs.',
        analysis: 'This is a daily-reset leveraged ETF — it compounds decay over time and is designed for intraday or very short-term trading only, not buy-and-hold. The underlying PURR is already highly speculative; 2x leverage amplifies gains and losses dramatically. Suitable only for sophisticated short-term traders.' },
      SPCU: { name: 'Defiance Daily Target 2X Long SpaceX ETF', type: 'Leveraged ETF',
        expense_ratio: '~1.05%', dividend_yield: 'N/A', aum: 'Recent launch',
        description: 'A 2x daily leveraged single-stock ETF seeking 200% of the daily performance of SpaceX (SPCX) by Defiance ETFs.',
        analysis: 'Daily-reset 2x leveraged ETF on SpaceX — which itself has a beta near 6. Volatility decay makes this unsuitable for any holding period beyond a single trading session. Maximum speculative risk.' },
      LOFF: { name: 'Direxion Daily SpaceX Bull 2X ETF', type: 'Leveraged ETF',
        expense_ratio: '~1.07%', dividend_yield: 'N/A', aum: 'Recent launch',
        description: 'A 2x daily leveraged ETF seeking 200% of the daily performance of SpaceX (SPCX) by Direxion.',
        analysis: 'Daily-reset 2x leveraged ETF on SpaceX. Like all single-stock leveraged ETFs, it resets daily and compounds decay over time. Suitable only for sophisticated short-term traders with high risk tolerance.' },
      CRWV: { name: 'CoreWeave Inc.', type: 'Large Cap Stock',
        expense_ratio: 'N/A', dividend_yield: '0%', aum: '~$35B market cap',
        description: 'CoreWeave is an AI-focused cloud computing company specializing in GPU infrastructure, primarily serving large AI model developers. IPO\'d in 2025.',
        analysis: 'CoreWeave carries high single-stock risk due to heavy customer concentration (primarily NVDA ecosystem), deep losses on a GAAP basis, and massive ongoing capex requirements. Revenue growth is strong but profitability remains distant. High volatility; suitable for aggressive growth allocations only.' },
      CRCL: { name: 'Circle Internet Group Inc.', type: 'Mid Cap Stock',
        expense_ratio: 'N/A', dividend_yield: '0%', aum: 'Mid cap',
        description: 'Circle Internet Group is the issuer of USDC, one of the largest US dollar stablecoins. IPO\'d June 2026, opening at $69 vs a $31 IPO price.',
        analysis: 'Circle\'s business is directly tied to stablecoin adoption and the broader crypto regulatory environment. Revenue is driven by interest earned on USDC reserves, making it sensitive to interest rates. High volatility as a newly public crypto-adjacent stock.' },
      CBALX:{ name: 'Columbia Balanced Fund', type: 'Balanced Fund',
        expense_ratio: '~0.97%', dividend_yield: 'Varies', aum: '~$5B',
        description: 'Columbia Balanced Fund (CBALX) is an actively managed balanced mutual fund from Columbia Threadneedle Investments, blending equities and fixed income for moderate long-term growth.',
        analysis: 'CBALX holds a typical 60/40-style blend of stocks and bonds, making it a moderate-risk option suitable for investors seeking growth with some downside cushion. The balanced allocation reduces volatility relative to a pure equity fund. Appropriate for moderate risk profiles in a core portfolio role.' },
    };

    const ov = STOCK_OVERRIDES[ticker];
    if (ov) {
      const score = knownScore !== undefined ? knownScore : (ov.defaultScore || 95);
      cacheScore(ticker, score);
      renderStockResult({
        ticker,
        name:           ov.name,
        type:           ov.type,
        risk_score:     score,
        risk_level:     riskLevelLabel(score),
        expense_ratio:  ov.expense_ratio,
        dividend_yield: ov.dividend_yield,
        aum:            ov.aum,
        description:    ov.description,
        analysis:       ov.analysis,
      });
      return;
    }

    // ── AI PATH: everything else ──
    const securityType = classifyTickerType(ticker);
    const prompt = buildStockPrompt(ticker, securityType, knownScore);

    const resp = await fetch('/api/proxy', {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!resp.ok) {
      const errBody = await resp.json().catch(() => ({}));
      throw new Error('API ' + resp.status + ': ' + (errBody?.error?.message || resp.statusText));
    }

    const data = await resp.json();
    if (data.error) throw new Error(data.error.message || 'API error');
    const txt  = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const match = txt.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON returned. Response: ' + txt.slice(0,100));

    let parsed = JSON.parse(match[0]);

    // Lock score to known value if we have one — never let AI override it
    if (knownScore !== undefined) parsed.risk_score = knownScore;

    // Ensure risk_level matches score
    const s = Math.round(parseFloat(parsed.risk_score) || 50);
    parsed.risk_score = s;
    parsed.risk_level = riskLevelLabel(s);

    // Cache the result for this session
    cacheScore(ticker, s);

    renderStockResult(parsed);
  } catch(e) {
    document.getElementById('stock-analyzing').style.display = 'none';
    alert('Could not find data for ' + ticker + '. Please check the ticker symbol and try again.');
  }
}

// ── Portfolio state — accounts array with cash, used for live recalc ──
let _portfolioAccounts = [];
// Sort state per account: { col: 'value'|'alloc'|'risk'|'name'|'ticker'|'type', dir: 1|-1 }
let _sortState = {};

function sortAccount(ai, col) {
  const key = 'acct-' + ai;
  const cur = _sortState[key] || { col: null, dir: 1 };
  const dir = (cur.col === col) ? -cur.dir : 1; // toggle if same col, else default asc
  _sortState[key] = { col, dir };

  const acct = _portfolioAccounts[ai];
  const sorted = [...acct.holdings].sort((a, b) => {
    let av, bv;
    if (col === 'risk')   { av = parseFloat(a.risk_score)||0;       bv = parseFloat(b.risk_score)||0; }
    else if (col === 'value')  { av = parseFloat(a.market_value)||0; bv = parseFloat(b.market_value)||0; }
    else if (col === 'alloc')  { av = parseFloat(a.allocation_pct)||0; bv = parseFloat(b.allocation_pct)||0; }
    else if (col === 'name')   { av = (a.name||'').toLowerCase();    bv = (b.name||'').toLowerCase(); return dir * av.localeCompare(bv); }
    else if (col === 'ticker') { av = (a.ticker||'').toLowerCase();  bv = (b.ticker||'').toLowerCase(); return dir * av.localeCompare(bv); }
    else if (col === 'type')   { av = (a.type||'').toLowerCase();    bv = (b.type||'').toLowerCase(); return dir * av.localeCompare(bv); }
    return dir * (av - bv);
  });

  // Store the sorted holdings order and re-render tbody
  _sortState[key]._sorted = sorted;
  const tbody = document.getElementById(key + '-tbody');
  if (tbody) tbody.innerHTML = sorted.map(h => renderHoldingRow(h, ai, acct.holdings.indexOf(h))).join('');

  // Update header arrows and active class
  const thead = document.getElementById(key + '-thead');
  if (thead) {
    thead.querySelectorAll('th[data-sort]').forEach(th => {
      const isActive = th.dataset.sort === col;
      th.classList.toggle('sort-active', isActive);
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) arrow.textContent = isActive ? (dir === 1 ? ' ▲' : ' ▼') : ' ⇅';
    });
  }
}

// ── Inline portfolio title editing ──
function startEditPortfolioTitle() {
  const el = document.getElementById('az-portfolio-title');
  if (!el || el.querySelector('input')) return; // already editing
  const current = el.firstChild ? el.firstChild.textContent.trim() : el.textContent.trim();
  el.innerHTML = `
    <input id="az-title-input" type="text" value="${current.replace(/"/g,'&quot;')}"
      style="font-family:'Playfair Display',serif;font-size:1.3rem;font-weight:700;color:#fff;
             background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.35);
             border-radius:6px;padding:2px 10px;outline:none;width:280px;max-width:90vw"
      onblur="commitPortfolioTitle()"
      onkeydown="if(event.key==='Enter')commitPortfolioTitle();if(event.key==='Escape')cancelPortfolioTitle('${current.replace(/'/g,"\\'")}')"
    >`;
  document.getElementById('az-title-input').focus();
  document.getElementById('az-title-input').select();
}

function commitPortfolioTitle() {
  const input = document.getElementById('az-title-input');
  if (!input) return;
  const val = input.value.trim() || 'Investment Portfolio';
  const el  = document.getElementById('az-portfolio-title');
  if (el) el.innerHTML = `${val}<span style="font-size:.65rem;opacity:.45;font-family:'Nunito Sans',sans-serif;font-weight:600;letter-spacing:.05em">✎</span>`;
}

function cancelPortfolioTitle(original) {
  const el = document.getElementById('az-portfolio-title');
  if (el) el.innerHTML = `${original}<span style="font-size:.65rem;opacity:.45;font-family:'Nunito Sans',sans-serif;font-weight:600;letter-spacing:.05em">✎</span>`;
}

// Format a raw portfolio name into a clean client-facing title.
// Examples:
//   "Freda - SWM Portfolio"              -> "Freda's Portfolio"
//   "John & Mary - LPL Account"          -> "John & Mary's Portfolio"
//   "Robert & Linda Matthews"            -> "Robert & Linda Matthews's Portfolio"
//   "Smith Family Trust - SWM"           -> "Smith Family Trust Portfolio"
//   "Freda's Portfolio"                  -> "Freda's Portfolio" (already clean, untouched)
//   "Sample — Robert & Linda Matthews"   -> "Robert & Linda Matthews's Portfolio"
//   ""  / null  / "Client Portfolio"     -> "Client Portfolio"
function formatPortfolioTitle(raw) {
  if (!raw) return 'Investment Portfolio';
  let s = String(raw).trim();
  if (!s || /^(client portfolio|investment portfolio)$/i.test(s)) return 'Investment Portfolio';

  // Already clean — "Name's Portfolio" form
  if (/['']\s*s?\s+portfolio$/i.test(s)) return s;

  // Strip leading junk prefixes like "SWM —", "Sample —", "Demo —"
  s = s.replace(/^(sample|demo|example|test|swm|lpl)\s*[-–—:]\s*/i, '').trim();

  // If a dash is present, figure out which side is the real client name
  const JUNK = /^(swm|lpl|ria|sma|tod|ira|roth|brokerage|account|portfolio|investments?|holdings?|assets?|managed|advisory|platform|model)[\s\w\(\)]*$/i;
  const dashMatch = s.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (dashMatch) {
    const left  = dashMatch[1].trim();
    const right = dashMatch[2].trim();
    if (JUNK.test(left))       s = right;
    else if (JUNK.test(right)) s = left;
    else                       s = left;
  }

  // Strip trailing junk words (repeat in case they stack)
  const trailingJunk = /\s+(portfolio|portfolios|account|accounts|brokerage|investments?|holdings?|assets?|ira|roth|tod|advisory|swm|lpl|managed|management|platform|model)$/i;
  while (trailingJunk.test(s)) s = s.replace(trailingJunk, '').trim();

  if (!s) return 'Investment Portfolio';

  // Trust / LLC / Foundation — no possessive
  if (/\b(trust|llc|foundation|estate|fund)\b/i.test(s)) return s + ' Portfolio';

  // Couple joined with & or and
  if (/\s+(&|and)\s+/i.test(s)) return s + "'s Portfolio";

  // Single name — standard possessive
  return s + "'s Portfolio";
}

function renderPortfolio(data) {
  // Normalise: support both old {holdings:[]} and new {accounts:[]} shapes
  let accounts = data.accounts || [];
  if (!accounts.length && data.holdings && data.holdings.length) {
    accounts = [{ account_name: data.portfolio_name || 'Portfolio', holdings: data.holdings }];
  }

  // Apply local score + type overrides to every holding in every account.
  // Priority: 1) classifyHolding (annuity/note/bond/CD detection by name/type)
  //           2) TICKER_SCORES / session cache (known tickers)
  //           3) AI-returned score (fallback)
  //           4) HOLDING_OVERRIDES — fixes stale names for reassigned tickers
  accounts = accounts.map(acct => ({
    ...acct,
    cash_added: 0,
    holdings: (acct.holdings || []).map(h => {
      const t = (h.ticker || '').toUpperCase().trim();
      const classified = classifyHolding(h);
      const mv = parseFloat(h.market_value) || 0;
      let holding;
      if (classified) {
        holding = { ...h, market_value: mv, risk_score: classified.score, type: classified.type };
      } else {
        const local = TICKER_SCORES[t] || _sessionScoreCache[t];
        holding = { ...h, market_value: mv, risk_score: local !== undefined ? local : (h.risk_score || 50) };
      }
      applyHoldingOverride(holding);
      return holding;
    })
  }));

  _portfolioAccounts = accounts;

  document.getElementById('analyzing-state').style.display = 'none';
  const resultsEl = document.getElementById('az-results');
  resultsEl.style.display = 'block';

  // Build static skeleton — scores/totals filled by recalcPortfolio()
  resultsEl.innerHTML = `
    <div class="az-score-banner">
      <div style="flex:1;min-width:0">
        <div class="az-score-ey">AI-Powered Portfolio Risk Analysis</div>
        <div class="az-score-title" id="az-portfolio-title" onclick="startEditPortfolioTitle()" title="Click to rename" style="cursor:pointer;display:inline-flex;align-items:center;gap:8px">${formatPortfolioTitle(data.portfolio_name)}<span style="font-size:.65rem;opacity:.45;font-family:'Nunito Sans',sans-serif;font-weight:600;letter-spacing:.05em">✎</span></div>
        <div class="az-bar-bg"><div class="az-bar-fill" id="az-bar" style="width:0%"></div></div>
        <div class="az-bar-cap"><span>Conservative (0)</span><span>Moderate (50)</span><span>Aggressive (100)</span></div>
      </div>
      <div style="text-align:center;flex-shrink:0">
        <div class="az-score" id="az-score">—</div>
        <div class="az-level" id="az-level">—</div>
        <div style="font-size:.55rem;color:rgba(255,255,255,.4);margin-top:2px">out of 100</div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12)">
          <div style="font-size:.52rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.1em">Total Portfolio Value</div>
          <div id="az-total-balance" style="font-size:1rem;font-weight:700;color:#fff;font-family:'Playfair Display',serif">—</div>
        </div>
      </div>
    </div>

    <div id="az-alignment"></div>

    <!-- ── SAVE BUTTONS (top of results) ── -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button onclick="saveAsImage('view-analyzer','az-img-btn-top','portfolio-analysis')" id="az-img-btn-top"
        style="display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;border:1.5px solid #cda561;background:transparent;color:#cda561;font-family:'Nunito Sans',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s">
        📄 Save as PDF
      </button>
      <button onclick="downloadHtml('portfolio-analysis')" id="az-html-btn"
        style="display:flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;border:1.5px solid #e8e4dc;background:transparent;color:#6b7e96;font-family:'Nunito Sans',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;transition:all .2s">
        💾 Save as HTML
      </button>
      <button class="btn-print" id="az-copy-btn-top" onclick="copyAnalyzerSummary()"
        style="display:flex;align-items:center;gap:6px">
        📋 Copy Summary
      </button>
    </div>

    <div class="spec-section">
      <div class="spec-title">Overall Risk Spectrum Position</div>
      <div class="spec-bar"><div class="spec-pin" id="az-pin" style="left:0%"></div></div>
      <div class="spec-ticks"><span>Conservative</span><span>Mod. Conservative</span><span>Moderate</span><span>Mod. Aggressive</span><span>Aggressive</span></div>
    </div>

    <div style="font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin-bottom:12px;">Asset Allocation Breakdown</div>
    <div class="alloc-grid" style="margin-bottom:24px" id="az-alloc-grid"><!-- filled by recalc --></div>

    <div id="az-accounts-wrap">
      ${accounts.map((acct, ai) => renderAccountBlock(acct, ai)).join('')}
    </div>

    <button class="add-account-btn" onclick="openAddAccountModal()">＋ Add Account to Portfolio</button>

    <!-- ══ DEEP DIVE ANALYSIS ══ -->
    <button class="dd-toggle-btn" id="dd-toggle-btn" onclick="toggleDeepDive()">
      <span>📊</span>
      <span>Deep Dive Analysis</span>
      <span style="flex:1"></span>
      <span class="dd-chevron">▼</span>
    </button>
    <div class="dd-panel" id="dd-panel">
      <div class="dd-panel-inner">

        <!-- Account filter pills -->
        <div class="dd-section-title">Include Accounts in Analysis</div>
        <div class="dd-acct-filters" id="dd-acct-filters"><!-- populated by JS --></div>

        <!-- Pie Chart -->
        <div class="dd-section-title">Portfolio Allocation</div>
        <div class="dd-chart-wrap">
          <svg class="dd-pie-svg" id="dd-pie-svg" viewBox="0 0 220 220"></svg>
          <div class="dd-legend" id="dd-legend"></div>
        </div>

        <!-- Sub-asset breakdown -->
        <div class="dd-section-title">Asset Category Breakdown</div>
        <div class="dd-sub-grid" id="dd-sub-grid"><!-- populated by JS --></div>

        <!-- Stress Test -->
        <div class="dd-section-title">Stress Testing</div>
        <button class="dd-narrative-btn" style="background:linear-gradient(135deg,#1f2d3a,#263547)" onclick="openStressTest()">
          ⚡ Run Portfolio Stress Test
        </button>

        <!-- AI Narrative -->
        <div class="dd-section-title" style="margin-top:8px">Portfolio Analysis</div>
        <button class="dd-narrative-btn" id="dd-narrative-btn" onclick="generateNarrative()">
          ✨ Draft Client Email
        </button>
        <div class="dd-narrative-box" id="dd-narrative-box"></div>

      </div>
    </div>

    <div class="footer-bar" style="margin-top:24px">
      <div><div class="fb-firm">Capital Planning Wealth Management</div><div class="fb-sub">Portfolio Risk Analyzer · Advisor Use Only · Confidential</div></div>
      <div><div class="fb-lpl-note">Securities &amp; Advisory Services offered through</div><div class="fb-lpl-name">LPL Financial · Member FINRA / SIPC</div></div>
    </div>
    <div class="r-actions">
      <button class="btn-print" id="az-copy-btn" onclick="copyAnalyzerSummary()">📋 Copy Full Summary</button>
      <button class="btn-save-img" id="az-img-btn" onclick="saveAsImage('view-analyzer','az-img-btn','portfolio-analysis')">🖼 Save / Print</button>
      <button class="btn-ghost" onclick="resetAnalyzer()">↺ New Analysis</button>
    </div>
    <div class="disclaimer"><strong>Disclosure:</strong> This portfolio risk analysis is generated by artificial intelligence and is for informational and advisor discussion purposes only. It does not constitute a formal suitability determination, investment advice, or guarantee of future results. Risk scores are estimates based on general characteristics of identified holdings. Securities and advisory services offered through LPL Financial, Member FINRA/SIPC. Capital Planning Wealth Management and LPL Financial are separate entities.</div>`;

  recalcPortfolio();
}

function buildAccountAllocHTML(holdings, cashAdded) {
  let eq = 0, fi = 0, cash = cashAdded > 0 ? cashAdded : 0, alt = 0, ann = 0, str = 0;
  holdings.forEach(h => {
    const mv    = parseFloat(h.market_value) || 0;
    const score = parseFloat(h.risk_score)   || 50;
    const t     = (h.type || '').toLowerCase();
    if (t.includes('annuity'))                                                          ann  += mv;
    else if (t.includes('structured note') || t.includes('buffer note') ||
             t.includes('autocall')        || t.includes('barrier note') ||
             t.includes('reverse convertible') || t.includes('principal protected'))    str  += mv;
    else if (score <= 6 || t.includes('money market') ||
             (t.includes('cash') && !t.includes('cash flow')))                          cash += mv;
    else if (score <= 40 || t.includes('bond') || t.includes('fixed') ||
             t.includes('municipal') || t.includes('securitized') ||
             t.includes('income etf') || t.includes('income fund'))                     fi   += mv;
    else if (t.includes('alt') || t.includes('commodity') || t.includes('real asset'))  alt  += mv;
    else                                                                                 eq   += mv;
  });
  const total = eq + fi + cash + alt + ann + str || 1;
  const pct   = n => (n / total * 100).toFixed(1);
  const chips = [
    { label: 'Equities',         val: eq,   color: '#2563a8', bg: '#e8f0fa' },
    { label: 'Fixed Income',     val: fi,   color: '#1a6b4a', bg: '#e6f4ed' },
    { label: 'Cash',             val: cash, color: '#6b7e96', bg: '#f0f2f5' },
    { label: 'Annuities',        val: ann,  color: '#7c3aed', bg: '#f3eeff' },
    { label: 'Structured Notes', val: str,  color: '#b45309', bg: '#fef3c7' },
    { label: 'Alternatives',     val: alt,  color: '#0e7490', bg: '#e0f7fa' },
  ].filter(c => c.val > 0).sort((a, b) => b.val - a.val);
  if (!chips.length) return '';
  return chips.map(c =>
    `<span style="font-size:.68rem;font-weight:700;padding:4px 10px;border-radius:20px;background:${c.bg};color:${c.color};white-space:nowrap">${c.label} <span style="opacity:.8">${pct(c.val)}%</span></span>`
  ).join('');
}

function renderAccountBlock(acct, ai) {
  const id = 'acct-' + ai;
  const holdingsHtml = (acct.holdings || []).map((h, hi) => renderHoldingRow(h, ai, hi)).join('');
  const cashAdded    = acct.cash_added || 0;
  const allocChips   = buildAccountAllocHTML(acct.holdings || [], cashAdded);
  const allocStrip   = allocChips
    ? `<div id="${id}-alloc-strip" class="acct-alloc-strip" style="display:flex;flex-wrap:wrap;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);background:#fafbfc">${allocChips}</div>`
    : `<div id="${id}-alloc-strip" class="acct-alloc-strip" style="display:none"></div>`;
  return `
    <div class="holdings-card" id="${id}" style="margin-bottom:20px">
      <div class="hc-head">
        <div>
          <div class="hc-title" id="${id}-title" onclick="startEditAccountTitle(${ai})" title="Click to rename account" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">${acct.account_name || 'Account ' + (ai+1)}<span style="font-size:.6rem;opacity:.3;font-weight:600">✎</span></div>
          <div class="hc-count" id="${id}-count">${(acct.holdings||[]).length} positions</div>
        </div>
        <div style="text-align:right;display:flex;gap:24px;align-items:flex-start">
          <div>
            <div style="font-size:.6rem;color:var(--slate-lt);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Account Balance</div>
            <div id="${id}-balance" style="font-size:1.1rem;font-weight:700;color:var(--navy);font-family:'Playfair Display',serif">—</div>
          </div>
          <div>
            <div style="font-size:.6rem;color:var(--slate-lt);text-transform:uppercase;letter-spacing:.1em;margin-bottom:2px">Account Risk Score</div>
            <div id="${id}-score" class="acct-score-num" title="Click to override account risk score" onclick="openAccountScoreEdit(${ai})" style="font-size:1.4rem;font-weight:700;color:var(--navy);cursor:pointer;display:inline-flex;align-items:center;gap:5px">—<span style="font-size:.6rem;opacity:.35;font-weight:600">✎</span></div>
            <div id="${id}-level" style="font-size:.65rem;color:var(--slate)">—</div>
          </div>
          <button class="acct-del-btn" title="Remove this account" onclick="deleteAccount(${ai},event)">✕ Remove</button>
        </div>
      </div>
      ${allocStrip}
      <table class="htable">
        <thead id="${id}-thead"><tr>
          <th data-sort="ticker" onclick="sortAccount(${ai},'ticker')" style="cursor:pointer;user-select:none;white-space:nowrap">Ticker<span class="sort-arrow"> ⇅</span></th>
          <th data-sort="name" onclick="sortAccount(${ai},'name')" style="cursor:pointer;user-select:none;white-space:nowrap">Holding<span class="sort-arrow"> ⇅</span></th>
          <th data-sort="type" onclick="sortAccount(${ai},'type')" style="cursor:pointer;user-select:none;white-space:nowrap">Type<span class="sort-arrow"> ⇅</span></th>
          <th data-sort="value" onclick="sortAccount(${ai},'value')" style="text-align:center;cursor:pointer;user-select:none;white-space:nowrap">Value<span class="sort-arrow"> ⇅</span></th>
          <th data-sort="alloc" onclick="sortAccount(${ai},'alloc')" style="text-align:center;cursor:pointer;user-select:none;white-space:nowrap">Alloc<span class="sort-arrow"> ⇅</span></th>
          <th data-sort="risk" onclick="sortAccount(${ai},'risk')" style="text-align:center;cursor:pointer;user-select:none;white-space:nowrap">Risk<span class="sort-arrow"> ⇅</span></th>
          <th>Level</th>
          <th style="text-align:center;font-size:.55rem;color:var(--slate-lt)">Actions</th>
        </tr></thead>
        <tbody id="${id}-tbody">${holdingsHtml}</tbody>
      </table>
      <div class="cash-input-wrap">
        <span class="cash-input-lbl">💵 Cash / Debit Balance:</span>
        <span style="font-size:.78rem;color:var(--slate);font-weight:600">$</span>
        <input class="cash-input" type="number" step="1000" placeholder="0"
          oninput="updateAccountCash(${ai}, this.value)"
          id="${id}-cash-input">
        <span id="${id}-cash-effect" style="font-size:.7rem;color:var(--green);font-weight:600"></span>
      </div>
    </div>`;
}

function renderHoldingRow(h, ai, hi) {
  const s = parseFloat(h.risk_score) || 50;
  const col = s<=25?'#2563a8':s<=40?'#22a06b':s<=60?'#6b7e96':s<=75?'#d4820a':'#c0392b';
  const badgeBg = s<=25?'#e8f0fa':s<=40?'#e6f4ed':s<=60?'#eef0f4':s<=75?'#fff3e0':'#fde8e8';
  const mv = h.market_value ? '$' + parseFloat(h.market_value).toLocaleString('en-US',{maximumFractionDigits:0}) : '—';
  const alloc = h.allocation_pct ? parseFloat(h.allocation_pct).toFixed(1)+'%' : '—';
  // Manual override styling — small ✎ prefix marks scores the advisor edited
  const overrideCls = h._manualOverride ? ' risk-num-override' : '';
  const editable = (ai !== undefined && hi !== undefined);
  const editAttrs = editable
    ? ` class="risk-num risk-num-edit${overrideCls}" title="Click to edit risk score" onclick="openRiskEdit(${ai},${hi},event)"`
    : ` class="risk-num${overrideCls}"`;
  return `<tr>
    <td><span class="ticker-badge">${h.ticker || '—'}</span></td>
    <td style="font-weight:600;font-size:.79rem">${h.name || '—'}</td>
    <td style="font-size:.71rem;color:#6b7e96">${h.type || '—'}</td>
    <td style="text-align:center;font-size:.75rem;color:var(--navy);font-weight:600">${mv}</td>
    <td style="text-align:center">
      <div class="risk-bar-wrap"><div class="risk-bar-bg"><div class="risk-bar-fill" style="width:${alloc!=='—'?alloc:'0'};background:${col}"></div></div></div>
      <div style="font-size:.68rem;color:#6b7e96">${alloc}</div>
    </td>
    <td style="text-align:center"><span${editAttrs} style="color:${col}">${Math.round(s)}</span></td>
    <td><span class="risk-badge" style="background:${badgeBg};color:${col}">● ${riskLevelLabel(s)}</span></td>
    ${editable ? `<td style="text-align:center;white-space:nowrap;padding:4px 6px">
      <button class="row-act-btn" title="Edit holding" onclick="openHoldingEdit(${ai},${hi},event)">✎</button>
      <button class="row-act-btn row-act-del" title="Delete holding" onclick="deleteHolding(${ai},${hi},event)">✕</button>
    </td>` : ''}
  </tr>`;
}

// ── Manual risk score override ──
// Opens a prompt to edit any holding's risk score. Marks the holding as
// manually overridden so the ✎ indicator appears, then recalcs the rollup.
function openRiskEdit(ai, hi, event) {
  if (event) event.stopPropagation();
  const acct = _portfolioAccounts[ai];
  if (!acct || !acct.holdings || !acct.holdings[hi]) return;
  const h = acct.holdings[hi];
  const current = Math.round(parseFloat(h.risk_score) || 50);
  const label = h.ticker || h.name || 'this holding';
  const input = prompt(
    `Edit risk score for ${label}\n` +
    (h.type ? `Type: ${h.type}\n` : '') +
    `\nEnter a value between 0 and 100 (current: ${current}):`,
    current
  );
  if (input === null) return;
  const trimmed = String(input).trim();
  if (trimmed === '') return;
  const newScore = parseInt(trimmed, 10);
  if (isNaN(newScore) || newScore < 0 || newScore > 100) {
    alert('Please enter a whole number between 0 and 100.');
    return;
  }
  h.risk_score = newScore;
  h._manualOverride = true;
  recalcPortfolio();
}

// ── Re-render the entire accounts wrap from the current _portfolioAccounts state ──
// Needed after any add/edit/delete that changes account or holding indices.
// ── Inline account title editing ──
function startEditAccountTitle(ai) {
  const id  = 'acct-' + ai;
  const el  = document.getElementById(id + '-title');
  if (!el || el.querySelector('input')) return; // already editing
  const acct   = _portfolioAccounts[ai];
  const current = acct ? acct.account_name || ('Account ' + (ai + 1)) : ('Account ' + (ai + 1));
  el.innerHTML = `<input id="${id}-title-input" type="text" value="${current.replace(/"/g,'&quot;')}"
    style="font-family:'Nunito Sans',sans-serif;font-size:.95rem;font-weight:700;color:var(--navy);
           background:#f4f6fa;border:1.5px solid var(--teal);border-radius:6px;
           padding:3px 10px;outline:none;width:260px;max-width:80vw"
    onblur="commitAccountTitle(${ai})"
    onkeydown="if(event.key==='Enter')this.blur();if(event.key==='Escape')cancelAccountTitle(${ai},'${current.replace(/'/g,"\\'")}')"
  >`;
  const input = document.getElementById(id + '-title-input');
  if (input) { input.focus(); input.select(); }
}

function commitAccountTitle(ai) {
  const id    = 'acct-' + ai;
  const input = document.getElementById(id + '-title-input');
  if (!input) return;
  const val = input.value.trim() || ('Account ' + (ai + 1));
  if (_portfolioAccounts[ai]) _portfolioAccounts[ai].account_name = val;
  const el = document.getElementById(id + '-title');
  if (el) el.innerHTML = `${val}<span style="font-size:.6rem;opacity:.3;font-weight:600">✎</span>`;
}

function cancelAccountTitle(ai, original) {
  const id = 'acct-' + ai;
  const el = document.getElementById(id + '-title');
  if (el) el.innerHTML = `${original}<span style="font-size:.6rem;opacity:.3;font-weight:600">✎</span>`;
}

// ── Manual account-level risk score override ──
// Lets an advisor pin the displayed account score independently of the
// weighted calculation — useful when Nitrogen shows a different value,
// or when a non-traded holding (annuity, etc.) skews the computed score.
function openAccountScoreEdit(ai) {
  const acct = _portfolioAccounts[ai];
  if (!acct) return;
  const computed = document.getElementById('acct-' + ai + '-score');
  const currentDisplay = acct._manualScoreOverride !== undefined
    ? acct._manualScoreOverride
    : (computed ? parseInt(computed.textContent) || 50 : 50);

  const input = prompt(
    `Override risk score for:\n"${acct.account_name || 'Account ' + (ai+1)}"\n\n` +
    `The calculated score is based on the weighted average of all holdings.\n` +
    `Enter a value between 0–100 to pin a custom score, or leave blank to reset to calculated:\n`,
    acct._manualScoreOverride !== undefined ? acct._manualScoreOverride : ''
  );

  if (input === null) return; // cancelled
  const trimmed = String(input).trim();

  if (trimmed === '') {
    // Reset to calculated
    delete acct._manualScoreOverride;
  } else {
    const newScore = parseInt(trimmed, 10);
    if (isNaN(newScore) || newScore < 0 || newScore > 100) {
      alert('Please enter a whole number between 0 and 100, or leave blank to reset.');
      return;
    }
    acct._manualScoreOverride = newScore;
  }
  recalcPortfolio();
}

function rerenderAccounts() {
  const wrap = document.getElementById('az-accounts-wrap');
  if (!wrap) return;
  wrap.innerHTML = _portfolioAccounts.map((acct, ai) => renderAccountBlock(acct, ai)).join('');
  // Restore the cash-added input values for each account
  _portfolioAccounts.forEach((acct, ai) => {
    const cashInput = document.getElementById('acct-' + ai + '-cash-input');
    if (cashInput && acct.cash_added) cashInput.value = acct.cash_added;
  });
}

// ── Delete a holding from an account ──
function deleteHolding(ai, hi, event) {
  if (event) event.stopPropagation();
  const acct = _portfolioAccounts[ai];
  if (!acct || !acct.holdings || !acct.holdings[hi]) return;
  const h = acct.holdings[hi];
  const label = h.ticker || h.name || 'this holding';
  if (!confirm(`Remove ${label} from ${acct.account_name || 'this account'}?`)) return;
  acct.holdings.splice(hi, 1);
  // Recalc allocation percentages for the remaining holdings in this account
  const totalMv = acct.holdings.reduce((s, x) => s + (parseFloat(x.market_value) || 0), 0);
  if (totalMv > 0) {
    acct.holdings.forEach(x => { x.allocation_pct = (parseFloat(x.market_value) || 0) / totalMv * 100; });
  }
  // Clear sort state for this account since indices have shifted
  delete _sortState['acct-' + ai];
  rerenderAccounts();
  recalcPortfolio();
}

// ── Delete an entire account from the portfolio ──
function deleteAccount(ai, event) {
  if (event) event.stopPropagation();
  const acct = _portfolioAccounts[ai];
  if (!acct) return;
  const name = acct.account_name || `Account ${ai+1}`;
  const count = (acct.holdings || []).length;
  const msg = count > 0
    ? `Remove ${name}?\n\nThis will delete ${count} holding${count===1?'':'s'} from the portfolio.`
    : `Remove ${name}?`;
  if (!confirm(msg)) return;
  _portfolioAccounts.splice(ai, 1);
  // Sort state keys reference old indices — reset everything to be safe
  _sortState = {};
  rerenderAccounts();
  recalcPortfolio();
}

// ── Open holding edit modal pre-filled with current values ──
let _heContext = null;
function openHoldingEdit(ai, hi, event) {
  if (event) event.stopPropagation();
  const acct = _portfolioAccounts[ai];
  if (!acct || !acct.holdings || !acct.holdings[hi]) return;
  const h = acct.holdings[hi];
  _heContext = { ai, hi };
  document.getElementById('he-ticker').value = h.ticker || '';
  document.getElementById('he-name').value = h.name || '';
  document.getElementById('he-type').value = h.type || '';
  document.getElementById('he-mv').value = h.market_value || '';
  document.getElementById('he-risk').value = Math.round(parseFloat(h.risk_score) || 50);
  const ovEl = document.getElementById('he-override-note');
  if (ovEl) ovEl.style.display = h._manualOverride ? 'block' : 'none';
  document.getElementById('he-overlay').style.display = 'flex';
}

function closeHoldingEdit() {
  document.getElementById('he-overlay').style.display = 'none';
  _heContext = null;
}

function saveHoldingEdit() {
  if (!_heContext) { closeHoldingEdit(); return; }
  const { ai, hi } = _heContext;
  const acct = _portfolioAccounts[ai];
  if (!acct || !acct.holdings || !acct.holdings[hi]) { closeHoldingEdit(); return; }
  const h = acct.holdings[hi];

  const newTicker = document.getElementById('he-ticker').value.trim().toUpperCase();
  const newName = document.getElementById('he-name').value.trim();
  const newType = document.getElementById('he-type').value.trim();
  const newMv = parseFloat(document.getElementById('he-mv').value);
  const newRisk = parseInt(document.getElementById('he-risk').value, 10);

  if (isNaN(newRisk) || newRisk < 0 || newRisk > 100) {
    alert('Risk score must be a whole number between 0 and 100.');
    return;
  }
  if (isNaN(newMv) || newMv < 0) {
    alert('Market value must be a non-negative number.');
    return;
  }

  const prevRisk = Math.round(parseFloat(h.risk_score) || 50);

  h.ticker = newTicker;
  h.name = newName;
  h.type = newType;
  h.market_value = newMv;
  h.risk_score = newRisk;
  h.risk_level = riskLevelLabel(newRisk);

  if (newRisk !== prevRisk) h._manualOverride = true;

  // Recalc allocation percentages across all holdings in this account
  const totalMv = acct.holdings.reduce((s, x) => s + (parseFloat(x.market_value) || 0), 0);
  if (totalMv > 0) {
    acct.holdings.forEach(x => { x.allocation_pct = (parseFloat(x.market_value) || 0) / totalMv * 100; });
  }

  closeHoldingEdit();
  rerenderAccounts();
  recalcPortfolio();
}

function updateAccountCash(ai, val) {
  _portfolioAccounts[ai].cash_added = parseFloat(val) || 0;
  recalcPortfolio();
}

function fmt$(n) { return n > 0 ? '$' + Math.round(n).toLocaleString('en-US') : '—'; }

function recalcPortfolio() {

  let portfolioWeightedScore = 0, portfolioTotalValue = 0;
  let totalEq = 0, totalFi = 0, totalCash = 0, totalAlt = 0, totalAnnuity = 0, totalStructured = 0;

  _portfolioAccounts.forEach((acct, ai) => {
    const id       = 'acct-' + ai;
    const holdings = acct.holdings || [];
    const cashAdded = acct.cash_added || 0;

    // ── Re-render tbody respecting any active sort ──
    const activeSortState = _sortState[id];
    const tbody = document.getElementById(id + '-tbody');
    if (tbody && activeSortState && activeSortState.col) {
      const col = activeSortState.col, dir = activeSortState.dir;
      const resorted = [...holdings].sort((a, b) => {
        if (col === 'risk')   return dir * ((parseFloat(a.risk_score)||0)   - (parseFloat(b.risk_score)||0));
        if (col === 'value')  return dir * ((parseFloat(a.market_value)||0) - (parseFloat(b.market_value)||0));
        if (col === 'alloc')  return dir * ((parseFloat(a.allocation_pct)||0) - (parseFloat(b.allocation_pct)||0));
        return dir * (a[col]||'').toString().toLowerCase().localeCompare((b[col]||'').toString().toLowerCase());
      });
      tbody.innerHTML = resorted.map(h => renderHoldingRow(h, ai, holdings.indexOf(h))).join('');
    }

    // ── Calculate account totals ──
    // Use market_value when available; fall back to allocation_pct as weight
    let acctInvestedValue  = holdings.reduce((s, h) => s + (parseFloat(h.market_value) || 0), 0);
    let acctAllocSum       = holdings.reduce((s, h) => s + (parseFloat(h.allocation_pct) || 0), 0);
    const hasMV            = acctInvestedValue > 0;
    const acctTotalValue   = acctInvestedValue + cashAdded;

    let acctWeightedScore = 0;
    holdings.forEach(h => {
      // Weight: use market_value if present, else allocation_pct as proxy
      const weight = hasMV ? (parseFloat(h.market_value) || 0) : (parseFloat(h.allocation_pct) || 0);
      const score  = parseFloat(h.risk_score) || 50;
      acctWeightedScore += weight * score;

      // Tally asset classes using market value (or weight proxy)
      const mv = hasMV ? (parseFloat(h.market_value) || 0) : weight;
      const t  = (h.type || '').toLowerCase();
      if (t.includes('annuity')) totalAnnuity += mv;
      else if (t.includes('structured note') || t.includes('buffer note') || t.includes('autocall') ||
               t.includes('barrier note')    || t.includes('reverse convertible') ||
               t.includes('participation note') || t.includes('principal protected')) totalStructured += mv;
      else if (score <= 6 || t.includes('money market') || (t.includes('cash') && !t.includes('cash flow') && !t.includes('cashflow'))) totalCash += mv;
      else if (score <= 40 || t.includes('bond') || t.includes('fixed') || t.includes('municipal') || t.includes('securitized') || t.includes('income etf') || t.includes('income fund')) totalFi += mv;
      else if (t.includes('alt') || t.includes('commodity') || t.includes('real asset')) totalAlt += mv;
      else totalEq += mv;
    });

    // Cash: positive counts as cash (score 5); negative debit increases risk score
    // A debit balance means the account is leveraged — scored at 85 (high risk)
    const DEBIT_SCORE = 85;
    if (cashAdded >= 0) {
      totalCash += cashAdded;
    }
    // (negative cash reduces totalCash naturally via balance math)

    // ── Account risk score ──
    // Denominator: total invested value + cash (MV path) OR alloc sum + cash (pct path)
    const acctDenom = hasMV
      ? acctTotalValue
      : (acctAllocSum + cashAdded);

    let acctScore;
    if (acctDenom <= 0) {
      // Account is fully leveraged or empty
      acctScore = cashAdded < 0 ? DEBIT_SCORE : 50;
    } else {
      // cashAdded < 0 means leverage — it contributes negative value but high-risk weighting
      const cashScoreContrib = cashAdded >= 0
        ? cashAdded * 5          // positive cash: conservative, score 5
        : cashAdded * DEBIT_SCORE; // debit: negative value × 85 raises weighted avg
      acctScore = Math.min(99, Math.round((acctWeightedScore + cashScoreContrib) / acctDenom));
    }

    // ── Update account UI ──
    const scoreEl   = document.getElementById(id + '-score');
    const levelEl   = document.getElementById(id + '-level');
    const balanceEl = document.getElementById(id + '-balance');
    const effectEl  = document.getElementById(id + '-cash-effect');

    // If the advisor has manually overridden the account score, use that instead
    const displayScore = (acct._manualScoreOverride !== undefined) ? acct._manualScoreOverride : acctScore;
    if (scoreEl) {
      const overrideMark = acct._manualScoreOverride !== undefined
        ? `<span style="font-size:.52rem;color:#d4820a;font-weight:700;font-family:'Nunito Sans',sans-serif;vertical-align:middle"> ✎</span>`
        : `<span style="font-size:.6rem;opacity:.35;font-weight:600">✎</span>`;
      scoreEl.innerHTML = `${displayScore}${overrideMark}`;
      scoreEl.style.color = riskColor(displayScore);
    }
    if (levelEl)   { levelEl.textContent = riskLevelLabel(displayScore); levelEl.style.color = riskColor(displayScore); }
    const displayBalance = acctTotalValue > 0 ? acctTotalValue : cashAdded;
    if (balanceEl) { balanceEl.textContent = displayBalance !== 0 ? (displayBalance < 0 ? '(' + fmt$(Math.abs(displayBalance)) + ')' : fmt$(displayBalance)) : '—'; balanceEl.style.color = displayBalance < 0 ? 'var(--red)' : ''; }
    if (effectEl)  { effectEl.textContent = cashAdded > 0 ? '→ lowers account score' : cashAdded < 0 ? '⚠️ debit balance · raises account score' : ''; effectEl.style.color = cashAdded < 0 ? 'var(--red)' : 'var(--green)'; }

    // ── Refresh per-account alloc strip ──
    const stripEl = document.getElementById(id + '-alloc-strip');
    if (stripEl) {
      const chips = buildAccountAllocHTML(holdings, cashAdded);
      if (chips) {
        stripEl.innerHTML = chips;
        stripEl.style.display = 'flex';
      } else {
        stripEl.innerHTML = '';
        stripEl.style.display = 'none';
      }
    }

    // ── Add to portfolio totals ──
    // If account has a manual score override, use that for the overall weighted average
    const acctValueForTotal = hasMV ? acctTotalValue : acctDenom;
    portfolioTotalValue += acctValueForTotal;
    if (acct._manualScoreOverride !== undefined) {
      portfolioWeightedScore += acct._manualScoreOverride * acctValueForTotal;
    } else {
      portfolioWeightedScore += acctWeightedScore + cashAdded * 5;
    }
  });

  const overallScore = portfolioTotalValue > 0
    ? Math.round(portfolioWeightedScore / portfolioTotalValue)
    : 50;
  const riskCol = riskColor(overallScore);

  // ── Update overall banner ──
  const scoreEl   = document.getElementById('az-score');
  const levelEl   = document.getElementById('az-level');
  const barEl     = document.getElementById('az-bar');
  const pinEl     = document.getElementById('az-pin');
  const totalBalEl = document.getElementById('az-total-balance');

  if (scoreEl)    { scoreEl.textContent = overallScore; }
  if (levelEl)    { levelEl.textContent = riskLevelLabel(overallScore); }
  if (barEl)      { barEl.style.width = overallScore + '%'; barEl.style.background = riskCol; }
  if (pinEl)      { pinEl.style.left = overallScore + '%'; }
  if (totalBalEl) { totalBalEl.textContent = portfolioTotalValue > 0 ? fmt$(portfolioTotalValue) : '—'; }

  // ── Update asset allocation grid ──
  const grandTotal = totalEq + totalFi + totalCash + totalAlt + totalAnnuity + totalStructured || 1;
  const pct = n => (n / grandTotal * 100).toFixed(1) + '%';
  const allocGrid = document.getElementById('az-alloc-grid');
  const allocBuckets = [
    { label: 'Equities',         val: totalEq },
    { label: 'Fixed Income',     val: totalFi },
    { label: 'Cash',             val: totalCash },
    { label: 'Annuities',        val: totalAnnuity },
    { label: 'Structured Notes', val: totalStructured },
    { label: 'Alternatives',     val: totalAlt },
  ];
  if (allocGrid) allocGrid.innerHTML = allocBuckets
    .filter(b => b.val > 0)
    .sort((a, b) => b.val - a.val)
    .map(b => `<div class="alloc-card"><div class="ac-label">${b.label}</div><div class="ac-value">${pct(b.val)}</div></div>`)
    .join('');
  if (typeof renderRiskAlignment === 'function') renderRiskAlignment();
}


