/**
 * validators.js
 * Reusable form validators.
 */

export const validators = {
  required: (value) => (value !== null && value !== undefined && String(value).trim() !== '') || 'This field is required.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.',
  minLength: (min) => (value) => String(value).length >= min || `Must be at least ${min} characters.`,
  positiveNumber: (value) => (Number(value) > 0) || 'Must be a number greater than zero.',
  nonNegativeNumber: (value) => (Number(value) >= 0) || 'Must be a number greater than or equal to zero.',
  integer: (value) => Number.isInteger(Number(value)) || 'Must be a whole number.',
  match: (otherValue, message) => (value) => value === otherValue || message,
};

/**
 * Validates a data object against a rule schema.
 * @param {object} data
 * @param {object} schema - { field: [rule1, rule2, ...] }
 * @returns {{ valid: boolean, errors: object }}
 */
export function validateForm(data, schema) {
  const errors = {};

  for (const field of Object.keys(schema)) {
    const rules = schema[field];
    for (const rule of rules) {
      const result = rule(data[field]);
      if (result !== true) {
        errors[field] = result;
        break;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
