import './neuralyzer.css';
import { OPTION_KEYS } from '../constants';
import { createDot } from './dot';
import { subscribeStatus } from './status';

chrome.storage.sync.get(OPTION_KEYS, function (options) {
  document.body.appendChild(createDot(options.url));
  const domain = options.url.substring(
    options.url.indexOf('https://') + 8,
    options.url.lastIndexOf('/')
  );
  if (window.location.host === domain) {
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
