// scripts/reupload-cache.mjs — one-off: re-uploads every product image
// with cacheControl: 1 year so Supabase serves them with proper HTTP headers
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ierviwtmdqerdmwtnimn.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var first (from Supabase Dashboard > Settings > API)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const BUCKET = 'product-images'

async function listAll(prefix = '') {
  const all = []
  let offset = 0
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 100, offset })
    if (error) throw error
    if (!data.length) break
    all.push(...data.map(f => prefix ? `${prefix}/${f.name}` : f.name))
    offset += data.length
    if (data.length < 100) break
  }
  return all
}

async function recursiveList(prefix = '') {
  const items = await listAll(prefix)
  const files = []
  for (const item of items) {
    if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(item)) {
      files.push(item)
    } else {
      try {
        const nested = await recursiveList(item)
        files.push(...nested)
      } catch (e) {
        files.push(item)
      }
    }
  }
  return files
}

const files = await recursiveList('')
console.log(`Found ${files.length} files to re-upload`)

let done = 0, failed = 0
for (const path of files) {
  try {
    const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(path)
    if (dlErr) throw dlErr
    const buf = Buffer.from(await blob.arrayBuffer())
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    })
    if (upErr) throw upErr
    done++
    if (done % 10 === 0) console.log(`  ${done}/${files.length}`)
  } catch (e) {
    failed++
    console.error(`FAILED: ${path} — ${e.message}`)
  }
}
console.log(`\nDone. Re-uploaded ${done}, failed ${failed}`)
