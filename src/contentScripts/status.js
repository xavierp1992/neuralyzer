import failIcon from '../assets/fail.svg';
export function subscribeStatus({ statusUrl, url }) {
  const popId = 'neuralyzerMsg';
  const ONE_HOUR = 60 * 1000 * 60; // 1 hour in milliseconds
  const baseAPI = statusUrl.replace('/subscribe', '');
  const STREAM_IDLE_TIMEOUT_MS = 30 * 1000; // 30 seconds for 3 missed pings

  let pollingTimer = null;
  let watchdogTimer = null;

  const eventSrc = new EventSource(statusUrl);
  eventSrc.addEventListener('ping', function () {
    armWatchdog();
  });

  const armWatchdog = () => {
    clearTimeout(watchdogTimer);
    watchdogTimer = setTimeout(() => {
      console.log('Did not receive heartbeat for the last 30 seconds');
      reconnect();
    }, STREAM_IDLE_TIMEOUT_MS);
  };

  const reconnect = () => {
    clearTimeout(watchdogTimer);
    if (eventSrc) {
      eventSrc.close();
      subscribeStatus({ statusUrl, url });
    }
  };
  const startPolling = async () => {
    if (pollingTimer) {
      return;
    }
    pollingTimer = setTimeout(async () => {
      try {
        const res = await fetch(baseAPI);
        const maintenance = await res.json();

        const { isManualMaintenance } = await chrome.storage.sync.get({
          isManualMaintenance: false,
        });

        if (!maintenance.enable && !isManualMaintenance) {
          stopPolling();

          const popup = document.getElementById(popId);
          if (popup) popup.remove();

          window.location.href = url;
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, ONE_HOUR);
  };

  const stopPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      pollingTimer = null;
    }
  };

  eventSrc.onopen = () => {
    armWatchdog();
  };

  eventSrc.onmessage = function (event) {
    armWatchdog();
    const manualMaintenanceMessage =
      'We are upgrading our systems to serve you better. \n. Thank you for your understanding.';
    chrome.storage.sync
      .get({ isManualMaintenance: false })
      .then(({ isManualMaintenance }) => {
        const maintenance = JSON.parse(event.data);
        let popup = document.getElementById(popId);
        if (maintenance.isMaintenance || isManualMaintenance) {
          if (!popup) {
            popup = generatePopupNode();
          }
          popup.innerText = '';
          generateContentNodes(
            isManualMaintenance ? manualMaintenanceMessage : maintenance.message
          ).forEach(popup.appendChild.bind(popup));
          startPolling();
        } else if (popup) {
          popup.remove();
          window.location.href = url;
        }
      });
  };
  eventSrc.onerror = function () {
    eventSrc.close();
    setTimeout(function () {
      subscribeStatus({ statusUrl, url });
    }, 60000);
  };

  return eventSrc;

  function generatePopupNode() {
    const i = document.createElement('i');
    i.id = popId;
    document.body.innerText = '';
    document.body.appendChild(i);
    return i;
  }

  function generateContentNodes(message) {
    const icon = new Image();
    icon.src = failIcon;
    const msg = document.createElement('i');
    const newMessage = message.replace(/\n/g, '<br>');
    msg.innerHTML = newMessage;
    return [icon, msg];
  }
}
