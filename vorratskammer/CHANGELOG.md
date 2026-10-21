# Changelog

All notable changes to Vorratskammer are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [2.0.0] - 2026-09-11

### Changed
- Rewrote the app as ES modules (`index.html` + `/app`), replacing the original single-file version.

### Fixed
- App failed to run at all over `file://` (ES modules require `http(s)`).
- ~300 lines of dead leftover code from the old single-file version were still sitting in `index.html`, unused and confusing.
- Nearly every button was unwired after the module rewrite — inline `onclick` handlers referenced functions that no longer existed globally. Rebuilt all interactivity (nav, filters, sort, scanner, add/edit/delete, section collapse, settings, export/import) using event delegation.
- `renderList()` crashed on load due to missing `state.locationOrder` / `state.collapsedSections` fields.
- Missing `mhdStatus` export crashed product card rendering.
- Missing `saveLocationState` / `saveSettings` exports in storage.
- The add/edit form only saved `name` and `mhd`; the other 10 fields (brand, category, quantity, unit, location, frozen state, note, image) were silently dropped.
- Filter chips (Alle/Abgelaufen/Bald/Eingefroren) were never actually applied to the list.
- Scanner (`Quagga.init`) was called with an empty config and would never have started the camera.
- Product image field could save a broken link when no product photo was found.

### Added
- MHD-status badges (ok/warn/danger), frozen badge, and quantity badge on product cards.
- Toast notifications for save/delete/export/import/clear actions.

## [1.0.0] - 2026-04-02

- Initial single-file version: barcode scanning (QuaggaJS), manual entry, expiry tracking, localStorage persistence, deployed to GitHub Pages.
