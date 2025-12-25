import './options.css';
import { OPTION_KEYS } from '../constants';
chrome.storage.sync.get(OPTION_KEYS, function (config) {
  OPTION_KEYS.forEach(
    (key) => (document.getElementById(key).value = config[key] || '')
  );
});
chrome.storage.sync.get({ disableLinkUrls: [] }, (result) => {
  const textarea = document.getElementById('disableUrls');
  textarea.value = result.disableLinkUrls.join('\n');
});
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
    console.log('maintenance toggled');
  });
document.getElementById('save-disable-links').addEventListener('click', () => {
  const textarea = document.getElementById('disableUrls');
  const rawLines = textarea.value.split('\n');

  const patterns = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  chrome.storage.sync.set({ disableLinkUrls: patterns }, () => {
    const status = document.getElementById('disable-links-status');
    status.textContent = 'Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 1500);
  });
});
