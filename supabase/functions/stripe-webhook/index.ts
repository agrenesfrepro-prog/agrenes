// Supabase Edge Function: stripe-webhook
// Deploy: supabase functions deploy stripe-webhook
// Set secret: supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
// In Stripe Dashboard → Webhooks → Add endpoint:
//   URL: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
//   Events: payment_intent.succeeded, payment_intent.payment_failed

import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-02-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
  }

  // Handle payment success
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.order_id

    if (orderId) {
      // Update order to paid + confirmed
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'confirmed',
          stripe_payment_intent: intent.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (error) console.error('Failed to update order:', error)
      else console.log(`✅ Order ${orderId} marked as paid`)

      // Insert tracking event
      await supabase.from('tracking_events').insert({
        order_id: orderId,
        status: 'confirmed',
        description: 'Payment received. Order confirmed and being prepared for dispatch.',
        location: 'AGRENES Packhouse, Ndeeba Kabowa, Kampala',
      })
    }
  }

  // Handle payment failure
  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata?.order_id

    if (orderId) {
      await supabase
        .from('orders')
        .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', orderId)

      console.log(`❌ Payment failed for order ${orderId}`)
    }
  }

  // Handle refund
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge
    const intentId = charge.payment_intent as string

    if (intentId) {
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded', status: 'refunded', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent', intentId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
