'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { auth } from '../../../lib/firebase'
import { sendEmailVerification } from 'firebase/auth'
import toast from 'react-hot-toast'
import { FiMail, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResend = async () => {
    setResending(true)
    try {
      const user = auth.currentUser
      if (user) {
        await sendEmailVerification(user)
        setResent(true)
        toast.success('Verification email sent!')
      } else {
        toast.error('Please log in first')
      }
    } catch (err) {
      toast.error('Failed to resend. Try again in a minute.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-md">
            <GiWheat className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-[#1565C0]">AgroLink</span>
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#81C784]/30">
          {/* Icon */}
          <div className="w-16 h-16 bg-[#E3F2FD] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FiMail className="text-3xl text-[#1565C0]" />
          </div>

          <h1 className="text-2xl font-bold text-[#1565C0] mb-2">Verify your email</h1>
          <p className="text-[#455A64] text-sm mb-6 leading-relaxed">
            We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
          </p>

          {/* Steps */}
          <div className="bg-[#F0F7FF] rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              'Check your email inbox',
              'Click the verification link',
              'Come back and sign in',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#4CAF50] text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </div>
                <span className="text-[#455A64] text-sm">{step}</span>
              </div>
            ))}
          </div>

          <p className="text-[#90A4AE] text-xs mb-4">
            Didn't receive it? Check your spam folder.
          </p>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#81C784]/40 hover:border-[#4CAF50] text-[#455A64] hover:text-[#1565C0] font-medium py-2.5 rounded-xl transition-all text-sm disabled:opacity-50 mb-3"
          >
            <FiRefreshCw className={`text-sm ${resending ? 'animate-spin' : ''}`} />
            {resent ? 'Email sent!' : resending ? 'Sending...' : 'Resend verification email'}
          </button>

          {/* Continue to login */}
          <Link href="/auth/login"
            className="w-full flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-3 rounded-xl transition-colors text-sm">
            Continue to Sign In <FiArrowRight />
          </Link>
        </div>

        <p className="text-[#90A4AE] text-xs mt-4">
          Wrong email?{' '}
          <Link href="/auth/register" className="text-[#4CAF50] hover:underline">Register again</Link>
        </p>
      </motion.div>
    </main>
  )
}
