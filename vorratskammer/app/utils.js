export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  return Math.ceil((target - today) / 86400000);
}

// 'ok' | 'warn' | 'danger' — used to color the MHD badge
export function mhdStatus(dateStr, warnDays = 7) {
  const d = daysUntil(dateStr);
  if (d === null) return 'ok';
  if (d < 0) return 'danger';
  if (d <= warnDays) return 'warn';
  return 'ok';
}

// Percentage of shelf life remaining (100 = just added, 0 = at/past MHD), or
// null if there's no MHD to measure against. Uses the product's "added" date
// as the purchase date; if that's missing, assumes a 30-day shelf life
// counting back from the MHD instead.
export function mhdProgress(addedISO, mhdStr) {
  if (!mhdStr) return null;

  const today = startOfDay(new Date());
  const mhd = startOfDay(new Date(mhdStr));

  let start = addedISO ? startOfDay(new Date(addedISO)) : null;
  if (!start || start >= mhd) {
    start = new Date(mhd.getTime() - 30 * 86400000);
  }

  const total = mhd - start;
  const remaining = mhd - today;
  const pct = Math.round((remaining / total) * 100);

  return Math.max(0, Math.min(100, pct));
}

function startOfDay(d) {
  d.setHours(0, 0, 0, 0);
  return d;
}

export function escapeHTML(str = '') {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}
