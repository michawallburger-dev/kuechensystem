// Small shared UI helpers (toast notifications).

let toastTimer;

export function showToast(message, icon = '✅') {
  const el = document.getElementById('toast');
  if (!el) return;

  el.innerHTML = `${icon} ${message}`;
  el.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}
