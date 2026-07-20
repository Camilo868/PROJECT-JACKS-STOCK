/**
 * badges.js
 * Helpers de render para los badges de clasificación ABC y semáforo.
 */

export function renderAbcBadge(cls) {
  const map = { A: 'sw-badge-a', B: 'sw-badge-b', C: 'sw-badge-c' };
  return `<span class="sw-badge ${map[cls] || 'sw-badge-c'}">Clase ${cls}</span>`;
}

export function renderSemaphoreBadge(status, label) {
  const dotClass = { red: 'sw-dot-red', yellow: 'sw-dot-yellow', green: 'sw-dot-green' }[status];
  return `<span class="sw-semaphore"><span class="sw-dot ${dotClass}"></span>${label}</span>`;
}
