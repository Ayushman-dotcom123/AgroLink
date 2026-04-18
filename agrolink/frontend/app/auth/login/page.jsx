'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../store/useStore'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiArrowRight, FiLoader } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { GiWheat } from 'react-icons/gi'
import {
  auth, googleProvider, RecaptchaVerifier,
  signInWithPhoneNumber, signInWithPopup,
} from '../../../lib/firebase'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function firebaseVerify(idToken) {
  const res = await fetch(`${API}/firebase-auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error('Verification failed')
  return res.json()
}

export default function LoginPage() {
  const { setAuth } = useAuthStore()
  const router = useRouter()

  // Email/password form
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Phone OTP
  const [showPhone, setShowPhone] = useState(false)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const confirmRef = useRef(null)
  const recaptchaRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible', callback: () => {},
    })
    return () => { recaptchaRef.current?.clear?.(); recaptchaRef.current = null }
  }, [])

  const redirect = (user) => {
    if (user.role === 'farmer') router.push('/dashboard')
    else if (user.role === 'admin') router.push('/admin')
    else router.push('/marketplace')
  }

  // ── Email / Password login ──
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setAuth(data.user, data.token)
      toast.success(`Welcome back, ${data.user.name}!`)
      redirect(data.user)
    } catch (err) {
      // Fallback demo users when MySQL is offline
      const demo = {
        'farmer@demo.com':   { user_id: 1, name: 'Ramesh Kumar',  role: 'farmer',   email: 'farmer@demo.com',   village: 'Karnal', state: 'Haryana' },
        'customer@demo.com': { user_id: 2, name: 'Priya Sharma',  role: 'customer',  email: 'customer@demo.com' },
        'admin@demo.com':    { user_id: 3, name: 'Admin User',    role: 'admin',     email: 'admin@demo.com' },
      }
      if (demo[form.email] && form.password === 'demo123') {
        setAuth(demo[form.email], 'demo-token')
        toast.success(`Welcome back, ${demo[form.email].name}!`)
        redirect(demo[form.email])
      } else {
        toast.error(err.message || 'Invalid credentials')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Google login ──
  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { user, token } = await firebaseVerify(idToken)
      setAuth(user, token)
      toast.success(`Welcome, ${user.name}!`)
      redirect(user)
    } catch (err) {
      toast.error('Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone OTP ──
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setPhoneLoading(true)
    try {
      const formatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      confirmRef.current = await signInWithPhoneNumber(auth, formatted, recaptchaRef.current)
      setOtpSent(true)
      toast.success('OTP sent!')
    } catch (err) {
      toast.error('Failed to send OTP.')
      recaptchaRef.current?.clear?.(); recaptchaRef.current = null
    } finally {
      setPhoneLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setPhoneLoading(true)
    try {
      const result = await confirmRef.current.confirm(otp)
      const idToken = await result.user.getIdToken()
      const { user, token } = await firebaseVerify(idToken)
      setAuth(user, token)
      toast.success(`Welcome, ${user.name}!`)
      redirect(user)
    } catch (err) {
      toast.error('Invalid OTP.')
    } finally {
      setPhoneLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF] flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: '#1565C0' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: '#4CAF50' }} />
      </div>
      <div id="recaptcha-container" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-md">
              <GiWheat className="text-[#C8E6C9] text-xl" />
            </div>
            <span className="text-2xl font-bold gradient-text">AgroLink</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">Welcome Back</h1>
          <p className="text-[#455A64] text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-[#81C784]/20">

          {/* Demo credentials hint */}
          <div className="bg-[#C8E6C9]/20 border border-[#81C784]/50 rounded-xl p-3 mb-5 text-xs text-[#1565C0]">
            <p className="font-bold mb-1">Demo Credentials:</p>
            <p>Farmer: farmer@demo.com / demo123</p>
            <p>Customer: customer@demo.com / demo123</p>
            <p>Admin: admin@demo.com / demo123</p>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-[#1565C0] text-sm font-medium mb-1.5 block">Email</label>
              <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                <FiMail className="text-[#455A64] flex-shrink-0" />
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5"><label className="text-[#1565C0] text-sm font-medium">Password</label><a href="/auth/forgot-password" className="text-[#4CAF50] text-xs hover:underline">Forgot password?</a></div>
              <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                <FiLock className="text-[#455A64] flex-shrink-0" />
                <input type={showPwd ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-[#455A64] hover:text-[#1565C0] flex-shrink-0">
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#81C784] text-[#4CAF50] focus:ring-[#4CAF50]" />
              <label htmlFor="remember" className="text-[#455A64] text-sm cursor-pointer">Remember me for 7 days</label>
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-grape flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-60">
              {loading ? <><FiLoader className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3F2FD]" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[#90A4AE] text-xs">or continue with</span></div>
          </div>

          {/* Quick login options */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={handleGoogle} disabled={loading}
              className="flex items-center justify-center gap-2 border-2 border-[#81C784]/40 hover:border-[#4CAF50] bg-white text-[#1565C0] font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-60">
              <FcGoogle className="text-xl" /> Google
            </button>
            <button onClick={() => { setShowPhone(!showPhone); setOtpSent(false); setOtp('') }}
              className={`flex items-center justify-center gap-2 border-2 bg-white text-[#1565C0] font-medium py-2.5 rounded-xl transition-all text-sm ${showPhone ? 'border-[#1565C0]' : 'border-[#81C784]/40 hover:border-[#4CAF50]'}`}>
              <FiPhone className="text-[#4CAF50]" /> Phone OTP
            </button>
          </div>

          {/* Phone OTP panel */}
          <AnimatePresence>
            {showPhone && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="bg-[#F0F7FF] rounded-xl p-4 mb-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-3">
                      <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px] bg-white">
                        <FiPhone className="text-[#455A64] flex-shrink-0" />
                        <span className="text-[#455A64] text-sm border-r border-[#e8e4df] pr-2 mr-1">+91</span>
                        <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="9876543210" maxLength={10}
                          className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                      </div>
                      <button type="submit" disabled={phoneLoading || phone.length < 10}
                        className="w-full btn-grape py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {phoneLoading ? <FiLoader className="animate-spin" /> : null} Send OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-3">
                      <p className="text-[#1565C0] text-xs text-center font-medium">OTP sent to +91 {phone}
                        <button type="button" onClick={() => setOtpSent(false)} className="text-[#4CAF50] ml-2 hover:underline">Change</button>
                      </p>
                      <input type="text" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP" maxLength={6}
                        className="input-field text-center text-xl tracking-[0.4em] font-bold" />
                      <button type="submit" disabled={phoneLoading || otp.length < 6}
                        className="w-full btn-grape py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {phoneLoading ? <FiLoader className="animate-spin" /> : null} Verify & Sign In
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[#455A64] text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#1565C0] hover:text-[#4CAF50] font-semibold transition-colors">Register here</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
