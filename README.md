# Capital Planning Advisor Tools — combined build (Nov 25, 2026)

## Deploy
Upload/commit **all 11 files** to the site root, replacing what's there. They must sit side by side:

    index.html   main.css
    00-api.js  10-core-questionnaire.js  20-portfolio-analyzer.js  30-accounts-deepdive.js
    40-stress-test.js  50-single-stock-data.js  60-model-library.js  70-proposal-builder.js
    80-client-profiles.js

Delete the old `80-clients-alignment.js` if it's there (it's no longer used).
Your Cloudflare Worker / `/api/proxy` setup does not change.

After deploying, a quick check: the **Client profiles** button appears bottom-right, and the stress test has a **2009 Rebound** tab and a **Save as PDF / Print** button.

## What's in this build
Starts from the version that is live today, plus:

**Scoring fixes (Nov 24)**
- Verified ticker table always wins; Treasury/government bond funds scored by duration (TLT 35, not 5)
- Fixed: money market AGPXX (74 → 5), insurance ETFs as annuities, CDs as structured notes, defensive stocks below SPY
- Debit balances now raise the account score (leverage-aware); stress test treats debits correctly
- Score Check panel + source tags; AI estimates flagged for review

**Merged from the multi-file draft (Nov 25)**
- Client profiles: save / load / back up a household (portfolio, score edits, cash, tolerance, distributions). Stored in this browser only for now.
- Reworded questionnaire (COVID-crash question, new weights) on the full-range 1–100 scale; contradiction flags; scoring method recorded in the compliance text
- Questionnaire result flows into the Analyzer's Risk Alignment card and is saved with the profile
- Stress test: 2009 Rebound scenario added (Stagflation kept), Save as PDF / Print
- Better client-name detection ("Joint", "Trust", "IRA" are no longer read as names)

**New**
- Real fund categories instead of "Multiple" from LPL exports (e.g. "Mid Cap ETF", "Multi-Sector Bond Fund")
- Proposal Builder: one click to use the portfolio already in the Analyzer
- Removed a stray copy of two pop-up windows that was being written into every analyzer export

To return to the original questionnaire scale, set `QUIZ_FULL_RANGE = false` in `10-core-questionnaire.js`.
