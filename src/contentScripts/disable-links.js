function log(...args) {
  console.log('[DisableLinks]', ...args);
}

function markAnchorDisabled(anchor) {
  if (!anchor) return;

  // Only process once
  if (anchor.dataset.disableLinksProcessed === 'true') return;
  anchor.dataset.disableLinksProcessed = 'true';

  const originalHref = anchor.getAttribute('href');
  if (!anchor.dataset.originalHref && originalHref) {
    anchor.dataset.originalHref = originalHref;
  }

  // Remove href + block interactions
  anchor.removeAttribute('href');
  anchor.style.pointerEvents = 'none';
  anchor.style.cursor = 'default';
  anchor.style.color = 'inherit';
  anchor.setAttribute('aria-disabled', 'true');
}

function collectAllLinks(root = document) {
  const links = [];
  links.push(...root.querySelectorAll('a[href]'));
  const allElements = root.querySelectorAll('*');
  allElements.forEach((el) => {
    if (el.shadowRoot) {
      links.push(...collectAllLinks(el.shadowRoot));
    }
  });
  return links;
}
function disableAllCurrentAnchors() {
  const anchors = collectAllLinks(document);
  anchors.forEach(markAnchorDisabled);
}

function setupGlobalClickBlocker() {
  document.addEventListener(
    'click',
    (event) => {
      // If clicked div is a shadowRoot, check for links inside it. If there are links in the shadowRoot, disable them.
      if (event.target.shadowRoot) {
        const links = [];
        links.push(...collectAllLinks(event.target.shadowRoot));
        links.forEach(markAnchorDisabled);
      }
      const anchor =
        event.target && event.target.closest ? event.target.closest('a') : null;
      if (!anchor) {
        return;
      }

      // If it has an href OR we previously marked it, block it
      const href = anchor.getAttribute('href') || anchor.dataset.originalHref;
      if (!href) return;

      anchor.style.pointerEvents = 'none';
      anchor.style.cursor = 'default';
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    },
    true // capture phase: we see the click before the page does
  );
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const el = /** @type {HTMLElement} */ (node);
        // If the added node is an <a>, process it
        if (el.tagName === 'A') {
          markAnchorDisabled(el);
        }

        // Also process any <a> inside it
        const anchors = el.querySelectorAll?.('a[href]');
        if (anchors && anchors.length) {
          anchors.forEach(markAnchorDisabled);
        }
      });
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

function shouldDisableForUrl(url, patterns) {
  return patterns.some((pattern) => pattern && url.includes(pattern));
}

// Entry point
chrome.storage.sync.get({ disableLinkUrls: [] }, (result) => {
  const patterns = result.disableLinkUrls || [];
  const currentUrl = window.location.href;

  if (!shouldDisableForUrl(currentUrl, patterns)) {
    log('No matching pattern; not disabling links on this page.');
    return;
  }

  log('Disabling links on this page.');

  // 1) Block current anchors
  disableAllCurrentAnchors();

  // 2) try to block future anchors added by React/SPA
  setupMutationObserver();

  // 3) Hard block all anchor clicks at the document level
  setupGlobalClickBlocker();
});
