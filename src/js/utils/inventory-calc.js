/**
 * inventory-calc.js
 * Core business logic: EOQ, ROP, ABC classification and criticality
 * semaphore. Pure functions with no DOM dependencies, so they can be
 * tested in isolation.
 */

const DAYS_PER_YEAR = 365;

/**
 * Cost of holding 1 unit in inventory for a year.
 * Set directly by the administrator (any whole number) — no longer
 * a percentage of unit cost.
 */
export function getHoldingCostPerUnit(product) {
  return product.holdingCost;
}

/**
 * Economic Order Quantity (EOQ).
 * EOQ = sqrt( (2 * D * S) / H )
 *   D = annual demand
 *   S = cost of placing one order
 *   H = holding cost per unit/year
 */
export function calculateEOQ(product) {
  const H = getHoldingCostPerUnit(product);
  if (!product.annualDemand || !product.orderingCost || !H) return 0;
  const eoq = Math.sqrt((2 * product.annualDemand * product.orderingCost) / H);
  return Math.round(eoq);
}

/** Average daily demand. */
export function calculateDailyDemand(product) {
  return product.annualDemand / DAYS_PER_YEAR;
}

/**
 * Reorder Point (ROP).
 * ROP = (daily demand * supplier lead time in days) + safety stock
 */
export function calculateROP(product, leadTimeDays) {
  const dailyDemand = calculateDailyDemand(product);
  return Math.round(dailyDemand * (leadTimeDays || 0) + (product.safetyStock || 0));
}

/**
 * Estimated orders per year and days between orders, useful as
 * context alongside the EOQ.
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
 * Semaphore status based on current stock vs. ROP.
 *  - red    -> critical stock, buy now
 *  - yellow -> below ROP, plan a purchase
 *  - green  -> healthy stock
 */
export function getSemaphoreStatus(product, rop) {
  if (product.currentStock <= 0) return 'red';
  if (product.currentStock <= rop * 0.6) return 'red';
  if (product.currentStock <= rop) return 'yellow';
  return 'green';
}

export const SEMAPHORE_LABEL = {
  red: 'Buy now',
  yellow: 'Watch',
  green: 'Healthy',
};

/**
 * ABC classification by annual consumption value (Pareto rule).
 * A -> up to 80% of cumulative value
 * B -> 80% to 95%
 * C -> the rest
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
  A: 'Daily review',
  B: 'Weekly review',
  C: 'Biweekly review',
};
