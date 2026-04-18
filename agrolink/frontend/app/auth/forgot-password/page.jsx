'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft, FiLoader } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
      toast.success('Reset email sent!')
    } catch (err) {
      const msg = err.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : 'Failed to send reset email. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: '#1565C0' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: '#4CAF50' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-md">
              <GiWheat className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-[#1565C0]">AgroLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#1565C0]">Reset Password</h1>
          <p className="text-[#455A64] text-sm mt-1">
            {sent ? 'Check your email for the reset link' : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#81C784]/30">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#C8E6C9]/40 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">📧</span>
              </div>
              <p className="text-[#455A64] text-sm">
                We sent a password reset link to <span className="font-semibold text-[#1565C0]">{email}</span>.
                Check your inbox and follow the link to reset your password.
              </p>
              <p className="text-[#90A4AE] text-xs">Didn't receive it? Check your spam folder.</p>
              <button onClick={() => setSent(false)}
                className="text-[#4CAF50] text-sm hover:underline">
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[#1565C0] text-sm font-medium mb-1.5 block">Email Address</label>
                <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                  <FiMail className="text-[#455A64] flex-shrink-0" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#90A4AE] h-full" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-grape flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-60">
                {loading ? <><FiLoader className="animate-spin" /> Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3F2FD]" /></div>
          </div>

          <Link href="/auth/login"
            className="flex items-center justify-center gap-2 text-[#455A64] text-sm hover:text-[#1565C0] transition-colors">
            <FiArrowLeft className="text-xs" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
