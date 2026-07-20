/**
 * validators.js
 * Validadores reutilizables para formularios.
 */

export const validators = {
  required: (value) => (value !== null && value !== undefined && String(value).trim() !== '') || 'Este campo es obligatorio.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Ingresa un correo electrónico válido.',
  minLength: (min) => (value) => String(value).length >= min || `Debe tener al menos ${min} caracteres.`,
  positiveNumber: (value) => (Number(value) > 0) || 'Debe ser un número mayor que cero.',
  nonNegativeNumber: (value) => (Number(value) >= 0) || 'Debe ser un número mayor o igual a cero.',
  match: (otherValue, message) => (value) => value === otherValue || message,
};

/**
 * Valida un objeto de datos contra un esquema de reglas.
 * @param {object} data
 * @param {object} schema - { campo: [regla1, regla2, ...] }
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
