// AGRENES order confirmation email — v2
// Loads order + items + linked address + user profile, sends via Resend.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = 'AGRENES Orders <orders@agrenesmarket.com>'
const SITE = 'https://agrenesmarket.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function fmtMoney(n: number, ccy = 'GBP') {
  try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: ccy }).format(n) } catch { return `£${(n || 0).toFixed(2)}` }
}

function renderHtml(o: any) {
  const items = (o.items || []).map((it: any) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">
        <div style="font-weight:600;color:#1B4332;">${it.name || it.product_name || 'Item'}</div>
        <div style="font-size:12px;color:#666;">Qty ${it.qty || it.quantity || 1}${it.unit ? ' · ' + it.unit : ''}</div>
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${fmtMoney((it.price || it.unit_price || 0) * (it.qty || it.quantity || 1))}</td>
    </tr>`).join('')

  const addr = o.address
  const custName = o.customer_name || (o.profile?.full_name) || 'there'

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Your AGRENES order</title></head>
<body style="margin:0;padding:0;background:#F5F1E8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#222;">
  <div style="max-width:600px;margin:0 auto;background:#fff;">
    <div style="background:linear-gradient(135deg,#1B4332,#2D6A4F);padding:28px 24px;text-align:center;color:#fff;">
      <div style="font-size:12px;letter-spacing:1.5px;opacity:.85;margin-bottom:6px;">AGRENES · UGANDA → UK</div>
      <div style="font-family:Georgia,serif;font-size:26px;font-weight:700;">Order confirmed 🥭</div>
      <div style="opacity:.85;font-size:14px;margin-top:6px;">Thank you for supporting Ugandan farmers.</div>
    </div>

    <div style="padding:24px;">
      <p style="font-size:15px;line-height:1.55;margin:0 0 18px;">Hi ${custName},</p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 22px;">
        We've received your order and are preparing it for despatch from our Kampala packhouse.
        You'll get another email as soon as it's on its way.
      </p>

      <div style="background:#F5F1E8;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#2D6A4F;text-transform:uppercase;">Order reference</div>
        <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#1B4332;">${o.reference || o.id}</div>
        <div style="font-size:12px;color:#666;margin-top:2px;">Placed ${new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      ${items ? `<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">${items}</table>` : ''}

      <table style="width:100%;margin-top:14px;font-size:14px;">
        ${o.subtotal ? `<tr><td style="padding:4px 0;color:#666;">Subtotal</td><td style="text-align:right;padding:4px 0;">${fmtMoney(o.subtotal)}</td></tr>` : ''}
        ${o.delivery_fee ? `<tr><td style="padding:4px 0;color:#666;">Delivery</td><td style="text-align:right;padding:4px 0;">${fmtMoney(o.delivery_fee)}</td></tr>` : ''}
        ${o.discount ? `<tr><td style="padding:4px 0;color:#2D6A4F;">Discount</td><td style="text-align:right;padding:4px 0;color:#2D6A4F;">−${fmtMoney(o.discount)}</td></tr>` : ''}
        <tr><td style="padding:10px 0 0;font-weight:700;font-size:16px;border-top:2px solid #1B4332;">Total</td><td style="text-align:right;padding:10px 0 0;font-weight:700;font-size:18px;color:#1B4332;border-top:2px solid #1B4332;">${fmtMoney(o.total || 0)}</td></tr>
      </table>

      ${addr ? `
      <div style="margin-top:24px;padding:14px 18px;background:#F8F4E9;border-radius:10px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.6px;color:#666;text-transform:uppercase;margin-bottom:6px;">Delivery to</div>
        <div style="font-size:14px;line-height:1.55;">
          ${(addr.full_name || addr.name || '')}<br>
          ${(addr.line1 || addr.street || '')}${addr.line2 ? ', ' + addr.line2 : ''}<br>
          ${(addr.city || '')}${addr.postcode || addr.postal_code ? ', ' + (addr.postcode || addr.postal_code) : ''}<br>
          ${(addr.country || '')}
        </div>
      </div>` : ''}

      <div style="text-align:center;margin:30px 0 10px;">
        <a href="${SITE}/orders" style="display:inline-block;background:#1B4332;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">Track my order →</a>
      </div>

      <p style="font-size:13px;color:#666;line-height:1.55;margin-top:26px;">
        Questions? Reply to this email or WhatsApp us on
        <a href="https://wa.me/447950554456" style="color:#2D6A4F;">+44 7950 554456</a>.
      </p>
    </div>

    <div style="background:#1B4332;color:#DAD7CD;padding:22px 24px;text-align:center;font-size:12px;line-height:1.6;">
      AGRENES · Agriculture Environment & Ecosystems Ltd<br>
      Ndeeba Kabowa, Kampala, Uganda · Reg. No. 179759<br>
      <a href="${SITE}" style="color:#DAD7CD;">agrenesmarket.com</a>
    </div>
  </div>
</body></html>`
}

async function loadFullOrder(supa: any, orderId: string) {
  const { data: order } = await supa.from('orders').select('*').eq('id', orderId).single()
  if (!order) return null
  const { data: items } = await supa.from('order_items').select('*').eq('order_id', orderId)
  let address = null
  if (order.address_id) {
    const { data: a } = await supa.from('addresses').select('*').eq('id', order.address_id).maybeSingle()
    address = a || null
  }
  let profile = null
  if (order.user_id) {
    const { data: p } = await supa.from('profiles').select('*').eq('id', order.user_id).maybeSingle()
    profile = p || null
  }
  return { ...order, items: items || [], address, profile }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { order_id, email } = await req.json().catch(() => ({}))
    if (!order_id) return new Response(JSON.stringify({ error: 'order_id missing' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const payload = await loadFullOrder(supa, order_id)
    if (!payload) return new Response(JSON.stringify({ error: 'order not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const toEmail = email || payload.profile?.email
    if (!toEmail) return new Response(JSON.stringify({ error: 'email missing' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [toEmail],
        subject: `Your AGRENES order · ${payload.reference || payload.id}`,
        html: renderHtml(payload),
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) return new Response(JSON.stringify({ error: 'resend failed', detail: data }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    return new Response(JSON.stringify({ ok: true, id: data.id, to: toEmail }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
