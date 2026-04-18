'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '../../../store/useStore'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiPhone, FiShoppingBag, FiArrowRight, FiLoader } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { GiWheat, GiFarmer } from 'react-icons/gi'
import {
  auth, googleProvider, RecaptchaVerifier,
  signInWithPhoneNumber, signInWithPopup,
} from '../../../lib/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const STATES = [
  'Andhra Pradesh','Assam','Bihar','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha',
  'Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
]
const SOIL_TYPES = ['Alluvial','Black','Red','Laterite','Sandy','Clay','Loamy']

async function firebaseVerify(idToken, role, extra = {}) {
  const res = await fetch(`${API}/firebase-auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, role, ...extra }),
  })
  if (!res.ok) throw new Error('Verification failed')
  return res.json()
}

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const router = useRouter()

  const [role, setRole] = useState(searchParams.get('role') || 'customer')
  const [loading, setLoading] = useState(false)

  // Main form
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    village: '', district: '', state: '', farm_size: '', soil_type: '',
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Phone OTP quick option
  const [showPhone, setShowPhone] = useState(false)
  const [phoneNum, setPhoneNum] = useState('')
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
    toast.success(`Welcome to AgroLink, ${user.name}!`)
    router.push(user.role === 'farmer' ? '/dashboard' : '/marketplace')
  }

  // ── Email / Password register ──
  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // 1. Register in your backend (MySQL)
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      // 2. Also create Firebase user so they can reset password via email
      try {
        const fbUser = await createUserWithEmailAndPassword(auth, form.email, form.password)
        await sendEmailVerification(fbUser.user)
        toast.success(`Welcome! Verification email sent to ${form.email}`)
      } catch (fbErr) {
        toast.success(`Welcome to AgroLink, ${form.name}!`)
      }

      setAuth(data.user, data.token)
      router.push('/auth/verify-email')
    } catch (err) {
      // Offline fallback
      const user = { user_id: Date.now(), name: form.name, email: form.email, role, village: form.village, state: form.state }
      setAuth(user, 'local-token')
      redirect(user)
    } finally {
      setLoading(false)
    }
  }

  // ── Google quick register ──
  const handleGoogle = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()
      const { user, token } = await firebaseVerify(idToken, role, {
        village: form.village, district: form.district, state: form.state,
        farm_size: form.farm_size, soil_type: form.soil_type,
      })
      setAuth(user, token)
      redirect(user)
    } catch (err) {
      toast.error('Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  // ── Phone OTP quick register ──
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setPhoneLoading(true)
    try {
      const formatted = phoneNum.startsWith('+') ? phoneNum : `+91${phoneNum.replace(/\D/g, '')}`
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
      const { user, token } = await firebaseVerify(idToken, role, {
        village: form.village, district: form.district, state: form.state,
        farm_size: form.farm_size, soil_type: form.soil_type,
      })
      setAuth(user, token)
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-md">
              <GiWheat className="text-[#C8E6C9] text-xl" />
            </div>
            <span className="text-2xl font-bold gradient-text">AgroLink</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">Create Account</h1>
          <p className="text-[#455A64] text-sm mt-1">Join India's smart farm marketplace</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-3 mb-5">
          {[
            ['farmer', 'Farmer', GiFarmer, 'Sell your crops'],
            ['customer', 'Customer', FiShoppingBag, 'Buy fresh crops'],
          ].map(([r, label, Icon, desc]) => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 rounded-2xl p-4 text-center border-2 transition-all ${role === r ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-[#81C784]/40 bg-white hover:border-[#4CAF50]'}`}>
              <Icon className={`text-2xl mx-auto mb-1 ${role === r ? 'text-[#1565C0]' : 'text-[#455A64]'}`} />
              <div className={`font-bold text-sm ${role === r ? 'text-[#1565C0]' : 'text-[#455A64]'}`}>{label}</div>
              <div className="text-[#455A64]/70 text-xs">{desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-[#81C784]/20">

          {/* ── Main registration form ── */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Full Name *</label>
                <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                  <FiUser className="text-[#455A64] text-sm flex-shrink-0" />
                  <input required value={form.name} onChange={e => update('name', e.target.value)}
                    placeholder="Ramesh Kumar"
                    className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                </div>
              </div>
              <div>
                <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Phone</label>
                <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                  <FiPhone className="text-[#455A64] text-sm flex-shrink-0" />
                  <input value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="+91 XXXXX"
                    className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Email *</label>
              <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                <FiMail className="text-[#455A64] text-sm flex-shrink-0" />
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
              </div>
            </div>

            <div>
              <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Password *</label>
              <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                <FiLock className="text-[#455A64] text-sm flex-shrink-0" />
                <input type="password" required minLength={6} value={form.password} onChange={e => update('password', e.target.value)}
                  placeholder="Min. 6 characters"
                  className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Village</label>
                <input value={form.village} onChange={e => update('village', e.target.value)}
                  placeholder="Your village" className="input-field" />
              </div>
              <div>
                <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">District</label>
                <input value={form.district} onChange={e => update('district', e.target.value)}
                  placeholder="Your district" className="input-field" />
              </div>
            </div>

            <div>
              <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">State *</label>
              <select required value={form.state} onChange={e => update('state', e.target.value)} className="input-field">
                <option value="">Select State</option>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {role === 'farmer' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Farm Size (Acres)</label>
                  <input type="number" value={form.farm_size} onChange={e => update('farm_size', e.target.value)}
                    placeholder="e.g. 5" className="input-field" />
                </div>
                <div>
                  <label className="text-[#1565C0] text-xs font-semibold mb-1.5 block">Soil Type</label>
                  <select value={form.soil_type} onChange={e => update('soil_type', e.target.value)} className="input-field">
                    <option value="">Select Soil Type</option>
                    {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-grape flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-60 mt-2">
              {loading ? <><FiLoader className="animate-spin" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3F2FD]" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-[#90A4AE] text-xs">or quick sign up with</span></div>
          </div>

          {/* Quick options */}
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
                        <input type="tel" required value={phoneNum} onChange={e => setPhoneNum(e.target.value)}
                          placeholder="9876543210" maxLength={10}
                          className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                      </div>
                      <button type="submit" disabled={phoneLoading || phoneNum.length < 10}
                        className="w-full btn-grape py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {phoneLoading ? <FiLoader className="animate-spin" /> : null} Send OTP
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-3">
                      <p className="text-[#1565C0] text-xs text-center font-medium">OTP sent to +91 {phoneNum}
                        <button type="button" onClick={() => setOtpSent(false)} className="text-[#4CAF50] ml-2 hover:underline">Change</button>
                      </p>
                      <input type="text" required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit OTP" maxLength={6}
                        className="input-field text-center text-xl tracking-[0.4em] font-bold" />
                      <button type="submit" disabled={phoneLoading || otp.length < 6}
                        className="w-full btn-grape py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                        {phoneLoading ? <FiLoader className="animate-spin" /> : null} Verify & Register
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[#455A64] text-sm">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#1565C0] hover:text-[#4CAF50] font-semibold transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
