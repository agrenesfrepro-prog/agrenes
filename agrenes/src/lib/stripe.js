import { loadStripe } from '@stripe/stripe-js'
import { supabase } from './supabase'

// Your Stripe publishable key — set in .env.local
// REACT_APP_STRIPE_PUBLIC_KEY=pk_live_xxx
export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || '')

// Create a PaymentIntent via Supabase Edge Function
export async function createPaymentIntent({ amount, currency = 'gbp', orderId, customerEmail }) {
  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
        'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ amount, currency, orderId, customerEmail }),
    }
  )

  const data = await response.json()
  if (data.error) throw new Error(data.error)
  return data // { clientSecret, paymentIntentId }
}
