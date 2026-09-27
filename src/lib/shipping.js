// AGRENES shipping calculator — Phase 2.
// UK: real Evri Standard Courier Collection rates (high end for safety buffer).
// International: flat placeholder until zoned rates are added.

const CATEGORY_WEIGHTS = {
  'food boxes': 7.0, 'fruits': 7.0, 'tubers': 7.5, 'bananas': 7.5,
  'fresh vegetables': 5.5, 'vegetables': 5.5,
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

const BULK_THRESHOLD_KG = 30

function ukDeliveryByWeight(kg) {
  if (kg <= 1)  return 4.30
  if (kg <= 2)  return 5.44
  if (kg <= 5)  return 7.58
  if (kg <= 10) return 7.68
  if (kg <= 15) return 11.29
  if (kg <= 20) return 15.36
  if (kg <= 25) return 18.97
  if (kg <= 30) return 22.58
  return 0
}

const FREE_UK_OVER   = Infinity
const FREE_INTL_OVER = Infinity
const INTL_FLAT      = 24.99

export function isUKCountry(country) {
  return /(^UK$|^GB$|United Kingdom|Great Britain|England|Wales|Scotland|Northern Ireland)/i.test(String(country || ''))
}

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

export function computeDeliveryInfo(items, subtotal, country = 'UK') {
  const totalWeightKg = Math.round(cartWeightKg(items) * 100) / 100

  if (totalWeightKg === 0) {
    return { cost: 0, label: 'Add items to see delivery', bulkContact: false, band: 'empty', totalWeightKg: 0 }
  }

  if (!isUKCountry(country)) {
    return { cost: INTL_FLAT, label: 'International delivery', bulkContact: false, band: 'international', totalWeightKg }
  }

  if (totalWeightKg > BULK_THRESHOLD_KG) {
    return { cost: 0, label: 'Contact us for bulk shipping quote', bulkContact: true, band: 'bulk', totalWeightKg }
  }

  const cost = ukDeliveryByWeight(totalWeightKg)
  const band = getBandName(totalWeightKg)
  const parcels = totalWeightKg > 15 ? ' (2 parcels)' : ''

  return {
    cost,
    label: 'Standard UK delivery' + parcels + ' · 2-3 working days',
    bulkContact: false,
    band,
    totalWeightKg,
  }
}

function getBandName(kg) {
  if (kg <= 1) return 'under-1kg'
  if (kg <= 2) return '1-2kg'
  if (kg <= 5) return '2-5kg'
  if (kg <= 10) return '5-10kg'
  if (kg <= 15) return '10-15kg'
  if (kg <= 20) return '15-20kg'
  if (kg <= 25) return '20-25kg'
  if (kg <= 30) return '25-30kg'
  return 'bulk'
}

export function amountToFreeUK(subtotal) {
  if (FREE_UK_OVER === Infinity) return 0
  return Math.max(0, FREE_UK_OVER - Number(subtotal || 0))
}

export const DELIVERY_META = {
  FREE_UK_OVER,
  FREE_INTL_OVER,
  INTL_FLAT,
  BULK_THRESHOLD_KG,
  UK_TIERS: [
    { max: 1,        fee: 4.30 },
    { max: 2,        fee: 5.44 },
    { max: 5,        fee: 7.58 },
    { max: 10,       fee: 7.68 },
    { max: 15,       fee: 11.29 },
    { max: 20,       fee: 15.36 },
    { max: 25,       fee: 18.97 },
    { max: 30,       fee: 22.58 },
    { max: Infinity, fee: 0,     bulkContact: true },
  ],
}