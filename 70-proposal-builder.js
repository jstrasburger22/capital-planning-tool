/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — Portfolio proposal builder — sleeves, comparisons, exports
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════════════
// CAPITAL PLANNING MODELS — Full data with sleeves, trade logs, returns
// ══════════════════════════════════════════════════════════════════════

const CAPITAL_PLANNING_MODELS = [

{
  id: 'cp-allcapworld2',
  name: 'All Cap World Focused 2',
  profile: 'Tactically Managed',
  benchmark: 'MSCI ACWI',
  inception: '2019-01-01',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [
    { year: 2025, model: 8.06,  bench: 20.42 },
    { year: 2024, model: 19.95, bench: 15.46 },
    { year: 2023, model: 16.55, bench: 19.90 },
    { year: 2022, model: -17.86,bench: -19.76 },
    { year: 2021, model: 20.18, bench: 16.60 },
    { year: 2020, model: 46.41, bench: 14.47 },
    { year: 2019, model: 25.64, bench: 23.52 },
  ],
  events: [
    { id:'ac1',  date:'2023-03-31', type:'add',    ticker:'EFA',  notes:'New position meets model criteria — BUY @71.52' },
    { id:'ac2',  date:'2023-03-31', type:'add',    ticker:'QQEW', notes:'New position meets model criteria — BUY @100.65' },
    { id:'ac3',  date:'2023-03-31', type:'remove', ticker:'RPV',  notes:'Fund Score Rank > Threshold — SELL @75.90 (bought @77.97)' },
    { id:'ac4',  date:'2023-03-31', type:'remove', ticker:'RSP',  notes:'Fund Score Rank > Threshold — SELL @144.62 (bought @136.49)' },
    { id:'ac5',  date:'2023-05-31', type:'add',    ticker:'QQQ',  notes:'New position meets model criteria — BUY @347.99' },
    { id:'ac6',  date:'2023-05-31', type:'remove', ticker:'EFA',  notes:'Fund Score Rank > Threshold — SELL @70.67 (bought @71.52)' },
    { id:'ac7',  date:'2024-02-02', type:'remove', ticker:'QQEW', notes:'Fund Score Rank > Threshold — SELL @119.98 (bought @100.65)' },
    { id:'ac8',  date:'2024-02-02', type:'add',    ticker:'MTUM', notes:'New position meets model criteria — BUY @172.89' },
    { id:'ac9',  date:'2024-03-28', type:'add',    ticker:'ILCG', notes:'New position meets model criteria — BUY @75.48' },
    { id:'ac10', date:'2024-03-28', type:'remove', ticker:'QQQ',  notes:'Fund Score Rank > Threshold — SELL @444.01 (bought @347.99)' },
    { id:'ac11', date:'2024-08-02', type:'remove', ticker:'MTUM', notes:'Fund Score Rank > Threshold — SELL @179.40 (bought @172.89)' },
    { id:'ac12', date:'2024-08-02', type:'add',    ticker:'SPY',  notes:'New position meets model criteria — BUY @532.90' },
    { id:'ac13', date:'2024-08-02', type:'add',    ticker:'ILCB', notes:'New position meets model criteria — BUY @73.51' },
    { id:'ac14', date:'2024-08-02', type:'remove', ticker:'ILCG', notes:'Fund Score Rank > Threshold — SELL @76.69 (bought @75.48)' },
    { id:'ac15', date:'2024-09-30', type:'add',    ticker:'IMCG', notes:'New position meets model criteria — BUY @72.97' },
    { id:'ac16', date:'2024-09-30', type:'remove', ticker:'SPY',  notes:'Fund Score Rank > Threshold — SELL @573.76 (bought @532.90)' },
    { id:'ac17', date:'2024-12-31', type:'add',    ticker:'ILCG', notes:'New position meets model criteria — BUY @89.60' },
    { id:'ac18', date:'2024-12-31', type:'remove', ticker:'ILCB', notes:'Fund Score Rank > Threshold — SELL @81.16 (bought @73.51)' },
    { id:'ac19', date:'2025-02-03', type:'remove', ticker:'ILCG', notes:'Fund Score Rank > Threshold — SELL @91.12 (bought @89.60)' },
    { id:'ac20', date:'2025-02-03', type:'add',    ticker:'RPG',  notes:'New position meets model criteria — BUY @43.34' },
    { id:'ac21', date:'2025-02-28', type:'add',    ticker:'MTUM', notes:'New position meets model criteria — BUY @218.43' },
    { id:'ac22', date:'2025-02-28', type:'remove', ticker:'IMCG', notes:'Fund Score Rank > Threshold — SELL @76.44 (bought @72.97)' },
    { id:'ac23', date:'2025-03-31', type:'add',    ticker:'SPY',  notes:'New position meets model criteria — BUY @559.39' },
    { id:'ac24', date:'2025-03-31', type:'remove', ticker:'RPG',  notes:'Fund Score Rank > Threshold — SELL @38.25 (bought @43.34)' },
    { id:'ac25', date:'2025-05-05', type:'add',    ticker:'IDLV', notes:'New position meets model criteria — BUY @32.41' },
    { id:'ac26', date:'2025-05-05', type:'remove', ticker:'SPY',  notes:'Fund Score Rank > Threshold — SELL @563.51 (bought @559.39)' },
    { id:'ac27', date:'2025-05-30', type:'add',    ticker:'RPG',  notes:'New position meets model criteria — BUY @42.86' },
    { id:'ac28', date:'2025-05-30', type:'remove', ticker:'IDLV', notes:'Fund Score Rank > Threshold — SELL @32.97 (bought @32.41)' },
    { id:'ac29', date:'2025-08-29', type:'add',    ticker:'ILCG', notes:'New position meets model criteria — BUY @100.16' },
    { id:'ac30', date:'2025-08-29', type:'remove', ticker:'MTUM', notes:'Fund Score Rank > Threshold — SELL @243.73 (bought @218.43)' },
    { id:'ac31', date:'2025-09-30', type:'add',    ticker:'MTUM', notes:'New position meets model criteria — BUY @256.45' },
    { id:'ac32', date:'2025-09-30', type:'remove', ticker:'RPG',  notes:'Fund Score Rank > Threshold — SELL @47.72 (bought @42.86)' },
    { id:'ac33', date:'2025-11-03', type:'add',    ticker:'QQQ',  notes:'New position meets model criteria — BUY @632.08' },
    { id:'ac34', date:'2025-11-03', type:'remove', ticker:'MTUM', notes:'Fund Score Rank > Threshold — SELL @253.52 (bought @256.45)' },
    { id:'ac35', date:'2025-11-28', type:'add',    ticker:'EEM',  notes:'New position meets model criteria — BUY @54.32' },
    { id:'ac36', date:'2025-11-28', type:'remove', ticker:'ILCG', notes:'Fund Score Rank > Threshold — SELL @104.22 (bought @100.16)' },
    { id:'ac37', date:'2026-02-27', type:'remove', ticker:'QQQ',  notes:'Fund Score Rank > Threshold — SELL @607.29 (bought @632.08)' },
    { id:'ac38', date:'2026-02-27', type:'add',    ticker:'RPG',  notes:'New position meets model criteria — BUY @49.83' },
    { id:'ac39', date:'2026-04-01', type:'remove', ticker:'RPG',  notes:'Fund Score Rank > Threshold — SELL (replaced with RPV)' },
    { id:'ac40', date:'2026-04-01', type:'add',    ticker:'RPV',  notes:'New position meets model criteria — BUY (value tilt shift)' },
    { id:'ac41', date:'2026-05-05', type:'remove', ticker:'RPV',  notes:'Fund Score Rank > Threshold — SELL (replaced with RPG)' },
    { id:'ac42', date:'2026-05-05', type:'remove', ticker:'EEM',  notes:'Fund Score Rank > Threshold — SELL (bought 11/28/2025)' },
    { id:'ac43', date:'2026-05-05', type:'add',    ticker:'RPG',  notes:'New position meets model criteria — BUY (pure growth tilt)' },
    { id:'ac44', date:'2026-05-05', type:'add',    ticker:'MTUM', notes:'New position meets model criteria — BUY (momentum factor)' },
  ],
  sleeves: [
    { name: 'Current', published_score: 87, holdings: [
      { ticker:'RPG', name:'Invesco S&P 500 Pure Growth ETF', type:'ETF', weight:50, risk_score:86 },
      { ticker:'MTUM', name:'iShares MSCI USA Momentum Factor ETF', type:'ETF', weight:50, risk_score:80 }
    ]}
  ]
},

{
  id: 'cp-biblical-strat-core',
  name: 'Biblically-Based Strategic Core',
  profile: 'Strategic',
  benchmark: 'Morningstar Moderate Target Risk',
  inception: '2024-01-01',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Growth with Income', published_score: 56, published_exp_ratio: 0.53, published_yield: 2.96, holdings: [
      { ticker:'TPLC', name:'Timothy Plan US Large/Mid Cap Core ETF', type:'ETF', weight:31, risk_score:73 },
      { ticker:'TPHD', name:'Timothy Plan High Dividend Stock ETF', type:'ETF', weight:11, risk_score:72 },
      { ticker:'TPSC', name:'Timothy Plan US Small Cap Core ETF', type:'ETF', weight:7, risk_score:88 },
      { ticker:'TPIF', name:'Timothy Plan International ETF', type:'ETF', weight:12, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:9, risk_score:28 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:7, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:6, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:5, risk_score:24 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:11, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-dfa-core-etf',
  name: 'DFA Dimensional Core ETF',
  profile: 'Multi-Sleeve',
  benchmark: '60/40 Blend',
  inception: '2022-01-01',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 83, published_exp_ratio: 0.21, published_yield: 1.89, holdings: [
      { ticker:'DFAC', name:'DFA U.S. Core Equity 2 ETF', type:'ETF', weight:33.3, risk_score:74 },
      { ticker:'DFAU', name:'DFA US Core Equity Market ETF', type:'ETF', weight:33.3, risk_score:75 },
      { ticker:'DFAI', name:'DFA International Core Equity Market ETF', type:'ETF', weight:19.6, risk_score:76 },
      { ticker:'DFAE', name:'DFA Emerging Core Equity Market ETF', type:'ETF', weight:8.8, risk_score:85 },
      { ticker:'DFAR', name:'DFA US Real Estate ETF', type:'ETF', weight:2.9, risk_score:78 },
      { ticker:'DFSD', name:'DFA Short Duration Fixed Income ETF', type:'Bond ETF', weight:0.0, risk_score:18 },
      { ticker:'DFCF', name:'DFA Core Fixed Income ETF', type:'Bond ETF', weight:0.0, risk_score:26 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.1, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 75, published_exp_ratio: 0.2, published_yield: 1.62, holdings: [
      { ticker:'DFAC', name:'DFA U.S. Core Equity 2 ETF', type:'ETF', weight:26.7, risk_score:74 },
      { ticker:'DFAU', name:'DFA US Core Equity Market ETF', type:'ETF', weight:26.7, risk_score:75 },
      { ticker:'DFAI', name:'DFA International Core Equity Market ETF', type:'ETF', weight:15.7, risk_score:76 },
      { ticker:'DFAE', name:'DFA Emerging Core Equity Market ETF', type:'ETF', weight:7.1, risk_score:85 },
      { ticker:'DFAR', name:'DFA US Real Estate ETF', type:'ETF', weight:2.4, risk_score:78 },
      { ticker:'DFSD', name:'DFA Short Duration Fixed Income ETF', type:'Bond ETF', weight:9.8, risk_score:18 },
      { ticker:'DFCF', name:'DFA Core Fixed Income ETF', type:'Bond ETF', weight:9.8, risk_score:26 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.8, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 67, published_exp_ratio: 0.2, published_yield: 1.34, holdings: [
      { ticker:'DFAC', name:'DFA U.S. Core Equity 2 ETF', type:'ETF', weight:20.0, risk_score:74 },
      { ticker:'DFAU', name:'DFA US Core Equity Market ETF', type:'ETF', weight:20.0, risk_score:75 },
      { ticker:'DFAI', name:'DFA International Core Equity Market ETF', type:'ETF', weight:11.8, risk_score:76 },
      { ticker:'DFAE', name:'DFA Emerging Core Equity Market ETF', type:'ETF', weight:5.3, risk_score:85 },
      { ticker:'DFAR', name:'DFA US Real Estate ETF', type:'ETF', weight:1.8, risk_score:78 },
      { ticker:'DFSD', name:'DFA Short Duration Fixed Income ETF', type:'Bond ETF', weight:19.6, risk_score:18 },
      { ticker:'DFCF', name:'DFA Core Fixed Income ETF', type:'Bond ETF', weight:19.6, risk_score:26 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.9, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 56, published_exp_ratio: 0.19, published_yield: 1.04, holdings: [
      { ticker:'DFAC', name:'DFA U.S. Core Equity 2 ETF', type:'ETF', weight:13.3, risk_score:74 },
      { ticker:'DFAU', name:'DFA US Core Equity Market ETF', type:'ETF', weight:13.3, risk_score:75 },
      { ticker:'DFAI', name:'DFA International Core Equity Market ETF', type:'ETF', weight:7.8, risk_score:76 },
      { ticker:'DFAE', name:'DFA Emerging Core Equity Market ETF', type:'ETF', weight:3.5, risk_score:85 },
      { ticker:'DFAR', name:'DFA US Real Estate ETF', type:'ETF', weight:1.2, risk_score:78 },
      { ticker:'DFSD', name:'DFA Short Duration Fixed Income ETF', type:'Bond ETF', weight:39.2, risk_score:18 },
      { ticker:'DFCF', name:'DFA Core Fixed Income ETF', type:'Bond ETF', weight:19.6, risk_score:26 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.1, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 49, published_exp_ratio: 0.19, published_yield: 0.76, holdings: [
      { ticker:'DFAC', name:'DFA U.S. Core Equity 2 ETF', type:'ETF', weight:6.7, risk_score:74 },
      { ticker:'DFAU', name:'DFA US Core Equity Market ETF', type:'ETF', weight:6.7, risk_score:75 },
      { ticker:'DFAI', name:'DFA International Core Equity Market ETF', type:'ETF', weight:3.9, risk_score:76 },
      { ticker:'DFAE', name:'DFA Emerging Core Equity Market ETF', type:'ETF', weight:1.8, risk_score:85 },
      { ticker:'DFAR', name:'DFA US Real Estate ETF', type:'ETF', weight:0.6, risk_score:78 },
      { ticker:'DFSD', name:'DFA Short Duration Fixed Income ETF', type:'Bond ETF', weight:52.3, risk_score:18 },
      { ticker:'DFCF', name:'DFA Core Fixed Income ETF', type:'Bond ETF', weight:26.1, risk_score:26 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.9, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-dfa-sustainable',
  name: 'DFA Sustainable',
  profile: 'Multi-Sleeve · ESG',
  benchmark: 'MSCI ACWI',
  inception: '2024-02-14',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 81, published_exp_ratio: 0.0, published_yield: 1.25, holdings: [
      { ticker:'DFSU', name:'Dimensional US Sustainability Core 1 ETF', type:'ETF', weight:71, risk_score:76 },
      { ticker:'DFSE', name:'Dimensional Emerging Markets Sustainability Core ETF', type:'ETF', weight:8, risk_score:85 },
      { ticker:'DFSI', name:'Dimensional Intl Sustainability Core 1 ETF', type:'ETF', weight:19, risk_score:75 },
      { ticker:'DFSD', name:'Dimensional Short-Duration Fixed Income ETF', type:'Bond ETF', weight:0, risk_score:18 },
      { ticker:'DFSB', name:'Dimensional Global Sustainability Fixed Income ETF', type:'Bond ETF', weight:0, risk_score:28 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 74, published_exp_ratio: 0.04, published_yield: 1.95, holdings: [
      { ticker:'DFSU', name:'Dimensional US Sustainability Core 1 ETF', type:'ETF', weight:57, risk_score:76 },
      { ticker:'DFSE', name:'Dimensional Emerging Markets Sustainability Core ETF', type:'ETF', weight:7, risk_score:85 },
      { ticker:'DFSI', name:'Dimensional Intl Sustainability Core 1 ETF', type:'ETF', weight:16, risk_score:75 },
      { ticker:'DFSD', name:'Dimensional Short-Duration Fixed Income ETF', type:'Bond ETF', weight:2, risk_score:18 },
      { ticker:'DFSB', name:'Dimensional Global Sustainability Fixed Income ETF', type:'Bond ETF', weight:16, risk_score:28 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 65, published_exp_ratio: 0.09, published_yield: 2.69, holdings: [
      { ticker:'DFSU', name:'Dimensional US Sustainability Core 1 ETF', type:'ETF', weight:43, risk_score:76 },
      { ticker:'DFSE', name:'Dimensional Emerging Markets Sustainability Core ETF', type:'ETF', weight:5, risk_score:85 },
      { ticker:'DFSI', name:'Dimensional Intl Sustainability Core 1 ETF', type:'ETF', weight:12, risk_score:75 },
      { ticker:'DFSD', name:'Dimensional Short-Duration Fixed Income ETF', type:'Bond ETF', weight:7, risk_score:18 },
      { ticker:'DFSB', name:'Dimensional Global Sustainability Fixed Income ETF', type:'Bond ETF', weight:31, risk_score:28 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 54, published_exp_ratio: 0.13, published_yield: 3.36, holdings: [
      { ticker:'DFSU', name:'Dimensional US Sustainability Core 1 ETF', type:'ETF', weight:29, risk_score:76 },
      { ticker:'DFSE', name:'Dimensional Emerging Markets Sustainability Core ETF', type:'ETF', weight:3, risk_score:85 },
      { ticker:'DFSI', name:'Dimensional Intl Sustainability Core 1 ETF', type:'ETF', weight:8, risk_score:75 },
      { ticker:'DFSD', name:'Dimensional Short-Duration Fixed Income ETF', type:'Bond ETF', weight:18, risk_score:18 },
      { ticker:'DFSB', name:'Dimensional Global Sustainability Fixed Income ETF', type:'Bond ETF', weight:40, risk_score:28 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 45, published_exp_ratio: 0.17, published_yield: 4.03, holdings: [
      { ticker:'DFSU', name:'Dimensional US Sustainability Core 1 ETF', type:'ETF', weight:17, risk_score:76 },
      { ticker:'DFSE', name:'Dimensional Emerging Markets Sustainability Core ETF', type:'ETF', weight:0, risk_score:85 },
      { ticker:'DFSI', name:'Dimensional Intl Sustainability Core 1 ETF', type:'ETF', weight:4, risk_score:75 },
      { ticker:'DFSD', name:'Dimensional Short-Duration Fixed Income ETF', type:'Bond ETF', weight:24.5, risk_score:18 },
      { ticker:'DFSB', name:'Dimensional Global Sustainability Fixed Income ETF', type:'Bond ETF', weight:52.5, risk_score:28 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-dfa-taxaware',
  name: 'DFA Tax Aware',
  profile: 'Multi-Sleeve · Tax-Managed',
  benchmark: 'MSCI ACWI',
  inception: '2022-05-20',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 86, published_exp_ratio: 0.23, published_yield: 1.27, holdings: [
      { ticker:'DFAC', name:'DFA T.A. U.S. Core Equity 2 ETF', type:'ETF', weight:67, risk_score:74 },
      { ticker:'DFAX', name:'DFA T.A. World Ex U.S. Core ETF', type:'ETF', weight:22, risk_score:76 },
      { ticker:'DFIV', name:'DFA International Value ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'DFSMX', name:'DFA Short Term Municipal Bond', type:'Mutual Fund', weight:0, risk_score:14 },
      { ticker:'DFNM', name:'Dimensional National Municipal Bond ETF', type:'Bond ETF', weight:0, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 77, published_exp_ratio: 0.21, published_yield: 1.21, holdings: [
      { ticker:'DFAC', name:'DFA T.A. U.S. Core Equity 2 ETF', type:'ETF', weight:57, risk_score:74 },
      { ticker:'DFAX', name:'DFA T.A. World Ex U.S. Core ETF', type:'ETF', weight:16, risk_score:76 },
      { ticker:'DFIV', name:'DFA International Value ETF', type:'ETF', weight:7, risk_score:74 },
      { ticker:'DFSMX', name:'DFA Short Term Municipal Bond', type:'Mutual Fund', weight:6, risk_score:14 },
      { ticker:'DFNM', name:'Dimensional National Municipal Bond ETF', type:'Bond ETF', weight:12, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 67, published_exp_ratio: 0.2, published_yield: 0.96, holdings: [
      { ticker:'DFAC', name:'DFA T.A. U.S. Core Equity 2 ETF', type:'ETF', weight:42, risk_score:74 },
      { ticker:'DFAX', name:'DFA T.A. World Ex U.S. Core ETF', type:'ETF', weight:12, risk_score:76 },
      { ticker:'DFIV', name:'DFA International Value ETF', type:'ETF', weight:6, risk_score:74 },
      { ticker:'DFSMX', name:'DFA Short Term Municipal Bond', type:'Mutual Fund', weight:7, risk_score:14 },
      { ticker:'DFNM', name:'Dimensional National Municipal Bond ETF', type:'Bond ETF', weight:31, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 52, published_exp_ratio: 0.2, published_yield: 0.68, holdings: [
      { ticker:'DFAC', name:'DFA T.A. U.S. Core Equity 2 ETF', type:'ETF', weight:28, risk_score:74 },
      { ticker:'DFAX', name:'DFA T.A. World Ex U.S. Core ETF', type:'ETF', weight:8, risk_score:76 },
      { ticker:'DFIV', name:'DFA International Value ETF', type:'ETF', weight:4, risk_score:74 },
      { ticker:'DFSMX', name:'DFA Short Term Municipal Bond', type:'Mutual Fund', weight:22, risk_score:14 },
      { ticker:'DFNM', name:'Dimensional National Municipal Bond ETF', type:'Bond ETF', weight:36, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 33, published_exp_ratio: 0.19, published_yield: 0.43, holdings: [
      { ticker:'DFAC', name:'DFA T.A. U.S. Core Equity 2 ETF', type:'ETF', weight:15, risk_score:74 },
      { ticker:'DFAX', name:'DFA T.A. World Ex U.S. Core ETF', type:'ETF', weight:4, risk_score:76 },
      { ticker:'DFIV', name:'DFA International Value ETF', type:'ETF', weight:2, risk_score:74 },
      { ticker:'DFSMX', name:'DFA Short Term Municipal Bond', type:'Mutual Fund', weight:29.5, risk_score:14 },
      { ticker:'DFNM', name:'Dimensional National Municipal Bond ETF', type:'Bond ETF', weight:47.5, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-dorsey-ndx',
  name: 'Dorsey NDX Model',
  profile: 'Tactically Managed',
  benchmark: 'Nasdaq-100',
  inception: '2024-01-01',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Current', published_score: 91, published_exp_ratio: 0.0, published_yield: 0.7, holdings: [
      { ticker:'ARM', name:'ARM Holdings PLC ADR', type:'Stock', weight:9.9, risk_score:92 },
      { ticker:'FANG', name:'Diamondback Energy Inc.', type:'Stock', weight:9.9, risk_score:86 },
      { ticker:'ADI', name:'Analog Devices Inc.', type:'Stock', weight:9.9, risk_score:88 },
      { ticker:'AMAT', name:'Applied Materials Inc.', type:'Stock', weight:9.9, risk_score:89 },
      { ticker:'ROST', name:'Ross Stores Inc.', type:'Stock', weight:9.9, risk_score:80 },
      { ticker:'ASML', name:'ASML Holding N.V.', type:'Stock', weight:9.9, risk_score:87 },
      { ticker:'LRCX', name:'Lam Research Corp.', type:'Stock', weight:9.9, risk_score:92 },
      { ticker:'STX', name:'Seagate Technology Holdings PLC', type:'Stock', weight:9.9, risk_score:88 },
      { ticker:'WDC', name:'Western Digital Corp.', type:'Stock', weight:9.9, risk_score:88 },
      { ticker:'GOOGL', name:'Alphabet Inc. Class A', type:'Stock', weight:9.9, risk_score:84 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.0, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-invesco-core-taxsensitive',
  name: 'Invesco Core Tax-Sensitive',
  profile: 'Multi-Sleeve · Tax-Sensitive',
  benchmark: '60/40 Blend',
  inception: '2024-08-09',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Growth', published_score: 65, published_exp_ratio: 0.26, published_yield: 1.85, holdings: [
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10.7, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:9.1, risk_score:72 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:13.2, risk_score:76 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:15.4, risk_score:74 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:3.5, risk_score:84 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:6.2, risk_score:82 },
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:19.9, risk_score:74 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund', type:'Mutual Fund', weight:0.0, risk_score:30 },
      { ticker:'ACTDX', name:'Invesco High Yield Municipal Fund', type:'Mutual Fund', weight:2.0, risk_score:36 },
      { ticker:'VKLIX', name:'Invesco Intermediate Term Municipal Income Fund', type:'Mutual Fund', weight:6.3, risk_score:22 },
      { ticker:'VMIIX', name:'Invesco Municipal Income Fund', type:'Mutual Fund', weight:3.8, risk_score:26 },
      { ticker:'PZA', name:'Invesco National AMT-Free Municipal Bond ETF', type:'Bond ETF', weight:3.8, risk_score:26 },
      { ticker:'ORSYX', name:'Invesco Short Term Municipal Fund Class Y', type:'Mutual Fund', weight:2.1, risk_score:12 },
      { ticker:'WTMF', name:'WisdomTree Managed Futures Strategy Fund', type:'ETF', weight:0.0, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 55, published_exp_ratio: 0.33, published_yield: 2.29, holdings: [
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:8.2, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:7.0, risk_score:72 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:10.2, risk_score:76 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:11.6, risk_score:74 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:2.7, risk_score:84 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:4.7, risk_score:82 },
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:15.3, risk_score:74 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund', type:'Mutual Fund', weight:2.0, risk_score:30 },
      { ticker:'ACTDX', name:'Invesco High Yield Municipal Fund', type:'Mutual Fund', weight:2.5, risk_score:36 },
      { ticker:'VKLIX', name:'Invesco Intermediate Term Municipal Income Fund', type:'Mutual Fund', weight:10.0, risk_score:22 },
      { ticker:'VMIIX', name:'Invesco Municipal Income Fund', type:'Mutual Fund', weight:6.4, risk_score:26 },
      { ticker:'PZA', name:'Invesco National AMT-Free Municipal Bond ETF', type:'Bond ETF', weight:6.4, risk_score:26 },
      { ticker:'ORSYX', name:'Invesco Short Term Municipal Fund Class Y', type:'Mutual Fund', weight:3.4, risk_score:12 },
      { ticker:'WTMF', name:'WisdomTree Managed Futures Strategy Fund', type:'ETF', weight:5.6, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 46, published_exp_ratio: 0.38, published_yield: 2.74, holdings: [
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:5.7, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:4.9, risk_score:72 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:7.1, risk_score:76 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:0.0, risk_score:84 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:8.7, risk_score:74 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:3.4, risk_score:82 },
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:10.5, risk_score:74 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund', type:'Mutual Fund', weight:2.6, risk_score:30 },
      { ticker:'ACTDX', name:'Invesco High Yield Municipal Fund', type:'Mutual Fund', weight:3.8, risk_score:36 },
      { ticker:'VKLIX', name:'Invesco Intermediate Term Municipal Income Fund', type:'Mutual Fund', weight:16.7, risk_score:22 },
      { ticker:'VMIIX', name:'Invesco Municipal Income Fund', type:'Mutual Fund', weight:10.9, risk_score:26 },
      { ticker:'PZA', name:'Invesco National AMT-Free Municipal Bond ETF', type:'Bond ETF', weight:10.8, risk_score:26 },
      { ticker:'ORSYX', name:'Invesco Short Term Municipal Fund Class Y', type:'Mutual Fund', weight:5.6, risk_score:12 },
      { ticker:'WTMF', name:'WisdomTree Managed Futures Strategy Fund', type:'ETF', weight:5.3, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-invesco-core',
  name: 'Invesco Core',
  profile: 'Multi-Sleeve',
  benchmark: 'S&P 500',
  inception: '2026-03-12',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 73, published_exp_ratio: 0.22, published_yield: 1.88, holdings: [
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:24.4, risk_score:74 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:18.9, risk_score:74 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:16.3, risk_score:76 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:13.2, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:11.3, risk_score:72 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:7.6, risk_score:82 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:4.0, risk_score:84 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:2.3, risk_score:84 },
      { ticker:'OPBYX', name:'Invesco Core Bond Fund Class Y', type:'Mutual Fund', weight:0.0, risk_score:28 },
      { ticker:'GSY', name:'Invesco Ultra Short Duration ETF', type:'Bond ETF', weight:0.0, risk_score:10 },
      { ticker:'GTO', name:'Invesco Total Return Bond ETF', type:'Bond ETF', weight:0.0, risk_score:32 },
      { ticker:'ICLO', name:'Invesco AAA CLO Floating Rate Note ETF', type:'Bond ETF', weight:0.0, risk_score:18 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund Class Y', type:'Mutual Fund', weight:0.0, risk_score:30 },
      { ticker:'PCY', name:'Invesco Emerging Markets Sovereign Debt ETF', type:'Bond ETF', weight:0.0, risk_score:45 },
      { ticker:'IFLN', name:'Invesco Bloomberg Enhanced Fallen Angels ETF', type:'Bond ETF', weight:0.0, risk_score:48 },
      { ticker:'GOVI', name:'Invesco Equal Weight 0-30 Year Treasury ETF', type:'Bond ETF', weight:0.0, risk_score:36 },
      { ticker:'ASFYX', name:'Virtus AlphaSimplex Managed Futures Strategy Fund Class I', type:'Mutual Fund', weight:0.0, risk_score:38 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 68, published_exp_ratio: 0.23, published_yield: 2.21, holdings: [
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:25.19, risk_score:74 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:17.03, risk_score:74 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:13.3, risk_score:76 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10.8, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:9.2, risk_score:72 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:6.78, risk_score:82 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:3.2, risk_score:84 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'OPBYX', name:'Invesco Core Bond Fund Class Y', type:'Mutual Fund', weight:2.25, risk_score:28 },
      { ticker:'GSY', name:'Invesco Ultra Short Duration ETF', type:'Bond ETF', weight:2.07, risk_score:10 },
      { ticker:'GTO', name:'Invesco Total Return Bond ETF', type:'Bond ETF', weight:2.18, risk_score:32 },
      { ticker:'ICLO', name:'Invesco AAA CLO Floating Rate Note ETF', type:'Bond ETF', weight:2.0, risk_score:18 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund Class Y', type:'Mutual Fund', weight:2.0, risk_score:30 },
      { ticker:'PCY', name:'Invesco Emerging Markets Sovereign Debt ETF', type:'Bond ETF', weight:0.0, risk_score:45 },
      { ticker:'IFLN', name:'Invesco Bloomberg Enhanced Fallen Angels ETF', type:'Bond ETF', weight:0.0, risk_score:48 },
      { ticker:'GOVI', name:'Invesco Equal Weight 0-30 Year Treasury ETF', type:'Bond ETF', weight:0.0, risk_score:36 },
      { ticker:'ASFYX', name:'Virtus AlphaSimplex Managed Futures Strategy Fund Class I', type:'Mutual Fund', weight:0.0, risk_score:38 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 58, published_exp_ratio: 0.3, published_yield: 2.48, holdings: [
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:21.28, risk_score:74 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:13.37, risk_score:74 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:10.2, risk_score:76 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:8.3, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:7.0, risk_score:72 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:5.35, risk_score:82 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:2.5, risk_score:84 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'OPBYX', name:'Invesco Core Bond Fund Class Y', type:'Mutual Fund', weight:7.57, risk_score:28 },
      { ticker:'GSY', name:'Invesco Ultra Short Duration ETF', type:'Bond ETF', weight:4.56, risk_score:10 },
      { ticker:'GTO', name:'Invesco Total Return Bond ETF', type:'Bond ETF', weight:6.27, risk_score:32 },
      { ticker:'ICLO', name:'Invesco AAA CLO Floating Rate Note ETF', type:'Bond ETF', weight:2.8, risk_score:18 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund Class Y', type:'Mutual Fund', weight:2.0, risk_score:30 },
      { ticker:'PCY', name:'Invesco Emerging Markets Sovereign Debt ETF', type:'Bond ETF', weight:0.0, risk_score:45 },
      { ticker:'IFLN', name:'Invesco Bloomberg Enhanced Fallen Angels ETF', type:'Bond ETF', weight:0.0, risk_score:48 },
      { ticker:'GOVI', name:'Invesco Equal Weight 0-30 Year Treasury ETF', type:'Bond ETF', weight:0.0, risk_score:36 },
      { ticker:'ASFYX', name:'Virtus AlphaSimplex Managed Futures Strategy Fund Class I', type:'Mutual Fund', weight:4.8, risk_score:38 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 48, published_exp_ratio: 0.32, published_yield: 3.04, holdings: [
      { ticker:'PBUS', name:'Invesco MSCI USA ETF', type:'ETF', weight:15.03, risk_score:74 },
      { ticker:'IMFL', name:'Invesco International Developed Dynamic Multifactor ETF', type:'ETF', weight:9.94, risk_score:74 },
      { ticker:'OMFL', name:'Invesco Russell 1000 Dynamic Multifactor ETF', type:'ETF', weight:7.0, risk_score:76 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:5.6, risk_score:85 },
      { ticker:'RWL', name:'Invesco S&P 500 Revenue ETF', type:'ETF', weight:4.8, risk_score:72 },
      { ticker:'IEMG', name:'iShares Core MSCI Emerging Markets ETF', type:'ETF', weight:3.93, risk_score:82 },
      { ticker:'OMFS', name:'Invesco Russell 2000 Dynamic Multifactor ETF', type:'ETF', weight:2.0, risk_score:84 },
      { ticker:'SCZ', name:'iShares MSCI EAFE Small-Cap ETF', type:'ETF', weight:0.0, risk_score:84 },
      { ticker:'OPBYX', name:'Invesco Core Bond Fund Class Y', type:'Mutual Fund', weight:11.82, risk_score:28 },
      { ticker:'GSY', name:'Invesco Ultra Short Duration ETF', type:'Bond ETF', weight:10.22, risk_score:10 },
      { ticker:'GTO', name:'Invesco Total Return Bond ETF', type:'Bond ETF', weight:9.66, risk_score:32 },
      { ticker:'ICLO', name:'Invesco AAA CLO Floating Rate Note ETF', type:'Bond ETF', weight:4.4, risk_score:18 },
      { ticker:'AFRYX', name:'Invesco Floating Rate ESG Fund Class Y', type:'Mutual Fund', weight:2.5, risk_score:30 },
      { ticker:'PCY', name:'Invesco Emerging Markets Sovereign Debt ETF', type:'Bond ETF', weight:2.49, risk_score:45 },
      { ticker:'IFLN', name:'Invesco Bloomberg Enhanced Fallen Angels ETF', type:'Bond ETF', weight:2.01, risk_score:48 },
      { ticker:'GOVI', name:'Invesco Equal Weight 0-30 Year Treasury ETF', type:'Bond ETF', weight:2.0, risk_score:36 },
      { ticker:'ASFYX', name:'Virtus AlphaSimplex Managed Futures Strategy Fund Class I', type:'Mutual Fund', weight:4.6, risk_score:38 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:2.0, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-invesco-power7',
  name: 'Invesco Power 7',
  profile: 'Tactically Managed · Sector Rotation',
  benchmark: 'S&P 500',
  inception: '2022-06-27',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Current', published_score: 90, published_exp_ratio: 0.58, published_yield: 1.05, holdings: [
      { ticker:'PXE', name:'Invesco Energy Exploration & Production ETF', type:'ETF', weight:14.14, risk_score:90 },
      { ticker:'PXJ', name:'Invesco Oil & Gas Services ETF', type:'ETF', weight:14.14, risk_score:92 },
      { ticker:'PKB', name:'Invesco Building & Construction ETF', type:'ETF', weight:14.14, risk_score:86 },
      { ticker:'KNCT', name:'Invesco Next Gen Connectivity ETF', type:'ETF', weight:14.14, risk_score:88 },
      { ticker:'PBD', name:'Invesco Global Clean Energy ETF', type:'ETF', weight:14.14, risk_score:92 },
      { ticker:'PSI', name:'Invesco Semiconductors ETF', type:'ETF', weight:14.14, risk_score:84 },
      { ticker:'PPA', name:'Invesco Aerospace & Defense ETF', type:'ETF', weight:14.14, risk_score:82 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.02, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-strategic-core-taxsensitive',
  name: 'Strategic Core Tax-Sensitive',
  profile: 'Multi-Sleeve · Tax-Sensitive',
  benchmark: 'S&P 500',
  inception: '2026-01-12',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 73, published_exp_ratio: 0.26, published_yield: 1.39, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:14, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:12, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:6, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:8, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:10, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:7, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:12, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:11, risk_score:77 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 65, published_exp_ratio: 0.28, published_yield: 1.88, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:11, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:9, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:8, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:5, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:9, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:9, risk_score:77 },
      { ticker:'CGMU', name:'Capital Group Municipal Income ETF', type:'Bond ETF', weight:7, risk_score:22 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:2, risk_score:17 },
      { ticker:'SMMU', name:'PIMCO Short Term Municipal Bond Active', type:'Bond ETF', weight:4, risk_score:12 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:5, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 54, published_exp_ratio: 0.31, published_yield: 2.48, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:13, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:6, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:6, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:4, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:3, risk_score:90 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:8, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:7, risk_score:77 },
      { ticker:'CGMU', name:'Capital Group Municipal Income ETF', type:'Bond ETF', weight:14, risk_score:22 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:4, risk_score:17 },
      { ticker:'SMMU', name:'PIMCO Short Term Municipal Bond Active', type:'Bond ETF', weight:9, risk_score:12 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:11, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 39, published_exp_ratio: 0.37, published_yield: 3.24, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:5, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:3, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:2, risk_score:84 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:3, risk_score:77 },
      { ticker:'CGMU', name:'Capital Group Municipal Income ETF', type:'Bond ETF', weight:25, risk_score:22 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:7, risk_score:17 },
      { ticker:'SMMU', name:'PIMCO Short Term Municipal Bond Active', type:'Bond ETF', weight:16, risk_score:12 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:20, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 32, published_exp_ratio: 0.4, published_yield: 3.63, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:7, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:2, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:2, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'CGMU', name:'Capital Group Municipal Income ETF', type:'Bond ETF', weight:30, risk_score:22 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:8, risk_score:17 },
      { ticker:'SMMU', name:'PIMCO Short Term Municipal Bond Active', type:'Bond ETF', weight:20, risk_score:12 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:25, risk_score:35 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-strategic-core-alts-crypto',
  name: 'Strategic Core w/ Alternative Investments (incl. Crypto)',
  profile: 'Multi-Sleeve · Alternatives',
  benchmark: 'S&P 500',
  inception: '2025-10-16',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [
    { id:'altsc-rb1', date:'2026-02-05', type:'rebalance', ticker:'ALL HOLDINGS', notes:'Full model rebalance — weights adjusted back to target allocations across all sleeves' },
    { id:'altsc-rb2', date:'2026-02-05', type:'trim',      ticker:'IBIT',         notes:'Trimmed overweight IBIT position back to target after crypto rally' },
    { id:'altsc-rb3', date:'2026-02-05', type:'trim',      ticker:'QQQM',         notes:'Trimmed overweight QQQM position back to target weight' },
    { id:'altsc-rb4', date:'2026-02-05', type:'add',       ticker:'GLD',          notes:'Added to GLD to restore target allocation after drift' },
    { id:'altsc-rb5', date:'2026-02-05', type:'trim',      ticker:'QLEIX',        notes:'Trimmed QLEIX back to target after equity market drift' },
  ],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 69, published_exp_ratio: 0.6, published_yield: 1.46, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:8.6, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:9.5, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:9.5, risk_score:80 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:6.7, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:4.8, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:4.8, risk_score:90 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:4.8, risk_score:72 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:8.6, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:6.7, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:8.6, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:7.6, risk_score:77 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:7.6, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:6.7, risk_score:50 },
      { ticker:'IBIT', name:'iShares Bitcoin Trust ETF', type:'ETF', weight:5.0, risk_score:95 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.0, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 58, published_exp_ratio: 0.63, published_yield: 2.16, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:7.7, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:8.6, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:5.8, risk_score:80 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:4.8, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:4.8, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:4.8, risk_score:90 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:3.8, risk_score:72 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:6.7, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:3.8, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:7.7, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:6.7, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:4.8, risk_score:28 },
      { ticker:'JSI', name:'Janus Henderson Securitized Income ETF', type:'Bond ETF', weight:3.8, risk_score:22 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:3.8, risk_score:35 },
      { ticker:'VNLA', name:'Janus Henderson Short Duration Income ETF', type:'Bond ETF', weight:2.9, risk_score:12 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:5.8, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:5.8, risk_score:50 },
      { ticker:'IBIT', name:'iShares Bitcoin Trust ETF', type:'ETF', weight:4.0, risk_score:95 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:2.9, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.0, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 46, published_exp_ratio: 0.62, published_yield: 2.84, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:7.8, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:8.8, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:4.9, risk_score:80 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:4.9, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:3.9, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:2.9, risk_score:90 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:3.9, risk_score:72 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:6.9, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:6.9, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:11.8, risk_score:28 },
      { ticker:'JSI', name:'Janus Henderson Securitized Income ETF', type:'Bond ETF', weight:6.9, risk_score:22 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:7.8, risk_score:35 },
      { ticker:'VNLA', name:'Janus Henderson Short Duration Income ETF', type:'Bond ETF', weight:4.9, risk_score:12 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:4.9, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:3.9, risk_score:50 },
      { ticker:'IBIT', name:'iShares Bitcoin Trust ETF', type:'ETF', weight:2.0, risk_score:95 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:5.9, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1.0, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-strategic-core-alts',
  name: 'Strategic Core w/ Alternative Investments',
  profile: 'Multi-Sleeve · Alternatives',
  benchmark: 'S&P 500',
  inception: '2025-10-16',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [
    { id:'alts-rb1', date:'2026-02-05', type:'rebalance', ticker:'ALL HOLDINGS', notes:'Full model rebalance — weights adjusted back to target allocations across all sleeves' },
    { id:'alts-rb2', date:'2026-02-05', type:'trim',     ticker:'QQQM',          notes:'Trimmed overweight QQQM position back to target weight' },
    { id:'alts-rb3', date:'2026-02-05', type:'add',      ticker:'GLD',           notes:'Added to GLD to restore target allocation after drift' },
    { id:'alts-rb4', date:'2026-02-05', type:'trim',     ticker:'QLEIX',         notes:'Trimmed QLEIX back to target after equity market drift' },
  ],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 66, published_exp_ratio: 0.65, published_yield: 1.27, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:10, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:7, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:7, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:9, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:8, risk_score:77 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:8, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:7, risk_score:50 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 57, published_exp_ratio: 0.7, published_yield: 2.0, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:8, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:9, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:6, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:7, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:4, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:8, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:7, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:4, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:6, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:3, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:3, risk_score:12 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:6, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:6, risk_score:50 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:3, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 48, published_exp_ratio: 0.67, published_yield: 2.77, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:8, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:9, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:5, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:4, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:3, risk_score:90 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:7, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:7, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:9, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:10, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:5, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:4, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:4, risk_score:24 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:5, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:4, risk_score:50 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:6, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 35, published_exp_ratio: 0.72, published_yield: 3.86, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:4, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:5, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:3, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:2, risk_score:84 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:3, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:16, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:18, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:10, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:6, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:8, risk_score:24 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:2, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:2, risk_score:50 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:11, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 29, published_exp_ratio: 0.73, published_yield: 4.41, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:2, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:3, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:2, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:20, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:22, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:12, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:8, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:10, risk_score:24 },
      { ticker:'GLD', name:'SPDR Gold Shares', type:'ETF', weight:2, risk_score:65 },
      { ticker:'QLEIX', name:'AQR Long-Short Equity I', type:'Mutual Fund', weight:1, risk_score:50 },
      { ticker:'FSMSX', name:'FS Multi-Strategy Alternatives I', type:'Mutual Fund', weight:12, risk_score:40 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-strategic-core',
  name: 'Strategic Core',
  profile: 'Multi-Sleeve',
  benchmark: 'S&P 500',
  inception: '2025-10-16',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [],
  events: [],
  sleeves: [
    { name: 'Aggressive Growth', published_score: 73, published_exp_ratio: 0.26, published_yield: 1.39, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:14, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:12, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:6, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:8, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:10, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:7, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:12, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:11, risk_score:77 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth', published_score: 64, published_exp_ratio: 0.31, published_yield: 2.12, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:11, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:9, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:5, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:5, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:5, risk_score:90 },
      { ticker:'XLG', name:'Invesco S&P 500 Top 50 ETF', type:'ETF', weight:8, risk_score:74 },
      { ticker:'SPGP', name:'Invesco S&P 500 GARP ETF', type:'ETF', weight:5, risk_score:78 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:9, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:9, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:5, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:6, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:4, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:3, risk_score:12 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Growth with Income', published_score: 53, published_exp_ratio: 0.34, published_yield: 2.98, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:13, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:10, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:6, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:6, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:4, risk_score:84 },
      { ticker:'XSVM', name:'Invesco S&P SmallCap Value with Momentum ETF', type:'ETF', weight:3, risk_score:90 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:8, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:7, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:9, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:11, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:7, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:6, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:5, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Moderate Growth', published_score: 37, published_exp_ratio: 0.43, published_yield: 4.14, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:9, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:5, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:3, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'SPYV', name:'SPDR Portfolio S&P 500 Value ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JSML', name:'Janus Henderson Small Cap Growth Alpha ETF', type:'ETF', weight:2, risk_score:84 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:4, risk_score:72 },
      { ticker:'CWI', name:'SPDR MSCI ACWI ex-US ETF', type:'ETF', weight:3, risk_score:77 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:16, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:20, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:12, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:12, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:8, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]},
    { name: 'Income with Capital Preservation', published_score: 31, published_exp_ratio: 0.48, published_yield: 4.73, holdings: [
      { ticker:'SPYM', name:'State Street SPDR Portfolio S&P 500 ETF', type:'ETF', weight:7, risk_score:74 },
      { ticker:'QQQM', name:'Invesco NASDAQ 100 ETF', type:'ETF', weight:2, risk_score:85 },
      { ticker:'XMHQ', name:'Invesco S&P MidCap Quality ETF', type:'ETF', weight:2, risk_score:80 },
      { ticker:'VFLO', name:'VictoryShares Free Cash Flow ETF', type:'ETF', weight:2, risk_score:72 },
      { ticker:'JIVE', name:'JPMorgan International Value ETF', type:'ETF', weight:3, risk_score:72 },
      { ticker:'FTCB', name:'First Trust Core Investment Grade ETF', type:'Bond ETF', weight:20, risk_score:28 },
      { ticker:'JMUIX', name:'Janus Henderson Multi-Sector Income I', type:'Mutual Fund', weight:25, risk_score:35 },
      { ticker:'PFTPX', name:'PIMCO Low Duration Income Fund Class I-2', type:'Mutual Fund', weight:15, risk_score:17 },
      { ticker:'LGRYX', name:'Lord Abbett Investment Grade Floating Rate', type:'Mutual Fund', weight:13, risk_score:12 },
      { ticker:'JMBS', name:'Janus Henderson Mortgage-Backed Securities ETF', type:'Bond ETF', weight:10, risk_score:24 },
      { ticker:'CASH', name:'Cash / Money Market', type:'Cash', weight:1, risk_score:5 }
    ]}
  ]
},

{
  id: 'cp-trowe-focused5',
  name: 'T.Rowe Price Focused 5',
  profile: 'Tactically Managed',
  benchmark: 'MSCI World',
  inception: '2019-01-01',
  perf: { ytd: null, oneYear: null, ytd_bench: null, oneYear_bench: null },
  annualReturns: [
    { year: 2025, model: 11.86, bench: 13.90 },
    { year: 2024, model: 23.20, bench: 17.88 },
    { year: 2023, model: 16.48, bench: 19.71 },
    { year: 2022, model: -17.02,bench: -18.28 },
    { year: 2021, model: 16.79, bench: 20.21 },
    { year: 2020, model: 36.91, bench: 15.01 },
    { year: 2019, model: 34.60, bench: 24.11 },
  ],
  events: [
    { id:'tr1',  date:'2023-02-02', type:'remove', ticker:'PRISX',  notes:'Fund Score Rank > Threshold — SELL @29.02 (bought @26.60)' },
    { id:'tr2',  date:'2023-02-02', type:'add',    ticker:'PIEQX',  notes:'New position meets model criteria — BUY @13.64' },
    { id:'tr3',  date:'2023-02-02', type:'add',    ticker:'PRDSX',  notes:'New position meets model criteria — BUY @33.31' },
    { id:'tr4',  date:'2023-02-02', type:'add',    ticker:'TRIGX',  notes:'New position meets model criteria — BUY @14.04' },
    { id:'tr5',  date:'2023-02-02', type:'remove', ticker:'MNYMKT', notes:'Fund Score Rank > Threshold — SELL @15.10 (bought @14.94)' },
    { id:'tr6',  date:'2023-02-02', type:'remove', ticker:'PRCOX',  notes:'Fund Score Rank > Threshold — SELL @38.45 (bought @37.62)' },
    { id:'tr7',  date:'2023-05-04', type:'add',    ticker:'PRDGX',  notes:'New position meets model criteria — BUY @56.19' },
    { id:'tr8',  date:'2023-05-04', type:'add',    ticker:'PRSCX',  notes:'New position meets model criteria — BUY @26.42' },
    { id:'tr9',  date:'2023-05-04', type:'remove', ticker:'TRVLX',  notes:'Fund Score Rank > Threshold — SELL @32.74 (bought @34.09)' },
    { id:'tr10', date:'2023-05-04', type:'remove', ticker:'PRNEX',  notes:'Fund Score Rank > Threshold — SELL @31.25 (bought @31.09)' },
    { id:'tr11', date:'2023-08-03', type:'add',    ticker:'PRCOX',  notes:'New position meets model criteria — BUY @42.52' },
    { id:'tr12', date:'2023-08-03', type:'add',    ticker:'TRBCX',  notes:'New position meets model criteria — BUY @118.78' },
    { id:'tr13', date:'2023-08-03', type:'add',    ticker:'PRWAX',  notes:'New position meets model criteria — BUY @50.91' },
    { id:'tr14', date:'2023-08-03', type:'remove', ticker:'PIEQX',  notes:'Fund Score Rank > Threshold — SELL @13.87 (bought @13.64)' },
    { id:'tr15', date:'2023-08-03', type:'remove', ticker:'PRDGX',  notes:'Fund Score Rank > Threshold — SELL @59.74 (bought @56.19)' },
    { id:'tr16', date:'2023-08-03', type:'remove', ticker:'PRDSX',  notes:'Fund Score Rank > Threshold — SELL @33.79 (bought @33.31)' },
    { id:'tr17', date:'2023-11-02', type:'add',    ticker:'PREIX',  notes:'New position meets model criteria — BUY @109.22' },
    { id:'tr18', date:'2023-11-02', type:'add',    ticker:'TRULX',  notes:'New position meets model criteria — BUY @28.47' },
    { id:'tr19', date:'2023-11-02', type:'remove', ticker:'TRIGX',  notes:'Fund Score Rank > Threshold — SELL @13.94 (bought @14.04)' },
    { id:'tr20', date:'2023-11-02', type:'remove', ticker:'PRSCX',  notes:'Fund Score Rank > Threshold — SELL @29.51 (bought @26.42)' },
    { id:'tr21', date:'2024-02-02', type:'remove', ticker:'TRULX',  notes:'Fund Score Rank > Threshold — SELL @32.64 (bought @28.47)' },
    { id:'tr22', date:'2024-02-02', type:'add',    ticker:'PRSCX',  notes:'New position meets model criteria — BUY @36.19' },
    { id:'tr23', date:'2024-02-02', type:'add',    ticker:'PRGTX',  notes:'New position meets model criteria — BUY @16.81' },
    { id:'tr24', date:'2024-02-02', type:'remove', ticker:'PRWAX',  notes:'Fund Score Rank > Threshold — SELL @57.55 (bought @50.91)' },
    { id:'tr25', date:'2024-05-03', type:'add',    ticker:'TRULX',  notes:'New position meets model criteria — BUY @34.65' },
    { id:'tr26', date:'2024-05-03', type:'add',    ticker:'PRISX',  notes:'New position meets model criteria — BUY @33.69' },
    { id:'tr27', date:'2024-05-03', type:'remove', ticker:'PREIX',  notes:'Fund Score Rank > Threshold — SELL @130.58 (bought @109.22)' },
    { id:'tr28', date:'2024-05-03', type:'remove', ticker:'PRSCX',  notes:'Fund Score Rank > Threshold — SELL @37.65 (bought @36.19)' },
    { id:'tr29', date:'2024-08-02', type:'remove', ticker:'PRISX',  notes:'Fund Score Rank > Threshold — SELL @34.17 (bought @33.69)' },
    { id:'tr30', date:'2024-08-02', type:'add',    ticker:'POMIX',  notes:'New position meets model criteria — BUY @54.92' },
    { id:'tr31', date:'2024-08-02', type:'add',    ticker:'PREIX',  notes:'New position meets model criteria — BUY @136.56' },
    { id:'tr32', date:'2024-08-02', type:'add',    ticker:'PRDGX',  notes:'New position meets model criteria — BUY @69.38' },
    { id:'tr33', date:'2024-08-02', type:'remove', ticker:'PRGTX',  notes:'Fund Score Rank > Threshold — SELL @17.96 (bought @16.81)' },
    { id:'tr34', date:'2024-08-02', type:'remove', ticker:'TRBCX',  notes:'Fund Score Rank > Threshold — SELL @153.75 (bought @118.78)' },
    { id:'tr35', date:'2024-11-01', type:'add',    ticker:'PRDSX',  notes:'New position meets model criteria — BUY @41.10' },
    { id:'tr36', date:'2024-11-01', type:'add',    ticker:'PRISX',  notes:'New position meets model criteria — BUY @38.36' },
    { id:'tr37', date:'2024-11-01', type:'remove', ticker:'PRDGX',  notes:'Fund Score Rank > Threshold — SELL @71.42 (bought @69.38)' },
    { id:'tr38', date:'2024-11-01', type:'remove', ticker:'TRULX',  notes:'Fund Score Rank > Threshold — SELL @37.76 (bought @34.65)' },
    { id:'tr39', date:'2025-02-03', type:'remove', ticker:'PREIX',  notes:'Fund Score Rank > Threshold — SELL @153.99 (bought @136.56)' },
    { id:'tr40', date:'2025-02-03', type:'add',    ticker:'TRBCX',  notes:'New position meets model criteria — BUY @180.46' },
    { id:'tr41', date:'2025-02-03', type:'add',    ticker:'PRMTX',  notes:'New position meets model criteria — BUY @129.88' },
    { id:'tr42', date:'2025-02-03', type:'remove', ticker:'PRDSX',  notes:'Fund Score Rank > Threshold — SELL @41.85 (bought @41.10)' },
    { id:'tr43', date:'2025-05-05', type:'add',    ticker:'TROSX',  notes:'New position meets model criteria — BUY @13.67' },
    { id:'tr44', date:'2025-05-05', type:'add',    ticker:'PIEQX',  notes:'New position meets model criteria — BUY @17.30' },
    { id:'tr45', date:'2025-05-05', type:'add',    ticker:'TRIGX',  notes:'New position meets model criteria — BUY @19.48' },
    { id:'tr46', date:'2025-05-05', type:'remove', ticker:'POMIX',  notes:'Fund Score Rank > Threshold — SELL @58.29 (bought @54.92)' },
    { id:'tr47', date:'2025-05-05', type:'remove', ticker:'PRCOX',  notes:'Fund Score Rank > Threshold — SELL @55.51 (bought @42.52)' },
    { id:'tr48', date:'2025-05-05', type:'remove', ticker:'TRBCX',  notes:'Fund Score Rank > Threshold — SELL @167.70 (bought @180.46)' },
    { id:'tr49', date:'2025-08-04', type:'remove', ticker:'PRMTX',  notes:'Fund Score Rank > Threshold — SELL @135.68 (bought @129.88)' },
    { id:'tr50', date:'2025-08-04', type:'add',    ticker:'PREIX',  notes:'New position meets model criteria — BUY @163.52' },
    { id:'tr51', date:'2025-08-04', type:'add',    ticker:'PRGTX',  notes:'New position meets model criteria — BUY @23.86' },
    { id:'tr52', date:'2025-08-04', type:'add',    ticker:'TRBCX',  notes:'New position meets model criteria — BUY @196.81' },
    { id:'tr53', date:'2025-08-04', type:'remove', ticker:'PIEQX',  notes:'Fund Score Rank > Threshold — SELL @18.08 (bought @17.30)' },
    { id:'tr54', date:'2025-08-04', type:'remove', ticker:'TROSX',  notes:'Fund Score Rank > Threshold — SELL @14.46 (bought @13.67)' },
    { id:'tr55', date:'2025-11-03', type:'add',    ticker:'PRGSX',  notes:'New position meets model criteria — BUY @64.45' },
    { id:'tr56', date:'2025-11-03', type:'add',    ticker:'PRASX',  notes:'New position meets model criteria — BUY @21.28' },
    { id:'tr57', date:'2025-11-03', type:'add',    ticker:'PRSCX',  notes:'New position meets model criteria — BUY @60.80' },
    { id:'tr58', date:'2025-11-03', type:'remove', ticker:'PRISX',  notes:'Fund Score Rank > Threshold — SELL @44.03 (bought @38.36)' },
    { id:'tr59', date:'2025-11-03', type:'remove', ticker:'PREIX',  notes:'Fund Score Rank > Threshold — SELL @177.46 (bought @163.52)' },
    { id:'tr60', date:'2025-11-03', type:'remove', ticker:'TRIGX',  notes:'Fund Score Rank > Threshold — SELL @22.46 (bought @19.48)' },
    { id:'tr61', date:'2026-02-02', type:'remove', ticker:'PRASX',  notes:'Fund Score Rank > Threshold — SELL @22.38 (bought @21.28)' },
    { id:'tr62', date:'2026-02-02', type:'remove', ticker:'PRSCX',  notes:'Fund Score Rank > Threshold — SELL @61.25 (bought @60.80)' },
    { id:'tr63', date:'2026-02-02', type:'remove', ticker:'TRBCX',  notes:'Fund Score Rank > Threshold — SELL @206.71 (bought @196.81)' },
    { id:'tr64', date:'2026-02-02', type:'remove', ticker:'PRGTX',  notes:'Fund Score Rank > Threshold — SELL @27.24 (bought @23.86)' },
    { id:'tr65', date:'2026-02-02', type:'add',    ticker:'TRIGX',  notes:'New position meets model criteria — BUY @25.60' },
    { id:'tr66', date:'2026-02-02', type:'add',    ticker:'PRNEX',  notes:'New position meets model criteria — BUY @44.78' },
    { id:'tr67', date:'2026-02-02', type:'add',    ticker:'TROSX',  notes:'New position meets model criteria — BUY @17.13' },
    { id:'tr68', date:'2026-02-02', type:'add',    ticker:'PSILX',  notes:'New position meets model criteria — BUY @18.56' },
  ],
  sleeves: [
    { name: 'Current', published_score: 86, published_exp_ratio: 0.87, published_yield: 0.57, holdings: [
      { ticker:'PRASX', name:'T. Rowe Price New Asia Fund', type:'Mutual Fund', weight:20, risk_score:86 },
      { ticker:'PRNEX', name:'T. Rowe Price New Era Fund', type:'Mutual Fund', weight:20, risk_score:82 },
      { ticker:'PRGTX', name:'T. Rowe Price Global Technology Fund', type:'Mutual Fund', weight:20, risk_score:92 },
      { ticker:'PRSCX', name:'T. Rowe Price Science & Tech Fund', type:'Mutual Fund', weight:20, risk_score:90 },
      { ticker:'PRGSX', name:'T. Rowe Price Global Stock', type:'Mutual Fund', weight:20, risk_score:82 }
    ]}
  ]
}

]; // end CAPITAL_PLANNING_MODELS


// ══════════════════════════════════════════════════════════════
// SLEEVE SELECTOR STATE — tracks active sleeve per model
// ══════════════════════════════════════════════════════════════
const _activeSleeveIndex = {}; // modelId -> sleeveIndex

function getActiveSleeve(m) {
  const idx = _activeSleeveIndex[m.id] || 0;
  return m.sleeves[Math.min(idx, m.sleeves.length - 1)];
}

function selectSleeve(modelId, idx) {
  _activeSleeveIndex[modelId] = idx;
  renderMdlGrid();
  // Auto-generate performance if not already cached for this sleeve
  const m = _models.find(x => x.id === modelId);
  if (!m) return;
  const sleeve = m.sleeves ? m.sleeves[Math.min(idx, m.sleeves.length - 1)] : null;
  const hasCached = sleeve ? sleeve.perf && sleeve.perf.ytd != null : m.perf && m.perf.ytd != null;
  if (!hasCached) {
    // Small delay so card renders first
    setTimeout(() => mdlGeneratePerf(modelId, idx), 300);
  }
}


// ══════════════════════════════════════════════════════════════
// PRELOAD + RENDERGRID PATCH
// ══════════════════════════════════════════════════════════════

function preloadCapitalPlanningModels() {
  if (_models.length > 0) return;
  CAPITAL_PLANNING_MODELS.forEach(m => {
    const s = getActiveSleeve(m);
    _models.push({
      ...m,
      holdings: s.holdings || [],
      events:   m.events || [],
    });
  });
  renderMdlGrid();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', preloadCapitalPlanningModels);
} else {
  preloadCapitalPlanningModels();
}

// ════════════════════════════════════════════════════════════════════
// ══ PORTFOLIO PROPOSAL BUILDER ══
// ════════════════════════════════════════════════════════════════════

// State
let _pbState = {
  current: null,            // { portfolio_name, total_value, risk_score, accounts, asset_alloc }
  sleeves: [],              // see schema in pbBuildSleeve
  notes: '',
  uploadedFile: null,
  uploadedFileData: null,
  noCurrent: false          // true = user chose "start from scratch"
};
let _pbSleeveCounter = 0;
let _pbCustomRowCounter = 0;

// ── Reset everything ──
function pbReset() {
  if (!confirm('Start over? This will clear the current portfolio and all sleeves.')) return;
  _pbState = { current: null, sleeves: [], notes: '', uploadedFile: null, uploadedFileData: null, noCurrent: false };
  document.getElementById('pb-current-summary').style.display = 'none';
  document.getElementById('pb-step2').style.display = 'none';
  document.getElementById('pb-step3').style.display = 'none';
  document.getElementById('pb-upload-status').textContent = '';
  document.getElementById('pb-upload-text').textContent = "Click or drop the client's current portfolio file";
  document.getElementById('pb-upload-box').classList.remove('has-file');
  document.getElementById('pb-skip-btn').classList.remove('active');
  document.getElementById('pb-step1-num').classList.remove('done');
  document.getElementById('pb-notes').value = '';
  const list = document.getElementById('pb-sleeves-list');
  if (list) list.innerHTML = '';
}

// ── Skip current portfolio (build from scratch) ──
function pbSkipCurrent() {
  // If already in skip mode, undo
  if (_pbState.noCurrent) {
    _pbState.noCurrent = false;
    document.getElementById('pb-skip-btn').classList.remove('active');
    document.getElementById('pb-step1-num').classList.remove('done');
    if (!_pbState.current) {
      document.getElementById('pb-step2').style.display = 'none';
      document.getElementById('pb-step3').style.display = 'none';
    }
    pbRenderComparison();
    return;
  }
  _pbState.noCurrent = true;
  _pbState.current = null;
  _pbState.uploadedFile = null;
  _pbState.uploadedFileData = null;
  document.getElementById('pb-upload-status').textContent = '';
  document.getElementById('pb-upload-text').textContent = "Click or drop the client's current portfolio file";
  document.getElementById('pb-upload-box').classList.remove('has-file');
  document.getElementById('pb-skip-btn').classList.add('active');
  document.getElementById('pb-step1-num').classList.add('done');
  document.getElementById('pb-current-summary').style.display = 'none';
  document.getElementById('pb-step2').style.display = 'block';
  document.getElementById('pb-step3').style.display = 'block';
  pbRenderSleeves();
  pbRenderComparison();
}

// ── Handle current portfolio file upload ──
async function pbHandleUpload(file) {
  if (!file) return;
  // If user uploads a real file, exit skip mode
  _pbState.noCurrent = false;
  document.getElementById('pb-skip-btn').classList.remove('active');

  _pbState.uploadedFile = file;
  const box = document.getElementById('pb-upload-box');
  const text = document.getElementById('pb-upload-text');
  text.textContent = '⏳ ' + file.name;
  box.classList.add('has-file');
  const status = document.getElementById('pb-upload-status');
  status.classList.remove('err');
  status.textContent = 'Reading file…';

  try {
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    const fileData = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file.'));
      if (ext === 'csv') reader.readAsText(file);
      else if (['xlsx','xls','docx','doc'].includes(ext)) reader.readAsArrayBuffer(file);
      else reader.readAsDataURL(file);
    });
    _pbState.uploadedFileData = fileData;

    status.textContent = 'Parsing with AI…';
    await pbParseCurrent(file, fileData, ext);

    status.textContent = '✓ Parsed successfully';
    text.textContent = '✓ ' + file.name + ' · click to replace';
    document.getElementById('pb-step1-num').classList.add('done');

    pbRenderCurrentSummary();
    document.getElementById('pb-step2').style.display = 'block';
    document.getElementById('pb-step3').style.display = 'block';
    pbRenderSleeves();
    pbRenderComparison();
  } catch (err) {
    console.error(err);
    status.classList.add('err');
    status.textContent = '✗ ' + (err.message || 'Upload failed. Try a different file.');
    text.textContent = "Click or drop the client's current portfolio file";
    box.classList.remove('has-file');
  }
}

// ── AI parse of current portfolio (uses the same engine as the analyzer) ──
async function pbParseCurrent(file, fileData, ext) {
  let fileContent = [];
  if (file.type.startsWith('image/') || (!['pdf','csv','xlsx','xls','docx','doc'].includes(ext))) {
    const b64 = fileData.split(',')[1];
    fileContent = [{ type:'image', source:{ type:'base64', media_type:file.type||'image/png', data:b64 } }];
  } else if (ext === 'pdf') {
    const b64 = fileData.split(',')[1];
    fileContent = [{ type:'document', source:{ type:'base64', media_type:'application/pdf', data:b64 } }];
  } else if (ext === 'csv') {
    fileContent = [{ type:'text', text:'FILE CONTENT (CSV):\n' + fileData }];
  } else if (ext === 'xlsx' || ext === 'xls') {
    const wb = XLSX.read(fileData, { type:'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(ws);
    if (!csv.trim()) throw new Error('Excel file appears empty.');
    fileContent = [{ type:'text', text:'FILE CONTENT (Excel as CSV):\n' + csv }];
  } else if (ext === 'docx' || ext === 'doc') {
    const result = await mammoth.extractRawText({ arrayBuffer: fileData });
    if (!result.value.trim()) throw new Error('Word document appears empty.');
    fileContent = [{ type:'text', text:'FILE CONTENT (Word doc):\n' + result.value }];
  }

  // Pull known scores subset to keep prompt manageable
  const fileText = fileContent.map(b => b.text || '').join(' ').toUpperCase();
  const knownScoresObj = {};
  for (const [ticker, score] of Object.entries({...TICKER_SCORES, ..._sessionScoreCache})) {
    const re = new RegExp('\\b' + ticker.replace('.','[.]') + '\\b');
    if (re.test(fileText)) knownScoresObj[ticker] = score;
  }
  Object.assign(knownScoresObj, {SPY:74,QQQ:85,AGG:28,IWM:87,BND:25,TLT:35,VTI:75,GLD:65,IBIT:95});
  const knownScoresJSON = JSON.stringify(knownScoresObj);

  // Pre-extract client first name(s) from account labels (e.g. "Byron - SWM IRA").
  const clientNameHint = buildClientNameHint(fileContent);

  const prompt = `You are a financial risk analyst. Parse this portfolio file and score every holding on a Nitrogen/Riskalyze 0-100 risk scale.

${clientNameHint}For the portfolio_name: use the real client name only — never use "SWM", "LPL", account numbers, or generic terms like "Client Portfolio".

KNOWN RISK SCORES (use these directly):
${knownScoresJSON}

For any ticker NOT in the list above, use your knowledge to assign a score. Calibration:
SPY=74, QQQ=85, AGG=28, TLT=35, HYG=48, GLD=65, EEM=82, IBIT=95
Money market/cash=5, Variable annuity=50, Other annuities=5, Structured note=30, Bond=20, CD=5

CRITICAL — Return ONLY valid JSON, no markdown, no explanation:
{"portfolio_name":"string","accounts":[{"account_name":"string","holdings":[{"ticker":"string","name":"string","type":"string","market_value":number,"allocation_pct":number,"risk_score":number}]}]}

Rules:
- Group by account
- market_value: actual dollar value from file
- allocation_pct: % of THIS account total (0-100)
- No ticker = empty string`;

  const resp = await fetch('/api/proxy', {
    method: 'POST',
    headers: getApiHeaders(),
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role:'user', content: [...fileContent, { type:'text', text:prompt }] }]
    })
  });
  if (!resp.ok) throw new Error(`API error ${resp.status}`);
  const data = await resp.json();
  if (data.error) throw new Error(data.error.message || 'API error');

  const txt = (data.content || []).map(b => b.text || '').join('').replace(/```json|```/g,'').trim();
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Could not parse AI response.');
  const parsed = JSON.parse(m[0]);

  // Apply classifyHolding overrides (annuity/note/bond detection) the same way the analyzer does
  const accounts = (parsed.accounts || []).map(acct => ({
    ...acct,
    holdings: (acct.holdings || []).map(h => {
      const classified = classifyHolding(h);
      const mv = parseFloat(h.market_value) || 0;
      if (classified) return { ...h, market_value: mv, risk_score: classified.score, type: classified.type };
      const t = (h.ticker || '').toUpperCase().trim();
      const local = TICKER_SCORES[t] || _sessionScoreCache[t];
      return { ...h, market_value: mv, risk_score: local !== undefined ? local : (h.risk_score || 50) };
    })
  }));

  // Compute total value and weighted risk score
  let totalValue = 0, weightedScore = 0;
  accounts.forEach(a => {
    (a.holdings || []).forEach(h => {
      const mv = parseFloat(h.market_value) || 0;
      totalValue += mv;
      weightedScore += mv * (parseFloat(h.risk_score) || 50);
    });
  });
  const overallRisk = totalValue > 0 ? Math.round(weightedScore / totalValue) : 50;

  _pbState.current = {
    portfolio_name: parsed.portfolio_name || 'Client Portfolio',
    total_value: totalValue,
    risk_score: overallRisk,
    accounts: accounts,
    asset_alloc: pbComputeAssetAlloc(accounts)
  };
}

// ── Compute asset class allocation from a flat list of holdings ──
function pbComputeAssetAlloc(accounts) {
  let eq=0, fi=0, cash=0, alt=0, ann=0, sn=0;
  accounts.forEach(a => {
    (a.holdings || []).forEach(h => {
      const mv = parseFloat(h.market_value) || 0;
      const t = (h.type || '').toLowerCase();
      const s = parseFloat(h.risk_score) || 50;
      if (t.includes('annuity')) ann += mv;
      else if (t.includes('structured note') || t.includes('buffer note') || t.includes('autocall') ||
               t.includes('barrier note') || t.includes('reverse convertible') ||
               t.includes('participation note') || t.includes('principal protected')) sn += mv;
      else if (s <= 6 || t.includes('money market') || (t.includes('cash') && !t.includes('cash flow'))) cash += mv;
      else if (s <= 40 || t.includes('bond') || t.includes('fixed') || t.includes('municipal') || t.includes('securitized')) fi += mv;
      else if (t.includes('alt') || t.includes('commodity') || t.includes('real asset')) alt += mv;
      else eq += mv;
    });
  });
  const total = eq+fi+cash+alt+ann+sn || 1;
  return {
    Equities: eq/total*100,
    'Fixed Income': fi/total*100,
    Cash: cash/total*100,
    Annuities: ann/total*100,
    'Structured Notes': sn/total*100,
    Alternatives: alt/total*100
  };
}

// ── Render current portfolio summary card ──
function pbRenderCurrentSummary() {
  const c = _pbState.current;
  if (!c) return;
  const box = document.getElementById('pb-current-summary');
  const col = riskColor(c.risk_score);
  const acctCount = (c.accounts || []).length;
  const positionsCount = c.accounts.reduce((s,a) => s + (a.holdings||[]).length, 0);
  box.innerHTML = `
    <div class="pb-summary-card">
      <div>
        <div class="pb-sum-label">Client</div>
        <div class="pb-sum-val">${formatPortfolioTitle(c.portfolio_name)}</div>
        <div style="font-size:.6rem;color:rgba(255,255,255,.5);margin-top:4px">${acctCount} account${acctCount===1?'':'s'} · ${positionsCount} position${positionsCount===1?'':'s'}</div>
      </div>
      <div style="text-align:center">
        <div class="pb-sum-label">Total Value</div>
        <div class="pb-sum-val">$${Math.round(c.total_value).toLocaleString('en-US')}</div>
      </div>
      <div style="text-align:center">
        <div class="pb-sum-label">Risk Score</div>
        <div class="pb-sum-val pb-sum-score" style="color:${col}">${c.risk_score}</div>
        <div style="font-size:.6rem;color:rgba(255,255,255,.6)">${riskLevelLabel(c.risk_score)}</div>
      </div>
    </div>`;
  box.style.display = 'block';
}

// ── Sleeve schema:
// { id, sourceType: 'cp-model'|'custom', modelId?, modelName, sleeveName?, weight, holdings: [{ticker,name,type,weight,risk_score}], risk_score }

function pbBuildSleeve(opts) {
  _pbSleeveCounter++;
  return {
    id: 'sl-' + _pbSleeveCounter,
    ...opts
  };
}

// ── Render the sleeves list ──
function pbRenderSleeves() {
  const list = document.getElementById('pb-sleeves-list');
  if (!list) return;
  if (!_pbState.sleeves.length) {
    list.innerHTML = '<div class="pb-empty">No sleeves added yet. Add a Capital Planning model or a custom sleeve below.</div>';
  } else {
    list.innerHTML = _pbState.sleeves.map(s => pbRenderSleeveCard(s)).join('');
  }
  pbUpdateWeightTotal();
  pbRenderComparison();
}

function pbRenderSleeveCard(s) {
  const col = riskColor(s.risk_score);
  const holdingsPreview = (s.holdings || []).slice(0, 6).map(h => {
    const w = parseFloat(h.weight) || 0;
    const label = (h.ticker ? h.ticker + ' · ' : '') + (h.name || h.ticker || '—');
    return `<div class="pb-sleeve-holding-row"><span style="color:var(--navy);font-weight:600">${label}</span><span>${w.toFixed(1)}%</span></div>`;
  }).join('');
  const moreCount = (s.holdings || []).length - 6;
  const moreLine = moreCount > 0 ? `<div class="pb-sleeve-holding-row" style="color:var(--slate-lt);font-style:italic">+ ${moreCount} more holding${moreCount===1?'':'s'}</div>` : '';

  return `
    <div class="pb-sleeve-card" id="${s.id}">
      <div class="pb-sleeve-head">
        <div>
          <div class="pb-sleeve-name">${s.modelName || 'Custom Sleeve'}</div>
          <div class="pb-sleeve-sub">${s.sourceType === 'cp-model' ? '🏛️ CP Model' : '✏️ Custom'} ${s.sleeveName ? '· ' + s.sleeveName : ''} · ${(s.holdings||[]).length} holding${(s.holdings||[]).length===1?'':'s'}</div>
        </div>
        <div class="pb-sleeve-weight-wrap pb-export-static">
          <input class="pb-sleeve-weight" type="number" min="0" max="100" step="0.1" value="${s.weight}" oninput="pbUpdateSleeveWeight('${s.id}', this.value)">
          <span class="pb-sleeve-pct">%</span>
        </div>
        <div style="text-align:center">
          <div class="pb-sleeve-risk-lbl">Risk</div>
          <div class="pb-sleeve-risk" style="color:${col}">${Math.round(s.risk_score)}</div>
          ${s.published_score != null ? `<div style="font-size:.5rem;letter-spacing:.06em;color:var(--slate-lt);margin-top:2px">LPL: ${s.published_score}</div>` : ''}
        </div>
        <button class="pb-sleeve-del pb-no-export" title="Remove sleeve" onclick="pbDeleteSleeve('${s.id}')">✕</button>
      </div>
      ${holdingsPreview ? `<div class="pb-sleeve-holdings">${holdingsPreview}${moreLine}</div>` : ''}
    </div>`;
}

function pbUpdateSleeveWeight(sleeveId, val) {
  const s = _pbState.sleeves.find(x => x.id === sleeveId);
  if (!s) return;
  s.weight = parseFloat(val) || 0;
  pbUpdateWeightTotal();
  pbRenderComparison();
}

function pbUpdateWeightTotal() {
  const total = _pbState.sleeves.reduce((s, x) => s + (parseFloat(x.weight) || 0), 0);
  const el = document.getElementById('pb-weight-total');
  if (!el) return;
  el.innerHTML = `Total weight: <span class="pb-tot-num">${total.toFixed(1)}%</span>`;
  el.classList.remove('warn','ok');
  if (Math.abs(total - 100) < 0.01) el.classList.add('ok');
  else el.classList.add('warn');
}

function pbDeleteSleeve(sleeveId) {
  const s = _pbState.sleeves.find(x => x.id === sleeveId);
  if (!s) return;
  if (!confirm(`Remove the "${s.modelName}" sleeve?`)) return;
  _pbState.sleeves = _pbState.sleeves.filter(x => x.id !== sleeveId);
  pbRenderSleeves();
}

// ── Compute weighted risk score for a sleeve from its holdings ──
function pbComputeSleeveRisk(holdings) {
  const totalW = holdings.reduce((s, h) => s + (parseFloat(h.weight) || 0), 0);
  if (totalW <= 0) return 50;
  const weighted = holdings.reduce((s, h) => s + (parseFloat(h.weight) || 0) * (parseFloat(h.risk_score) || 50), 0);
  return weighted / totalW;
}

// ── CP MODEL SLEEVE MODAL ──
function pbOpenAddModelSleeve() {
  const sel = document.getElementById('pb-model-select');
  sel.innerHTML = '<option value="">— Select a Capital Planning model —</option>' +
    CAPITAL_PLANNING_MODELS.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  document.getElementById('pb-model-weight').value = '';
  document.getElementById('pb-model-preview').style.display = 'none';
  document.getElementById('pb-model-sleeve-wrap').style.display = 'none';
  document.getElementById('pb-model-overlay').style.display = 'flex';
}

function pbCloseModelModal() {
  document.getElementById('pb-model-overlay').style.display = 'none';
}

function pbUpdateModelPreview(resetSleeve) {
  const modelId = document.getElementById('pb-model-select').value;
  if (!modelId) {
    document.getElementById('pb-model-preview').style.display = 'none';
    document.getElementById('pb-model-sleeve-wrap').style.display = 'none';
    return;
  }
  const model = CAPITAL_PLANNING_MODELS.find(m => m.id === modelId);
  if (!model) return;

  // Only repopulate the sleeve dropdown when the model itself changes (resetSleeve=true).
  // When called from the sleeve onchange, preserve the user's selected index.
  const sleeveWrap = document.getElementById('pb-model-sleeve-wrap');
  const sleeveSel  = document.getElementById('pb-model-sleeve-select');
  if (model.sleeves && model.sleeves.length > 1) {
    if (resetSleeve || sleeveSel.dataset.modelId !== modelId) {
      sleeveSel.innerHTML = model.sleeves.map((sl, i) => `<option value="${i}">${sl.name}</option>`).join('');
      sleeveSel.value = '0';
      sleeveSel.dataset.modelId = modelId;
    }
    sleeveWrap.style.display = 'block';
  } else {
    sleeveWrap.style.display = 'none';
    sleeveSel.dataset.modelId = modelId;
  }
  const sleeveIdx = (model.sleeves && model.sleeves.length > 1) ? (parseInt(sleeveSel.value)||0) : 0;
  const sleeve = (model.sleeves || [])[sleeveIdx];
  if (!sleeve) return;

  const risk = pbComputeSleeveRisk(sleeve.holdings);
  const col = riskColor(risk);
  const holdingsHtml = sleeve.holdings.map(h =>
    `<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border)">
       <span style="font-weight:600;color:var(--navy)">${h.ticker || '—'}</span>
       <span style="color:var(--slate);flex:1;margin:0 8px;font-size:.72rem">${h.name || ''}</span>
       <span style="font-weight:700;color:var(--navy)">${(parseFloat(h.weight)||0).toFixed(1)}%</span>
     </div>`).join('');

  // Build LPL published reference badges if present
  const refBits = [];
  if (sleeve.published_score != null)     refBits.push(`LPL Risk <strong>${sleeve.published_score}</strong>`);
  if (sleeve.published_exp_ratio != null) refBits.push(`Exp Ratio <strong>${sleeve.published_exp_ratio.toFixed(2)}%</strong>`);
  if (sleeve.published_yield != null)     refBits.push(`Yield <strong>${sleeve.published_yield.toFixed(2)}%</strong>`);
  const refRow = refBits.length
    ? `<div style="margin:6px 0 10px;padding:8px 10px;background:#f3eede;border-left:3px solid var(--gold);font-size:.7rem;color:var(--navy);border-radius:4px">
         <span style="font-size:.55rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--slate);margin-right:8px">Per LPL Factsheet</span>
         ${refBits.join(' &nbsp;·&nbsp; ')}
       </div>`
    : '';

  document.getElementById('pb-model-preview').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div><strong>${model.name}</strong>${sleeve.name && sleeve.name !== 'Current' ? ' · ' + sleeve.name : ''}</div>
      <div><span style="color:${col};font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700">${Math.round(risk)}</span> <span style="font-size:.65rem;color:var(--slate-lt)">risk score</span></div>
    </div>
    ${refRow}
    ${holdingsHtml}`;
  document.getElementById('pb-model-preview').style.display = 'block';
}

function pbConfirmModelSleeve() {
  const modelId = document.getElementById('pb-model-select').value;
  const weight = parseFloat(document.getElementById('pb-model-weight').value);
  if (!modelId) { alert('Please select a model.'); return; }
  if (isNaN(weight) || weight <= 0 || weight > 100) { alert('Enter a weight between 0 and 100.'); return; }
  const model = CAPITAL_PLANNING_MODELS.find(m => m.id === modelId);
  if (!model) return;
  const sleeveIdx = (model.sleeves && model.sleeves.length > 1)
    ? (parseInt(document.getElementById('pb-model-sleeve-select').value)||0)
    : 0;
  const sleeve = (model.sleeves || [])[sleeveIdx];
  if (!sleeve) { alert('Selected model has no holdings.'); return; }

  // Apply classifyHolding overrides to the model's holdings (in case some need reclassification)
  const holdings = sleeve.holdings.map(h => {
    const classified = classifyHolding(h);
    if (classified) return { ...h, risk_score: classified.score, type: classified.type };
    return { ...h };
  });
  const risk = pbComputeSleeveRisk(holdings);

  _pbState.sleeves.push(pbBuildSleeve({
    sourceType: 'cp-model',
    modelId,
    modelName: model.name,
    sleeveName: sleeve.name && sleeve.name !== 'Current' ? sleeve.name : '',
    weight,
    holdings,
    risk_score: risk,
    published_score: sleeve.published_score,
    published_exp_ratio: sleeve.published_exp_ratio,
    published_yield: sleeve.published_yield
  }));

  pbCloseModelModal();
  pbRenderSleeves();
}

// ── CUSTOM SLEEVE MODAL ──
function pbOpenAddCustomSleeve() {
  document.getElementById('pb-custom-name').value = '';
  document.getElementById('pb-custom-weight').value = '';
  document.getElementById('pb-custom-holdings-list').innerHTML = '';
  pbAddCustomRow(); // start with one empty row
  document.getElementById('pb-custom-overlay').style.display = 'flex';
}

function pbCloseCustomModal() {
  document.getElementById('pb-custom-overlay').style.display = 'none';
}

function pbAddCustomRow() {
  _pbCustomRowCounter++;
  const id = 'pbcr-' + _pbCustomRowCounter;
  const row = document.createElement('div');
  row.className = 'aa-holding-row';
  row.id = id;
  row.style.cssText = 'display:grid;grid-template-columns:90px 1fr 80px 75px 32px;gap:8px;margin-bottom:6px';
  row.innerHTML = `
    <input class="aa-input" placeholder="TICKER" style="text-transform:uppercase">
    <input class="aa-input" placeholder="Name / description">
    <input class="aa-input" type="number" min="0" max="100" step="0.1" placeholder="Weight">
    <input class="aa-input" type="number" min="0" max="100" placeholder="Risk">
    <button class="aa-remove-btn" onclick="this.closest('.aa-holding-row').remove()" title="Remove">✕</button>`;
  document.getElementById('pb-custom-holdings-list').appendChild(row);
}

function pbConfirmCustomSleeve() {
  const name = document.getElementById('pb-custom-name').value.trim();
  const weight = parseFloat(document.getElementById('pb-custom-weight').value);
  if (!name) { alert('Please enter a sleeve name.'); return; }
  if (isNaN(weight) || weight <= 0 || weight > 100) { alert('Enter a sleeve weight between 0 and 100.'); return; }

  const rows = document.querySelectorAll('#pb-custom-holdings-list .aa-holding-row');
  const holdings = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const ticker = (inputs[0].value || '').trim().toUpperCase();
    const hname = (inputs[1].value || '').trim();
    const w = parseFloat(inputs[2].value);
    let r = parseInt(inputs[3].value, 10);
    if (!ticker && !hname) return; // skip blank rows
    if (isNaN(w) || w <= 0) return; // require a weight

    // Auto-classify if no risk provided
    const fake = { ticker, name: hname, type: '' };
    const classified = classifyHolding(fake);
    if (isNaN(r)) {
      if (classified) r = classified.score;
      else r = TICKER_SCORES[ticker] || _sessionScoreCache[ticker] || 50;
    }
    holdings.push({
      ticker,
      name: hname || ticker,
      type: classified ? classified.type : 'Custom',
      weight: w,
      risk_score: r
    });
  });

  if (!holdings.length) { alert('Add at least one holding with a weight greater than zero.'); return; }

  // Normalize: weights inside the sleeve should sum to 100 for the rollup math.
  // If user gave dollar-ish weights or a partial set, we still rescale to make calc clean.
  const sumW = holdings.reduce((s, h) => s + h.weight, 0);
  if (sumW > 0 && Math.abs(sumW - 100) > 0.5) {
    holdings.forEach(h => { h.weight = h.weight / sumW * 100; });
  }
  const risk = pbComputeSleeveRisk(holdings);

  _pbState.sleeves.push(pbBuildSleeve({
    sourceType: 'custom',
    modelId: null,
    modelName: name,
    sleeveName: '',
    weight,
    holdings,
    risk_score: risk
  }));

  pbCloseCustomModal();
  pbRenderSleeves();
}

// ── Compute proposed portfolio risk + asset allocation from sleeves ──
function pbComputeProposed() {
  const totalW = _pbState.sleeves.reduce((s, x) => s + (parseFloat(x.weight) || 0), 0);
  if (totalW <= 0) return { risk: null, alloc: null, totalWeight: 0 };

  // Weighted risk score across sleeves
  const weightedRisk = _pbState.sleeves.reduce((s, x) =>
    s + (parseFloat(x.weight) || 0) * (parseFloat(x.risk_score) || 50), 0) / totalW;

  // Asset allocation: aggregate holdings across sleeves
  // Each holding's contribution to the overall portfolio % is:
  //   (sleeveWeight / totalW) × (holdingWeight / 100)
  const buckets = { Equities:0, 'Fixed Income':0, Cash:0, Annuities:0, 'Structured Notes':0, Alternatives:0 };
  _pbState.sleeves.forEach(sl => {
    const sleeveShare = (parseFloat(sl.weight) || 0) / totalW;
    const innerSum = sl.holdings.reduce((s, h) => s + (parseFloat(h.weight)||0), 0) || 1;
    sl.holdings.forEach(h => {
      const w = (parseFloat(h.weight) || 0) / innerSum;
      const overallShare = sleeveShare * w * 100;
      const t = (h.type || '').toLowerCase();
      const s = parseFloat(h.risk_score) || 50;
      if (t.includes('annuity')) buckets['Annuities'] += overallShare;
      else if (t.includes('structured note') || t.includes('buffer note') || t.includes('autocall') ||
               t.includes('barrier') || t.includes('reverse convertible') ||
               t.includes('participation note') || t.includes('principal protected')) buckets['Structured Notes'] += overallShare;
      else if (s <= 6 || t.includes('money market') || (t.includes('cash') && !t.includes('cash flow'))) buckets['Cash'] += overallShare;
      else if (s <= 40 || t.includes('bond') || t.includes('fixed') || t.includes('municipal') || t.includes('securitized')) buckets['Fixed Income'] += overallShare;
      else if (t.includes('alt') || t.includes('commodity') || t.includes('real asset')) buckets['Alternatives'] += overallShare;
      else buckets['Equities'] += overallShare;
    });
  });

  return { risk: Math.round(weightedRisk), alloc: buckets, totalWeight: totalW };
}

// ── Render the comparison panel ──
function pbRenderComparison() {
  const c = _pbState.current;
  const noCurrent = _pbState.noCurrent === true;
  const p = pbComputeProposed();
  const wrap = document.getElementById('pb-comparison');
  if (!wrap) return;
  if (!c && !noCurrent) { wrap.innerHTML = ''; return; }

  const noProposed = !p.risk;
  const cCol = c ? riskColor(c.risk_score) : '#a8b8cc';
  const pCol = noProposed ? '#a8b8cc' : riskColor(p.risk);
  const delta = (noProposed || noCurrent) ? null : (p.risk - c.risk_score);
  const deltaClass = delta === null ? 'pb-delta-flat' : (delta > 0 ? 'pb-delta-up' : delta < 0 ? 'pb-delta-down' : 'pb-delta-flat');
  const deltaArrow = delta === null ? '—' : (delta > 0 ? '▲' : delta < 0 ? '▼' : '◆');

  // Asset allocation rows — show both current and proposed bars (current omitted in scratch mode)
  const allocKeys = ['Equities','Fixed Income','Cash','Annuities','Structured Notes','Alternatives'];
  const bucketColors = {
    'Equities':'#2d5a8a', 'Fixed Income':'#22a06b', 'Cash':'#6b7e96',
    'Annuities':'#9b59b6', 'Structured Notes':'#d4820a', 'Alternatives':'#c9a84c'
  };
  const allocRows = allocKeys.filter(k => (c && (c.asset_alloc[k] || 0) > 0.05) || (p.alloc && p.alloc[k] > 0.05)).map(k => {
    const cv = c ? (c.asset_alloc[k] || 0) : 0;
    const pv = p.alloc ? (p.alloc[k] || 0) : 0;
    const bc = bucketColors[k];
    return `
      <div class="pb-alloc-row">
        <div class="pb-alloc-label">${k}</div>
        <div class="pb-alloc-bar-wrap">
          ${noCurrent
            ? '<div style="font-size:.65rem;color:var(--slate-lt);font-style:italic;text-align:center">—</div>'
            : `<div class="pb-alloc-bar-bg"><div class="pb-alloc-bar-fill" style="width:${cv.toFixed(1)}%;background:${bc}"></div></div>
               <div class="pb-alloc-pct">${cv.toFixed(1)}%</div>`}
        </div>
        <div class="pb-alloc-bar-wrap">
          <div class="pb-alloc-bar-bg"><div class="pb-alloc-bar-fill" style="width:${pv.toFixed(1)}%;background:${bc}"></div></div>
          <div class="pb-alloc-pct">${pv.toFixed(1)}%</div>
        </div>
      </div>`;
  }).join('');

  // Sleeve composition table
  const sleeveRows = _pbState.sleeves.map(s => {
    const col = riskColor(s.risk_score);
    return `<tr>
      <td style="font-weight:700;color:var(--navy);font-size:.78rem;padding:6px 8px">${s.modelName}${s.sleeveName ? ' · ' + s.sleeveName : ''}</td>
      <td style="font-size:.7rem;color:var(--slate);padding:6px 8px">${s.sourceType === 'cp-model' ? 'CP Model' : 'Custom'}</td>
      <td style="text-align:center;font-weight:700;font-family:'Playfair Display',serif;padding:6px 8px">${s.weight.toFixed(1)}%</td>
      <td style="text-align:center;color:${col};font-weight:700;font-family:'Playfair Display',serif;padding:6px 8px">${Math.round(s.risk_score)}</td>
    </tr>`;
  }).join('');

  // Current-side card content (real data, or "scratch" placeholder)
  const currentCardBody = noCurrent ? `
        <div class="pb-compare-head">Current Portfolio</div>
        <div class="pb-compare-score" style="color:#a8b8cc;font-size:2.6rem">—</div>
        <div class="pb-compare-level" style="color:var(--slate-lt);font-style:italic">Starting from scratch</div>
        <div class="pb-compare-bar-bg"><div class="pb-compare-bar-fill" style="width:0%"></div></div>
        <div class="pb-compare-stat" style="font-style:italic;color:var(--slate-lt)"><span>No current portfolio</span><strong>—</strong></div>
        <div class="pb-compare-stat" style="font-style:italic;color:var(--slate-lt)"><span>Building a new allocation</span><strong>—</strong></div>` : `
        <div class="pb-compare-head">Current Portfolio</div>
        <div class="pb-compare-score" style="color:${cCol}">${c.risk_score}</div>
        <div class="pb-compare-level">${riskLevelLabel(c.risk_score)}</div>
        <div class="pb-compare-bar-bg"><div class="pb-compare-bar-fill" style="width:${c.risk_score}%;background:${cCol}"></div></div>
        <div class="pb-compare-stat"><span>Total Value</span><strong>$${Math.round(c.total_value).toLocaleString('en-US')}</strong></div>
        <div class="pb-compare-stat"><span>Accounts</span><strong>${(c.accounts||[]).length}</strong></div>
        <div class="pb-compare-stat"><span>Positions</span><strong>${c.accounts.reduce((s,a)=>s+(a.holdings||[]).length,0)}</strong></div>`;

  // Proposed-side bottom stat depends on whether we have a current total to anchor to
  const proposedTotalStat = c
    ? `<div class="pb-compare-stat"><span>Estimated Total</span><strong>$${Math.round(c.total_value).toLocaleString('en-US')}</strong></div>`
    : '';

  wrap.innerHTML = `
    <div class="pb-compare-grid">
      <div class="pb-compare-col">${currentCardBody}</div>
      <div class="pb-compare-col proposed">
        <div class="pb-compare-head proposed">Proposed Portfolio</div>
        <div class="pb-compare-score" style="color:${pCol}">${noProposed ? '—' : p.risk}</div>
        <div class="pb-compare-level">${noProposed ? 'Add sleeves to build' : riskLevelLabel(p.risk)}</div>
        <div class="pb-compare-bar-bg"><div class="pb-compare-bar-fill" style="width:${noProposed?0:p.risk}%;background:${pCol}"></div></div>
        <div class="pb-compare-stat"><span>Sleeves</span><strong>${_pbState.sleeves.length}</strong></div>
        <div class="pb-compare-stat"><span>Weight Allocated</span><strong style="color:${Math.abs(p.totalWeight-100)<0.01?'var(--green)':'#c0392b'}">${p.totalWeight.toFixed(1)}%</strong></div>
        ${proposedTotalStat}
      </div>
    </div>

    ${(!noProposed && !noCurrent) ? `
    <div class="pb-delta-banner">
      <div>
        <div class="pb-delta-label">Risk Score Change</div>
        <div style="font-size:.85rem;color:#fff;margin-top:2px">${c.risk_score} → ${p.risk}</div>
      </div>
      <div style="text-align:right">
        <div class="pb-delta-label">Delta</div>
        <div class="pb-delta-val ${deltaClass}">${deltaArrow} ${delta>0?'+':''}${delta} pts</div>
      </div>
    </div>` : ''}

    <div style="margin-top:22px">
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin-bottom:10px">${noCurrent ? 'Proposed Allocation' : 'Asset Allocation Comparison'}</div>
      <div class="pb-alloc-row" style="border-bottom:2px solid var(--navy);padding-bottom:6px">
        <div style="font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase">Asset Class</div>
        <div style="font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase">${noCurrent ? '—' : 'Current'}</div>
        <div style="font-size:.6rem;color:var(--gold);font-weight:700;letter-spacing:.08em;text-transform:uppercase">Proposed</div>
      </div>
      ${allocRows || '<div style="padding:14px;text-align:center;color:var(--slate-lt);font-size:.74rem;font-style:italic">No allocation data yet — add sleeves to see the breakdown.</div>'}
    </div>

    ${sleeveRows ? `
    <div style="margin-top:22px">
      <div style="font-size:.65rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--slate);margin-bottom:10px">Proposed Sleeve Composition</div>
      <table style="width:100%;border-collapse:collapse;font-family:'Nunito Sans',sans-serif">
        <thead>
          <tr style="border-bottom:2px solid var(--navy)">
            <th style="text-align:left;font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px">Sleeve</th>
            <th style="text-align:left;font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px">Source</th>
            <th style="text-align:center;font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px">Weight</th>
            <th style="text-align:center;font-size:.6rem;color:var(--slate-lt);font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 8px">Risk</th>
          </tr>
        </thead>
        <tbody>${sleeveRows}</tbody>
      </table>
    </div>` : ''}
  `;
}

// ── Save proposal as PDF (uses existing saveAsImage on the proposal view) ──
function pbSaveAsImage() {
  if (!_pbState.current && !_pbState.noCurrent) { alert('Upload a current portfolio first, or click "Start from scratch" to skip.'); return; }
  if (!_pbState.sleeves.length) { alert('Add at least one sleeve before saving.'); return; }
  pbPrepForExport();
  saveAsImage('view-proposal', null, 'portfolio-proposal');
  pbRestoreAfterExport();
}

// ── Download as standalone HTML ──
function pbDownloadHtml() {
  if (!_pbState.current && !_pbState.noCurrent) { alert('Upload a current portfolio first, or click "Start from scratch" to skip.'); return; }
  if (!_pbState.sleeves.length) { alert('Add at least one sleeve before saving.'); return; }
  pbPrepForExport();
  saveAsImage('view-proposal', null, 'portfolio-proposal', true);
  pbRestoreAfterExport();
}

// ── Pre-export DOM prep: persist typed input/textarea values into HTML attributes ──
// so innerHTML capture preserves them.
function pbPrepForExport() {
  const view = document.getElementById('view-proposal');
  if (!view) return;
  // Textarea: copy value into textContent (textContent becomes the inner HTML of <textarea>)
  const ta = document.getElementById('pb-notes');
  if (ta) {
    _pbState.notes = ta.value || '';
    ta.textContent = _pbState.notes;
  }
  // Number/text inputs: sync .value into the value attribute
  view.querySelectorAll('input').forEach(inp => {
    if (inp.value !== undefined && inp.value !== null) inp.setAttribute('value', inp.value);
  });
}

function pbRestoreAfterExport() {
  // No restore needed — saveAsImage captures innerHTML synchronously, and the
  // attribute-sync above does not break the live UI (DOM .value still drives display).
}

// Keep notes in sync as the user types (for export)
document.addEventListener('input', e => {
  if (e.target && e.target.id === 'pb-notes') _pbState.notes = e.target.value;
});

