// supabase/functions/send-order-email/index.ts
//
// CHUNK C+D — Supabase Edge Function that sends order status emails via Resend.
//
// Triggered by a Supabase Database Webhook configured on order_status_events
// INSERT. When a new event row lands with a stage that has an email template
// (confirmed / dispatched / uk_customs / out_for_delivery), this function
// fetches the order + customer email and fires a branded HTML email.
//
// Deploy:  supabase functions deploy send-order-email --no-verify-jwt
//
// Required env vars (set in Supabase Dashboard → Project Settings → Edge Functions):
//   RESEND_API_KEY     — your Resend API key
//   PUBLIC_SITE_URL    — https://agrenesmarket.com
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

// deno-lint-ignore-file no-explicit-any

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_STAGES = new Set(['confirmed', 'dispatched', 'uk_customs', 'out_for_delivery']);

// Stages that also alert the AGRENES team (sent to the ORDER_NOTIFY_EMAIL secret).
const TEAM_STAGES = new Set(['confirmed', 'quote_pending']);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const payload = await req.json();

    // Supabase Database Webhook payload shape:
    //   { type: 'INSERT', table: 'order_status_events', record: {...}, ... }
    const record = payload.record ?? payload;
    const stage: string = record.stage;
    const orderId: string = record.order_id;

    if (!stage || !orderId) {
      return json({ error: 'Missing stage or order_id' }, 400);
    }

    // Only send emails for whitelisted stages
    if (!EMAIL_STAGES.has(stage) && !TEAM_STAGES.has(stage)) {
      return json({ skipped: true, reason: `Stage "${stage}" has no email template` }, 200);
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const publicSite = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://agrenesmarket.com';
    if (!resendKey) return json({ error: 'RESEND_API_KEY not configured' }, 500);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the order on its own (no embedded join: that needs a foreign key
    // to profiles which may not exist, and guests have no profile anyway).
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return json({ error: `Order not found: ${orderErr?.message ?? 'unknown'}` }, 404);
    }

    let profile: any = null;
    if (order.user_id) {
      const { data: p } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', order.user_id)
        .maybeSingle();
      profile = p;
    }

    // Guests: the checkout writes "Delivery: Full Name, address..." into notes.
    const notesName: string = (String(order.notes ?? '').match(/Delivery:\s*([^,·]+)/)?.[1] ?? '').trim();

    const customerEmail: string | null = order.customer_email ?? profile?.email ?? null;
    const customerName: string = profile?.full_name || notesName || '';
    const firstName: string = customerName.trim().split(/\s+/)[0] || 'there';

    if (!order.tracking_token) {
      return json({ error: 'Order has no tracking token' }, 500);
    }

    // Line items for the order details table
    const { data: itemRows } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    const items: any[] = (itemRows ?? []).slice().sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
    const detailsHtml = orderDetailsHtml(items, order);

    const trackingUrl = `${publicSite}/track/${order.tracking_token}`;
    const result: Record<string, unknown> = { stage };

    const send = async (body: Record<string, unknown>) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'AGRENES Market <hello@agrenesmarket.com>', ...body }),
      });
      if (!res.ok) return { ok: false, detail: await res.text() };
      return { ok: true, detail: (await res.json()).id };
    };

    // 1. Customer email
    if (EMAIL_STAGES.has(stage)) {
      if (!customerEmail) {
        result.customer = 'skipped: no customer email on order';
      } else {
        const tmpl = TEMPLATES[stage](firstName, order.reference, trackingUrl, order.estimated_delivery, order.total, order.currency, detailsHtml);
        const r = await send({ to: [customerEmail], subject: tmpl.subject, html: tmpl.html });
        result.customer = r.ok ? `sent to ${customerEmail} (${r.detail})` : `failed: ${r.detail}`;
        result.sent = r.ok;
      }
    }

    // 2. Team alert ("New order" / "New bulk quote request")
    if (TEAM_STAGES.has(stage)) {
      const teamTo = (Deno.env.get('ORDER_NOTIFY_EMAIL') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
      if (teamTo.length === 0) {
        result.team = 'skipped: ORDER_NOTIFY_EMAIL secret not set';
      } else {
        const isQuote = stage === 'quote_pending';
        const headline = isQuote ? `New bulk quote request: ${order.reference}` : `New order: ${order.reference}`;
        const html = teamWrap({
          headline,
          intro: isQuote
            ? `${customerName || 'A customer'} has asked for a bulk shipping quote. Nothing has been paid yet.`
            : `You've received the following order from ${customerName || 'a guest customer'}. Payment is confirmed.`,
          customerName, customerEmail,
          notes: String(order.notes ?? ''),
          placedAt: order.created_at,
          detailsHtml,
          adminUrl: `${publicSite}/admin/orders/${order.id}`,
        });
        const r = await send({
          to: teamTo,
          subject: `${headline} (${money(order.total, order.currency)})`,
          html,
          ...(customerEmail ? { reply_to: customerEmail } : {}),
        });
        result.team = r.ok ? `sent (${r.detail})` : `failed: ${r.detail}`;
      }
    }

    const failed = Object.values(result).some((v) => typeof v === 'string' && v.startsWith('failed'));
    return json(result, failed ? 500 : 200);
  } catch (err: any) {
    return json({ error: err?.message ?? String(err) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

type TemplateFn = (
  firstName: string,
  orderRef: string,
  trackingUrl: string,
  estimatedDelivery: string | null,
  total: number,
  currency: string,
  detailsHtml: string
) => { subject: string; html: string };

const TEMPLATES: Record<string, TemplateFn> = {
  confirmed: (firstName, orderRef, trackingUrl, estimatedDelivery, _total, _currency, detailsHtml) => ({
    subject: `Order ${orderRef} confirmed — what happens next`,
    html: wrap({
      headline: 'Your order is confirmed ✅',
      firstName,
      bodyHtml: `
        <p>We've received your order and the ground team in Uganda has been notified. Here's what happens next:</p>
        <p>Our Kabowa packhouse team sources your produce fresh from our outgrower network this week, packs it for cold-chain transit, and it leaves on our next Entebbe → Gatwick flight (we fly four times weekly). From there, Evri handles the final leg to your door.</p>
        <p>We'll email you again at every stage — when it's dispatched, through UK customs, and out for delivery. In the meantime, you can check progress any time at the link below.</p>
        ${estimatedDelivery ? `<p style="margin-top:20px"><strong style="color:#074031">Estimated delivery: ${formatDateGB(estimatedDelivery)}</strong></p>` : ''}
        <h2 style="margin:28px 0 10px 0; font-size:16px; color:#074031;">Your order</h2>
        ${detailsHtml}
      `,
      orderRef, trackingUrl,
    }),
  }),

  dispatched: (firstName, orderRef, trackingUrl) => ({
    subject: `Order ${orderRef} has left Entebbe ✈️`,
    html: wrap({
      headline: 'Your order has left Entebbe ✈️',
      firstName,
      bodyHtml: `
        <p>Your order was loaded onto today's Entebbe → Gatwick flight. It's cold-chain packed and in the air right now.</p>
        <p>Flight time from Entebbe to Gatwick is roughly 10 hours, then another 24–48 hours for UK customs and Evri road freight to you. You're about 2–4 days out from your doorstep.</p>
      `,
      orderRef, trackingUrl,
    }),
  }),

  uk_customs: (firstName, orderRef, trackingUrl) => ({
    subject: `Order ${orderRef} through UK customs — on the road`,
    html: wrap({
      headline: 'Through UK customs — on the road 🛃',
      firstName,
      bodyHtml: `
        <p>Your order has cleared UK customs at Gatwick and been handed to Evri for the final leg to you. Depending on where you are in the UK, that's typically 24–48 hours from now.</p>
        <p>The tracking page below will update to "Out for Delivery" on the morning your parcel is on the van.</p>
      `,
      orderRef, trackingUrl,
    }),
  }),

  out_for_delivery: (firstName, orderRef, trackingUrl) => ({
    subject: `Order ${orderRef} arriving today 🏃`,
    html: wrap({
      headline: 'Arriving today 🏃',
      firstName,
      bodyHtml: `
        <p>Your order is on the van and arriving at your address today. Evri typically delivers between 8am and 8pm.</p>
        <p>If you're not home, Evri will leave it in your safe place or with a neighbour (whatever you selected at checkout). Fresh produce lands with 10–14 days of usable shelf life — refrigerate on arrival for maximum freshness.</p>
      `,
      orderRef, trackingUrl,
    }),
  }),
};

function wrap({ headline, firstName, bodyHtml, orderRef, trackingUrl }: {
  headline: string;
  firstName: string;
  bodyHtml: string;
  orderRef: string;
  trackingUrl: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" style="max-width:100%; background:#ffffff; border-radius:12px; overflow:hidden;" cellspacing="0" cellpadding="0" border="0">
          <!-- Brand header -->
          <tr>
            <td style="background:#074031; padding:24px; text-align:center;">
              <div style="color:#d4af37; font-size:22px; font-weight:700; letter-spacing:-0.3px;">
                agrenes<span style="color:#a7d7c5;">market</span>
              </div>
            </td>
          </tr>
          <!-- Headline -->
          <tr>
            <td style="padding:32px 32px 16px 32px;">
              <h1 style="margin:0 0 8px 0; font-size:22px; color:#074031; line-height:1.3;">${escapeHtml(headline)}</h1>
              <p style="margin:0; color:#6b7280; font-size:14px;">Hi ${escapeHtml(firstName)},</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:0 32px 24px 32px; font-size:15px; line-height:1.6; color:#334155;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- CTA button -->
          <tr>
            <td style="padding:0 32px 32px 32px;" align="center">
              <a href="${trackingUrl}"
                 style="display:inline-block; background:#074031; color:#ffffff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
                Track your order →
              </a>
              <p style="margin:12px 0 0 0; font-size:12px; color:#6b7280;">Order ${escapeHtml(orderRef)}</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px; background:#fafbf9; font-size:12px; color:#6b7280; text-align:center; line-height:1.6;">
              Questions? Reply to this email, or call Isma on +44 7947 716008.<br>
              AGRENES UK LIMITED · 263 Longheath Gardens, Croydon CR0 7TZ · Companies House 16391212
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================================================
// ORDER DETAILS TABLE (shared by the customer email and the team alert)
// ============================================================================

function money(amount: unknown, currency: unknown): string {
  const code = String(currency || 'GBP').toUpperCase();
  const n = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code }).format(n);
  } catch { return `${code} ${n.toFixed(2)}`; }
}

function qtyText(qty: unknown): string {
  const n = Number(qty ?? 0);
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function orderDetailsHtml(items: any[], order: any): string {
  const cur = order.currency;
  const cell = 'padding:10px 12px; border:1px solid #e2e8f0; font-size:14px; color:#334155;';
  const head = 'padding:10px 12px; border:1px solid #e2e8f0; font-size:13px; color:#074031; background:#ecfdf5; text-align:left;';
  const rows = items.length
    ? items.map((i) => `
        <tr>
          <td style="${cell}">${escapeHtml(i.name ?? 'Item')}${i.unit ? ` <span style="color:#64748b;">(${escapeHtml(String(i.unit))})</span>` : ''}</td>
          <td style="${cell} text-align:center;">${qtyText(i.qty)}</td>
          <td style="${cell} text-align:right;">${money(i.subtotal ?? Number(i.price ?? 0) * Number(i.qty ?? 0), cur)}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="${cell}">Item details are not available for this order.</td></tr>`;
  const line = (label: string, value: string, bold = false) => `
        <tr>
          <td colspan="2" style="${cell} ${bold ? 'font-weight:700; color:#0f172a;' : ''}">${label}</td>
          <td style="${cell} text-align:right; ${bold ? 'font-weight:700; color:#0f172a;' : ''}">${value}</td>
        </tr>`;
  const method = String(order.payment_method ?? '');
  const methodLabel = method === 'card' ? 'Credit / debit card (Stripe)' : method === 'bulk_quote' ? 'Bulk quote (not yet paid)' : method;
  return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin:0 0 8px 0;">
        <tr>
          <th style="${head}">Product</th>
          <th style="${head} text-align:center;">Quantity</th>
          <th style="${head} text-align:right;">Price</th>
        </tr>${rows}
        ${order.subtotal != null ? line('Subtotal', money(order.subtotal, cur)) : ''}
        ${order.delivery_fee != null ? line('Delivery', Number(order.delivery_fee) > 0 ? money(order.delivery_fee, cur) : (method === 'bulk_quote' ? 'To be quoted' : 'Free')) : ''}
        ${Number(order.discount ?? 0) > 0 ? line('Discount', '-' + money(order.discount, cur)) : ''}
        ${methodLabel ? line('Payment method', escapeHtml(methodLabel)) : ''}
        ${line('Total', money(order.total, cur), true)}
      </table>`;
}

function teamWrap({ headline, intro, customerName, customerEmail, notes, placedAt, detailsHtml, adminUrl }: {
  headline: string; intro: string; customerName: string; customerEmail: string | null;
  notes: string; placedAt: string; detailsHtml: string; adminUrl: string;
}) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(headline)}</title></head>
<body style="margin:0; padding:0; background:#f5f5f0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" style="max-width:100%; background:#ffffff; border-radius:12px; overflow:hidden;" cellspacing="0" cellpadding="0" border="0">
        <tr><td style="background:#074031; padding:28px 24px; text-align:center;">
          <div style="color:#ffffff; font-size:24px; font-weight:700;">${escapeHtml(headline)}</div>
        </td></tr>
        <tr><td style="padding:24px 32px 8px 32px; font-size:15px; line-height:1.6; color:#334155;">
          <p style="margin:0 0 6px 0;">${escapeHtml(intro)}</p>
          <p style="margin:0 0 18px 0; color:#64748b; font-size:13px;">${escapeHtml(formatDateGB(placedAt))}</p>
          ${detailsHtml}
          <h2 style="margin:22px 0 8px 0; font-size:15px; color:#074031;">Customer</h2>
          <p style="margin:0;">${escapeHtml(customerName || 'Guest')}${customerEmail ? ` · <a href="mailto:${escapeHtml(customerEmail)}" style="color:#074031;">${escapeHtml(customerEmail)}</a>` : ''}</p>
          ${notes ? `<h2 style="margin:22px 0 8px 0; font-size:15px; color:#074031;">Delivery details</h2><p style="margin:0; white-space:pre-wrap;">${escapeHtml(notes)}</p>` : ''}
        </td></tr>
        <tr><td style="padding:24px 32px 32px 32px;" align="center">
          <a href="${adminUrl}" style="display:inline-block; background:#074031; color:#ffffff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">Open order in admin →</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, (ch) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!)
  );
}

function formatDateGB(input: string): string {
  try {
    return new Date(input).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return input; }
}
