import { useState } from 'react'
import { Star, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
import toast from 'react-hot-toast'

export default function WriteReview({ productId, onSubmit, onClose }) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ title: '', body: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to leave a review'); return }
    if (rating === 0) { toast.error('Please select a star rating'); return }
    setSaving(true)
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: form.title,
      body: form.body,
      is_verified: false,
    })
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Review submitted! Thank you.')
    onSubmit?.()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      {/* Backdrop — sits BELOW the modal box via z-index */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.45)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        zIndex: 1
      }} />

      {/* Modal box — sits ABOVE the backdrop, fully clear */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: '#fff', borderRadius: 14,
        width: '100%', maxWidth: 440,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)'
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--br)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h2 style={{ fontSize: 16 }}>Write a Review</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mu)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--mu)', marginBottom: 10 }}>
              Your Rating *
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Star size={32}
                    fill={(hover || rating) >= s ? 'var(--am)' : 'none'}
                    color={(hover || rating) >= s ? 'var(--am)' : 'var(--br)'}
                    style={{ transition: 'all .1s' }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div style={{ fontSize: 13, color: 'var(--mu)', marginTop: 6 }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Review Title</label>
            <input className="form-input" placeholder="Summarise your experience"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Your Review *</label>
            <textarea className="form-input" rows={4} required
              placeholder="How was the quality, freshness, packaging and value?"
              value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              style={{ resize: 'vertical' }} />
          </div>
          <button type="submit" disabled={saving || rating === 0} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 46, opacity: (saving || rating === 0) ? .6 : 1 }}>
            {saving ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}
