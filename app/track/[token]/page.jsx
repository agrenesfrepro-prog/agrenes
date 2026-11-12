// app/track/[token]/page.jsx
// AGRENES Market — customer-facing order tracking page
// Access: public, gated by unguessable 32-char token in URL
// Data source: get_order_tracking(p_token) Supabase RPC
// Styling: inline styles (framework-independent)

import { createClient } from '../../../src/lib/supabase-ssr/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Revalidate every 60 seconds so customer refreshes pick up admin stage updates
export const revalidate = 60;

// Don't let tracking pages leak into search engines
export const metadata = {
  title: 'Track your order — AGRENES Market',
  description: 'Live tracking for your AGRENES Market order from Uganda to the UK.',
  robots: { index: false, follow: false },
};

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

// ============================================================================
// Style tokens — AGRENES brand palette
// ============================================================================
const C = {
  forest:    '#074031',
  emerald:   '#047857',
  emeraldMid:'#059669',
  emeraldLight: '#ecfdf5',
  emeraldBorder: '#a7f3d0',
  amber:     '#d4af37',
  amberLight:'#fef3c7',
  amberBright: '#fbbf24',
  mint:      '#a7d7c5',
  slate900:  '#0f172a',
  slate700:  '#334155',
  slate500:  '#64748b',
  slate400:  '#94a3b8',
  slate200:  '#e2e8f0',
  slate100:  '#f1f5f9',
  white:     '#ffffff',
};

const S = {
  main: {
    minHeight: '100vh',
    background: `linear-gradient(to bottom, ${C.emeraldLight}, ${C.white} 40%, ${C.amberLight})`,
    padding: '32px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: C.slate700,
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  brandWordmark: {
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: C.forest,
    textDecoration: 'none',
  },
  brandWordmarkAmber: {
    color: C.amber,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: '16px',
    border: `1px solid ${C.emeraldBorder}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    padding: '24px',
    marginBottom: '24px',
  },
  headlineCard: {
    textAlign: 'center',
    padding: '28px 24px',
  },
  headlineTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: C.forest,
    margin: 0,
    lineHeight: 1.3,
  },
  headlineTitleCancelled: {
    fontSize: '22px',
    fontWeight: 700,
    color: C.slate900,
    margin: 0,
    lineHeight: 1.3,
  },
  headlineSub: {
    fontSize: '14px',
    color: C.slate500,
    marginTop: '8px',
    marginBottom: 0,
  },
  orderCodeMono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontWeight: 600,
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: C.slate500,
    marginBottom: '20px',
  },
  pipelineList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    paddingLeft: '28px',
    borderLeft: `2px solid ${C.slate200}`,
    position: 'relative',
  },
  pipelineItem: {
    position: 'relative',
    marginBottom: '24px',
  },
  pipelineItemLast: {
    position: 'relative',
    marginBottom: 0,
  },
  bullet: {
    position: 'absolute',
    left: '-42px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    top: 0,
  },
  bulletDone: {
    backgroundColor: C.emeraldMid,
    color: C.white,
  },
  bulletCurrent: {
    backgroundColor: C.amberBright,
    color: C.forest,
    boxShadow: `0 0 0 4px ${C.amberLight}`,
    animation: 'agrenes-pulse 2s infinite',
  },
  bulletFuture: {
    backgroundColor: C.slate200,
    color: C.slate400,
  },
  stageLabel: {
    fontSize: '15px',
    fontWeight: 600,
    color: C.slate900,
    margin: 0,
  },
  stageTimestamp: {
    fontSize: '12px',
    color: C.slate500,
    marginTop: '2px',
    marginBottom: 0,
  },
  stageNote: {
    fontStyle: 'italic',
    color: C.slate700,
    display: 'block',
    marginTop: '2px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px 24px',
  },
  dt: {
    fontSize: '12px',
    color: C.slate500,
    margin: 0,
  },
  dd: {
    fontSize: '15px',
    color: C.slate900,
    margin: '4px 0 0 0',
    fontWeight: 500,
  },
  ddBold: {
    fontSize: '15px',
    color: C.slate900,
    margin: '4px 0 0 0',
    fontWeight: 700,
  },
  reassurance: {
    backgroundColor: C.amberLight,
    border: `1px solid ${C.amberBright}`,
    borderRadius: '16px',
    padding: '18px 20px',
    fontSize: '14px',
    color: '#78350f',
    marginBottom: '24px',
    lineHeight: 1.55,
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center',
    fontSize: '12px',
    color: C.slate500,
  },
  footerLink: {
    color: C.forest,
    textDecoration: 'underline',
  },
  footerLegal: {
    marginTop: '14px',
    fontSize: '10px',
    color: C.slate400,
  },
};

export default async function TrackPage({ params }) {
  const { token } = await params;

  if (!token || token.length < 16 || token.length > 128) notFound();

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_order_tracking', { p_token: token })
    .maybeSingle();

  if (error || !data) notFound();

  const currentIndex = STAGES.findIndex((s) => s.key === data.order_status);
  const firstName = (data.customer_name ?? '').trim().split(/\s+/)[0] || 'there';

  const eventByStage = new Map();
  for (const e of data.events ?? []) eventByStage.set(e.stage, e);

  const isDelivered = data.order_status === 'delivered';
  const isCancelled = data.order_status === 'cancelled';

  return (
    <main style={S.main}>
      <div style={S.container}>

        {/* Brand header */}
        <div style={S.brandHeader}>
          <Link href="/" style={S.brandWordmark}>
            agrenes<span style={S.brandWordmarkAmber}>market</span>
          </Link>
        </div>

        {/* Headline */}
        <header style={{ ...S.card, ...S.headlineCard }}>
          {isCancelled ? (
            <>
              <h1 style={S.headlineTitleCancelled}>Order cancelled</h1>
              <p style={S.headlineSub}>
                Order <span style={S.orderCodeMono}>{data.order_code}</span> has been cancelled.
                Any charge will be refunded in 5–10 business days.
              </p>
            </>
          ) : isDelivered ? (
            <>
              <h1 style={S.headlineTitle}>
                Hi {firstName} — your order is delivered 🎉
              </h1>
              <p style={S.headlineSub}>
                Order <span style={S.orderCodeMono}>{data.order_code}</span>
                {' · '}
                Delivered {formatDateTime(data.delivered_at)}
              </p>
            </>
          ) : (
            <>
              <h1 style={S.headlineTitle}>
                Hi {firstName} — your order is on its way
              </h1>
              <p style={S.headlineSub}>
                Order <span style={S.orderCodeMono}>{data.order_code}</span>
                {data.estimated_delivery && (
                  <>
                    {' · '}Estimated delivery{' '}
                    <span style={{ fontWeight: 600, color: C.emerald }}>
                      {formatDate(data.estimated_delivery)}
                    </span>
                  </>
                )}
              </p>
            </>
          )}
        </header>

        {/* 8-stage pipeline */}
        {!isCancelled && (
          <section style={S.card}>
            <h2 style={S.sectionLabel}>Where your order is</h2>
            <ol style={S.pipelineList}>
              {STAGES.map((stage, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex && !isDelivered;
                const isDeliveredStage = stage.key === 'delivered' && isDelivered;
                const isFuture = i > currentIndex;
                const ev = eventByStage.get(stage.key);

                const bulletStyle = {
                  ...S.bullet,
                  ...((isDone || isDeliveredStage) ? S.bulletDone : isCurrent ? S.bulletCurrent : S.bulletFuture),
                };

                const itemStyle = i === STAGES.length - 1 ? S.pipelineItemLast : S.pipelineItem;

                return (
                  <li key={stage.key} style={itemStyle}>
                    <span style={bulletStyle} aria-hidden="true">
                      {(isDone || isDeliveredStage) ? '✓' : stage.emoji}
                    </span>
                    <div style={{ opacity: isFuture ? 0.5 : 1 }}>
                      <h3 style={S.stageLabel}>{stage.label}</h3>
                      {ev && (
                        <p style={S.stageTimestamp}>
                          {formatDateTime(ev.at)}
                          {ev.note && (
                            <span style={S.stageNote}>{ev.note}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Order summary */}
        <section style={S.card}>
          <h2 style={S.sectionLabel}>Order details</h2>
          <dl style={S.detailsGrid}>
            <div>
              <dt style={S.dt}>Order total</dt>
              <dd style={S.ddBold}>
                {formatCurrency(data.order_total, data.currency)}
              </dd>
            </div>
            <div>
              <dt style={S.dt}>Placed on</dt>
              <dd style={S.dd}>{formatDate(data.order_created_at)}</dd>
            </div>
            {data.shipping_city && (
              <div>
                <dt style={S.dt}>Delivering to</dt>
                <dd style={S.dd}>
                  {data.shipping_city}
                  {data.shipping_country ? `, ${data.shipping_country}` : ''}
                </dd>
              </div>
            )}
            {!isDelivered && data.estimated_delivery && (
              <div>
                <dt style={S.dt}>Estimated arrival</dt>
                <dd style={S.dd}>{formatDate(data.estimated_delivery)}</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Reassurance block — only show while in motion */}
        {!isDelivered && !isCancelled && (
          <section style={S.reassurance}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: '#92400e' }}>Fresh from Uganda:</strong>{' '}
              Your produce was picked at our Kabowa packhouse this week,
              cold-chain packed, and flown direct to Gatwick. On arrival it typically has 10–14 days of usable shelf
              life — refrigerate on receipt for maximum freshness.
            </p>
          </section>
        )}

        {/* Footer / contact */}
        <footer style={S.footer}>
          Questions about your order?<br />
          Email{' '}
          <a href="mailto:hello@agrenesmarket.com" style={S.footerLink}>hello@agrenesmarket.com</a>
          {' '}or call Isma on{' '}
          <a href="tel:+447947716008" style={S.footerLink}>+44 7947 716008</a>
          <p style={S.footerLegal}>
            AGRENES UK LIMITED · Companies House 16391212 · 263 Longheath Gardens, Croydon CR0 7TZ
          </p>
        </footer>
      </div>

      {/* Pulse animation for the current stage */}
      <style>{`
        @keyframes agrenes-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
      `}</style>
    </main>
  );
}

// ============================================================================
// Formatting helpers
// ============================================================================

function formatDate(input) {
  if (!input) return '';
  const d = new Date(input);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateTime(input) {
  if (!input) return '';
  const d = new Date(input);
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function formatCurrency(amount, currency) {
  const code = (currency ?? 'GBP').toUpperCase();
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
    }).format(Number(amount ?? 0));
  } catch {
    return `${code} ${Number(amount ?? 0).toFixed(2)}`;
  }
}
