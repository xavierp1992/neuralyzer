// src/background/background.js
import { isKioskDomain, KIOSK_PREVIOUS_URL_KEY } from '../constants';

function saveUrlIfKiosk(details) {
  if (isKioskDomain(details.url)) {
    chrome.storage.sync.set({
      [KIOSK_PREVIOUS_URL_KEY]: details.url,
    });
  }
}

// React Router uses pushState
chrome.webNavigation.onHistoryStateUpdated.addListener(saveUrlIfKiosk);
// Also track full page reloads
chrome.webNavigation.onCompleted.addListener(saveUrlIfKiosk);
