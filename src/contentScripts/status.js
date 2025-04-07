import failIcon from '../assets/fail.svg';
export function subscribeStatus({ statusUrl, url }) {
  const popId = 'neuralyzerMsg';
  const eventSrc = new EventSource(statusUrl);
  eventSrc.onmessage = function (event) {
    console.log({ event });
    const maintenance = JSON.parse(event.data);
    let popup = document.getElementById(popId);
    if (maintenance.isMaintenance) {
      if (!popup) {
        popup = generatePopupNode();
      }
      popup.innerText = '';
      generateContentNodes(maintenance.message).forEach(
        popup.appendChild.bind(popup)
      );
    } else if (popup) {
      popup.remove();
      window.location.href = url;
    }
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
