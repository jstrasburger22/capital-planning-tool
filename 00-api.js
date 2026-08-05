/* ═══════════════════════════════════════════════════════════
   Capital Planning Wealth Management — API header helpers + shared CSS collection for exports
   Load order matters: files share one global scope and are loaded
   in numeric order by index.html.
   ═══════════════════════════════════════════════════════════ */

  function getApiHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  function submitApiKey() {}
  function reopenApiKeyModal() {}

  // Gather all CSS text — inline <style> blocks plus same-origin external stylesheets.
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
