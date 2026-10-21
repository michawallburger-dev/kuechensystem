import { state } from '../state.js';
import { saveProducts } from '../storage.js';
import { uid } from '../utils.js';
import { renderList } from './render.js';
import { showToast } from './utils.js';

const TEXT_FIELDS = ['barcode', 'name', 'brand', 'mhd', 'qty', 'unit', 'note'];

// Tracks the product image for the product currently open in the modal —
// read from here on save instead of the <img> element's .src, because an
// empty src attribute resolves to the page's own URL, not an empty string.
let currentImg = null;

export function openAddModal(barcode, productData) {
  state.editingId = null;
  state.isFrozen = false;
  currentImg = null;

  document.getElementById('modal-title').textContent = 'Produkt hinzufügen';
  resetForm();
  document.getElementById('f-barcode').value = barcode || '';

  const banner = document.getElementById('product-found-banner');
  if (productData && productData.name) {
    document.getElementById('f-name').value = productData.name || '';
    document.getElementById('f-brand').value = productData.brand || '';
  }
  if (productData && productData.img) {
    currentImg = productData.img;
    document.getElementById('found-img').src = productData.img;
    document.getElementById('found-name').textContent = productData.name || '';
    document.getElementById('found-brand').textContent = productData.brand || '';
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }

  openModalEl();
}

export function openEditModal(id) {
  const p = state.products.find(x => x.id === id);
  if (!p) return;

  state.editingId = id;
  state.isFrozen = !!p.frozen;
  currentImg = p.img || null;

  document.getElementById('modal-title').textContent = 'Produkt bearbeiten';
  document.getElementById('f-barcode').value = p.barcode || '';
  document.getElementById('f-name').value = p.name || '';
  document.getElementById('f-brand').value = p.brand || '';
  document.getElementById('f-category').value = p.category || '';
  document.getElementById('f-mhd').value = p.mhd || '';
  document.getElementById('f-qty').value = p.qty || '';
  document.getElementById('f-unit').value = p.unit || '';
  document.getElementById('f-location').value = p.location || '';
  document.getElementById('f-frozen-date').value = p.frozenDate || '';
  document.getElementById('f-note').value = p.note || '';
  document.getElementById('f-frozen-toggle').classList.toggle('on', state.isFrozen);
  document.getElementById('frozen-date-group').style.display = state.isFrozen ? 'block' : 'none';
  document.getElementById('product-found-banner').style.display = 'none';

  openModalEl();
}

export function closeModal() {
  document.getElementById('add-modal')?.classList.remove('open');
}

export function toggleFrozen() {
  state.isFrozen = !state.isFrozen;
  document.getElementById('f-frozen-toggle').classList.toggle('on', state.isFrozen);
  document.getElementById('frozen-date-group').style.display = state.isFrozen ? 'block' : 'none';

  if (state.isFrozen && !document.getElementById('f-frozen-date').value) {
    document.getElementById('f-frozen-date').value = new Date().toISOString().split('T')[0];
  }
}

export function saveProductFromForm() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) {
    showToast('Bitte Namen eingeben', '⚠️');
    return;
  }

  const existing = state.editingId
    ? state.products.find(p => p.id === state.editingId)
    : null;

  const product = {
    id: state.editingId || uid(),
    barcode: document.getElementById('f-barcode').value || '',
    name,
    brand: document.getElementById('f-brand').value.trim(),
    category: document.getElementById('f-category').value,
    mhd: document.getElementById('f-mhd').value,
    qty: document.getElementById('f-qty').value,
    unit: document.getElementById('f-unit').value.trim(),
    location: document.getElementById('f-location').value,
    frozen: state.isFrozen,
    frozenDate: state.isFrozen
      ? (document.getElementById('f-frozen-date').value || new Date().toISOString().split('T')[0])
      : null,
    note: document.getElementById('f-note').value.trim(),
    img: currentImg,
    added: existing?.added || new Date().toISOString()
  };

  if (state.editingId) {
    const i = state.products.findIndex(p => p.id === state.editingId);
    state.products[i] = product;
    showToast('Produkt aktualisiert');
  } else {
    state.products.push(product);
    showToast('Produkt gespeichert');
  }

  saveProducts();
  renderList();
  closeModal();
}

export function deleteProduct(id) {
  if (!confirm('Produkt löschen?')) return;

  state.products = state.products.filter(p => p.id !== id);
  saveProducts();
  renderList();
  showToast('Gelöscht', '🗑️');
}

function openModalEl() {
  document.getElementById('add-modal')?.classList.add('open');
}

function resetForm() {
  TEXT_FIELDS.forEach(f => {
    const el = document.getElementById(`f-${f}`);
    if (el) el.value = '';
  });
  document.getElementById('f-category').value = '';
  document.getElementById('f-location').value = '';
  document.getElementById('f-frozen-toggle').classList.remove('on');
  document.getElementById('frozen-date-group').style.display = 'none';
  document.getElementById('f-frozen-date').value = '';
  document.getElementById('product-found-banner').style.display = 'none';
}
