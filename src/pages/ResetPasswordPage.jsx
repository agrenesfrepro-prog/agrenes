import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase puts the recovery token in the URL hash; the client picks it up automatically
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check if we already have a session (user clicked the email link)
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true)
    })
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { toast.error(error.message); return }
    toast.success('Password updated! You can now sign in.')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--wh)', borderRadius: 16, padding: '32px 24px', width: '100%', maxWidth: 420, boxShadow: 'var(--sh3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: 'var(--gll)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px'
          }}>
            <Lock size={24} color="var(--g3)" />
          </div>
          <h1 style={{ fontSize: 22, marginBottom: 6 }}>Set New Password</h1>
          <p style={{ fontSize: 13, color: 'var(--mu)' }}>
            {ready ? 'Enter your new password below' : 'Verifying your reset link…'}
          </p>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>New Password</label>
            <input className="form-input" type={showPass ? 'text' : 'password'}
              placeholder="Min. 6 characters" value={password}
              onChange={e => setPassword(e.target.value)} required
              style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 12, bottom: 12,
              background: 'none', border: 'none', color: 'var(--lt)', cursor: 'pointer'
            }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input className="form-input" type={showPass ? 'text' : 'password'}
              placeholder="Repeat your password" value={confirm}
              onChange={e => setConfirm(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading || !ready} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 15, opacity: (loading || !ready) ? .6 : 1 }}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13 }}>
          <a href="/login" style={{ color: 'var(--g3)', fontWeight: 600 }}>← Back to Sign In</a>
        </p>
      </div>
    </div>
  )
}
