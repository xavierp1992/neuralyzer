import './options.css';
import { OPTION_KEYS } from '../constants';

function parseLines(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

chrome.storage.sync.get(OPTION_KEYS, function (config) {
  OPTION_KEYS.forEach(
    (key) => (document.getElementById(key).value = config[key] || '')
  );
});

chrome.storage.sync.get({ disableLinkUrls: [] }, (result) => {
  const textarea = document.getElementById('disableUrls');
  textarea.value = result.disableLinkUrls.join('\n');
});

chrome.storage.sync.get(
  { hideElementUrls: [], hideElementSelectors: [] },
  (result) => {
    document.getElementById('hideElementUrls').value =
      result.hideElementUrls.join('\n');
    document.getElementById('hideElementSelectors').value =
      result.hideElementSelectors.join('\n');
  }
);

chrome.storage.sync
  .get({ isManualMaintenance: false })
  .then(({ isManualMaintenance }) => {
    const statusText = document.getElementById('manualMaintenance');
    const slider = document.getElementById('toggleMaintenance');
    statusText.textContent = isManualMaintenance ? 'Online' : 'Offline';
    slider.checked = isManualMaintenance;
  });
document.getElementById('configuration').onsubmit = function (event) {
  event.preventDefault();
  const values = Object.values(event.target).reduce(function (
    acc,
    { name, value }
  ) {
    if (name) {
      acc[name] = value;
    }
    return acc;
  },
  {});
  chrome.storage.sync.set(values, function () {
    document.getElementById('flashMsg').innerText = 'Config saved!';
    setTimeout(function () {
      document.getElementById('flashMsg').innerText = '';
    }, 1500);
  });
};
// options/options.js
document
  .getElementById('toggleMaintenance')
  .addEventListener('change', (event) => {
    const isChecked = event.target.checked;
    const statusText = document.getElementById('manualMaintenance');
    statusText.textContent = event.target.checked ? 'Online' : 'Offline';
    chrome.storage.sync.set({ isManualMaintenance: isChecked }).then(
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.reload(tabs[0].id);
      })
    );
  });
document.getElementById('save-disable-links').addEventListener('click', () => {
  const textarea = document.getElementById('disableUrls');
  const patterns = parseLines(textarea.value);

  chrome.storage.sync.set({ disableLinkUrls: patterns }, () => {
    const status = document.getElementById('disable-links-status');
    status.textContent = 'Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
});

document.getElementById('save-hide-elements').addEventListener('click', () => {
  const urlTextarea = document.getElementById('hideElementUrls');
  const selectorTextarea = document.getElementById('hideElementSelectors');
  const hideElementUrls = parseLines(urlTextarea.value);
  const hideElementSelectors = parseLines(selectorTextarea.value);

  chrome.storage.sync.set({ hideElementUrls, hideElementSelectors }, () => {
    const status = document.getElementById('hide-elements-status');
    status.textContent = 'Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
});
