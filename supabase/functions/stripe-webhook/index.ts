// Supabase Edge Function: stripe-webhook  (the safety net)
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (whsec_… from Stripe)
// In Stripe Dashboard → Developers → Webhooks → Add endpoint:
//   URL:    https://ierviwtmdqerdmwtnimn.supabase.co/functions/v1/stripe-webhook
//   Events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
//
// If a customer pays but closes the page before the site can confirm the order,
// Stripe still tells us here, and the order is confirmed (and the email sent) anyway.

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, signature ?? '', Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err?.message)
    return json({ error: 'Invalid signature' }, 400)
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent
      const orderId = String(intent.metadata?.order_id ?? '')
      if (UUID_RE.test(orderId)) {
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle()
        const due = Math.round(Number((order as any)?.total ?? 0) * 100)
        if (!order) {
          console.error(`Paid intent ${intent.id} names unknown order ${orderId}`)
        } else if (Number(intent.amount_received ?? 0) < due) {
          console.error(`Order ${orderId}: paid ${intent.amount_received}, due ${due}. Not confirmed.`)
        } else {
          // Does nothing if the site already confirmed it.
          const { error } = await supabase.rpc('confirm_order_payment', { p_order_id: orderId })
          if (error) console.error('confirm_order_payment failed:', error.message)
        }
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent
      const orderId = String(intent.metadata?.order_id ?? '')
      if (UUID_RE.test(orderId)) {
        await supabase.from('orders').update({ payment_status: 'failed' })
          .eq('id', orderId).eq('status', 'pending')
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (intentId && charge.refunded) {
        const intent = await stripe.paymentIntents.retrieve(intentId)
        const orderId = String(intent.metadata?.order_id ?? '')
        if (UUID_RE.test(orderId)) {
          await supabase.from('orders').update({ payment_status: 'refunded' }).eq('id', orderId)
        }
      }
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err?.message)
    return json({ error: 'Handler error' }, 500)
  }

  return json({ received: true })
})
