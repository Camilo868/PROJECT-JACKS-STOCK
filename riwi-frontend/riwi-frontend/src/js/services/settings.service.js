/**
 * settings.service.js
 * Local application preferences (no backend required).
 */
const KEY = 'stockwise_settings';

const DEFAULTS = {
  // Whole number set freely by the administrator/client. Used as-is
  // (no % framing, no conversion) to pre-fill new products.
  defaultHoldingCost: 20,
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
