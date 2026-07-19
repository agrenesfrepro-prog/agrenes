# Stripe Integration Setup Guide

## What's been built
- Real card payments via Stripe Elements (Visa, Mastercard, Amex)
- Apple Pay & Google Pay (automatic on supported devices)
- Payment Intent created server-side via Supabase Edge Function
- Webhook listener that marks orders as paid automatically
- Stock deduction on successful payment
- Refund handling (order marked refunded when Stripe refund fires)

---

## Step 1 — Get your Stripe keys

1. Go to **https://dashboard.stripe.com**
2. Click **Developers → API Keys**
3. Copy your:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)

> ⚠️ Start with `pk_test_` / `sk_test_` while testing. Switch to live keys when ready.

---

## Step 2 — Add your publishable key to the app

In your `.env.local` file:
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_key_here
```

---

## Step 3 — Deploy the Edge Functions to Supabase

Install Supabase CLI if you haven't:
```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-id
```

Set your Stripe secret key as a Supabase secret:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_secret_key_here
```

Deploy both Edge Functions:
```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

---

## Step 4 — Set up the Stripe Webhook

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add Endpoint**
3. URL: `https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing Secret** (starts with `whsec_`)

Set it as a Supabase secret:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

---

## Step 5 — Test it

1. Run the app: `npm start`
2. Add items to cart → Checkout
3. Use Stripe test card: **4242 4242 4242 4242** · Any future expiry · Any CVV
4. Watch the order appear in your Supabase `orders` table with `payment_status = paid`

**More test cards:**
| Card | Result |
|---|---|
| 4242 4242 4242 4242 | Payment succeeds |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | 3D Secure required |
| 4000 0082 6000 3178 | Insufficient funds |

---

## Step 6 — Go live

1. Switch `.env.local` to `pk_live_xxx`
2. Update the Supabase secret to `sk_live_xxx`
3. Add a live webhook endpoint in Stripe (same URL)
4. Redeploy: `supabase functions deploy create-payment-intent`

---

## Refunds

To issue a refund:
1. Go to **Stripe Dashboard → Payments**
2. Find the payment → Click **Refund**
3. The webhook automatically updates the order status to `refunded`

Or via Stripe API — you can add a "Request Refund" button in the app later.

---

## Apple Pay & Google Pay

These work automatically via Stripe Payment Element — no extra setup needed. 
- Apple Pay shows on Safari/iOS (requires HTTPS + domain verification in Stripe)
- Google Pay shows on Chrome/Android

To enable Apple Pay on your domain:
1. Stripe Dashboard → Settings → Payment Methods → Apple Pay
2. Add and verify your domain (agrenes.co.uk)
