// app/track/[token]/loading.jsx
// Rendered during the server-side fetch (usually <300ms, barely visible).
// Skeleton matches the real page's layout so there's no jolt when it hydrates.

export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl animate-pulse">
        {/* Brand header */}
        <div className="mb-6 h-7 w-40 mx-auto rounded bg-emerald-100" />

        {/* Headline card */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-white px-6 py-7 shadow-sm">
          <div className="mx-auto h-6 w-3/4 rounded bg-slate-200" />
          <div className="mx-auto mt-3 h-4 w-1/2 rounded bg-slate-100" />
        </div>

        {/* Pipeline card */}
        <div className="mb-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-5 h-3 w-32 rounded bg-slate-200" />
          <div className="space-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-7 w-7 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200" />
                  <div className="h-2 w-24 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details card */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-4 h-3 w-24 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-2 w-16 rounded bg-slate-100" />
                <div className="mt-2 h-4 w-28 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
