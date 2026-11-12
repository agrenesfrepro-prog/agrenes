// app/track/[token]/not-found.jsx
// Shown when the tracking token is invalid, expired, or doesn't match any order.
// Styling: inline styles (framework-independent)

import Link from 'next/link';

export const metadata = {
  title: 'Order not found — AGRENES Market',
  robots: { index: false, follow: false },
};

const C = {
  forest:    '#074031',
  emerald:   '#047857',
  emeraldBorder: '#a7f3d0',
  emeraldLight: '#ecfdf5',
  amber:     '#d4af37',
  amberLight:'#fef3c7',
  slate900:  '#0f172a',
  slate700:  '#334155',
  slate500:  '#64748b',
  slate400:  '#94a3b8',
  white:     '#ffffff',
};

const S = {
  main: {
    minHeight: '100vh',
    background: `linear-gradient(to bottom, ${C.emeraldLight}, ${C.white} 40%, ${C.amberLight})`,
    padding: '64px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: C.slate700,
  },
  container: {
    maxWidth: '512px',
    margin: '0 auto',
  },
  brandHeader: {
    textAlign: 'center',
    marginBottom: '32px',
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
    padding: '40px 24px',
    textAlign: 'center',
  },
  iconCircle: {
    margin: '0 auto 20px auto',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: C.amberLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: C.slate900,
    margin: 0,
    lineHeight: 1.3,
  },
  description: {
    marginTop: '12px',
    fontSize: '14px',
    color: C.slate500,
    lineHeight: 1.5,
  },
  helpText: {
    marginTop: '24px',
    fontSize: '14px',
    color: C.slate700,
    lineHeight: 1.6,
  },
  helpPara: {
    margin: '0 0 12px 0',
  },
  buttonRow: {
    marginTop: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  buttonPrimary: {
    display: 'inline-block',
    backgroundColor: C.emerald,
    color: C.white,
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'center',
  },
  buttonSecondary: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: C.emerald,
    border: `1px solid ${C.emerald}`,
    textDecoration: 'none',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    textAlign: 'center',
  },
  footerLegal: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '10px',
    color: C.slate400,
  },
};

export default function TrackingNotFound() {
  return (
    <main style={S.main}>
      <div style={S.container}>

        <div style={S.brandHeader}>
          <Link href="/" style={S.brandWordmark}>
            agrenes<span style={S.brandWordmarkAmber}>market</span>
          </Link>
        </div>

        <div style={S.card}>
          <div style={S.iconCircle}>🔎</div>
          <h1 style={S.title}>We couldn&apos;t find that order</h1>
          <p style={S.description}>
            The tracking link may have expired, been typed wrong, or belong to an order that was cancelled.
          </p>

          <div style={S.helpText}>
            <p style={S.helpPara}>
              Try opening the link straight from your order confirmation email —
              that&apos;s the most reliable way back in.
            </p>
            <p style={{ ...S.helpPara, marginBottom: 0 }}>
              Still stuck? We&apos;ll find your order from your email address or phone number.
            </p>
          </div>

          <div style={S.buttonRow}>
            <a
              href="mailto:hello@agrenesmarket.com?subject=Help finding my order"
              style={S.buttonPrimary}
            >
              Email hello@agrenesmarket.com
            </a>
            <a
              href="tel:+447947716008"
              style={S.buttonSecondary}
            >
              Call Isma +44 7947 716008
            </a>
          </div>
        </div>

        <p style={S.footerLegal}>
          AGRENES UK LIMITED · Companies House 16391212 · 263 Longheath Gardens, Croydon CR0 7TZ
        </p>
      </div>
    </main>
  );
}
