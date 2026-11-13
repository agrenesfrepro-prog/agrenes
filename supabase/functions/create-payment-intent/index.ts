// Supabase Edge Function: create-payment-intent
// Deploy: supabase functions deploy create-payment-intent --no-verify-jwt
// Secret needed: STRIPE_SECRET_KEY (already set). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided automatically.
//
// Two jobs, both decided on the SERVER so the customer's browser cannot change them:
//   1. Create a payment for an order. The amount is read from the order saved
//      in the database (never from the browser).
//   2. { action: 'confirm', paymentIntentId } — ask Stripe whether that payment
//      really succeeded for the full order total, and only then mark the order
//      confirmed and paid.

// deno-lint-ignore-file no-explicit-any
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2025-08-27.basil',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function loadOrder(orderId: string) {
  if (!orderId || !UUID_RE.test(orderId)) throw new Error('Missing or invalid order')
  const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
  if (error) throw new Error('Could not load the order')
  if (!data) throw new Error('Order not found')
  return data as any
}

const pence = (amount: unknown) => Math.round(Number(amount ?? 0) * 100)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()

    // ── 2. Confirm a payment ────────────────────────────────────────────────
    if (body?.action === 'confirm') {
      const intentId = String(body.paymentIntentId ?? '')
      if (!/^pi_[A-Za-z0-9]+$/.test(intentId)) throw new Error('Missing payment reference')

      const intent = await stripe.paymentIntents.retrieve(intentId)
      if (intent.status !== 'succeeded') {
        return reply({ confirmed: false, reason: `Payment status is ${intent.status}` })
      }

      const order = await loadOrder(String(intent.metadata?.order_id ?? ''))
      const due = pence(order.total)
      if (String(intent.currency).toLowerCase() !== String(order.currency || 'gbp').toLowerCase()
          || Number(intent.amount_received ?? 0) < due) {
        console.error(`Amount mismatch for order ${order.id}: paid ${intent.amount_received} ${intent.currency}, due ${due}`)
        return reply({ confirmed: false, reason: 'Paid amount does not match the order total' })
      }

      if (String(order.payment_status) === 'paid') return reply({ confirmed: true, already: true })

      const { data: ok, error } = await supabase.rpc('confirm_order_payment', { p_order_id: order.id })
      if (error) throw new Error(`Could not confirm the order: ${error.message}`)
      return reply({ confirmed: ok === true })
    }

    // ── 1. Create a payment for an order ───────────────────────────────────
    const order = await loadOrder(String(body?.orderId ?? ''))

    if (String(order.status) !== 'pending' || String(order.payment_status) === 'paid') {
      throw new Error('This order is not awaiting payment')
    }

    const amount = pence(order.total)
    if (!Number.isFinite(amount) || amount < 50) {
      throw new Error('Invalid amount — minimum is £0.50')
    }

    const reference = String(order.reference ?? order.id)
    const email = String(order.customer_email || body?.customerEmail || '') || undefined

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: String(order.currency || 'gbp').toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: { order_id: order.id, order_reference: reference, platform: 'agrenes' },
      description: `AGRENES Market order ${reference}`,
    })

    return reply({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, amount: amount / 100 })
  } catch (error: any) {
    return reply({ error: error?.message ?? String(error) }, 400)
  }
})
