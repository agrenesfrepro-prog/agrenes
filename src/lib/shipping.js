// AGRENES shipping calculator — Phase 1.
// UK: weight-tiered Evri ParcelShop rates + margin
// International: flat placeholder until zoned rates are added.

const CATEGORY_WEIGHTS = {
  'food boxes': 6.0, 'fruits': 6.0, 'tubers': 6.0, 'bananas': 6.0,
  'fresh vegetables': 1.0, 'vegetables': 1.0,
  'beans & nuts': 1.0, 'legumes': 1.0, 'dried foods': 1.0, 'dried': 1.0,
  'herbs & spices': 0.3, 'herbs': 0.3,
  'beverages': 0.5,
  'african crafts': 1.0, 'crafts': 1.0,
}
const DEFAULT_ITEM_WEIGHT = 1.0

function itemWeightKg(item) {
  const w = Number(item?.weight_kg)
  if (!isNaN(w) && w > 0) return w
  const cat = (item?.categories?.name || item?.category_name || item?.category || '').toString().toLowerCase().trim()
  return CATEGORY_WEIGHTS[cat] ?? DEFAULT_ITEM_WEIGHT
}

export function cartWeightKg(items) {
  if (!Array.isArray(items) || items.length === 0) return 0
  return items.reduce((s, i) => s + itemWeightKg(i) * (Number(i.qty) || 1), 0)
}

// UK weight-tier fee based on real Evri ParcelShop + margin
function ukDeliveryByWeight(kg) {
  if (kg <= 2)  return 3.99
  if (kg <= 5)  return 4.99
  if (kg <= 10) return 7.99
  if (kg <= 15) return 10.99
  return 13.99
}

const FREE_UK_OVER   = 75
const FREE_INTL_OVER = 150
const INTL_FLAT      = 24.99

export function isUKCountry(country) {
  return /(^UK$|^GB$|United Kingdom|Great Britain|England|Wales|Scotland|Northern Ireland)/i.test(String(country || ''))
}

// Estimate delivery from a single product + qty (used on the product page)
export function estimateDeliveryForProduct(product, qty = 1, country = 'UK') {
  const item = { ...product, qty }
  return computeDeliveryFee([item], (Number(product?.price) || 0) * qty, country)
}

export function computeDeliveryFee(items, subtotal, country = 'UK') {
  if (isUKCountry(country)) {
    if (Number(subtotal) >= FREE_UK_OVER) return 0
    return ukDeliveryByWeight(cartWeightKg(items))
  }
  if (Number(subtotal) >= FREE_INTL_OVER) return 0
  return INTL_FLAT
}

export function amountToFreeUK(subtotal) {
  return Math.max(0, FREE_UK_OVER - Number(subtotal || 0))
}

export const DELIVERY_META = {
  FREE_UK_OVER,
  FREE_INTL_OVER,
  INTL_FLAT,
  UK_TIERS: [
    { max: 2,  fee: 3.99 },
    { max: 5,  fee: 4.99 },
    { max: 10, fee: 7.99 },
    { max: 15, fee: 10.99 },
    { max: Infinity, fee: 13.99 },
  ]
}
