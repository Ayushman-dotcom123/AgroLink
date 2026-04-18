'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useStore'
import { useRouter } from 'next/navigation'
import { FiPackage, FiMapPin, FiArrowLeft } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered']
const statusColors = {
  'Pending':          'text-[#455A64] bg-[#455A64]/10 border-[#455A64]/20',
  'Confirmed':        'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20',
  'Packed':           'text-[#1565C0] bg-[#1565C0]/10 border-[#1565C0]/20',
  'Out for Delivery': 'text-blue-600 bg-blue-50 border-blue-200',
  'Delivered':        'text-[#388E3C] bg-[#C8E6C9]/40 border-[#81C784]/40',
  'Cancelled':        'text-red-500 bg-red-50 border-red-200',
}

export default function OrderDetailPage({ params }) {
  const { token, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return }
    fetch(`${API}/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id, isAuthenticated])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-[#E3F2FD] rounded w-1/3" />
          <div className="h-40 bg-[#E3F2FD] rounded-2xl" />
          <div className="h-32 bg-[#E3F2FD] rounded-2xl" />
        </div>
      </main>
    )
  }

  if (!order || order.error) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 text-center py-20">
          <FiPackage className="text-6xl text-[#81C784] mx-auto mb-4" />
          <p className="text-[#455A64] mb-4">Order not found.</p>
          <Link href="/orders" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Back to Orders</Link>
        </div>
      </main>
    )
  }

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/orders" className="inline-flex items-center gap-1 text-[#4CAF50] text-sm hover:underline mb-3">
            <FiArrowLeft className="text-xs" /> Back to Orders
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">Order #{order.order_id}</h1>
              <p className="text-[#455A64] text-sm mt-0.5">
                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className={`text-sm px-3 py-1.5 rounded-full border font-semibold ${statusColors[order.status] || statusColors['Pending']}`}>
              {order.status}
            </span>
          </div>
        </motion.div>

        {/* Progress tracker */}
        {order.status !== 'Cancelled' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm mb-5">
            <h2 className="text-[#1565C0] font-bold mb-4 text-sm">Order Progress</h2>
            <div className="flex items-center gap-1 mb-2">
              {STATUS_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center flex-1">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                    idx < currentStep ? 'bg-[#4CAF50]' : idx === currentStep ? 'bg-[#1565C0]' : 'bg-[#E3F2FD]'
                  }`}>
                    {idx < currentStep && <span className="text-white text-[8px]">✓</span>}
                    {idx === currentStep && <span className="w-2 h-2 bg-white rounded-full block" />}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded transition-colors ${idx < currentStep ? 'bg-[#4CAF50]' : 'bg-[#E3F2FD]'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {STATUS_STEPS.map((s, idx) => (
                <span key={idx} className={`text-[10px] font-medium ${
                  idx <= currentStep ? 'text-[#1565C0]' : 'text-[#90A4AE]'
                }`}>{s.split(' ')[0]}</span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Order items */}
        {order.items?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm mb-5 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E3F2FD]">
              <h2 className="text-[#1565C0] font-bold text-sm">Items Ordered</h2>
            </div>
            <div className="divide-y divide-[#E3F2FD]">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 bg-[#E3F2FD] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🌾
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1565C0] font-semibold text-sm">{item.crop_name}</p>
                    <p className="text-[#455A64] text-xs">by {item.farmer_name}</p>
                    <p className="text-[#455A64] text-xs">{item.quantity_kg} kg × ₹{Number(item.price_per_kg).toFixed(0)}/kg</p>
                  </div>
                  <div className="text-[#388E3C] font-bold text-sm">
                    ₹{(item.quantity_kg * item.price_per_kg).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Summary + delivery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold text-sm mb-3">Payment Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#455A64]">Subtotal</span>
                <span className="text-[#1565C0] font-medium">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#455A64]">Delivery</span>
                <span className="text-[#388E3C] font-medium">Free</span>
              </div>
              <div className="border-t border-[#E3F2FD] pt-2 flex justify-between">
                <span className="text-[#1565C0] font-bold">Total</span>
                <span className="text-[#388E3C] font-black text-lg">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-[#455A64] pt-1">
                Payment: <span className="font-medium capitalize">{order.payment_method || 'razorpay'}</span>
              </div>
            </div>
          </motion.div>

          {order.delivery_address && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold text-sm mb-3 flex items-center gap-1">
                <FiMapPin className="text-[#4CAF50]" /> Delivery Address
              </h2>
              <p className="text-[#455A64] text-sm leading-relaxed">
                {typeof order.delivery_address === 'string'
                  ? order.delivery_address
                  : JSON.stringify(order.delivery_address)}
              </p>
            </motion.div>
          )}
        </div>

        {order.status === 'Cancelled' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-500 font-medium">
            This order was cancelled.
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  )
}
