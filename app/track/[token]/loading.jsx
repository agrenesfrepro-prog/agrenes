// app/track/[token]/loading.jsx
// Shown briefly while the server fetches tracking data. Usually <300ms.
// Styling: inline styles (framework-independent)

const C = {
  forest:    '#074031',
  emeraldBorder: '#a7f3d0',
  emeraldLight: '#ecfdf5',
  amberLight:'#fef3c7',
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
  },
  container: {
    maxWidth: '640px',
    margin: '0 auto',
    animation: 'agrenes-skeleton 1.5s ease-in-out infinite',
  },
  card: {
    backgroundColor: C.white,
    borderRadius: '16px',
    border: `1px solid ${C.emeraldBorder}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    padding: '24px',
    marginBottom: '24px',
  },
  brandSkeleton: {
    width: '160px',
    height: '28px',
    margin: '0 auto 24px auto',
    borderRadius: '6px',
    backgroundColor: C.slate200,
  },
  bar: (w, h, color = C.slate200) => ({
    width: w,
    height: `${h}px`,
    borderRadius: '4px',
    backgroundColor: color,
    margin: '0 auto',
  }),
  pipelineRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  dot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: C.slate200,
    flexShrink: 0,
  },
};

export default function Loading() {
  return (
    <main style={S.main}>
      <div style={S.container}>

        {/* Brand skeleton */}
        <div style={S.brandSkeleton} />

        {/* Headline card skeleton */}
        <div style={{ ...S.card, textAlign: 'center' }}>
          <div style={S.bar('70%', 20)} />
          <div style={{ ...S.bar('50%', 14, C.slate100), marginTop: '10px' }} />
        </div>

        {/* Pipeline card skeleton */}
        <div style={S.card}>
          <div style={{ ...S.bar('120px', 12), margin: '0 0 20px 0' }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={S.pipelineRow}>
              <div style={S.dot} />
              <div style={{ flex: 1 }}>
                <div style={{ ...S.bar('180px', 12), margin: '0' }} />
                <div style={{ ...S.bar('100px', 8, C.slate100), margin: '6px 0 0 0' }} />
              </div>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes agrenes-skeleton {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
