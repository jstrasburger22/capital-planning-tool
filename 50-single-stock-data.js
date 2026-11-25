/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Single stock/ETF analyzer, scoring engine v2, ticker scoring tables
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══ SINGLE STOCK ANALYZER ══


function renderStockResult(d) {
  const s = parseFloat(d.risk_score)||50;
  const col = riskColor(s);
  const el  = document.getElementById('stock-results');
  el.style.display = 'block';
  document.getElementById('stock-analyzing').style.display = 'none';
  el.innerHTML = `
    <div class="sr-hero">
      <div>
        <div class="sr-ticker">${d.ticker||''}</div>
        <div class="sr-name">${d.name||d.ticker||''}</div>
        <div class="sr-type">${d.type||''}</div>
      </div>
      <div class="az-score-circle"><div class="az-score-num" style="color:${col}">${Math.round(s)}</div><div class="az-score-lbl">Risk Score</div></div>
    </div>
    <div class="sr-metrics">
      <div class="sr-metric"><div class="sr-mlbl">Risk Level</div><div class="sr-mval" style="color:${col}">${d.risk_level||riskLevelLabel(s)}</div></div>
      <div class="sr-metric"><div class="sr-mlbl">Expense Ratio</div><div class="sr-mval">${d.expense_ratio||'—'}</div></div>
      <div class="sr-metric"><div class="sr-mlbl">Dividend Yield</div><div class="sr-mval">${d.dividend_yield||'—'}</div></div>
      <div class="sr-metric"><div class="sr-mlbl">AUM</div><div class="sr-mval">${d.aum||'—'}</div></div>
      <div class="sr-metric"><div class="sr-mlbl">Risk Score</div><div class="sr-mval" style="color:${col}">${Math.round(s)} / 100</div></div>
    </div>
    ${d.description ? '<div class="sr-analysis" style="margin-bottom:12px">' + d.description + '</div>' : ''}
    ${d.analysis    ? '<div class="sr-analysis">' + d.analysis + '</div>' : ''}
    ${d._src ? '<div style="margin-top:10px;font-size:.68rem;color:var(--slate)">Score source: <strong>' + (SCORE_SRC_LABELS[d._src] || d._src) + '</strong>' + (d._src === 'ai' ? ' — not yet in the verified table; confirm before using with clients.' : '') + '</div>' : ''}`;
}

// ══ TICKER SCORING ══
// ── TICKER SCORE DATABASE ──
// Scores are Nitrogen (Riskalyze) calibrated 0-100. Last reviewed: 2026-03.
// Session cache: unknown tickers scored via web search are cached for the session.
// Refresh cycle: stale entries (6+ months) are re-verified on next lookup.

const TICKER_SCORE_META = {
  version: '2026.11',
  reviewed: '2026-11-24',   // Scoring engine v2: verified table first, Treasury funds by duration
  // Set to true to force re-verify ALL tickers via web (use every ~6 months)
  forceRefresh: false
};

// In-session cache for web-looked-up scores (persists across analyses in same session)
const _sessionScoreCache = {};
const _sessionScoreDates = {};

function cacheScore(ticker, score) {
  _sessionScoreCache[ticker.toUpperCase()] = score;
  _sessionScoreDates[ticker.toUpperCase()] = Date.now();
}
function getCachedScore(ticker) {
  const t = ticker.toUpperCase();
  return _sessionScoreCache[t] !== undefined ? _sessionScoreCache[t] : null;
}

// ══════════════════════════════════════════════════════════════════════
// HOLDING_OVERRIDES — single source of truth for tickers whose names
// were reassigned after the AI's training cutoff. Applied everywhere:
// CSV parse, batch AI scoring, PDF/image AI path, and single-stock search.
// Add new entries here and they automatically propagate to all paths.
// ══════════════════════════════════════════════════════════════════════
const HOLDING_OVERRIDES = {
  SPCX: { name: 'SpaceX',                              type: 'Large Cap Stock'  },
  PURR: { name: 'Hyperliquid Strategies Inc.',          type: 'Small Cap Stock'  },
  PUR:  { name: 'Defiance 2X Long PURR ETF',            type: 'Leveraged ETF'    },
  SPCU: { name: 'Defiance 2X Long SpaceX ETF',          type: 'Leveraged ETF'    },
  LOFF: { name: 'Direxion Daily SpaceX Bull 2X ETF',    type: 'Leveraged ETF'    },
  SPCF: { name: 'ProShares Ultra SpaceX ETF',           type: 'Leveraged ETF'    },
  SSPC: { name: 'Leverage Shares 2x Short SPCX ETF',    type: 'Leveraged ETF'    },
  SPCH: { name: 'Leverage Shares 2x Long SPCX ETF',     type: 'Leveraged ETF'    },
  CRWV: { name: 'CoreWeave Inc.',                        type: 'Large Cap Stock'  },
  CRCL: { name: 'Circle Internet Group Inc.',            type: 'Mid Cap Stock'    },
  QNT:  { name: 'Quantinuum Inc.',                       type: 'Small Cap Stock'  },
  CBALX:{ name: 'Columbia Balanced Fund',               type: 'Balanced Fund'    },
};

// Apply HOLDING_OVERRIDES to a single holding object in-place.
// Only overwrites name/type when the current name looks like a raw ticker
// (blank, matches ticker symbol, or is a known stale label).
const STALE_NAMES = new Set([
  'THE ACQUIRERS FUND','ACQUIRERS FUND','ROUNDHILL CAT ETF','CAT ETF',
  'SPAC AND NEW ISSUE ETF','THE SPAC AND NEW ISSUE ETF',
  'CALVERT BALANCED FUND CLASS A','CALVERT BALANCED FUND',
  'COLUMBIA BALANCED FUND CLASS A',
]);
function applyHoldingOverride(h) {
  const t = (h.ticker || '').toUpperCase().trim();
  if (!t || !HOLDING_OVERRIDES[t]) return;
  const ov = HOLDING_OVERRIDES[t];
  const curName = (h.name || '').trim().toUpperCase();
  const isBlankOrRaw = !h.name || curName === t || curName === '' || STALE_NAMES.has(curName);
  if (isBlankOrRaw) h.name = ov.name;
  if (!h.type || STALE_NAMES.has(curName)) h.type = ov.type;
}

const TICKER_SCORES = {
  // ── US BROAD MARKET ETFs ──
  SPY:74,IVV:74,VOO:74,VTI:75,ITOT:75,SCHB:75,SPTM:75,BBUS:75,
  QQQ:85,QQQM:85,ONEQ:84,
  IWM:87,IWB:74,IWF:79,IWD:72,IWS:75,IWN:76,IWO:88,IWP:84,
  MDY:80,IVOO:80,IJH:79,IJR:85,SCHA:86,VB:84,VO:78,VV:74,
  DIA:72,RSP:76,EUSA:74,
  // ── INTERNATIONAL DEVELOPED ──
  EFA:76,IEFA:76,VEA:76,SCHF:76,SPDW:76,DFAI:76,
  EWJ:74,EWU:76,EWG:78,EWC:76,EWA:78,EWL:72,EWQ:76,EWI:78,EWP:80,
  IEUR:76,VGK:76,FEZ:78,HEDJ:76,
  SCZ:84,VSS:82,FNDF:74,AVDV:82,
  // ── INTERNATIONAL EMERGING ──
  EEM:82,VWO:82,IEMG:82,SCHE:82,SPEM:82,DEM:80,
  EWZ:88,EWY:84,MCHI:84,FXI:84,INDA:84,EWT:82,EWX:86,
  AVEM:82,DFEM:82,
  // ── US BONDS — GOVT ──
  AGG:28,BND:25,SCHZ:25,IUSB:26,SPAB:26,
  TLT:35,EDV:40,ZROZ:42,VGLT:35,SPTL:35,
  IEF:28,VGIT:26,SCHR:26,SPTI:26,
  SHY:15,VGSH:14,SPTS:13,
  BIL:5,SHV:5,SGOV:5,TBLL:5,CLTL:5,
  TIP:30,SCHP:28,VTIP:22,STIP:20,PBTP:22,
  // ── US BONDS — CORPORATE ──
  LQD:32,VCIT:30,IGIB:30,SPIB:30,
  VCSH:20,IGSB:20,SPSB:19,
  HYG:48,JNK:50,USHY:48,FALN:50,HYLB:48,HYEM:54,
  BKLN:42,SRLN:45,FLOT:18,FLRN:18,
  // ── US BONDS — MUNI ──
  MUB:22,VTEB:22,TFI:22,SUB:18,SHYD:30,HYD:40,
  // ── INTERNATIONAL BONDS ──
  BNDX:22,IAGG:22,BWX:24,EMB:45,VWOB:45,PCY:45,
  // ── SECTOR ETFs ──
  XLK:83,VGT:83,FTEC:83,IYW:84,
  SOXX:90,SMH:92,SOXQ:90,
  XLF:76,VFH:76,KBE:78,KRE:82,IAI:78,
  XLE:80,VDE:80,OIH:85,XOP:88,
  XLV:72,VHT:72,IHI:76,IBB:82,XBI:90,
  XLU:62,VPU:62,IDU:62,
  XLI:75,VIS:75,ITA:78,
  XLP:65,VDC:65,NOBL:72,
  XLB:77,VAW:77,
  XLRE:71,VNQ:76,VNQI:77,IYR:76,SCHH:75,RWR:76,
  XLC:78,
  XLY:82,VCR:82,
  // ── FACTOR / SMART BETA ──
  MTUM:80,QUAL:75,USMV:68,VLUE:72,SIZE:76,
  DGRO:70,VIG:70,SDY:71,DVY:72,SCHD:70,DGRW:72,
  COWZ:74,CALF:82,DIVO:70,
  AVUS:74,AVUV:84,AVLV:72,
  DFAC:74,DFSV:84,DFLV:72,
  // ── INTERNATIONAL FACTOR ──
  AVDV:82,AVIV:74,AVDE:76,DFAX:76,
  // ── ALTERNATIVES ──
  GLD:65,IAU:65,GLDM:65,SGOL:65,
  SLV:72,SIVR:72,
  GDX:82,GDXJ:88,RING:84,
  PDBC:72,DJP:70,COMT:70,GSG:72,BCI:68,
  USO:85,UNG:90,
  IBIT:95,FBTC:95,GBTC:95,ETHE:93,BITB:95,BITW:92,BITO:88,BTCO:95,
  ARKK:93,ARKG:93,ARKW:92,ARKF:90,ARKE:91,ARKX:88,
  BOTZ:88,AIQ:86,ROBO:86,
  HACK:82,CIBR:82,BUG:82,
  DRIV:82,KARS:82,
  // ── BALANCED / ALLOCATION ──
  AOM:42,AOR:52,AOA:62,AOK:35,
  VBIAX:55,VBILX:45,VBAL:55,
  VWINX:45,VWELX:58,VTWNX:52,VTHRX:58,VFORX:62,VFFVX:68,
  FFNOX:68,FFFHX:62,FBALX:60,
  // ── MONEY MARKET ──
  VMFXX:5,VMMXX:5,VMRXX:5,
  SPAXX:5,FDRXX:5,FZFXX:5,FDLXX:5,
  SWVXX:5,SNSXX:5,SNVXX:5,
  SPRXX:5,PRTXX:5,
  // ── LARGE CAP STOCKS ──
  AAPL:82,MSFT:80,GOOGL:84,GOOG:84,AMZN:90,META:88,NVDA:96,
  TSLA:94,'BRK.B':74,'BRK.A':74,
  JPM:82,JNJ:74,V:78,MA:79,UNH:79,HD:80,PG:72,
  KO:70,PEP:70,WMT:72,COST:76,
  XOM:78,CVX:78,ABBV:78,MRK:73,LLY:85,
  AVGO:88,AMD:93,INTC:83,QCOM:85,TXN:78,
  BAC:82,WFC:82,GS:84,MS:84,C:83,
  NFLX:89,DIS:76,CMCSA:73,
  RTX:74,HON:74,CAT:78,DE:76,
  // ── MID/SMALL CAP STOCKS ──
  PLTR:95,RKLB:97,HOOD:92,COIN:95,MSTR:99,
  // ── TIMOTHY PLAN ──
  TPLC:73,TPSC:88,TPIF:77,TPHD:72,TPHE:78,TPMN:28,TPBIX:28,
  // ── AMERICAN FUNDS (Capital Group) ── all major share classes
  AIVSX:74,AIVAX:74,AIVCX:74,AIVEX:74,AIVFX:74,
  AGTHX:82,AGTAX:82,AGTCX:82,AGTEX:82,AGTFX:82,
  ANCFX:76,ANCAX:76,ANCCX:76,ANCEX:76,
  AMCPX:80,AMCAX:80,AMCCX:80,AMCEX:80,
  ABALX:58,BALAX:58,BALCX:58,
  AMRMX:72,AMRAX:72,AMRCX:72,
  AWSHX:74,AWSAX:74,AWSCX:74,
  ANWPX:78,ANWAX:78,ANWCX:78,
  CWGIX:78,CWGAX:78,CWGCX:78,
  SMCWX:84,SCWAX:84,SCWCX:84,
  NEWFX:78,NWFFX:78,NWFAX:78,
  AMECX:62,AMEAX:62,AMECX:62,
  ABNDX:28,BFTHX:28,BFTAX:28,BFTCX:28,
  CGFAX:74,CNPAX:75,CEUAX:76,CWMAX:73,
  // ── FIDELITY ACTIVE FUNDS ──
  FMAGX:82,FCNTX:80,FGRIX:78,FDGRX:85,FLPSX:78,
  FPURX:62,FXAIX:74,FSMAX:87,FXNAX:28,
  FTBFX:28,FBNDX:28,FSKAX:74,FSSNX:87,FGMNX:74,
  FSPTX:83,FSPHX:76,FBIOX:86,FIDSX:76,FBMPX:72,
  // ── T. ROWE PRICE ──
  PRGFX:82,PRBLX:74,PRWCX:62,RPMGX:84,TRBCX:82,
  PRMSX:87,TRSSX:87,PRDSX:74,TRQNX:74,
  TISCX:82,RPBAX:62,
  // ── VANGUARD ACTIVE ──
  VGHCX:78,VGIAX:76,VWNFX:72,VPCCX:74,VCVLX:70,
  // ── DODGE & COX ──
  DODGX:74,DODFX:76,DODIX:28,DODBX:58,DODWX:76,
  // ── PIMCO ──
  PTTRX:25,PTTAX:25,PTTCX:25,PIMIX:25,PDMIX:25,
  PFUIX:20,PFIIX:20,PLMAX:22,PTLDX:22,
  PHDIX:50,PHIYX:50,
  // ── MFS ──
  MFEKX:78,MFETX:78,MFEAX:78,MFECX:78,
  MFSBX:78,MSFRX:74,MFSAX:74,
  // ── FRANKLIN TEMPLETON ──
  TEPLX:78,TEPIX:78,TEPAX:78,
  FRIAX:74,FKASX:74,FRNDX:74,
  FKINX:68,FKBAX:62,
  // ── PUTNAM ──
  PGEOX:78,PGVAX:78,PGVCX:78,PGIAX:78,
  // ── COLUMBIA / COLUMBIA THREADNEEDLE ──
  LMVTX:76,CSGZX:76,CTFAX:74,
  // ── BLACKROCK / ISHARES ACTIVE ──
  MAFAX:74,MAFBX:74,MAFCX:74,MAFIX:74,
  BSPIX:74,BSPAX:74,
  // ── AMERICAN CENTURY ──
  TWCUX:82,TWCGX:82,ACNPX:76,TWUSX:74,
  // ── JANUS HENDERSON ──
  JDMAX:82,JDMRX:82,JGRTX:80,JGRAX:80,
  JMUIX:35,JTAIX:58,JABAX:58,
  // ── INVESCO / AIM ──
  AGPXX:74,AEPGX:76,ACMVX:72,
  // ── HARTFORD ──
  ITHAX:80,HAIAX:76,HAFAX:74,
  // ── LORD ABBETT ──
  LABFX:62,LAGVX:74,LAVLX:72,
  // ── DIMENSIONAL (DFA) ──
  DFUSX:74,DFSVX:84,DFLVX:72,DFQTX:74,
  DFIVX:76,DFIEX:76,DFEVX:82,
  DFGBX:22,DFTEX:28,
  // ── SCHWAB FUNDS ──
  SWPPX:74,SWSSX:87,SWIIX:74,SWLSX:87,
  SWBGX:62,SWBAX:48,
  // ── GABELLI ──
  GABEX:74,GABAX:74,GABLX:72,

  // ══════════════════════════════════════════
  // EXPANDED TABLE — Verified March 2026
  // ══════════════════════════════════════════

  // ── COVERED CALL / INCOME ETFs (very popular in advisor books) ──
  JEPI:52,JEPQ:62,DIVO:68,XYLD:65,QYLD:70,RYLD:72,
  SPYI:65,QQQI:72,IWMI:74,
  SVOL:38,ULTY:78,
  NUSI:55,GPIX:65,GPIQ:70,

  // ── BUFFER / DEFINED OUTCOME ETFs ──
  // iShares (BUFR series), Innovator, First Trust — all ~40-55 depending on buffer
  BUFR:45,BUFT:45,BFEB:45,BMAR:45,BAPR:45,BMAY:45,BJUN:45,
  BJUL:45,BAUG:45,BSEP:45,BOCT:45,BNOV:45,BDEC:45,
  PJAN:45,PFEB:45,PMAR:45,PAPR:45,PMAY:45,PJUN:45,
  PJUL:45,PAUG:45,PSEP:45,POCT:45,PNOV:45,PDEC:45,
  UJAN:50,UFEB:50,UMAR:50,UAPR:50,UMAY:50,UJUN:50,
  UJUL:50,UAUG:50,USEP:50,UOCT:50,UNOV:50,UDEC:50,
  // Innovator Power Buffer
  PBJAN:42,PBFEB:42,PBMAR:42,PBAPR:42,PBMAY:42,PBJUN:42,
  PBJUL:42,PBAUG:42,PBSEP:42,PBOCT:42,PBNOV:42,PBDEC:42,

  // ── POPULAR INCOME / MULTI-ASSET ETFs ──
  SCHD:70,VYM:70,DGRO:70,VIG:70,DVY:72,SDY:71,
  HDV:68,FDVV:70,SPHD:66,SPYD:72,
  PFF:42,PFFD:42,FPE:44,FPEI:44,  // Preferred stock
  EMLC:50,PCY:45,EBND:46,          // EM bonds

  // ── PIMCO ETFs (active, widely used) ──
  MINT:12,LDUR:22,BOND:30,UNII:28,
  PYLD:35,PDBC:72,

  // ── TOTAL RETURN / MULTI-SECTOR BOND ETFs ──
  FTSL:20,FLOT:18,FLRN:18,NEAR:14,JPST:12,ICSH:10,
  CSHI:10,SGOV:5,BIL:5,SHV:5,TBLL:5,USFR:5,
  TFLO:5,CLOU:82,

  // ── ULTRASHORT BOND ──
  GSY:10,PULS:12,FISR:20,SCHI:14,VUSB:14,

  // ── BROAD INTERNATIONAL (commonly used) ──
  VT:76,ACWI:76,URTH:75,VXUS:78,IXUS:78,VEU:77,
  ACWX:77,CWI:77,DIVI:74,EFAV:72,EEMV:76,

  // ── DIVIDEND INTERNATIONAL ──
  IDV:74,DWX:74,VYMI:76,HEFA:74,HEZU:76,

  // ── US FACTOR / SMART BETA (expanded) ──
  COWZ:74,CALF:82,DIVO:68,GPIX:65,
  AVUS:74,AVUV:84,AVLV:72,AVMC:83,
  DFAC:74,DFSV:84,DFLV:72,DFIX:28,
  FNDB:74,FNDX:74,FNDA:82,FNDF:74,FNDX:74,

  // ── SECTOR ETFs (expanded) ──
  // Technology
  IGV:85,SKYY:82,WCLD:86,BUG:82,HACK:82,CIBR:82,
  ROBO:82,BOTZ:84,AIQ:82,IRBO:82,QTUM:85,
  ARKK:92,ARKG:90,ARKW:90,ARKF:88,ARKE:88,ARKX:86,
  SOXQ:88,USD:85,PSI:84,

  // Healthcare
  XBI:88,IBB:82,ARKG:90,IHI:76,IHF:72,BBH:78,
  IDNA:84,GNOM:86,SBIO:92,LABD:95,

  // Financials expanded
  IAI:76,KBE:78,KRE:82,KBWB:78,IAK:74,KIE:72,

  // Energy
  XOP:88,OIH:85,AMLP:68,MLPA:68,ENFR:72,FCG:82,
  TAN:88,ICLN:84,QCLN:84,FAN:78,GRID:76,

  // Real Estate expanded
  REM:72,MORT:70,REZ:74,INDS:74,SRVR:76,HOMZ:74,

  // Consumer
  XHB:80,ITB:82,PBS:78,PBJ:66,MILN:78,FTXD:68,

  // Materials/Commodities
  PDBC:72,COMT:70,GSG:68,BCI:68,DJP:70,DBO:76,
  CORN:72,WEAT:72,SOYB:70,CANE:68,

  // ── LEVERAGED (common in advisor tools, scored at underlying risk) ──
  // Note: these are high risk by nature
  SSO:85,UPRO:90,QLD:90,TQQQ:95,SPXL:90,TECL:95,
  SDS:85,SQQQ:95,SPXS:90,     // Inverse — same risk score as leveraged
  SOXL:96,LABU:96,NAIL:88,DRN:84,

  // ── POPULAR INDIVIDUAL STOCKS (advisor single-stock notes often reference these) ──
  // Magnificent 7 + common blue chips
  AAPL:82,MSFT:80,NVDA:96,GOOGL:84,GOOG:84,META:88,AMZN:90,TSLA:94,
  'BRK.B':74,'BRK.A':74,
  JPM:82,BAC:82,WFC:82,GS:84,MS:84,C:83,
  JNJ:74,UNH:79,PFE:72,ABBV:78,LLY:85,MRK:73,
  XOM:78,CVX:78,COP:83,SLB:85,
  V:78,MA:79,PYPL:87,SQ:92,
  HD:80,LOW:81,COST:76,WMT:72,TGT:81,AMZN:90,
  KO:70,PEP:70,MCD:72,SBUX:76,
  AVGO:88,AMD:93,INTC:83,QCOM:85,TXN:78,AMAT:89,ASML:87,
  NFLX:89,DIS:76,CMCSA:73,PARA:82,
  RTX:74,LMT:72,NOC:72,GD:72,BA:85,
  T:68,VZ:66,TMUS:76,
  CAT:78,DE:76,HON:74,MMM:74,GE:78,ETN:78,
  NEE:70,DUK:64,SO:64,D:64,
  AMT:72,PLD:74,O:68,WELL:70,SPG:76,
  PLTR:95,RKLB:97,HOOD:93,COIN:95,MSTR:99,
  UBER:90,LYFT:92,ABNB:90,
  SNOW:93,DDOG:93,NET:93,ZS:93,CRWD:94,
  SOFI:92,AFRM:94,UPST:95,
  RKT:93,JOBY:96,ACHR:97,

  // ── STRUCTURED NOTE COMMON UNDERLYINGS (scored as structured products) ──
  // These CUSIPs / descriptors map to ~30 (with buffer) or ~45 (no buffer)
  // The classifyHolding() function handles named structured notes
  // These are placeholder scores for any that slip through as tickers

  // ── JANUS HENDERSON ETFs ──
  JAAA:18,JBBB:25,JMBS:24,VNLA:12,
  JSMD:82,JSML:84,JHMM:58,

  // ── NUVEEN / TIAA ETFs ──
  BVAL:28,NUSC:84,NULC:72,NULV:68,NUBD:26,

  // ── FIRST TRUST ETFs ──
  FDN:84,FTEC:83,LMBS:24,FPEI:44,HYLS:52,
  FV:74,FHK:80,FCAL:22,FUMB:20,

  // ── WISDOMTREE ETFs ──
  DLN:70,EPI:82,DXJ:74,HEDJ:74,DGRW:72,
  WTMF:35,AGZD:20,HYZD:44,

  // ── PACER ETFs ──
  COWZ:74,CALF:82,BGIG:32,PFIX:30,PFIG:26,

  // ── DIMENSIONAL FUND ADVISORS (DFA) — expanded ──
  DFUSX:74,DFSVX:84,DFLVX:72,DFQTX:74,
  DFIVX:76,DFIEX:76,DFEVX:82,
  DFGBX:22,DFTEX:28,DFCEX:30,
  DFGEX:78,DFITX:28,DFEOX:76,
  DFSIX:80,DFCIX:74,

  // ── DODGE & COX (expanded share classes) ──
  DODGX:74,DODFX:76,DODIX:28,DODBX:58,DODWX:76,
  DOXIX:28,  // Income Fund institutional

  // ── AMERICAN FUNDS (Capital Group) — comprehensive ──
  // Growth Fund of America
  AGTHX:82,AGTAX:82,AGTBX:82,AGTCX:82,AGTEX:82,AGTFX:82,
  RGAAX:82,RGABX:82,RGACX:82,RGAEX:82,RGAFX:82,
  // Investment Company of America
  AIVSX:74,AIVAX:74,AIVCX:74,AIVEX:74,AIVFX:74,
  // Fundamental Investors
  ANCFX:76,ANCAX:76,ANCCX:76,ANCEX:76,ANCFX:76,
  // New World
  NEWFX:78,NWFAX:78,NWFBX:78,NWFCX:78,
  // Capital World Growth
  CWGIX:78,CWGAX:78,CWGBX:78,CWGCX:78,
  // New Perspective
  ANWPX:78,ANWAX:78,ANWBX:78,ANWCX:78,
  // American Mutual
  AMRMX:72,AMRAX:72,AMRBX:72,AMRCX:72,
  // Washington Mutual
  AWSHX:74,AWSAX:74,AWSBX:74,AWSCX:74,
  // AMCAP
  AMCPX:80,AMCAX:80,AMCBX:80,AMCCX:80,
  // Smallcap World
  SMCWX:84,SCWAX:84,SCWBX:84,SCWCX:84,
  // Balanced
  ABALX:58,BALAX:58,BALBX:58,BALCX:58,
  // American High Income Trust
  AHITX:50,AHIAX:50,AHIBX:50,AHICX:50,
  // Bond Fund of America
  ABNDX:28,BFAAX:28,BFABX:28,BFACX:28,BFTAX:28,BFTCX:28,
  // Capital World Bond
  CWBFX:28,CWBAX:28,CWBBX:28,CWBCX:28,
  // Intermediate Bond
  AIBAX:24,AIBBX:24,AIBCX:24,
  // Short-Term Bond
  ASBAX:18,ASBBX:18,ASBCX:18,
  // Capital Income Builder
  CAIBX:58,CAIAX:58,CAIBX:58,CAICX:58,
  // Income Fund of America
  AMECX:60,AMEAX:60,AMECX:60,
  // EuroPacific Growth
  AEPGX:78,AEGAX:78,AEGBX:78,AEGCX:78,
  // International Growth and Income
  IGAAX:76,IGABX:76,IGACX:76,IGIFX:76,
  // Target Date series (Capital Group)
  RWJEX:55,RWIFX:58,RWIHX:62,RWIIX:65,RWIGX:68,

  // ── FIDELITY — comprehensive ──
  // Index funds
  FXAIX:74,FSKAX:74,FSPSX:76,FSMAX:87,FZROX:74,FZILX:76,
  FXNAX:28,FZIPX:28,FUAMX:26,FIBAX:26,
  // Active equity
  FMAGX:82,FCNTX:80,FBGRX:82,FDGRX:85,FLPSX:78,
  FGRIX:78,FSPTX:82,FOCPX:82,FSMEX:80,FTRNX:82,
  FDIVX:76,FGIKX:78,FINPX:74,FSCOX:74,
  FIENX:76,FIGRX:78,FPBFX:74,
  // Active bond / income
  FPURX:62,FBALX:60,FASMX:58,
  FTBFX:28,FBNDX:28,FSICX:28,FHIGX:24,FSIGX:20,
  FSHBX:20,FUMBX:20,FTHRX:24,
  FSAHX:50,SPHIX:50,FAGIX:48,
  // Fidelity Freedom (target date)
  FFFHX:62,FFFDX:60,FFFEX:58,FFFIX:54,FFFFX:50,FFFBX:46,
  FFFAX:42,FFGAX:38,FFKAX:34,FFHAX:32,
  FIOFX:28,FLIFX:26,FLBAX:24,FSENX:22,
  // Fidelity Advisor series (A shares common in advisory)
  FGAAX:80,FTAAX:74,FIQAX:28,FCBAX:58,

  // ── T. ROWE PRICE — expanded ──
  PRGFX:82,PRBLX:74,PRWCX:62,
  RPMGX:84,TRBCX:82,PRMSX:87,TRSSX:87,
  PRDSX:74,TRQNX:74,TISCX:82,
  RPBAX:62,PRFDX:74,TRBUX:80,PRIDX:76,
  PRAFX:78,PACLX:82,RPGEX:80,
  // T. Rowe bond
  PTTAX:28,PTTRX:28,RPITX:28,PRRIX:26,RPBDX:24,
  PRHYX:50,TRHYX:50,
  // T. Rowe target date
  TRRDX:68,TRRCX:64,TRRAX:60,TRRBX:56,TRREX:52,
  TRRFX:48,TRRGX:44,TRRHX:40,TRRIX:36,TRRJX:32,

  // ── VANGUARD MUTUAL FUNDS — expanded ──
  // Index equity
  VFIAX:74,VTSAX:75,VGTSX:78,VTIAX:78,VSIAX:84,
  VIMAX:78,VSCIX:84,VEXPX:78,VEXAX:78,
  VDIGX:70,VEIPX:70,VWNAX:70,
  // Index bond
  VBTLX:25,VBILX:25,VBIRX:22,VFIIX:22,
  VWAHX:22,VCITX:28,VWESX:28,VIHIX:22,
  VWLUX:28,VWSTX:20,VMLTX:20,
  // Active
  VWELX:58,VWINX:45,VWENX:58,VWNEX:45,
  VGHCX:78,VGIAX:76,VPCCX:74,VHCOX:78,
  PRIMECAP:80,VPMCX:80,VPMAX:80,
  // Target Retirement
  VTTSX:74,VTTHX:68,VTIVX:64,VFORX:60,VFIFX:56,
  VFFVX:68,VTWNX:52,VTHRX:58,VTENX:48,
  VTINX:35,VTWNX:52,

  // ── PIMCO — expanded ──
  // Core bond
  PTTRX:28,PTTAX:28,PTTCX:28,PTACX:28,
  PIMIX:30,PONAX:30,PONCX:30,
  // Income
  PONDX:30,PFUIX:20,PFIIX:20,PLMAX:22,PTLDX:22,
  // Short-term
  PFUIX:18,PSHDX:16,PSHAX:16,
  // High yield
  PHDIX:50,PHIYX:50,PHIAX:50,
  // Multi-sector
  PYLD:35,PMLAX:35,PMLDX:35,
  // Total Return ETF
  BOND:30,TRPIX:30,

  // ── MFS — expanded ──
  MFEKX:78,MFETX:78,MFEAX:78,MFECX:78,
  MWEFX:78,MWEAX:78,MWECX:78,
  MFSBX:76,MSFRX:74,MFSAX:74,MFSCX:74,
  MIGFX:76,MIGAX:76,MIGCX:76,
  MFLDX:74,MFLEX:74,MFLAX:74,
  MFDTX:28,MFDAX:28,MFDCX:28,
  MFBFX:58,MFBAX:58,MFBCX:58,

  // ── FRANKLIN TEMPLETON — expanded ──
  TEPLX:78,TEPIX:78,TEPAX:78,
  FKGRX:80,FKGAX:80,FKGCX:80,
  FRIAX:74,FKASX:74,FRNDX:74,FKAUX:74,
  FKINX:68,FKBAX:62,FKBDX:62,
  TEMMX:80,TEMFX:80,TEMTX:80,
  FKTFX:22,FKTAX:22,FKTCX:22,

  // ── HARTFORD FUNDS — popular in LPL ──
  ITHAX:80,ITHCX:80,ITIEX:80,
  HAIAX:76,HAICX:76,HAIIX:76,
  HAFAX:74,HAFCX:74,HAFEX:74,
  HIINX:28,HIICX:28,HIIAX:28,
  HBMAX:58,HBMCX:58,HBMIX:58,

  // ── LORD ABBETT ──
  LABFX:62,LAGVX:74,LAVLX:72,
  LAFFX:74,LAFAX:74,LAFCX:74,
  LBNDX:28,LBNAX:28,LBNCX:28,
  LHYAX:50,LHYCX:50,LHYIX:50,

  // ── COLUMBIA THREADNEEDLE ──
  CTFAX:74,CTFCX:74,CTFIX:74,
  LMVTX:76,CSGZX:76,
  CMJAX:22,CMJCX:22,CMJIX:22,
  CBDAX:28,CBDCX:28,CBDIX:28,

  // ── INVESCO / AIM — popular in advisor accounts ──
  AGPXX:74,AEPGX:76,ACMVX:72,
  OIEIX:76,OIEAX:76,OIECX:76,
  GTSGX:80,GTSAX:80,GTSCX:80,
  MSIGX:76,MSIAX:76,MSICX:76,
  AUBAX:28,AUBCX:28,AUBIX:28,

  // ── AMERICAN CENTURY ──
  TWCUX:82,TWCGX:82,ACNPX:76,TWUSX:74,
  TWEIX:74,TWENX:74,ACINX:74,
  TWIBX:28,TWIEX:28,TWUIX:28,
  AMDIX:58,AMDAX:58,AMDCX:58,

  // ── JANUS HENDERSON MUTUAL FUNDS ──
  JDMAX:82,JDMRX:82,JGRTX:80,JGRAX:80,
  JMUIX:35,JTAIX:58,JABAX:58,
  JAOSX:76,JAGRX:80,JAOAX:76,
  JNUSX:74,JNUAX:74,JNUCX:74,
  JHYAX:50,JHYCX:50,JHYIX:50,

  // ── PUTNAM ──
  PGEOX:78,PGVAX:78,PGVCX:78,PGIAX:78,
  PEYAX:74,PEYCX:74,PEYIX:74,
  PINCX:28,PINIX:28,PINAX:28,

  // ── NUVEEN (popular for munis) ──
  FATAX:22,FATBX:22,NUVBX:22,NUVNX:22,
  FLHYX:40,NUHYX:40,

  // ── BLACKROCK / INSTITUTIONAL FUNDS ──
  MAFAX:74,MAFCX:74,MAFIX:74,
  BSPIX:74,BSPAX:74,
  BRHYX:50,BRHAX:50,
  MCLOX:28,MCLAX:28,MCLIX:28,

  // ── GOLDMAN SACHS FUNDS ──
  GSTFX:28,GSTAX:28,GSTCX:28,
  GSGIX:74,GSGAX:74,GSGCX:74,
  GSGRX:78,GSMAX:78,GSMCX:78,
  GSNHX:50,GSNAX:50,GSNCX:50,

  // ── JPMorgan FUNDS ──
  OIEIX:76,JGVSX:74,JGVAX:74,JLGMX:78,
  JCPAX:76,JCPCX:76,JCPIX:76,
  JSOAX:84,JSOCX:84,JSOIX:84,
  JMBAX:28,JMBCX:28,JMBIX:28,
  JSIAX:20,JSICX:20,JSIIX:20,
  OHYFX:50,OHYAX:50,OHYCX:50,

  // ── MORGAN STANLEY ──
  MSEQX:78,MSEGX:78,MSERX:78,
  MPEMX:82,MPEAX:82,MPECX:82,
  MLDAX:28,MLDCX:28,MLDIX:28,

  // ── WELLS FARGO / ALLSPRING ──
  WFAOX:74,WFAAX:74,WFACX:74,
  STAEX:76,STAAX:76,STACX:76,
  WFHYX:50,WFHAX:50,WFHCX:50,
  WBIGX:28,WBIAX:28,WBICX:28,

  // ── TARGET DATE — PRINCIPAL ──
  PPLEX:62,PPLAX:62,PPLCX:62,
  PPMDX:56,PPMAX:56,PPMCX:56,

  // ── LIQUID ALTERNATIVES / MULTISTRATEGY MUTUAL FUNDS ──
  // Long-short equity, market neutral, managed futures, multi-strat
  // Lower beta to equities than typical equity funds; risk scores reflect
  // realized volatility and Morningstar within-category risk ratings.
  QLEIX:50,QLENX:50,QLERX:50,         // AQR Long-Short Equity (beta ~0.3-0.5, low correlation)
  QMNIX:30,QMNNX:30,                   // AQR Equity Market Neutral (beta ~0)
  AQMIX:55,AQMNX:55,                   // AQR Managed Futures Strategy
  QSPIX:55,QSPNX:55,                   // AQR Style Premia Alternative
  QDSIX:45,QDSNX:45,                   // AQR Diversifying Strategies
  FSMSX:40,FSMRX:40,                   // FS Multi-Strategy Alternatives (beta ~0.07)
  WTMFX:45,                            // WisdomTree Managed Futures
  BIVRX:50,                            // Blackstone Alternative Multi-Strategy
  AHLPX:50,                            // American Beacon AHL Managed Futures
  MFTFX:55,                            // Catalyst/Millburn Hedge Strategy

  // ── STRUCTURED NOTE RISK SCORES BY TYPE ──
  // These are placeholder scores used when name/CUSIP detection triggers classifyHolding()
  // Buffer Note (10-20% buffer): ~35-42
  // Barrier Note (no buffer, 20-30% barrier): ~45-55
  // Autocall / Phoenix Note: ~45-55
  // Market-Linked CD: ~25-30
  // Principal Protected Note: ~20-28
  // Reverse Convertible: ~55-65
  // Leveraged Note (2x participation): ~70-80

  // ── CAPITAL PLANNING MODEL HOLDINGS (additions for proposal builder consistency) ──
  // DFA equity ETFs (diversified core)
  DFAU:75, DFAE:85, DFAR:78, DFSU:76, DFSE:85, DFSI:75, DFIV:74,
  // DFA bond ETFs / mutual funds
  DFSD:18, DFCF:26, DFSB:28, DFSMX:14, DFNM:24,
  // All Cap World Focused 2 holdings
  RPG:86,
  // Biblically-Based Strategic Core holdings
  FTCB:28, PFTPX:17, LGRYX:12,
  // Dorsey NDX Model single-stock holdings
  ARM:92, FANG:86, ADI:88, ROST:80, LRCX:92, STX:88, WDC:88,
  // Invesco Core / Core Tax-Sensitive equity ETFs
  RWL:72, OMFL:76, IMFL:74, OMFS:84, PBUS:74,
  // Invesco fixed-income / muni / floating rate funds
  AFRYX:30, ACTDX:36, VKLIX:22, VMIIX:26, PZA:26, ORSYX:12,
  OPBYX:28, GTO:32, ICLO:18, IFLN:48, GOVI:36, ASFYX:38,
  // Invesco Power 7 sector ETFs
  PXE:90, PXJ:92, PKB:86, KNCT:88, PBD:92, PPA:82,
  // Strategic Core family equity ETFs
  SPYM:74, XMHQ:80, VFLO:72, SPYV:72, XSVM:90, XLG:74, SPGP:78, JIVE:72,
  // Strategic Core family fixed-income
  CGMU:22, SMMU:12, JSI:22,
  // T.Rowe Price Focused 5 funds
  PRASX:86, PRNEX:82, PRGTX:92, PRSCX:90, PRGSX:82,

  // ══════════════════════════════════════════════════════════════
  // 2025–2026 IPOs & RECENTLY ADDED TICKERS — Updated July 2026
  // ══════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════
  // JP MORGAN US TECHNOLOGY LEADERS SMA — Added July 2026
  // Source: JPM US-Technology-Leaders-Holdings.pdf (as of June 30, 2026)
  // ══════════════════════════════════════════════════════════════

  // Automobiles & Components
  RIVN:96,    // Rivian Automotive — EV startup, pre-profit, high vol

  // Banks / Fintech
  NU:90,      // Nu Holdings — Brazilian digital bank, EM + fintech risk

  // Capital Goods / Industrials
  SYM:95,     // Symbotic Inc — warehouse robotics/AI, high growth, volatile
  ROK:76,     // Rockwell Automation — industrial automation, blue chip
  VICR:88,    // Vicor Corp — power components, mid-cap, cyclical
  // BE (Bloom Energy) already in table

  // Consumer / Retail
  WRBY:90,    // Warby Parker — direct-to-consumer eyewear, small-cap growth

  // Financial Services
  XYZ:92,     // Block Inc (formerly SQ) — fintech/crypto, high volatility
  FIGR:90,    // Figure Technology Solutions — blockchain lending, speculative

  // Insurance / Insurtech
  LMND:94,    // Lemonade Inc — AI insurance, pre-profit, highly volatile

  // Media & Entertainment
  TTWO:88,    // Take-Two Interactive — gaming (GTA publisher), volatile

  // Pharma / AI Health
  TEM:94,     // Tempus AI — AI-driven oncology data, speculative

  // Semiconductors
  CBRS:96,    // Cerebras Systems — AI wafer-scale chips, IPO 2024, speculative
  ENPH:92,    // Enphase Energy — solar microinverters, high vol
  WOLF:94,    // Wolfspeed — silicon carbide chips, pre-profit, very volatile
  MXL:88,     // MaxLinear — mixed-signal semiconductors, cyclical
  ALGM:86,    // Allegro MicroSystems — automotive/industrial ICs
  MTSI:88,    // MACOM Technology — RF/microwave semiconductors
  AMKR:86,    // Amkor Technology — semiconductor packaging
  ENTG:90,    // Entegris — semiconductor materials, high growth
  GFS:84,     // GlobalFoundries — contract chipmaker (non-cutting-edge nodes)
  TSM:88,     // Taiwan Semiconductor ADR — world's largest foundry, geopolitical risk
  CDNS:88,    // Cadence Design Systems — EDA software, steady compounder

  // Software & Services
  SHOP:90,    // Shopify — e-commerce platform, high growth
  ZM:82,      // Zoom Communications — video conferencing, post-COVID normalization
  DOCN:90,    // DigitalOcean — cloud for SMBs, small-cap growth
  TWLO:90,    // Twilio — cloud communications API, high growth
  PANW:88,    // Palo Alto Networks — cybersecurity platform, large-cap growth

  // Technology Hardware & Equipment
  FN:84,      // Fabrinet — optical/electronic manufacturing services
  TTMI:84,    // TTM Technologies — printed circuit boards, cyclical
  LITE:88,    // Lumentum Holdings — optical/photonic components
  CIEN:86,    // Ciena Corp — networking infrastructure
  GLW:76,     // Corning Inc — specialty glass/fiber optics, blue chip
  SNDK:84,    // SanDisk Corp — NAND flash storage (spun off from WDC)

  // ── Hyperliquid Strategies (PURR) — Nasdaq, founded 2025 ──
  // Digital asset treasury company; holds/stakes HYPE token. Crypto-adjacent, highly speculative.
  // Added to Russell 2000/3000 June 2026. Leveraged ETF (PUR) launched July 8, 2026.
  PURR:97,
  PUR:99,    // Defiance Daily Target 2X Long PURR ETF (launched July 8, 2026)

  // ── SpaceX (SPCX) — IPO'd June 12, 2026 on Nasdaq at $135 ──
  // Beta ~5.79, daily volatility ~8.33%. Dual-class structure (Musk holds ~82% voting).
  // Segments: launch/Starlink/AI (includes xAI/Grok acquisition Feb 2026).
  // Largest IPO in history (~$1.75T valuation). Currently trading ~$123–$126 (Jul 22, 2026).
  // Scored 96 — mega-cap but extreme volatility; comparable to NVDA at peak IPO frenzy.
  SPCX:96,

  // ── SpaceX leveraged/inverse ETFs (for awareness — scored at max risk) ──
  SPCU:99,   // Defiance 2X Long SpaceX ETF
  LOFF:99,   // Direxion Daily SpaceX Bull 2X ETF
  SPCH:99,   // Leverage Shares 2x Long SPCX
  SSPC:99,   // Leverage Shares 2x Short SPCX (inverse, same risk)
  SPCF:99,   // ProShares Ultra SpaceX

  // ── CoreWeave (CRWV) — IPO'd Mar 2025, AI GPU cloud computing ──
  // Heavy NVDA customer concentration, deeply unprofitable, high capex. Score: 96
  CRWV:96,

  // ── Circle Internet Group (CRCL) — IPO'd June 2026, USDC stablecoin issuer ──
  // Crypto-adjacent; opened at $69 vs $31 IPO price. Score: 94
  CRCL:94,

  // ── Quantinuum (QNT) — IPO'd June 4, 2026, quantum computing ──
  // $15.6B valuation; long-dated speculative tech. Score: 95
  QNT:95,

  // ── Klarna (KLAR) — IPO'd 2025, buy-now-pay-later fintech ──
  KLAR:92,

  // ── Figma (FIG) — IPO'd 2025, design platform ──
  FIG:90,

  // ── Chime (CHYM) — IPO'd 2025, digital banking ──
  CHYM:92,

  // ── Rocket Lab USA (already tracked, confirm) ──
  RKLB:97,

  // ── Archer Aviation (ACHR) — eVTOL, speculative ──
  ACHR:97,

  // ── Joby Aviation (JOBY) — eVTOL ──
  JOBY:96,

  // ── Popular AI / tech stocks added or repriced post-2024 ──
  ORCL:82,   // Oracle — AI/cloud pivot, more stable than pure AI plays
  CRM:86,    // Salesforce — AI agents, solid but richly valued
  SAP:78,    // SAP — enterprise software, international
  NOW:88,    // ServiceNow — AI workflow, high growth
  WDAY:88,   // Workday — enterprise HR/finance cloud
  APP:94,    // Applovin — ad tech / AI; extremely volatile 2024-2025
  TTD:92,    // The Trade Desk — programmatic ad tech
  DUOL:92,   // Duolingo — EdTech / AI features
  CELH:93,   // Celsius Holdings — energy drinks, high volatility
  DECK:86,   // Deckers Brands (HOKA/UGG)
  ONON:90,   // On Holdings — running shoes, high growth
  SMCI:96,   // Super Micro Computer — AI server, extreme vol
  MRVL:90,   // Marvell Technology — AI networking chips
  ARM:92,    // Arm Holdings — chip IP, AI inference
  ALAB:94,   // Astera Labs — AI connectivity chipmaker (IPO 2024)
  DELL:84,   // Dell — AI server demand uplift
  HPE:76,    // Hewlett Packard Enterprise
  IONQ:97,   // IonQ — quantum computing, highly speculative
  RGTI:97,   // Rigetti Computing — quantum, speculative
  QBTS:97,   // D-Wave Quantum — quantum, speculative

  // ══════════════════════════════════════════════════════════════
  // NOV 2026 ACCURACY CORRECTIONS — listed last so they override any
  // earlier duplicate entry for the same ticker.
  // ══════════════════════════════════════════════════════════════
  // Money market fund that was scored like an equity fund (74)
  AGPXX:5, JMST:18,
  // Leveraged / options ETFs that were under-scored
  USD:96,    // ProShares Ultra Semiconductors (2x)
  NAIL:97,   // Direxion 3x Homebuilders
  DRN:95,    // Direxion 3x Real Estate
  PFIX:80,   // Simplify Interest Rate Hedge — options on rates, very volatile
  // Single stocks: firm rule = individual stocks score at or above SPY (74)
  // because of single-company risk. These defensive names sat below SPY.
  JNJ:78, PG:78, KO:78, PEP:78, MCD:78, MRK:78, DUK:78, SO:78,
  WMT:80, COST:80, PFE:80, CMCSA:80, DE:80, T:80, VZ:80, TMUS:80, NEE:80, D:80,
  AMT:80, PLD:80, O:80, WELL:80, ROK:80,
  RTX:78, HON:78, LMT:78, NOC:78, GD:78, 'BRK.B':78, 'BRK.A':78,
  DIS:82, SBUX:82, MMM:82, SPG:82, GLW:82, HPE:84,
  // Treasury index funds by duration (common in 401k rollovers)
  VFISX:14, VSBSX:14, SCHO:14, IEI:22, VFITX:27, VSIGX:27, GOVT:26,
  TLH:32, VUSTX:35, VLGSX:35, FNBGX:35, SCHQ:35,
};

// ── Client-name extraction from account labels ──
// Used by both the analyzer and the proposal builder to pre-hint the AI about the
// portfolio owner(s), so titles don't come back as "Client Portfolio" or worse.
// Handles: individual accounts ("Byron - SWM IRA"), joint accounts with both names
// visible ("Byron & Liz - SWM JTWROS", "Byron and Liz - SWM Brokerage"), and rejects
// generic labels like "Joint - SWM Brokerage" that don't identify a real person.
const NAME_TOKEN_BLACKLIST = new Set([
  // Registration types
  'Joint','Jtwros','Jtten','Ttee','Ttees','Trust','Estate','Household',
  'Individual','Brokerage','Account','Roth','Ira','Sep','Simple',
  'Custodian','Uma','Ugma','Utma','Living','Family','Revocable','Irrevocable',
  // Column headers from common CSV formats
  'Value','Amount','Total','Cash','Market','Description','Asset',
  'Sector','Class','Date','Cost','Price','Units','Fund','Money',
  // Firm/product identifiers that occasionally sit in the label slot
  'Swm','Lpl','Advisor'
]);

function extractClientFirstNames(text) {
  if (!text) return [];
  const names = [];
  const seen = new Set();
  // Dual-name pattern first (more specific): "X & Y - SWM" / "X and Y - SWM"
  const dualRe = /(?:^|[\r\n,])\s*([A-Z][a-z]+)[ ]+(?:&|And|and)[ ]+([A-Z][a-z]+)(?:[ ]+[A-Z][a-z]+)?[ ]*[-–—][ ]*SWM\b/g;
  for (const m of text.matchAll(dualRe)) {
    for (const cand of [m[1], m[2]]) {
      if (!NAME_TOKEN_BLACKLIST.has(cand) && !seen.has(cand)) {
        seen.add(cand); names.push(cand);
      }
    }
  }
  // Single-name pattern: "X - SWM" (optionally "X Y - SWM" for first+last)
  const singleRe = /(?:^|[\r\n,])\s*([A-Z][a-z]+)(?:[ ]+[A-Z][a-z]+)?[ ]*[-–—][ ]*SWM\b/g;
  for (const m of text.matchAll(singleRe)) {
    const cand = m[1];
    if (!NAME_TOKEN_BLACKLIST.has(cand) && !seen.has(cand)) {
      seen.add(cand); names.push(cand);
    }
  }
  return names;
}

function buildClientNameHint(fileContent) {
  try {
    const flatText = (fileContent || []).map(b => b.text || '').join(' ');
    const uniqueNames = extractClientFirstNames(flatText);
    if (uniqueNames.length === 1) {
      return `The client's name is "${uniqueNames[0]}". Use "${uniqueNames[0]}'s Portfolio" as the portfolio_name. `;
    } else if (uniqueNames.length >= 2) {
      const joined = uniqueNames.slice(0, 2).join(' & ');
      return `The clients are ${uniqueNames.join(' and ')}. Use "${joined}'s Portfolio" as the portfolio_name. `;
    }
  } catch(e) {}
  return '';
}


const STRUCTURED_ISSUERS = [
  'jpmorgan','jp morgan','morgan stanley','goldman sachs','goldman','citigroup','citi',
  'barclays','bnp','ubs','deutsche bank','hsbc','wells fargo','bank of america',
  'credit suisse','nomura','cibc','rbc','macquarie','stifel','raymond james',
  'mizuho','mufg','sumitomo','natixis'
];
const STRUCTURED_KEYWORDS = [
  'structured note','market linked','market-linked','principal protected',
  'autocall','buffer note','barrier note','reverse convertible','equity linked',
  'index linked','medium term note','mtn','contingent','phoenix note',
  'trigger','lnkd','linked','note lkd','fin llc','note due','cap note',
  'floored','participation note','absolute return'
];
const BOND_KEYWORDS   = ['corporate bond','municipal bond','muni bond',' bond due ',' % due ','agency bond','callable bond'];
const CD_KEYWORDS     = ['certificate of deposit','brokered cd','callable cd'];

function isCusip(str) {
  const s = (str||'').trim().replace(/\s/g,'');
  if (s.length < 6 || s.length > 9) return false;
  const hasLetter = /[A-Z]/i.test(s);
  const hasDigit  = /[0-9]/.test(s);
  if (hasLetter && !hasDigit && s.length <= 5) return false;
  if (hasLetter && hasDigit && s.length >= 6) return true;
  if (!hasLetter && hasDigit && s.length >= 6) return true;
  return false;
}

// ══════════════════════════════════════════════════════════════════════
// SCORING ENGINE v2 — Nov 2026
// One resolver is used by EVERY module (analyzer, add-account, single
// ticker, proposal builder) so the same holding always gets the same score.
//
// Order of precedence:
//   1. Advisor manual override            (h._manualOverride)
//   2. Verified TICKER_SCORES table       (known tickers always win)
//   3. Rule-based classification          (cash, annuities, CDs, individual
//                                           bonds, Treasury funds by duration,
//                                           structured notes)
//   4. Session cache / AI estimate
//   5. Fallback 50                        (flagged in Score Check)
//
// Every resolved holding is tagged h._src = 'manual'|'table'|'rule'|'ai'|'fallback'
// so the Score Check panel can show exactly where each number came from.
//
// FIRM RULES KEPT: cash / money market / CDs / fixed & indexed annuities = 5,
// individual US Treasury securities = 5, variable annuities = 50,
// structured notes = 30.
// CHANGED: Treasury & government bond FUNDS are no longer forced to 5 —
// they are scored by duration (T-bill 5 · short 14 · intermediate 27 · long 37).
// ══════════════════════════════════════════════════════════════════════

const _FUND_WORDS_RE = /\b(etf|etfs|fund|funds|index|portfolio|ishares|vanguard|spdr|schwab|fidelity|invesco|pimco|blackrock|admiral|investor|instl|institutional|shares|shs|class [a-z0-9]|cl [a-z])\b/i;
const _COUPON_RE     = /\d+(?:\.\d+)?\s?%/;
const _TSY_WORD_RE   = /\b(treasury|treasuries|treas|t-bills?|tbills?|t bill|t-notes?|t-bonds?|strips|us govt|u\.s\. govt|united states govt|government|govt)\b/i;
const _FOREIGN_GOV_RE= /\b(canada|canadian|mexico|mexican|japan|brazil|germany|german|france|french|italy|spain|australia|province|provincial|republic of|kingdom of|sovereign|intl|international|global|world|emerging|ex-us|ex us|foreign)\b/i;
const _AGENCY_RE     = /\b(fnma|fhlmc|fhlb|ffcb|freddie mac|fannie mae|federal home loan|federal farm credit|ginnie mae|gnma|tennessee valley)\b/i;
const _HY_RE         = /\b(high yield|hi yld|hi-yld|junk|subordinated|jr sub|pik|convertible|conv)\b/i;

// Phrases that only show up on structured products. Generic words that used to
// misfire ("linked" → inflation-linked bond funds, "absolute return",
// "contingent", "floored", "mtn") were removed.
const _STRUCT_STRONG = [
  'structured note','structured product','market linked','market-linked','principal protected',
  'capital protected','autocall','auto-call','auto call','buffer note','buffered note',
  'barrier note','reverse convertible','reverse exchangeable','equity linked','equity-linked',
  'index linked note','index-linked note','contingent coupon','contingent income',
  'contingent interest','trigger','lnkd','lkd to','note lkd','linked to','participation note','phoenix note','phoenix autocall',
  'enhanced participation','cap note','capped note','dual directional','digital note',
  'callable yield note','leveraged note','absolute return note'
];

function _isTradableTicker(t) { return /^[A-Z]{1,5}(\.[A-Z])?$/.test(t || '') && t !== 'CASH'; }

// Does this holding look like a pooled fund (ETF / mutual fund) rather than an
// individual security?
function _looksLikeFund(h) {
  const t    = (h.ticker || '').trim().toUpperCase();
  const name = h.name || '';
  const txt  = name + ' ' + (h.type || '');
  // Coupon / maturity descriptors mean an individual bond or note, not a fund
  if (_COUPON_RE.test(name) || /\b(due|dtd|b\/e|matures?|maturity)\b/i.test(name)) return false;
  if (_FUND_WORDS_RE.test(txt)) return true;
  if (/^[A-Z]{4}X$/.test(t) && !/XX$/.test(t)) return true;   // mutual fund ticker convention
  return false;
}

// Years until the latest future date found in a bond description
function _yearsToMaturity(txt) {
  const cy = new Date().getFullYear();
  const years = [];
  (txt.match(/\b(?:19|20)\d{2}\b/g) || []).forEach(y => years.push(+y));
  let m;
  const reDate = /\b\d{1,2}\/\d{1,2}\/(\d{2,4})\b/g;
  while ((m = reDate.exec(txt))) { let y = +m[1]; if (y < 100) y += 2000; years.push(y); }
  const rePacked = /%\s*(\d{2})(\d{2})(\d{2})\b/g;              // LPL style "3.250% 022326" = MMDDYY
  while ((m = rePacked.exec(txt))) years.push(2000 + +m[3]);
  const future = years.filter(y => y >= cy && y <= cy + 60);
  return future.length ? Math.max(...future) - cy : null;
}

// Individual (non-Treasury) bonds: short paper stays at the firm's 10;
// longer maturities and high-yield credit score higher.
function _individualBondScore(combined, rawName) {
  const yrs = _yearsToMaturity(rawName + ' ' + combined);
  let s = (yrs == null) ? 10 : yrs <= 3 ? 10 : yrs <= 7 ? 13 : yrs <= 12 ? 17 : 22;
  if (_HY_RE.test(combined)) s += 14;
  return s;
}

// Treasury / government bond FUNDS scored by duration (matches the verified table:
// SGOV 5 · SHY 15 · VGSH 14 · IEF 28 · VGIT 26 · TLT 35 · VGLT 35 · EDV 40)
function _treasuryFundDuration(s) {
  s = (s || '').toLowerCase();
  if (/\b(bills?|ultra[- ]?short|floating|float)\b|0-3 ?mo|0-3 month|1-3 month|0-1 year|money market/.test(s))
    return { score: 5,  label: 'Treasury Bill / Floating Rate Fund' };
  if (/\btips\b|inflation/.test(s))
    return /\bshort\b|0-5|1-5/.test(s) ? { score: 20, label: 'Short-Term TIPS Fund' } : { score: 28, label: 'TIPS Fund' };
  if (/\b(long|extended|zero coupon|strips)\b|20\+|25\+|10\+|10-20|20-30|25-30/.test(s))
    return { score: 37, label: 'Long-Term Treasury Fund' };
  if (/\b(intermediate|interm|int-term)\b|3-7|3-10|5-10|7-10/.test(s))
    return { score: 27, label: 'Intermediate Treasury Fund' };
  if (/\bshort\b|short-term|1-3|0-5|1-5/.test(s))
    return { score: 14, label: 'Short-Term Treasury Fund' };
  return { score: 26, label: 'Government Bond Fund' };
}

function _isIndividualTreasury(h, combined) {
  if (!_TSY_WORD_RE.test(combined) || _FOREIGN_GOV_RE.test(combined)) return false;
  if (_looksLikeFund(h)) return false;
  if (/money market|\bmmf\b|sweep/.test(combined)) return false;
  // "...digital asset treasury company" etc. — a stock, not a Treasury
  if (/\b(stock|equity|common|adr|inc|corp|company|holdings)\b/.test(combined) && !_COUPON_RE.test(h.name || '')) return false;
  const t = (h.ticker || '').replace(/\s/g, '');
  return _COUPON_RE.test(h.name || '') ||
         /\b(bills?|notes?|nts|bonds?|bds|strips|tips)\b/.test(combined) ||
         /^912/.test(t) ||                                   // Treasury CUSIPs start with 912
         /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(h.name || '');
}

function _structuredHit(combined, type, fundLike) {
  const isBank = STRUCTURED_ISSUERS.some(b => new RegExp('\\b' + b.replace(/ /g, '\\s+') + '\\b').test(combined));
  // Defined-outcome / buffer ETFs are funds — not notes (they go to the table or AI, ~45)
  if (fundLike && !/\bnotes?\b|structured/.test(type)) return { strong: false, isBank };
  const strong = _STRUCT_STRONG.some(k => combined.includes(k)) ||
                 /\bfin(?:l|ance)?\s+(?:co\s+)?llc\b/.test(combined) ||      // "JPMorgan Chase Finl Co LLC", "GS Finance LLC"
                 /\bstructured\b|\bnotes?\b/.test(type) ||
                 (isBank && /\bnotes?\b|\bnote due\b|\bmtn\b|\bbuffered?\b|\bbarrier\b|\bcapped\b/.test(combined));
  return { strong, isBank };
}

function _noteTypeLabel(combined) {
  return /buffer/.test(combined) ? 'Buffer Note'
    : /autocall|auto-call|auto call|phoenix/.test(combined) ? 'Autocall Note'
    : /barrier/.test(combined) ? 'Barrier Note'
    : /reverse convertible|reverse exchangeable/.test(combined) ? 'Reverse Convertible Note'
    : /principal protected|capital protected/.test(combined) ? 'Principal Protected Note'
    : /leveraged|enhanced participation|participation/.test(combined) ? 'Participation Note'
    : 'Structured Note';
}

function classifyHolding(h) {
  const rawName  = (h.name || '').trim();
  const name     = rawName.toLowerCase();
  const ticker   = (h.ticker || h.cusip || '').trim().toUpperCase();
  const type     = (h.type || '').toLowerCase();
  const combined = name + ' ' + type;
  const fundLike = _looksLikeFund(h);

  // ── CASH / MONEY MARKET / SWEEP / INSURED DEPOSITS → 5 ──
  const isMMTicker = /^[A-Z]{3}XX$/.test(ticker);      // money market funds end in "XX" (SPAXX, VMFXX, AGPXX…)
  const mmWords    = /money market|\bmmkt\b|\bmmf\b|\bsweep\b|insured cash|insured deposit|\bfdic\b|bank deposit|deposit (program|account|sweep)|cash reserves?/.test(combined);
  const cashLabel  = ticker === 'CASH' || name === 'cash' || /^cash\b/.test(name) ||
                     (/\bcash\b/.test(type) && !/cash flow|cashflow|cash cow/.test(combined)) ||
                     /\bsavings\b/.test(type);
  // Custodians often label ultra-short / muni BOND funds "Cash Alternatives" — those are not cash
  const bondFundInCashClothing = cashLabel && fundLike && !mmWords && !isMMTicker &&
        /\b(bond|income|duration|ultra|short|muni|municipal|treasury|floating|credit|enhanced|maturity)\b/.test(name);
  if (isMMTicker || mmWords || (cashLabel && !bondFundInCashClothing))
    return { score: 5, type: 'Cash / Money Market' };

  // ── VARIABLE ANNUITIES → 50 (checked before the generic annuity rule) ──
  const isVA = /variable annuit|var annuity|variable insurance|subaccount|sub-account|sub account/.test(combined) ||
               type.trim() === 'variable' ||                         // eMoney exports "Variable" for VAs
               (/\bvariable\b/.test(combined) && /annuit/.test(combined));
  if (isVA) return { score: 50, type: 'Variable Annuity' };

  // ── FIXED / INDEXED / RILA / MYGA ANNUITIES → 5 ──
  // (The old rule matched ANY type containing "insurance", which turned insurance-sector
  //  ETFs and insurance stocks into annuities at 5.)
  const isAnnuity = /annuit/.test(combined) ||
        /fixed[- ]indexed|\bmyga\b|multi[- ]year guaranteed|point[- ]to[- ]point|\bfia\b|\brila\b|registered index[- ]linked|insurance (product|contract)/.test(combined) ||
        (/^\s*(insurance|insurance\/annuity)\s*$/.test(type) && !_isTradableTicker(ticker));
  if (isAnnuity) return { score: 5, type: 'Annuity' };

  // ── CDs (brokered, callable, market-linked) → 5 ──
  const isCD = CD_KEYWORDS.some(k => combined.includes(k)) ||
               /market[- ]linked cd|\bmlcd\b/.test(combined) ||
               /\bcds?\b/.test(type) ||
               (!fundLike && /\bcds?\b/.test(name) && (_COUPON_RE.test(rawName) || /\b(bank|bk|na|fsb|ssb)\b/.test(name) || isCusip(ticker)));
  if (isCD) return { score: 5, type: 'CD' };

  // ── INDIVIDUAL US TREASURY SECURITIES → 5 (firm rule) ──
  if (_isIndividualTreasury(h, combined)) {
    return { score: 5, type: /\bbills?\b|t-bill|tbill/.test(combined) ? 'US Treasury Bill' : 'US Treasury' };
  }

  // ── TREASURY / GOVERNMENT BOND FUNDS → scored by duration ──
  if (fundLike && _TSY_WORD_RE.test(combined) && !_FOREIGN_GOV_RE.test(combined) && !/\b(equity|stock)\b/.test(combined)) {
    const d = _treasuryFundDuration(combined);
    return { score: d.score, type: d.label, note: 'duration' };
  }

  const sh = _structuredHit(combined, type, fundLike);

  // ── INDIVIDUAL BONDS (muni, corporate, agency) → 10–36 by maturity & credit ──
  const looksIndividualBond = !fundLike && !sh.strong && (
        BOND_KEYWORDS.some(k => combined.includes(k)) || _AGENCY_RE.test(combined) ||
        (_COUPON_RE.test(rawName) && (
            /\b(due|dtd|b\/e|mat|matures?|sr|nt|nts|notes?|bds?|bonds?|rev|go|gen oblig|ref|deb|debs)\b/.test(name) ||
            /\d{1,2}\/\d{1,2}\/\d{2,4}|\b\d{6}\b/.test(rawName) || isCusip(ticker))) ||
        /^(corporate|municipal|agency|individual) bonds?$/.test(type.trim()));
  if (looksIndividualBond) {
    const kind = /municipal|\bmuni\b|\brevs?\b|\bgo\b|gen oblig|authority|\bauth\b|school dist|county|\bcnty\b|\bcity of\b|\bcivic\b|\bimpt\b|\bdorm\b|\btpk\b|turnpike|\bwtr\b|\bswr\b|\bhosp\b|\bisd\b|\bpub\b/.test(combined) ? 'Municipal Bond'
      : (_AGENCY_RE.test(combined) || /\bagency\b/.test(combined)) ? 'Agency Bond'
      : /corporate|\bcorp\b|\binc\b|\bco\b|\bllc\b|\bplc\b/.test(combined) ? 'Corporate Bond'
      : 'Individual Bond';
    return { score: _individualBondScore(combined, rawName), type: kind };
  }

  // ── STRUCTURED NOTES → 30 (flat, all types) ──
  if (sh.strong) return { score: 30, type: _noteTypeLabel(combined) };

  // Unknown CUSIP with no other clues — usually a structured note in advisory books.
  // Scored 30 but flagged in Score Check so the advisor can confirm.
  if (isCusip(ticker) && !fundLike) return { score: 30, type: _noteTypeLabel(combined), note: 'cusip-only' };

  return null;
}

// ── The single resolver every module uses ──
function resolveHoldingScore(h) {
  const t = (h.ticker || '').toUpperCase().trim();
  const n = parseFloat(h.risk_score);
  if (h._manualOverride && !isNaN(n)) return { score: Math.round(n), type: h.type, src: 'manual' };
  if (t && TICKER_SCORES[t] !== undefined) return { score: TICKER_SCORES[t], type: h.type, src: 'table' };
  const c = classifyHolding(h);
  if (c) return { score: c.score, type: c.type, src: 'rule', note: c.note };
  if (h._src === 'fallback') return { score: 50, type: h.type, src: 'fallback' };
  if (t && _sessionScoreCache[t] !== undefined) return { score: _sessionScoreCache[t], type: h.type, src: 'ai' };
  if (!isNaN(n) && n > 0) return { score: Math.round(n), type: h.type, src: 'ai' };
  return { score: 50, type: h.type, src: 'fallback' };
}

function applyResolvedScore(h) {
  const r = resolveHoldingScore(h);
  h.risk_score = r.score;
  h.risk_level = riskLevelLabel(r.score);
  if (r.src === 'rule' && r.type) h.type = r.type;     // rules supply a precise label
  else if (r.src === 'table' && (!h.type || /^(multiple|other|n\/?a|unknown|-+)$/i.test(h.type.trim()))) {
    const c = classifyHolding(h);                        // e.g. "Multiple" → "Cash / Money Market"
    if (c && c.type) h.type = c.type;
  }
  if (isGenericType(h.type)) {                           // e.g. "Multiple" → "Mid Cap ETF"
    const cat = inferFundCategory(h);
    if (cat) h.type = cat;
  }
  h._src = r.src;
  if (r.note) h._srcNote = r.note; else delete h._srcNote;
  return h;
}


// ══ FUND CATEGORY LABELS ══
// Custodian exports (LPL especially) often label every fund "Multiple". When the type is
// generic, infer a readable category from the fund name + score. Display only — scores
// never change, but the clearer label also improves the stress-test asset mapping.
const _GENERIC_TYPE_RE = /^\s*(multiple|other|others|n\/?a|unknown|-+|equity|equities|fixed income|etfs?|exchange[- ]traded funds?|mutual funds?|funds?|stocks?|securities|security|open end fund|closed end fund)?\s*$/i;
function isGenericType(t) { return _GENERIC_TYPE_RE.test(t || ''); }

function inferFundCategory(h) {
  const nm = (h.name || '').toLowerCase();
  const tk = (h.ticker || '').toUpperCase();
  const s  = parseFloat(h.risk_score);
  const sc = isNaN(s) ? 50 : s;
  if (!nm) return null;
  const isETF = /\betfs?\b|ishares|spdr|\bshares trust\b/.test(nm);
  const isMF  = !isETF && (/\bfund\b|;\s*[a-z0-9]+\s*$|\b(admiral|investor|instl|institutional|class [a-z0-9])\b/.test(nm) || /^[A-Z]{4}X$/.test(tk));
  const veh   = isETF ? ' ETF' : isMF ? ' Fund' : '';
  const has   = re => re.test(nm);

  if (/^[A-Z]{3}XX$/.test(tk) || has(/money market|liquid assets|cash reserves|(government|treasury) obligations|cash management/)) return 'Cash / Money Market';

  // Bond categories — only when the score or name says it's really a bond fund
  if (sc <= 45 || has(/\bbonds?\b/)) {
    const b =
      has(/multi[- ]?sector/)                                        ? 'Multi-Sector Bond' :
      has(/municipal|\bmuni\b|tax[- ](exempt|free)/)                  ? 'Municipal Bond' :
      has(/high[- ]yield|high income|\bjunk\b|fallen angel/)          ? 'High Yield Bond' :
      has(/securitized|mortgage|\bmbs\b|\bclo\b|asset[- ]backed/)     ? 'Securitized Bond' :
      has(/\btips\b|inflation/)                                       ? 'TIPS / Inflation Bond' :
      has(/floating rate|bank loan|senior loan|leveraged loan/)       ? 'Floating Rate / Bank Loan' :
      has(/emerging markets? (debt|bond)|\bem debt\b/)                ? 'Emerging Markets Bond' :
      has(/treasury|government|govt/)                                 ? 'Government Bond' :
      has(/ultra[- ]?short|short[- ]term|short duration|enhanced cash|short maturity|limited[- ]term/) ? 'Short-Term Bond' :
      has(/international bond|global bond|world bond|intl bond|global aggregate/) ? 'International Bond' :
      has(/corporate|investment grade|\bcredit\b/)                    ? 'Corporate Bond' :
      has(/\bbonds?\b|aggregate|core plus|core fixed|fixed income|total return|\bincome\b/) ? 'Core Bond' : null;
    if (b) return b + veh;
  }

  if (!veh && !has(/\b(trust|portfolio|index|strategy)\b/)) {
    // No fund markers: an individual stock
    return sc >= 55 && /^[A-Z]{1,5}(\.[A-Z])?$/.test(tk) ? 'Stock' : null;
  }

  const e =
    has(/bitcoin|ether(eum)?\b|crypto|digital asset|blockchain/)                 ? 'Crypto' :
    has(/\bgold\b|silver|precious metal|commodit|\boil\b|natural gas|uranium/)   ? 'Commodities' :
    has(/real estate|\breit|realty|property/)                                    ? 'Real Estate' :
    has(/buffer|defined outcome|structured outcome|hedged equity|downside protect/) ? 'Buffered / Defined Outcome' :
    has(/premium income|covered call|buy[- ]?write|option income|yieldmax|enhanced income/) ? 'Equity Income / Options' :
    has(/managed futures|market neutral|long[- ]short|multi[- ]strat|merger|event driven|alternative|absolute return/) ? 'Alternatives' :
    has(/balanced|allocation|target (date|retirement)|retirement 20\d\d|\b20[2-7]\d fund|lifestrategy|moderate growth|conservative growth/) ? 'Balanced / Allocation' :
    has(/emerging/)                                                              ? 'Emerging Markets Equity' :
    has(/international|\bintl\b|eafe|ex[- ]?us|developed markets?|foreign|global|world|europe|japan|pacific|overseas|acwi/)
      ? (has(/value/) ? 'International Value' : has(/small/) ? 'International Small Cap' : 'International Equity') :
    has(/small[- ]?cap|smallcap|russell 2000|small company|microcap/)            ? 'Small Cap' :
    has(/mid[- ]?cap|midcap|mid company/)                                        ? 'Mid Cap' :
    has(/semiconductor|technology|\btech\b|health ?care|biotech|pharma|financials?\b|banks?\b|energy|utilities|industrials?|consumer|communication|materials|innovation|cloud|cyber|robotic|artificial intelligence|\bai\b|clean|infrastructure|aerospace|defense/) ? 'Sector / Thematic' :
    has(/dividend|equity income|high yield equity|shareholder yield/)            ? 'Dividend Equity' :
    has(/nasdaq|growth/)                                                         ? 'Large Cap Growth' :
    has(/value/)                                                                 ? 'Large Cap Value' :
    has(/s ?& ?p 500|s and p 500|\b500\b|total (stock )?market|large[- ]?cap|blue chip|quality|equal weight|core equity|us equity|stock index|stock market/) ? 'Large Cap Blend' :
    null;
  return e ? e + veh : null;
}

const SCORE_SRC_LABELS = {
  table: 'Verified ticker table', rule: 'Rule-based (asset type)', ai: 'AI estimate',
  manual: 'Manual override', fallback: 'Default 50 — no score found'
};

// ── One asset-class bucket function used by every allocation view ──
// (Previously each view guessed from the risk score — e.g. anything ≤ 6 was "Cash",
//  so a mis-scored bond fund also showed up as cash, and "Healthcare" matched "alt".)
function assetBucket(h) {
  const t  = (h.type || '').toLowerCase();
  const nm = (h.name || '').toLowerCase();
  const s  = parseFloat(h.risk_score);
  const sc = isNaN(s) ? 50 : s;
  if (/debit/.test(t)) return 'Debit';
  if (/annuit/.test(t)) return 'Annuities';
  if (/structured|buffer note|autocall|barrier note|reverse convertible|participation note|principal protected/.test(t)) return 'Structured Notes';
  const notCashFlow = !/cash flow|cashflow|cash cow/.test(t + ' ' + nm);
  if (/\bcash\b|money market|sweep|\bcds?\b|certificate of deposit|treasury bill|floating rate fund/.test(t) && notCashFlow && sc <= 8) return 'Cash';
  if (sc <= 6 && !/bond|fixed|treasury|municipal|muni|income|note/.test(t)) return 'Cash';
  if (/bond|fixed income|treasury|municipal|\bmuni|securitized|mortgage|\btips\b|government|duration|aggregate|high yield|floating rate|\bclo\b|credit|preferred/.test(t)) return 'Fixed Income';
  if (sc <= 40) return 'Fixed Income';
  if (/\balt\b|alternative|commodit|real asset|gold|silver|precious|managed futures|market neutral|long[- ]short|multi[- ]strat|crypto|bitcoin|digital asset/.test(t)) return 'Alternatives';
  return 'Equities';
}

// ══ SCORE CHECK — flags holdings whose score deserves a second look ══
let _scoreCheckOpen = null;   // remembers whether the advisor opened/closed the panel
function scoreCheckIssues(h) {
  if (h._manualOverride) return [];                    // advisor already reviewed it
  const issues = [];
  const t = (h.type || '').toLowerCase(), nm = (h.name || '').toLowerCase(), txt = t + ' ' + nm;
  const s = parseFloat(h.risk_score);
  if (h._src === 'fallback') issues.push('No score could be found — defaulted to 50. Please verify.');
  if (h._srcNote === 'cusip-only') issues.push('Identified only by its CUSIP — scored as a structured note (30). Confirm what it is.');
  const cashish = (/money market|sweep|\bcash\b|\bcds?\b|certificate|annuit|\bbills?\b|floating rate fund|government (&|and) agency|govt (&|and) agency/.test(txt) && !/cash flow|cash cow/.test(txt)) ||
                  /^[A-Z]{3}XX$/.test((h.ticker || '').toUpperCase());
  if (s <= 6 && !cashish && t !== 'us treasury' &&
      /bond|income|duration|fixed|treasury|govt|government|municipal|\bmuni|credit|mortgage|securitized|aggregate|\btips\b/.test(txt))
    issues.push('Bond holding scored like cash (≤ 6). Bond funds usually score 12–40 depending on duration.');
  if (s < 40 && /\b(stock|equity|growth|small cap|mid cap|large cap|emerging|technology|sector)\b/.test(txt) &&
      !/annuit|structured|note|buffer|income|bond|hedged|defined outcome/.test(txt))
    issues.push('Equity holding with an unusually low score.');
  if (s >= 60 && /\b(bond|treasury|municipal|muni|fixed income|money market)\b/.test(t) &&
      !/high yield|emerging|convertible|leveraged|inverse|2x|3x/.test(txt))
    issues.push('Bond / cash holding with an unusually high score.');
  return issues;
}

function buildScoreCheckHTML() {
  if (!_portfolioAccounts || !_portfolioAccounts.length) return '';
  const counts = { table: 0, rule: 0, ai: 0, manual: 0, fallback: 0 };
  const flagged = [], aiRows = [];
  _portfolioAccounts.forEach((acct, ai) => (acct.holdings || []).forEach((h, hi) => {
    const src = h._manualOverride ? 'manual' : (h._src || 'ai');
    counts[src] = (counts[src] || 0) + 1;
    const issues = scoreCheckIssues(h);
    if (issues.length) flagged.push({ h, ai, hi, msg: issues.join(' ') });
    else if (src === 'ai') aiRows.push({ h, ai, hi, msg: 'AI estimate — this ticker is not in the verified table yet.' });
  }));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return '';
  const chip = (n, label, bg, col) => n ? `<span style="font-size:.66rem;font-weight:700;padding:3px 10px;border-radius:20px;background:${bg};color:${col};white-space:nowrap">${label} ${n}</span>` : '';
  const row = (r, warn) => `
    <div style="display:grid;grid-template-columns:64px 1fr 44px 58px;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #eef1f5">
      <span class="ticker-badge" style="justify-self:start">${r.h.ticker || '—'}</span>
      <div><div style="font-size:.76rem;font-weight:700;color:var(--navy)">${r.h.name || '—'}</div>
           <div style="font-size:.68rem;color:${warn ? '#b45309' : '#6b7e96'};margin-top:2px">${warn ? '⚠️ ' : ''}${r.msg}</div></div>
      <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:1rem;color:${riskColor(parseFloat(r.h.risk_score) || 50)};text-align:center">${Math.round(parseFloat(r.h.risk_score) || 50)}</div>
      <button class="row-act-btn" style="width:auto;padding:4px 10px" onclick="openRiskEdit(${r.ai},${r.hi},event)">Edit</button>
    </div>`;
  const openAttr = (_scoreCheckOpen === null ? flagged.length > 0 : _scoreCheckOpen) ? ' open' : '';
  return `
    <details class="section-card" style="margin-bottom:16px;padding:14px 18px" ontoggle="_scoreCheckOpen=this.open"${openAttr}>
      <summary style="cursor:pointer;display:flex;align-items:center;gap:10px;flex-wrap:wrap;list-style:none">
        <span style="font-size:.7rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--navy)">🔎 Score Check</span>
        ${flagged.length ? chip(flagged.length, '⚠ To review', '#fff3e0', '#b45309') : chip(1, '✓ Nothing flagged', '#e6f4ed', '#1d7a50').replace(' 1<', '<')}
        ${chip(counts.table, 'Verified', '#e8f0fa', '#2563a8')}
        ${chip(counts.rule, 'Rule-based', '#f0f2f5', '#4a5b70')}
        ${chip(counts.ai, 'AI estimate', '#f5eed8', '#8a6d1f')}
        ${chip(counts.manual, 'Manual', '#f3eeff', '#7c3aed')}
        ${chip(counts.fallback, 'Defaulted', '#fde8e8', '#c0392b')}
        <span style="flex:1"></span><span style="font-size:.62rem;color:var(--slate-lt)">click to show / hide details</span>
      </summary>
      <div style="margin-top:12px;font-size:.7rem;color:var(--slate);line-height:1.6">
        Every score comes from one of five sources: the <strong>verified ticker table</strong>, a <strong>rule</strong> for the asset type
        (cash, annuities, CDs, individual bonds, structured notes, Treasury funds by duration), an <strong>AI estimate</strong>,
        a <strong>manual</strong> edit, or a <strong>default</strong> when nothing was found. Holdings that look out of line are listed first.
      </div>
      ${flagged.length ? `<div style="margin-top:10px">${flagged.map(r => row(r, true)).join('')}</div>` : ''}
      ${aiRows.length ? `<div style="margin-top:12px;font-size:.6rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8a6d1f">AI estimates (${aiRows.length})</div>${aiRows.map(r => row(r, false)).join('')}` : ''}
      ${!flagged.length && !aiRows.length ? '<div style="margin-top:10px;font-size:.74rem;color:#1d7a50;font-weight:600">✓ Every holding was scored from the verified table, a firm rule, or a manual edit.</div>' : ''}
    </details>`;
}


// Mammoth DOCX support (lazy load)
const mammoth = {
  extractRawText: async ({ arrayBuffer }) => {
    if (!window._mammoth) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    return window.mammoth.extractRawText({ arrayBuffer });
  }
};
