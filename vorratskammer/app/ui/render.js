import { state } from '../state.js';
import { daysUntil, mhdStatus, mhdProgress, escapeHTML } from '../utils.js';
import { saveLocationState } from '../storage.js';

export function renderList() {
  const list = getFilteredProducts();
  const el = document.getElementById('product-list');

  updateStats();

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="icon">🫙</div>
        <h3>Noch leer</h3>
        <p>Scanne dein erstes Produkt über den Button unten.</p>
      </div>`;
    return;
  }

  const groups = groupByLocation(list);
  const keys = sortLocations(Object.keys(groups));

  keys.forEach(k => {
    if (!state.locationOrder.includes(k)) state.locationOrder.push(k);
  });
  // Drop locations from the order that no longer have any products,
  // so the reorder list in Settings doesn't accumulate stale entries.
  state.locationOrder = state.locationOrder.filter(k => keys.includes(k));

  saveLocationState();

  el.innerHTML = keys.map(k => renderSection(k, groups[k])).join('');
  renderLocationOrder();
}

export function renderLocationOrder() {
  const el = document.getElementById('location-order-list');
  if (!el) return;

  if (!state.locationOrder.length) {
    el.innerHTML = `
      <div class="toggle-row" style="padding:14px;">
        <span class="toggle-label" style="color:var(--text-muted);font-size:13px;">Noch keine Lagerorte vorhanden</span>
      </div>`;
    return;
  }

  el.innerHTML = state.locationOrder.map((name, i) => `
    <div class="toggle-row" style="padding:10px 14px;">
      <span class="toggle-label">${escapeHTML(name)}</span>
      <div style="display:flex;gap:6px;">
        <button class="icon-btn edit" data-move-up="${i}" ${i === 0 ? 'disabled style="opacity:0.3"' : ''}>⬆️</button>
        <button class="icon-btn edit" data-move-down="${i}" ${i === state.locationOrder.length - 1 ? 'disabled style="opacity:0.3"' : ''}>⬇️</button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const warnDays = parseInt(state.settings.warnDays || 7);

  document.getElementById('stat-total').textContent = state.products.length;
  document.getElementById('stat-frozen').textContent = state.products.filter(p => p.frozen).length;
  document.getElementById('stat-soon').textContent =
    state.products.filter(p => {
      const d = daysUntil(p.mhd);
      return d !== null && d >= 0 && d <= warnDays;
    }).length;
  document.getElementById('stat-expired').textContent =
    state.products.filter(p => {
      const d = daysUntil(p.mhd);
      return d !== null && d < 0;
    }).length;
}

function groupByLocation(list) {
  const groups = {};
  list.forEach(p => {
    const key = p.location || 'Sonstiges';
    (groups[key] ||= []).push(p);
  });
  return groups;
}

function sortLocations(keys) {
  return keys.sort((a, b) => {
    const ia = state.locationOrder.indexOf(a);
    const ib = state.locationOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function sortItems(items) {
  const sorted = [...items];
  if (state.sortOrder === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    sorted.sort((a, b) => {
      const da = daysUntil(a.mhd);
      const db = daysUntil(b.mhd);
      if (da === null) return 1;
      if (db === null) return -1;
      return da - db;
    });
  }
  return sorted;
}

function renderSection(name, items) {
  const collapsed = state.collapsedSections[name];
  const sorted = sortItems(items);

  return `
    <div class="location-section">
      <div class="location-header" data-section="${escapeHTML(name)}">
        <span>${escapeHTML(name)} (${items.length})</span>
        <span>${collapsed ? '▶️' : '▼'}</span>
      </div>
      <div class="location-body" style="display:${collapsed ? 'none' : 'block'}">
        ${sorted.map(renderCard).join('')}
      </div>
    </div>
  `;
}

function renderCard(p) {
  const warnDays = parseInt(state.settings.warnDays || 7);
  const status = mhdStatus(p.mhd, warnDays);
  const emoji = (p.category || '').trim().split(' ')[0] || '📦';
  const progress = mhdProgress(p.added, p.mhd);

  return `
    <div class="product-card">
      ${p.img
        ? `<img class="product-img" src="${p.img}" alt="">`
        : `<div class="product-emoji">${emoji}</div>`}
      <div class="product-info">
        <div class="product-name">${escapeHTML(p.name)}</div>
        ${p.brand ? `<div class="product-brand">${escapeHTML(p.brand)}</div>` : ''}
        ${progress !== null ? `
          <div class="mhd-bar">
            <div class="mhd-bar-fill ${progressClass(progress)}" style="width:${progress}%"></div>
          </div>
        ` : ''}
        <div class="product-meta">
          <span class="badge badge-mhd${status === 'ok' ? '' : ' ' + status}">${formatMHD(p.mhd)}</span>
          ${p.frozen ? `<span class="badge badge-frozen">❄️ Gefroren</span>` : ''}
          ${p.qty ? `<span class="badge badge-qty">${escapeHTML(String(p.qty))} ${escapeHTML(p.unit || '')}</span>` : ''}
        </div>
      </div>
      <div class="product-actions">
        <button class="icon-btn edit" data-edit="${p.id}">✏️</button>
        <button class="icon-btn delete" data-delete="${p.id}">🗑️</button>
      </div>
    </div>
  `;
}

function progressClass(pct) {
  if (pct < 20) return 'danger';
  if (pct <= 50) return 'warn';
  return 'good';
}

function formatMHD(dateStr) {
  const d = daysUntil(dateStr);
  if (d === null) return 'Kein MHD';
  if (d < 0) return '⚠️ Abgelaufen';
  if (d === 0) return 'Heute';
  if (d === 1) return 'Morgen';
  return `in ${d} Tagen`;
}

function getFilteredProducts() {
  const q = document.getElementById('search-input')?.value.toLowerCase() || '';
  const filter = state.currentFilter || 'all';
  const warnDays = parseInt(state.settings.warnDays || 7);

  return state.products.filter(p => {
    if (q && !p.name.toLowerCase().includes(q)) return false;

    if (filter === 'frozen') return !!p.frozen;
    if (filter === 'expired' || filter === 'soon') {
      const d = daysUntil(p.mhd);
      if (filter === 'expired') return d !== null && d < 0;
      return d !== null && d >= 0 && d <= warnDays;
    }

    return true; // 'all'
  });
}
