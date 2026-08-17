// AGRENES pricing — single source of truth.
// Every place that shows a price or a line total calls priceFor().

export function priceFor(product, qty = 1) {
  const q = Math.max(0, Number(qty) || 0)
  if (!product || q === 0) {
    return { unit_price: 0, line_total: 0, bulk_applied: false, savings: 0 }
  }
  const retail = Number(product.price) || 0
  const bulk   = Number(product.bulk_price) || 0
  const minB   = Number(product.bulk_min_qty) || 0
  const bulkEligible = minB > 0 && bulk > 0 && q >= minB

  const unit_price = bulkEligible ? bulk : retail
  const line_total = unit_price * q
  const savings    = bulkEligible ? (retail - bulk) * q : 0
  return { unit_price, line_total, bulk_applied: bulkEligible, savings }
}

// Build display tiers a customer can pick from (retail-side + bulk-side).
// Returns { retail: [{qty, total}], bulk: [{qty, total}] }
export function tiersFor(product) {
  if (!product) return { retail: [], bulk: [] }
  const retailUnits  = [1, 2, 5, 10]
  const retail = retailUnits
    .filter(u => !product.bulk_min_qty || u < product.bulk_min_qty)
    .map(u => ({ qty: u, total: (Number(product.price) || 0) * u }))

  const bulk = []
  if (product.bulk_min_qty && product.bulk_price) {
    const base = Number(product.bulk_min_qty)
    // Show 3 bulk tiers: min, 2×min, 4×min
    ;[base, base * 2, base * 4].forEach(u => {
      bulk.push({ qty: u, total: (Number(product.bulk_price) || 0) * u })
    })
  }
  return { retail, bulk }
}

// The "From £X" price to show on shop cards — the cheapest single unit price
// available for the product (retail price if no variants, or lowest variant).
export function fromPrice(product) {
  const variants = (product?.product_variants || []).filter(v => v.is_active !== false).map(v => Number(v.price)).filter(n => !isNaN(n))
  if (variants.length) return Math.min(...variants)
  return Number(product?.price) || 0
}
