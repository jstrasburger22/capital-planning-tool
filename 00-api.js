/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — AI model setting, API headers, shared CSS collector for exports
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

  // AI model used for every call through /api/proxy. Change it here once.
  const AI_MODEL = 'claude-sonnet-4-6';

  function collectAllCSS() {
    let css = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
    try {
      for (const sheet of document.styleSheets) {
        if (sheet.ownerNode && sheet.ownerNode.tagName === 'STYLE') continue; // already captured
        if (sheet.href && sheet.href.indexOf('fonts.googleapis') !== -1) continue; // fonts load via link tag
        try { css += '\n' + Array.from(sheet.cssRules).map(r => r.cssText).join('\n'); } catch (e) { /* cross-origin */ }
      }
    } catch (e) {}
    return css;
  }

  function getApiHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  function submitApiKey() {}
  function reopenApiKeyModal() {}
