'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import Link from 'next/link'
import { FiPackage, FiRefreshCw } from 'react-icons/fi'
import { useAuthStore } from '../../store/useStore'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered']

const statusColors = {
  'Delivered':        'text-[#388E3C] bg-[#81C784]/20 border-[#81C784]/40',
  'Out for Delivery': 'text-[#1565C0] bg-[#1565C0]/10 border-[#1565C0]/20',
  'Packed':           'text-[#455A64] bg-[#455A64]/10 border-[#455A64]/20',
  'Confirmed':        'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20',
  'Pending':          'text-[#455A64] bg-[#455A64]/10 border-[#455A64]/20',
  'Cancelled':        'text-red-500 bg-red-50 border-red-200',
}

const cropEmoji = (crops) => {
  if (!crops) return '🌾'
  const lower = crops.toLowerCase()
  if (lower.includes('rice') || lower.includes('wheat')) return '🌾'
  if (lower.includes('tomato') || lower.includes('onion') || lower.includes('potato')) return '🥦'
  if (lower.includes('mango') || lower.includes('banana')) return '🍎'
  return '🌾'
}

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) { router.push('/auth/login'); return }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/orders/my/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Could not load orders.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-[#E3F2FD] rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#E3F2FD] rounded w-1/2" />
                  <div className="h-3 bg-[#E3F2FD] rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-[#81C784]/20 rounded-2xl flex items-center justify-center mb-4">
            <FiPackage className="text-4xl text-[#4CAF50]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1565C0] mb-2">No Orders Yet</h2>
          <p className="text-[#455A64] mb-2 text-sm">{error || 'You have not placed any orders yet.'}</p>
          <Link href="/marketplace" className="btn-primary px-8 mt-4">Browse Marketplace</Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#1565C0]">My Orders</h1>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 text-[#4CAF50] text-sm hover:underline">
            <FiRefreshCw className="text-xs" /> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl px-4 py-2.5 text-[#388E3C] text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order, i) => {
            const currentStep = STATUS_STEPS.indexOf(order.status)
            return (
              <motion.div key={order.order_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-[#81C784]/20 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                    {cropEmoji(order.crops)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/orders/${order.order_id}`} className="text-[#1565C0] font-bold hover:underline">{order.crops || 'Order items'}</Link>
                        <p className="text-[#455A64] text-xs mt-0.5">
                          Order #{order.order_id} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#388E3C] font-black text-lg">
                          ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[order.status] || statusColors['Pending']}`}>
                          {order.status}
                        </span>
                        {order.status === 'Pending' && (
                          <button
                            onClick={async () => {
                              if (!confirm('Cancel this order?')) return
                              try {
                                const res = await fetch(`${API}/orders/${order.order_id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ status: 'Cancelled' }),
                                })
                                if (res.ok) {
                                  setOrders(prev => prev.map(o => o.order_id === order.order_id ? { ...o, status: 'Cancelled' } : o))
                                  toast.success('Order cancelled')
                                }
                              } catch { toast.error('Failed to cancel') }
                            }}
                            className="text-xs text-red-500 hover:underline mt-1 block"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress tracker */}
                    {order.status !== 'Cancelled' && (
                      <>
                        <div className="flex items-center gap-1 mt-3">
                          {STATUS_STEPS.map((step, idx) => (
                            <div key={idx} className="flex items-center flex-1">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${idx <= currentStep ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`} />
                              {idx < STATUS_STEPS.length - 1 && (
                                <div className={`flex-1 h-0.5 ${idx < currentStep ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1.5">
                          {STATUS_STEPS.map((s, idx) => (
                            <span key={idx} className={`text-[10px] ${idx <= currentStep ? 'text-[#4CAF50]' : 'text-[#90A4AE]'}`}>
                              {s.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      <Footer />
    </main>
  )
}
