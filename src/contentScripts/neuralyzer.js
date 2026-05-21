import './neuralyzer.css';
import {
  isKioskDomain,
  isSingpassDomain,
  KIOSK_PREVIOUS_URL_KEY,
  OPTION_KEYS,
} from '../constants';
import { createDot } from './dot';
import { subscribeStatus } from './status';
import { createNavigateButton } from './button';

chrome.storage.sync.get(OPTION_KEYS, function (options) {
  document.body.appendChild(createDot(options.url));
  const domain = options.url.substring(
    options.url.indexOf('https://') + 8,
    options.url.lastIndexOf('/')
  );
  const adminDomain = `https://${domain}/admin`;
  if (
    window.location.host === domain &&
    !window.location.href.startsWith(adminDomain)
  ) {
    if (options.kioskName) {
      const kioskName = localStorage.getItem('kioskName');
      if (kioskName === null || kioskName !== options.kioskName) {
        localStorage.setItem('kioskName', options.kioskName);
        window.location.reload();
      }
    }
    if (options.statusUrl) {
      subscribeStatus(options);
    }
    setInterval(function () {
      const today = new Date().getHours();
      if (today >= 0 && today <= 7) {
        console.log('session to be cleared, redirecting in progress...');
        window.location.href = options.url;
      }
    }, 3600000);
  }
});

chrome.storage.sync.get([KIOSK_PREVIOUS_URL_KEY], function (value) {
  const currentURl = window.location.origin;
  const isKiosk = isKioskDomain(currentURl);
  const isSingpass = isSingpassDomain(currentURl);
  // Just show button when user is in singpass page
  if (!isKiosk && isSingpass) {
    document.body.appendChild(createNavigateButton(value?.previousStepUrl));
  }
});
