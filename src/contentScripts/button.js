export function createNavigateButton(navigateUrl) {
  const btn = document.createElement('button');
  btn.id = 'neuralyzerNavigateBtn';
  btn.textContent = 'Back to Application';

  btn.addEventListener('click', () => {
    window.location.replace(navigateUrl);
  });

  return btn;
}
