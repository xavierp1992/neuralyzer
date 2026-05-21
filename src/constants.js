export const OPTION_KEYS = ['url', 'statusUrl', 'kioskName'];
export const KIOSK_PREVIOUS_URL_KEY = 'previousStepUrl';

export const KIOSK_DOMAIN_PATTERNS = [
  // DEV
  /^localhost:5500$/,
  // QA (kiosk.qa.spdigital.sg and kiosk-sit[number].qa.spdigital.sg)
  /^kiosk(-sit\d+)?\.qa\.spdigital\.sg$/,
  // PROD
  /^kiosk\.spdigital\.sg$/,
];

export const SINGPASS_DOMAIN_PATTERNS = [
  /myinfo\.gov\.sg$/,
  /singpass\.gov\.sg$/,
];

function isMatchDomain(url, patterns) {
  try {
    const urlObj = new URL(url);
    return patterns.some((pattern) => pattern.test(urlObj.host));
  } catch (e) {
    console.error("Can't check domain. The domain is invalid ", e);
  }

  return false;
}

export function isKioskDomain(url) {
  return isMatchDomain(url, KIOSK_DOMAIN_PATTERNS);
}

export function isSingpassDomain(url) {
  return isMatchDomain(url, SINGPASS_DOMAIN_PATTERNS);
}
