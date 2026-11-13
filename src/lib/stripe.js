import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

// Your Stripe publishable key — set in .env.local
// REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '')

const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const FUNCTIONS_URL = `${process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`

async function callPaymentFunction(body) {
  const { data: { session } } = await supabase.auth.getSession()
  const response = await fetch(FUNCTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Guests have no session, so fall back to the public key
      'Authorization': `Bearer ${session?.access_token || ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data
}

// Start a payment for an order. The amount is decided by the server from the
// saved order — nothing the browser sends can change what is charged.
export async function createPaymentIntent({ orderId, customerEmail }) {
  return callPaymentFunction({ orderId, customerEmail }) // { clientSecret, paymentIntentId, amount }
}

// After Stripe reports success in the browser, ask the server to check with
// Stripe and mark the order confirmed. Retries a few times on a bad connection.
export async function confirmPaymentOnServer(paymentIntentId) {
  let lastError = null
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const data = await callPaymentFunction({ action: 'confirm', paymentIntentId })
      if (data.confirmed) return true
      lastError = new Error(data.reason || 'Not confirmed yet')
    } catch (err) { lastError = err }
    await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
  }
  console.error('Order confirmation failed:', lastError?.message)
  return false
}
