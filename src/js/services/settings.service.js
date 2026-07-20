/**
 * settings.service.js
 * Preferencias locales de la aplicación (no requieren backend).
 */
const KEY = 'stockwise_settings';

const DEFAULTS = {
  defaultHoldingCostRate: 0.2,
  lowStockNotifications: true,
  currency: 'COP',
};

export const SettingsService = {
  get() {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  },
  save(settings) {
    localStorage.setItem(KEY, JSON.stringify(settings));
    return settings;
  },
};
