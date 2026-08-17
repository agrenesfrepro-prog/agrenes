// AGRENES shipping calculator — v1
// Weight-tiered UK rates based on real Evri ParcelShop cost + margin.
// International currently flat £24.99 until proper zone rates are added.

// Category-based default weights in kg (used when a product has no weight_kg set)
const CATEGORY_WEIGHTS = {
  'food boxes':      6.0,
  'fruits':          6.0,
  'fresh vegetables':3.0,
  'vegetables':      3.0,
  'beans & nuts':    1.0,
  'legumes':         1.0,
  'dried foods':     1.0,
  'dried':           1.0,
  'herbs & spices':  0.3,
  'herbs':           0.3,
  'beverages':       0.5,
  'african crafts':  1.0,
  'crafts':          1.0,
  'tubers':          6.0,
  'bananas':         6.0,
}
const DEFAULT_ITEM_WEIGHT = 1.0

function itemWeightKg(item) {
  if (item?.weight_kg && !isNaN(Number(item.weight_kg))) return Number(item.weight_kg)
  const cat = (item?.categories?.name || item?.category_name || '').toLowerCase().trim()
  return CATEGORY_WEIGHTS[cat] ?? DEFAULT_ITEM_WEIGHT
}

// Cart total weight in kg
export function cartWeightKg(items) {
  if (!Array.isArray(items) || !items.length) return 0
  return items.reduce((sum, i) => sum + itemWeightKg(i) * (Number(i.qty) || 1), 0)
}

// UK weight tier → delivery fee (£)
function ukDeliveryByWeight(kg) {
  if (kg <= 2)  return 3.99
  if (kg <= 5)  return 4.99
  if (kg <= 10) return 7.99
  if (kg <= 15) return 10.99
  return 13.99
}

/**
 * Compute delivery fee based on items, subtotal, and country.
 * @param {Array} items — cart items
 * @param {number} subtotal — cart subtotal in GBP
 * @param {string} country — 'GB' | 'UK' | 'United Kingdom' | 'US' | 'CA' | 'DE' | ...
 * @returns {number} delivery fee in GBP
 */
export function computeDeliveryFee(items, subtotal, country = 'UK') {
  const isUK = /(^UK$|^GB$|United Kingdom|Great Britain|England|Wales|Scotland|Northern Ireland)/i.test(String(country || ''))
  const FREE_UK_OVER = 75
  const FREE_INTL_OVER = 150
  const INTL_FLAT = 24.99

  if (isUK) {
    if (Number(subtotal) >= FREE_UK_OVER) return 0
    return ukDeliveryByWeight(cartWeightKg(items))
  }
  // International: flat rate until zoned pricing is added
  if (Number(subtotal) >= FREE_INTL_OVER) return 0
  return INTL_FLAT
}

// Small helper for cart drawer: how far from free UK delivery
export function amountToFreeUK(subtotal) {
  return Math.max(0, 75 - Number(subtotal || 0))
}
