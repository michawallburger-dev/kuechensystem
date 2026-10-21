import { load } from './storage.js';
import { initEvents } from './ui/events.js';
import { renderList } from './ui/render.js';
import { VERSION } from './state.js';

function init() {
  load();
  initEvents();
  renderList();
  registerServiceWorker();
  showVersion();
}

function showVersion() {
  const el = document.getElementById('app-version');
  if (el) el.textContent = `Vorratskammer v${VERSION} · Open Food Facts API`;
}

// Offline/PWA support. Skipped on file:// since service workers require http(s).
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;

  const swCode = `
    const CACHE = 'vk-v1';
    self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/']))));
    self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
  `;
  const blob = new Blob([swCode], { type: 'application/javascript' });
  navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(() => {});
}

init();
