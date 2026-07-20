/**
 * inventory-calc.js
 * Lógica de negocio central del sistema: EOQ, ROP, clasificación ABC
 * y semáforo de criticidad. Funciones puras, sin dependencias del DOM,
 * para que puedan probarse de forma aislada.
 */

const DAYS_PER_YEAR = 365;

/**
 * Costo de mantener 1 unidad en inventario durante un año.
 * H = costo unitario * tasa de almacenamiento (%anual)
 */
export function getHoldingCostPerUnit(product) {
  return product.unitCost * product.holdingCostRate;
}

/**
 * Cantidad Económica de Pedido (EOQ).
 * EOQ = raíz( (2 * D * S) / H )
 *   D = demanda anual
 *   S = costo de ordenar un pedido
 *   H = costo de almacenamiento por unidad/año
 */
export function calculateEOQ(product) {
  const H = getHoldingCostPerUnit(product);
  if (!product.annualDemand || !product.orderingCost || !H) return 0;
  const eoq = Math.sqrt((2 * product.annualDemand * product.orderingCost) / H);
  return Math.round(eoq);
}

/** Demanda diaria promedio. */
export function calculateDailyDemand(product) {
  return product.annualDemand / DAYS_PER_YEAR;
}

/**
 * Punto de Reorden (ROP).
 * ROP = (demanda diaria * lead time del proveedor en días) + stock de seguridad
 */
export function calculateROP(product, leadTimeDays) {
  const dailyDemand = calculateDailyDemand(product);
  return Math.round(dailyDemand * (leadTimeDays || 0) + (product.safetyStock || 0));
}

/**
 * Número estimado de pedidos por año y tiempo entre pedidos (días),
 * útil para mostrar contexto junto al EOQ.
 */
export function calculateOrderCycle(product) {
  const eoq = calculateEOQ(product);
  if (!eoq) return { ordersPerYear: 0, daysBetweenOrders: 0 };
  const ordersPerYear = product.annualDemand / eoq;
  return {
    ordersPerYear: Math.round(ordersPerYear * 10) / 10,
    daysBetweenOrders: Math.round(DAYS_PER_YEAR / ordersPerYear),
  };
}

/**
 * Estado de semáforo según stock actual frente al ROP.
 *  - red    -> stock crítico, comprar ya
 *  - yellow -> stock por debajo del ROP, planear compra
 *  - green  -> stock saludable
 */
export function getSemaphoreStatus(product, rop) {
  if (product.currentStock <= 0) return 'red';
  if (product.currentStock <= rop * 0.6) return 'red';
  if (product.currentStock <= rop) return 'yellow';
  return 'green';
}

export const SEMAPHORE_LABEL = {
  red: 'Comprar ahora',
  yellow: 'Vigilar',
  green: 'Saludable',
};

/**
 * Clasificación ABC por valor de consumo anual (regla de Pareto).
 * A -> hasta el 80% del valor acumulado
 * B -> del 80% al 95%
 * C -> resto
 * @param {Array} products
 * @returns {Map<string, { class: 'A'|'B'|'C', value: number, percentOfTotal: number, cumulativePercent: number }>}
 */
export function classifyABC(products) {
  const withValue = products.map((p) => ({
    id: p.id,
    value: p.unitCost * p.annualDemand,
  }));

  const totalValue = withValue.reduce((sum, p) => sum + p.value, 0) || 1;
  const sorted = [...withValue].sort((a, b) => b.value - a.value);

  const result = new Map();
  let cumulative = 0;

  for (const item of sorted) {
    cumulative += item.value;
    const cumulativePercent = (cumulative / totalValue) * 100;
    const percentOfTotal = (item.value / totalValue) * 100;
    let cls = 'C';
    if (cumulativePercent <= 80) cls = 'A';
    else if (cumulativePercent <= 95) cls = 'B';

    result.set(item.id, {
      class: cls,
      value: item.value,
      percentOfTotal,
      cumulativePercent,
    });
  }

  return result;
}

export const REVIEW_FREQUENCY_LABEL = {
  A: 'Revisión diaria',
  B: 'Revisión semanal',
  C: 'Revisión quincenal',
};
