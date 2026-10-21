import { state } from '../state.js';
import { renderList, renderLocationOrder } from './render.js';
import { openAddModal, openEditModal, closeModal, toggleFrozen, saveProductFromForm, deleteProduct } from './modal.js';
import { showToast } from './utils.js';
import { startScanner, stopScanner } from '../scanner.js';
import { lookupBarcode } from '../api.js';
import { saveSetting, saveProducts, saveLocationState } from '../storage.js';

export function initEvents() {
  wireNav();
  wireSearch();
  wireFilters();
  wireSort();
  wireScanner();
  wireProductList();
  wireModal();
  wireSettings();
}

// ── Navigation ──
function wireNav() {
  document.getElementById('nav-home')?.addEventListener('click', () => switchView('home'));
  document.getElementById('nav-list')?.addEventListener('click', () => switchView('list'));
  document.getElementById('nav-settings')?.addEventListener('click', () => switchView('settings'));
  document.getElementById('fab-scanner')?.addEventListener('click', () => switchView('scanner'));
}

function switchView(view) {
  if (state.currentView === 'scanner' && view !== 'scanner') stopScanner();

  state.currentView = view;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`${view}-view`)?.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`nav-${view}`)?.classList.add('active');

  if (view === 'scanner') startScanner(handleScanned);
  if (view === 'home') renderList();
}

async function handleScanned(code) {
  const data = await lookupBarcode(code);
  switchView('home');
  openAddModal(code, data);
}

// ── Search ──
function wireSearch() {
  document.getElementById('search-input')?.addEventListener('input', debounce(renderList, 200));
}

// ── Filter chips ──
function wireFilters() {
  document.getElementById('filter-row')?.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;

    document.querySelectorAll('#filter-row .chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.currentFilter = chip.dataset.filter;
    renderList();
  });
}

// ── Sort toggle ──
function wireSort() {
  document.getElementById('sort-btn')?.addEventListener('click', () => {
    state.sortOrder = state.sortOrder === 'mhd' ? 'name' : 'mhd';
    renderList();
    showToast(state.sortOrder === 'mhd' ? 'Sortiert nach MHD' : 'Sortiert nach Name');
  });
}

// ── Manual barcode entry (scanner view) ──
function wireScanner() {
  document.getElementById('manual-lookup-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('manual-barcode');
    const val = input?.value.trim();
    if (!val) return;

    const data = await lookupBarcode(val);
    stopScanner();
    switchView('home');
    openAddModal(val, data);
    if (input) input.value = '';
  });
}

// ── Product list: edit / delete / collapse (event delegation) ──
function wireProductList() {
  document.getElementById('product-list')?.addEventListener('click', e => {
    const editBtn = e.target.closest('[data-edit]');
    if (editBtn) { openEditModal(editBtn.dataset.edit); return; }

    const delBtn = e.target.closest('[data-delete]');
    if (delBtn) { deleteProduct(delBtn.dataset.delete); return; }

    const header = e.target.closest('.location-header');
    if (header) {
      const key = header.dataset.section;
      state.collapsedSections[key] = !state.collapsedSections[key];
      renderList();
    }
  });
}

// ── Add/edit modal ──
function wireModal() {
  document.getElementById('modal-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('modal-save-btn')?.addEventListener('click', saveProductFromForm);
  document.getElementById('f-frozen-toggle')?.addEventListener('click', toggleFrozen);

  document.getElementById('add-modal')?.addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
}

// ── Settings ──
function wireSettings() {
  document.getElementById('warn-days')?.addEventListener('change', e => {
    saveSetting('warnDays', e.target.value);
    renderList();
  });

  document.getElementById('export-btn')?.addEventListener('click', exportData);
  document.getElementById('import-trigger')?.addEventListener('click', () => {
    document.getElementById('import-file')?.click();
  });
  document.getElementById('import-file')?.addEventListener('change', importData);
  document.getElementById('clear-all-btn')?.addEventListener('click', clearAll);

  document.getElementById('location-order-list')?.addEventListener('click', e => {
    const upBtn = e.target.closest('[data-move-up]');
    const downBtn = e.target.closest('[data-move-down]');
    if (!upBtn && !downBtn) return;

    const i = parseInt((upBtn || downBtn).dataset.moveUp ?? (upBtn || downBtn).dataset.moveDown, 10);
    const j = upBtn ? i - 1 : i + 1;
    if (j < 0 || j >= state.locationOrder.length) return;

    [state.locationOrder[i], state.locationOrder[j]] = [state.locationOrder[j], state.locationOrder[i]];
    saveLocationState();
    renderLocationOrder();
    renderList();
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify({
    products: state.products,
    settings: state.settings,
    exported: new Date().toISOString()
  }, null, 2)], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vorratskammer-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exportiert!');
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.products) {
        state.products = data.products;
        if (data.settings) state.settings = data.settings;
        saveProducts();
        renderList();
        showToast(`${state.products.length} Produkte importiert`);
      }
    } catch {
      showToast('Fehler beim Import', '❌');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function clearAll() {
  if (!confirm('Wirklich ALLE Daten löschen? Das kann nicht rückgängig gemacht werden.')) return;

  state.products = [];
  saveProducts();
  renderList();
  showToast('Alle Daten gelöscht', '🗑️');
}

function debounce(fn, delay) {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, delay);
  };
}
