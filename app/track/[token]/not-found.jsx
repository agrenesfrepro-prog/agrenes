// app/track/[token]/not-found.jsx
// Shown when the tracking token is invalid, expired, or doesn't match any order.
// Friendly tone — someone genuinely lost their link shouldn't feel scolded.

import Link from 'next/link';

export const metadata = {
  title: 'Order not found — AGRENES Market',
  robots: { index: false, follow: false },
};

export default function TrackingNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold tracking-tight text-emerald-900">
              agrenes<span className="text-amber-500">market</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
            🔎
          </div>
          <h1 className="text-xl font-bold text-slate-900">We couldn&apos;t find that order</h1>
          <p className="mt-3 text-sm text-slate-600">
            The tracking link may have expired, been typed wrong, or belong to an order that was cancelled.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p className="text-slate-700">
              Try opening the link straight from your order confirmation email —
              that&apos;s the most reliable way back in.
            </p>
            <p className="text-slate-700">
              Still stuck? We&apos;ll find your order from your email address or phone number.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:hello@agrenesmarket.com?subject=Help finding my order"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Email hello@agrenesmarket.com
            </a>
            <a
              href="tel:+447947716008"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-700 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Call Isma +44 7947 716008
            </a>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-400">
          AGRENES UK LIMITED · Companies House 16391212 · 263 Longheath Gardens, Croydon CR0 7TZ
        </p>
      </div>
    </main>
  );
}
