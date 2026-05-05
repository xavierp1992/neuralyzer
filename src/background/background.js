// src/background/background.js
const KIOSK_DOMAIN_PATTERNS = [
  // DEV
  /^localhost:5500$/,
  // QA (kiosk.qa.spdigital.sg and kiosk-sit[number].qa.spdigital.sg)
  /^kiosk(-sit\d+)?\.qa\.spdigital\.sg$/,
  // PROD
  /^kiosk\.spdigital\.sg$/,
];

function isKioskDomain(url) {
  try {
    const urlObj = new URL(url);
    return KIOSK_DOMAIN_PATTERNS.some((pattern) => pattern.test(urlObj.host));
  } catch (e) {
    console.error("Can't check domain. The domain is invalid ", e);
  }

  return false;
}

function saveUrlIfKiosk(details) {
  if (isKioskDomain(details.url)) {
    chrome.storage.sync.set({ previousStepUrl: details.url });
  }
}

// React Router uses pushState
chrome.webNavigation.onHistoryStateUpdated.addListener(saveUrlIfKiosk);
// Also track full page reloads
chrome.webNavigation.onCompleted.addListener(saveUrlIfKiosk);
