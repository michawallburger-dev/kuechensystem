import { state } from './state.js';

const KEYS = {
  PRODUCTS: 'vk_products',
  SETTINGS: 'vk_settings',
  UI: 'vk_ui_state'
};

export function load() {
  state.products = JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
  state.settings = JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');

  const ui = JSON.parse(localStorage.getItem(KEYS.UI) || '{}');
  state.locationOrder = ui.locationOrder || [];
  state.collapsedSections = ui.collapsedSections || {};
}

export function saveProducts() {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(state.products));
}

export function saveSettings() {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(state.settings));
}

export function saveSetting(key, value) {
  state.settings[key] = value;
  saveSettings();
}

export function saveLocationState() {
  localStorage.setItem(KEYS.UI, JSON.stringify({
    locationOrder: state.locationOrder,
    collapsedSections: state.collapsedSections
  }));
}
