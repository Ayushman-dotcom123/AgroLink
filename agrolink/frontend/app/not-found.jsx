'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHome } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F0F7FF] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-md">
            <GiWheat className="text-white text-xl" />
          </div>
          <span className="text-2xl font-bold text-[#1565C0]">AgroLink</span>
        </div>

        {/* 404 illustration */}
        <div className="text-8xl mb-4">🌾</div>
        <h1 className="text-6xl font-bold text-[#1565C0] mb-2">404</h1>
        <h2 className="text-xl font-bold text-[#455A64] mb-3">Page Not Found</h2>
        <p className="text-[#455A64] text-sm mb-8 leading-relaxed">
          Looks like this field is empty. The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="flex items-center justify-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <FiHome /> Go Home
          </Link>
          <Link href="/marketplace"
            className="flex items-center justify-center gap-2 border-2 border-[#81C784] text-[#1565C0] hover:bg-[#81C784]/20 font-bold px-6 py-3 rounded-xl transition-colors">
            <GiWheat /> Browse Marketplace
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
