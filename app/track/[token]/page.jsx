// app/track/[token]/page.jsx
// AGRENES Market — customer-facing order tracking page
// Access: public, gated by unguessable 32-char token in URL
// Data source: get_order_tracking(p_token) Supabase RPC
//
// IMPORTANT — Supabase client import:
// This file assumes a server client factory at ../../../src/lib/supabase-ssr/server.
// If your project uses a different path (e.g. @/utils/supabase/server),
// adjust the import line below. The factory should wrap @supabase/ssr's
// createServerClient with your cookies() reader, the same pattern already
// used by app/page.js, app/shop/page.js, and app/product/[id]/page.js.

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

export default async function TrackPage({ params }) {
  const { token } = await params;

  // Basic input shape check — avoid wasting a DB round-trip on garbage
  if (!token || token.length < 16 || token.length > 128) notFound();

  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_order_tracking', { p_token: token })
    .maybeSingle();

  if (error || !data) notFound();

  const currentIndex = STAGES.findIndex((s) => s.key === data.order_status);
  const firstName = (data.customer_name ?? '').trim().split(/\s+/)[0] || 'there';

  // When was each stage reached? Map events[] into a lookup for quick render
  const eventByStage = new Map();
  for (const e of data.events ?? []) eventByStage.set(e.stage, e);

  const isDelivered = data.order_status === 'delivered';
  const isCancelled = data.order_status === 'cancelled';

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">

        {/* Brand header */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-emerald-900">
              agrenes<span className="text-amber-500">market</span>
            </span>
          </Link>
        </div>

        {/* Headline */}
        <header className="mb-8 rounded-2xl border border-emerald-100 bg-white px-6 py-7 text-center shadow-sm">
          {isCancelled ? (
            <>
              <h1 className="text-xl font-bold text-slate-900">Order cancelled</h1>
              <p className="mt-2 text-sm text-slate-600">
                Order <span className="font-mono font-semibold">{data.order_code}</span> has been cancelled.
                Any charge will be refunded in 5–10 business days.
              </p>
            </>
          ) : isDelivered ? (
            <>
              <h1 className="text-xl font-bold text-emerald-900">
                Hi {firstName} — your order is delivered 🎉
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Order <span className="font-mono font-semibold">{data.order_code}</span>
                {' · '}
                Delivered {formatDateTime(data.delivered_at)}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-emerald-900">
                Hi {firstName} — your order is on its way
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Order <span className="font-mono font-semibold">{data.order_code}</span>
                {data.estimated_delivery && (
                  <>
                    {' · '}Estimated delivery{' '}
                    <span className="font-semibold text-emerald-700">
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
          <section className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-500">
              Where your order is
            </h2>
            <ol className="relative border-l-2 border-slate-200 pl-7">
              {STAGES.map((stage, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex && !isDelivered;
                const isDeliveredStage = stage.key === 'delivered' && isDelivered;
                const isFuture = i > currentIndex;
                const ev = eventByStage.get(stage.key);

                const bulletClass = [
                  'absolute flex h-7 w-7 items-center justify-center rounded-full text-sm',
                  '-left-[14px]',
                  isDone || isDeliveredStage
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-amber-400 text-emerald-900 ring-4 ring-amber-100 pulse-ring'
                    : 'bg-slate-200 text-slate-400',
                ].join(' ');

                const labelClass = isFuture ? 'opacity-50' : '';

                return (
                  <li key={stage.key} className="mb-6 last:mb-0">
                    <span className={bulletClass} aria-hidden="true">
                      {(isDone || isDeliveredStage) ? '✓' : stage.emoji}
                    </span>
                    <div className={labelClass}>
                      <h3 className="font-semibold text-slate-900">{stage.label}</h3>
                      {ev && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDateTime(ev.at)}
                          {ev.note && (
                            <span className="block italic text-slate-600">{ev.note}</span>
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
        <section className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Order details
          </h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Order total</dt>
              <dd className="text-base font-semibold text-slate-900">
                {formatCurrency(data.order_total, data.currency)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Placed on</dt>
              <dd className="text-base text-slate-900">
                {formatDate(data.order_created_at)}
              </dd>
            </div>
            {data.shipping_city && (
              <div>
                <dt className="text-xs text-slate-500">Delivering to</dt>
                <dd className="text-base text-slate-900">
                  {data.shipping_city}
                  {data.shipping_country ? `, ${data.shipping_country}` : ''}
                </dd>
              </div>
            )}
            {!isDelivered && data.estimated_delivery && (
              <div>
                <dt className="text-xs text-slate-500">Estimated arrival</dt>
                <dd className="text-base text-slate-900">
                  {formatDate(data.estimated_delivery)}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Reassurance block — only show while in motion */}
        {!isDelivered && !isCancelled && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p>
              <strong>Fresh from Uganda:</strong> Your produce was picked at our Kabowa packhouse this week,
              cold-chain packed, and flown direct to Gatwick. On arrival it typically has 10–14 days of usable shelf
              life — refrigerate on receipt for maximum freshness.
            </p>
          </section>
        )}

        {/* Footer / contact */}
        <footer className="mt-10 text-center text-xs text-slate-500">
          Questions about your order?<br />
          Email <a href="mailto:hello@agrenesmarket.com" className="underline">hello@agrenesmarket.com</a>
          {' '}or call Isma on{' '}
          <a href="tel:+447947716008" className="underline">+44 7947 716008</a>
          <p className="mt-4 text-[10px] text-slate-400">
            AGRENES UK LIMITED · Companies House 16391212 · 263 Longheath Gardens, Croydon CR0 7TZ
          </p>
        </footer>
      </div>

      {/* Pulse animation for the current stage — CSS only, no JS required */}
      <style>{`
        @keyframes pulse-ring-kf {
          0%   { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
          100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
        }
        .pulse-ring {
          animation: pulse-ring-kf 2s infinite;
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
