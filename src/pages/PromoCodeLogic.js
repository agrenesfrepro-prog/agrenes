// Promo code validation — import this in CheckoutPage
import { supabase } from '../lib/supabase'

export async function validatePromoCode(code, orderTotal) {
  if (!code?.trim()) return { error: 'Please enter a promo code' }

  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !promo) return { error: 'Invalid promo code' }
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) return { error: 'This promo code has expired' }
  if (promo.max_uses && promo.used_count >= promo.max_uses) return { error: 'This promo code has reached its limit' }
  if (promo.min_order && orderTotal < promo.min_order) return { error: `Minimum order of £${promo.min_order.toFixed(2)} required for this code` }

  const discount = promo.type === 'percent'
    ? (orderTotal * promo.value) / 100
    : Math.min(promo.value, orderTotal)

  return { promo, discount: parseFloat(discount.toFixed(2)), error: null }
}

export async function markPromoUsed(promoId) {
  await supabase.rpc('increment_promo_usage', { promo_id: promoId })
}
