/**
 * format.js
 * Formatting utilities for currency, numbers and dates.
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
