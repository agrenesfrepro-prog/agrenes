// app/admin/orders/[id]/page.jsx
// CHUNK B — Admin stage-advance UI for a single order
//
// Native Next.js route (bypasses the CRA bridge). Lists an order's current
// status + 8-stage pipeline with buttons to advance. Clicking a button runs
// a Supabase UPDATE on orders.status; the DB triggers handle the event log
// and (once the edge function is deployed) the email send.
//
// Access: Supabase SSR auth + profiles.role check.
// Only users with role = 'admin' can view this page.
//
// To navigate here: open admin orders list → click an order → URL becomes
// /admin/orders/{order_uuid}. You can also paste the URL directly.
//
// STYLING: inline styles, no Tailwind (project does not use Tailwind).

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '../../../../src/lib/supabase';
import { useAuthStore } from '../../../../src/lib/store';

const STAGES = [
  { key: 'pending',          emoji: '📋', label: 'Order Placed' },
  { key: 'confirmed',        emoji: '✅', label: 'Confirmed' },
  { key: 'preparing',        emoji: '📦', label: 'Preparing in Kabowa' },
  { key: 'dispatched',       emoji: '🚚', label: 'Dispatched from Uganda' },
  { key: 'in_transit',       emoji: '✈️', label: 'In Transit to UK' },
  { key: 'uk_customs',       emoji: '🛃', label: 'Through UK Customs' },
  { key: 'out_for_delivery', emoji: '🏃', label: 'Out for Delivery' },
  { key: 'delivered',        emoji: '🎉', label: 'Delivered' },
];

const C = {
  forest: '#074031',
  emeraldMid: '#059669',
  emeraldLight: '#ecfdf5',
  emeraldBorder: '#a7f3d0',
  amber: '#d4af37',
  amberBright: '#fbbf24',
  amberLight: '#fef3c7',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  white: '#ffffff',
  red: '#dc2626',
  redLight: '#fef2f2',
};

export default function AdminOrderStagePage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const { user, profile } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auth guard — admin only
  useEffect(() => {
    if (user === null || profile === null) return; // still loading auth
    if (!user) {
      router.replace('/login?redirect=/admin/orders/' + orderId);
      return;
    }
    if (profile?.role !== 'admin') {
      setError('You need admin access to view this page.');
      setLoading(false);
    }
  }, [user, profile, orderId, router]);

  // Fetch order + events
  const refresh = async () => {
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (orderErr) { setError(orderErr.message); setLoading(false); return; }

    // Customer profile (signed-in orders only). Fetched separately so a guest
    // order, or a missing table relationship, never breaks the page.
    if (orderData.user_id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', orderData.user_id)
        .maybeSingle();
      orderData.profiles = prof || null;
    }

    const { data: itemData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const { data: eventData } = await supabase
      .from('order_status_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    setOrder(orderData);
    setEvents(eventData || []);
    setItems((itemData || []).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))));
    setLoading(false);
  };

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, orderId]);

  const advanceToStage = async (stage) => {
    if (!confirm(`Move order to "${stage}"? The customer will receive an email notification if one is configured for this stage.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: stage })
        .eq('id', orderId);
      if (error) throw error;
      await refresh();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <main style={S.main}>
        <div style={S.container}>
          <div style={S.card}>
            <h1 style={{ fontSize: 20, color: C.red, margin: 0 }}>Error</h1>
            <p style={{ color: C.slate700, marginTop: 8 }}>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (loading || !order) {
    return (
      <main style={S.main}>
        <div style={S.container}>
          <div style={S.card}>
            <p style={{ color: C.slate500, textAlign: 'center', margin: 0 }}>Loading order…</p>
          </div>
        </div>
      </main>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === order.status);
  const customerEmail = order.customer_email || order.profiles?.email || '(no email on file)';
  const notesName = (String(order.notes || '').match(/Delivery:\s*([^,·]+)/)?.[1] || '').trim();
  const customerName = order.profiles?.full_name || (notesName ? `${notesName}${order.user_id ? '' : ' (guest)'}` : '(guest)');
  const money = (n) => `£${Number(n || 0).toFixed(2)}`;
  const qtyText = (q) => { const n = Number(q || 0); return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))); };
  const th = { textAlign: 'left', fontSize: 12, fontWeight: 600, color: C.slate500, padding: '0 0 8px 0', borderBottom: `1px solid ${C.slate200}` };
  const td = { fontSize: 14, color: C.slate900, padding: '10px 0', borderBottom: `1px solid ${C.slate100}`, verticalAlign: 'top' };
  const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: C.slate700, padding: '4px 0' };

  return (
    <main style={S.main}>
      <div style={S.container}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => router.back()} style={S.backLink}>← Back</button>
          <h1 style={S.pageTitle}>Order {order.reference}</h1>
        </div>

        {/* Order summary */}
        <section style={S.card}>
          <h2 style={S.sectionLabel}>Order summary</h2>
          <dl style={S.detailsGrid}>
            <div><dt style={S.dt}>Customer</dt><dd style={S.dd}>{customerName}</dd></div>
            <div><dt style={S.dt}>Email</dt><dd style={S.dd}>{customerEmail}</dd></div>
            <div><dt style={S.dt}>Order total</dt><dd style={S.ddBold}>{order.currency} {Number(order.total).toFixed(2)}</dd></div>
            <div><dt style={S.dt}>Placed</dt><dd style={S.dd}>{formatDateTime(order.created_at)}</dd></div>
            <div><dt style={S.dt}>Order type</dt><dd style={S.dd}>{order.order_type}</dd></div>
            <div><dt style={S.dt}>Payment</dt><dd style={S.dd}>{order.payment_status} · {order.payment_method}</dd></div>
            {order.estimated_delivery && (
              <div><dt style={S.dt}>Est. delivery</dt><dd style={S.dd}>{formatDate(order.estimated_delivery)}</dd></div>
            )}
            {order.delivered_at && (
              <div><dt style={S.dt}>Delivered at</dt><dd style={S.dd}>{formatDateTime(order.delivered_at)}</dd></div>
            )}
          </dl>
          {order.notes && (
            <>
              <h3 style={{ ...S.sectionLabel, marginTop: 20, marginBottom: 8 }}>Delivery notes</h3>
              <pre style={S.notes}>{order.notes}</pre>
            </>
          )}
          {order.tracking_token && (
            <>
              <h3 style={{ ...S.sectionLabel, marginTop: 20, marginBottom: 8 }}>Customer tracking URL</h3>
              <a
                href={`/track/${order.tracking_token}`}
                target="_blank"
                rel="noopener noreferrer"
                style={S.trackingLink}
              >
                /track/{order.tracking_token.slice(0, 16)}… ↗
              </a>
            </>
          )}
        </section>

        {/* Items ordered */}
        <section style={S.card}>
          <h2 style={S.sectionLabel}>Items ordered</h2>
          {items.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
              <thead>
                <tr>
                  <th style={th}>Product</th>
                  <th style={{ ...th, textAlign: 'center' }}>Qty</th>
                  <th style={{ ...th, textAlign: 'right' }}>Unit price</th>
                  <th style={{ ...th, textAlign: 'right' }}>Line total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td style={td}>
                      {it.name || 'Item'}
                      {it.unit ? <span style={{ color: C.slate500 }}> ({it.unit})</span> : null}
                    </td>
                    <td style={{ ...td, textAlign: 'center' }}>{qtyText(it.qty)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{money(it.price)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>{money(it.subtotal ?? Number(it.price || 0) * Number(it.qty || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ fontSize: 14, color: C.red, margin: '0 0 12px 0' }}>
              No line items are saved for this order.
            </p>
          )}
          <div style={totalRow}><span>Subtotal</span><span>{money(order.subtotal)}</span></div>
          <div style={totalRow}><span>Delivery</span><span>{money(order.delivery_fee)}</span></div>
          {Number(order.discount || 0) > 0 && (
            <div style={totalRow}><span>Discount</span><span>-{money(order.discount)}</span></div>
          )}
          <div style={{ ...totalRow, fontSize: 16, fontWeight: 700, color: C.slate900, borderTop: `1px solid ${C.slate200}`, marginTop: 6, paddingTop: 10 }}>
            <span>Total</span><span>{money(order.total)}</span>
          </div>
        </section>

        {/* Stage advance */}
        <section style={S.card}>
          <h2 style={S.sectionLabel}>Advance stage</h2>
          <p style={{ fontSize: 13, color: C.slate500, marginTop: 0, marginBottom: 20 }}>
            Current stage: <strong style={{ color: C.forest }}>{STAGES[currentIndex]?.label || order.status}</strong>
          </p>

          <div style={S.stageGrid}>
            {STAGES.map((stage, i) => {
              const isDone = i < currentIndex;
              const isCurrent = i === currentIndex;
              const isFuture = i > currentIndex;
              const isNext = i === currentIndex + 1;

              const btnStyle = {
                ...S.stageButton,
                ...(isDone ? S.stageButtonDone :
                   isCurrent ? S.stageButtonCurrent :
                   isNext ? S.stageButtonNext :
                   S.stageButtonFuture),
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.6 : 1,
              };

              return (
                <button
                  key={stage.key}
                  disabled={saving || isCurrent}
                  onClick={() => advanceToStage(stage.key)}
                  style={btnStyle}
                >
                  <span style={{ fontSize: 20, marginRight: 8 }}>{stage.emoji}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{stage.label}</span>
                  {isDone && <span style={{ color: C.emeraldMid, fontWeight: 700 }}>✓</span>}
                  {isCurrent && <span style={{ fontSize: 11, color: C.forest, fontWeight: 600 }}>CURRENT</span>}
                  {isNext && !saving && <span style={{ fontSize: 11, color: C.forest, fontWeight: 600 }}>NEXT →</span>}
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 11, color: C.slate400, marginTop: 16, marginBottom: 0 }}>
            Each click logs an event in order_status_events and (once the send-order-email edge function is deployed) fires a Resend email to {customerEmail}.
          </p>
        </section>

        {/* Event history */}
        <section style={S.card}>
          <h2 style={S.sectionLabel}>Event history</h2>
          {events.length === 0 ? (
            <p style={{ color: C.slate500, margin: 0 }}>No events logged yet.</p>
          ) : (
            <ul style={S.eventList}>
              {events.map((ev) => (
                <li key={ev.id} style={S.eventItem}>
                  <strong style={{ color: C.forest }}>{ev.stage}</strong>
                  {ev.note && <span style={{ color: C.slate700 }}> — {ev.note}</span>}
                  <span style={{ color: C.slate500, fontSize: 12, marginLeft: 8 }}>{formatDateTime(ev.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  );
}

// ============================================================================
// Styles
// ============================================================================

const S = {
  main: {
    minHeight: '100vh',
    background: `linear-gradient(to bottom, ${C.emeraldLight}, ${C.white})`,
    padding: '32px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: { maxWidth: 760, margin: '0 auto' },
  backLink: {
    background: 'none', border: 'none', color: C.forest, fontWeight: 600,
    fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 8,
  },
  pageTitle: { fontSize: 24, color: C.slate900, margin: '4px 0 0 0' },
  card: {
    backgroundColor: C.white, borderRadius: 16,
    border: `1px solid ${C.emeraldBorder}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    padding: 24, marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 1.5, color: C.slate500, marginTop: 0, marginBottom: 16,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px 24px',
    margin: 0,
  },
  dt: { fontSize: 11, color: C.slate500, margin: 0 },
  dd: { fontSize: 14, color: C.slate900, margin: '2px 0 0 0' },
  ddBold: { fontSize: 14, color: C.slate900, margin: '2px 0 0 0', fontWeight: 700 },
  notes: {
    background: C.slate100, border: `1px solid ${C.slate200}`,
    borderRadius: 8, padding: '10px 14px', fontSize: 12.5,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    color: C.slate700, fontFamily: 'ui-monospace, SFMono-Regular, monospace', margin: 0,
  },
  trackingLink: {
    color: C.forest, textDecoration: 'underline', fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, monospace',
  },
  stageGrid: {
    display: 'grid',
    gap: 8,
  },
  stageButton: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '12px 16px', borderRadius: 10,
    border: `1px solid ${C.slate200}`,
    fontSize: 14, fontWeight: 500,
    background: C.white,
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  stageButtonDone: {
    background: C.emeraldLight,
    borderColor: C.emeraldBorder,
    color: C.slate700,
  },
  stageButtonCurrent: {
    background: C.amberLight,
    borderColor: C.amberBright,
    color: C.forest,
    fontWeight: 700,
    cursor: 'default',
  },
  stageButtonNext: {
    background: C.white,
    borderColor: C.forest,
    color: C.forest,
    fontWeight: 600,
  },
  stageButtonFuture: {
    background: C.white,
    borderColor: C.slate200,
    color: C.slate500,
  },
  eventList: { listStyle: 'none', margin: 0, padding: 0 },
  eventItem: {
    padding: '8px 0',
    borderBottom: `1px solid ${C.slate100}`,
    fontSize: 13,
  },
};

// ============================================================================
// Helpers
// ============================================================================

function formatDate(input) {
  if (!input) return '';
  return new Date(input).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateTime(input) {
  if (!input) return '';
  return new Date(input).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
