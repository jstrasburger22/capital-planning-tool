/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Single stock/ETF analyzer, ticker scoring tables and data
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
    ${d.analysis    ? '<div class="sr-analysis">' + d.analysis + '</div>' : ''}`;
}

// ══ TICKER SCORING ══
// ── TICKER SCORE DATABASE ──
// Scores are Nitrogen (Riskalyze) calibrated 0-100. Last reviewed: 2026-03.
// Session cache: unknown tickers scored via web search are cached for the session.
// Refresh cycle: stale entries (6+ months) are re-verified on next lookup.

const TICKER_SCORE_META = {
  version: '2026.03',
  reviewed: '2026-03-06',
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

function classifyHolding(h) {
  const name    = (h.name||'').toLowerCase();
  const ticker  = (h.ticker||'').trim();
  const type    = (h.type||'').toLowerCase();
  const combined = name + ' ' + type;

  // ── CASH / MONEY MARKET / INSURED DEPOSITS → score: 5 ──
  // Includes: cash, sweeps, money market funds, insured cash accounts, bank deposits
  if (
    ticker === 'CASH' || name === 'cash' ||
    type.includes('money market') || name.includes('money market') ||
    name.includes('sweep') || name.includes('insured cash') ||
    name.includes('fdic') || name.includes('bank deposit') ||
    type.includes('cash') || type.includes('savings')
  ) return { score:5, type:'Cash / Money Market' };

  // ── VARIABLE ANNUITIES → score: 50 ──
  // Variable annuities have real market exposure through subaccounts; treated as moderate risk.
  // Checked BEFORE the generic annuity catch so variable VAs don't fall through to score 5.
  const isVariableAnnuity =
    combined.includes("variable annuity") || combined.includes("variable annuities") ||
    combined.includes("var annuity") ||
    type.includes("variable annuity") || type.includes("variable insurance") ||
    type === "variable" ||   // eMoney exports "Variable" as the asset class for VAs
    // "variable" + "annuity" anywhere in name (handles "ABC Variable XYZ Annuity")
    (combined.includes("variable") && (combined.includes("annuity") || combined.includes("annuit"))) ||
    // VA subaccounts
    combined.includes("subaccount") || combined.includes("sub-account") || combined.includes("sub account");
  if (isVariableAnnuity) return { score: 50, type: "Variable Annuity" };

  // ── ANNUITIES → score: 5 ──
  // Fixed, fixed-indexed, MYGA, structured annuities — all insurance products
  // Checked BEFORE structured notes — a "structured annuity" is still an annuity
  const isAnnuity =
    combined.includes("annuity") || combined.includes("annuitie") ||
    combined.includes("fixed indexed") || combined.includes("fixed-indexed") ||
    combined.includes("myga") || combined.includes("multi-year guaranteed") ||
    combined.includes("variable annuity") || combined.includes("immediate annuity") ||
    combined.includes("deferred annuity") || combined.includes("income annuity") ||
    combined.includes("point-to-point") || combined.includes("point to point") ||
    combined.includes("index annuity") || combined.includes("indexed annuity") ||
    combined.includes("fia ") || combined.includes("rila") ||
    type.includes("annuity") || type.includes("insurance product") || type.includes("insurance");
  if (isAnnuity) return { score:5, type:"Annuity" };

  // ── CDs → score: 5 ──
  // Brokered CDs, callable CDs, market-linked CDs — all treated as conservative cash-like
  if (
    CD_KEYWORDS.some(k => combined.includes(k)) ||
    combined.includes('market linked cd') || combined.includes('market-linked cd') || combined.includes('mlcd')
  ) return { score:5, type:'CD' };

  // ── US TREASURIES, GOVT MONEY MARKET, T-BILLS → score: 5 ──
  // Any US government-issued security is treated as conservative (score 5)
  const isTreasury =
    combined.includes('treasury') || combined.includes('t-note') || combined.includes('t-bond') ||
    combined.includes('t-bill') || combined.includes('tbill') || combined.includes('t bill') ||
    combined.includes('united states treasury') || combined.includes('us treasury') ||
    combined.includes('u.s. treasury') || combined.includes('u.s. govt') ||
    combined.includes('us govt') || combined.includes('united states govt') ||
    combined.includes('government money market') || combined.includes('govt money market') ||
    combined.includes('federal money market') ||
    // Treasury ETFs / tickers
    ticker === 'BIL' || ticker === 'SHV' || ticker === 'SGOV' || ticker === 'TBLL' ||
    ticker === 'USFR' || ticker === 'CLTL' || ticker === 'TFLO' || ticker === 'VGSH' ||
    ticker === 'IEF' || ticker === 'TLT' || ticker === 'GOVT' || ticker === 'SCHO' ||
    ticker === 'SCHR' || ticker === 'SCHQ' || ticker === 'VGIT' || ticker === 'VGLT';
  if (isTreasury) return { score:5, type:'US Treasury' };

  // ── INDIVIDUAL BONDS → score: 10 ──
  // Munis, corporates, agency bonds
  if (BOND_KEYWORDS.some(k => combined.includes(k))) {
    const bondType = combined.includes('municipal') || combined.includes(' muni') ? 'Municipal Bond'
      : combined.includes('corporate') ? 'Corporate Bond'
      : combined.includes('agency') ? 'Agency Bond'
      : 'Individual Bond';
    return { score:10, type: bondType };
  }

  // ── STRUCTURED NOTES → score: 30 (flat, all types) ──
  // Includes: buffer notes, autocalls, barrier notes, reverse convertibles,
  // principal protected notes, any CUSIP-identified or bank-issued note
  const isBank = STRUCTURED_ISSUERS.some(b => combined.includes(b));
  const isNote = STRUCTURED_KEYWORDS.some(k => combined.includes(k)) || type.includes('note') || type.includes('structured');

  if (!isAnnuity && (isCusip(ticker) || (isBank && isNote) || STRUCTURED_KEYWORDS.some(k => combined.includes(k)))) {
    // Preserve the descriptive type label for display, but score is always 30
    const noteType = combined.includes('buffer') || combined.includes('buffered') ? 'Buffer Note'
      : combined.includes('autocall') || combined.includes('phoenix') ? 'Autocall Note'
      : combined.includes('barrier') ? 'Barrier Note'
      : combined.includes('reverse convertible') ? 'Reverse Convertible Note'
      : combined.includes('principal protected') || combined.includes('capital protected') ? 'Principal Protected Note'
      : combined.includes('leveraged') || combined.includes('enhanced participation') ? 'Participation Note'
      : 'Structured Note';
    return { score:30, type: noteType };
  }

  return null;
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
