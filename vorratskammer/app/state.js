// Bump this on every release. Shown in Settings and used in CHANGELOG.md entries.
export const VERSION = '2.0.0';

export const state = {
  products: [],
  settings: {},
  currentView: 'home',
  currentFilter: 'all',
  sortOrder: 'mhd',
  editingId: null,
  isFrozen: false,
  quaggaRunning: false,
  locationOrder: [],
  collapsedSections: {}
};
