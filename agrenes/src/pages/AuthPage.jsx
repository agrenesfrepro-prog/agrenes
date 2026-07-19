import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../lib/store'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuthStore()
  const [mode, setMode] = useState('login') // login | register
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email:'', password:'', fullName:'', phone:'' })

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(form.email, form.password)
        if (error) throw error
        toast.success('Welcome back!')
        navigate('/')
      } else {
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters')
        const { error } = await signUp(form.email, form.password, form.fullName)
        if (error) throw error
        toast.success('Account created! Please check your email to confirm.')
        setMode('login')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column'}}>
      {/* Header */}
      <div style={{
        background:'var(--g1)', padding:'20px 20px 40px',
        textAlign:'center', position:'relative'
      }}>
        <button onClick={() => navigate(-1)} style={{
          position:'absolute', left:16, top:20,
          background:'rgba(255,255,255,.15)', border:'none', color:'#fff',
          borderRadius:8, padding:'6px 10px', cursor:'pointer',
          display:'flex', alignItems:'center', gap:4, fontSize:13
        }}>
          <ArrowLeft size={16}/>
        </button>
        <img src="/logo.png" alt="AGRENES" style={{height:48, margin:'0 auto 12px', filter:'brightness(0) invert(1)'}}/>
        <p style={{color:'rgba(255,255,255,.7)', fontSize:13}}>
          {mode === 'login' ? 'Welcome back!' : 'Create your account'}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background:'var(--wh)', borderRadius:'20px 20px 0 0',
        marginTop:-20, flex:1, padding:'28px 20px 40px',
        maxWidth:480, width:'100%', margin:'-20px auto 0', boxShadow:'var(--sh3)'
      }}>
        {/* Toggle */}
        <div style={{
          display:'flex', background:'var(--brl)', borderRadius:12, padding:4, marginBottom:24
        }}>
          {[{label:'Sign In', val:'login'},{label:'Create Account', val:'register'}].map(tab => (
            <button key={tab.val} onClick={() => setMode(tab.val)} style={{
              flex:1, padding:'9px 0', borderRadius:9, fontSize:13.5, fontWeight:600,
              background: mode===tab.val ? 'var(--wh)' : 'transparent',
              border:'none', color: mode===tab.val ? 'var(--g2)' : 'var(--mu)',
              boxShadow: mode===tab.val ? 'var(--sh1)' : 'none',
              cursor:'pointer', transition:'all .2s'
            }}>{tab.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" type="text" placeholder="Jane Smith"
                value={form.fullName} onChange={e => set('fullName', e.target.value)} required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input className="form-input" type="email" placeholder="jane@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required
            />
          </div>

          <div className="form-group" style={{position:'relative'}}>
            <label>Password</label>
            <input className="form-input" type={showPass ? 'text' : 'password'}
              placeholder={mode==='login' ? 'Your password' : 'Min. 6 characters'}
              value={form.password} onChange={e => set('password', e.target.value)}
              required style={{paddingRight:44}}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position:'absolute', right:12, bottom:12,
              background:'none', border:'none', color:'var(--lt)', cursor:'pointer'
            }}>
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Phone (optional)</label>
              <input className="form-input" type="tel" placeholder="+44 7700 000000"
                value={form.phone} onChange={e => set('phone', e.target.value)}
              />
            </div>
          )}

          {mode === 'login' && (
            <div style={{textAlign:'right', marginBottom:16, marginTop:-6}}>
              <button type="button" onClick={async () => {
                if (!form.email) { toast.error('Enter your email address first'); return }
                const { error } = await import('../lib/supabase').then(m => m.supabase.auth.resetPasswordForEmail(form.email, { redirectTo: window.location.origin + '/reset-password' }))
                if (error) toast.error(error.message)
                else toast.success('Password reset email sent! Check your inbox.')
              }} style={{
                background:'none', border:'none', color:'var(--g3)',
                fontSize:12.5, fontWeight:600, cursor:'pointer'
              }}>Forgot password?</button>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{
            width:'100%', justifyContent:'center', height:48, fontSize:15,
            opacity: loading ? .7 : 1
          }}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{
          margin:'24px 0', textAlign:'center',
          position:'relative'
        }}>
          <div style={{position:'absolute', inset:'50% 0 auto', height:1, background:'var(--br)'}}/>
          <span style={{position:'relative', background:'var(--wh)', padding:'0 12px', fontSize:12, color:'var(--lt)'}}>
            OR CONTINUE WITH
          </span>
        </div>

        {/* Social login placeholder */}
        <button style={{
          width:'100%', background:'var(--bg)', border:'1px solid var(--br)',
          borderRadius:10, padding:'12px 0', fontSize:14, fontWeight:600,
          display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer'
        }}>
          <span>🔵</span> Continue with Google
        </button>

        <p style={{textAlign:'center', marginTop:20, fontSize:13, color:'var(--mu)'}}>
          By {mode==='login' ? 'signing in' : 'creating an account'}, you agree to our{' '}
          <Link to="/terms" style={{color:'var(--g3)', fontWeight:600}}>Terms</Link> &{' '}
          <Link to="/privacy" style={{color:'var(--g3)', fontWeight:600}}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
