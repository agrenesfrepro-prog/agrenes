// Thin helper to serve resized versions of Supabase-hosted images.
// Only rewrites URLs that are Supabase Storage 'public' object URLs; other URLs pass through.
export function img(url, width = 600, quality = 70) {
  if (!url || typeof url !== 'string') return url
  // Match Supabase storage public URL and turn it into a render/image URL
  // ...supabase.co/storage/v1/object/public/<bucket>/<path>  ->
  // ...supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=W&quality=Q&resize=cover
  try {
    if (url.includes('/storage/v1/object/public/')) {
      const rendered = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
      const sep = rendered.includes('?') ? '&' : '?'
      return rendered + sep + 'width=' + width + '&quality=' + quality + '&resize=cover'
    }
  } catch {}
  return url
}
