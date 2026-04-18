'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_STEPS = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered']
const NEXT_STATUS = {
  'Pending':          'Confirmed',
  'Confirmed':        'Packed',
  'Packed':           'Out for Delivery',
  'Out for Delivery': 'Delivered',
}

const statusColors = {
  'Pending':          'text-[#455A64] bg-[#455A64]/10 border-[#455A64]/20',
  'Confirmed':        'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20',
  'Packed':           'text-[#1565C0] bg-[#1565C0]/10 border-[#1565C0]/20',
  'Out for Delivery': 'text-blue-600 bg-blue-50 border-blue-200',
  'Delivered':        'text-[#388E3C] bg-[#81C784]/20 border-[#81C784]/40',
  'Cancelled':        'text-red-500 bg-red-50 border-red-200',
}

function OrderCard({ order, token, onStatusUpdate }) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const currentStep = STATUS_STEPS.indexOf(order.status)
  const nextStatus = NEXT_STATUS[order.status]

  const handleAdvance = async () => {
    if (!nextStatus) return
    setUpdating(true)
    try {
      const res = await fetch(`${API}/orders/${order.order_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Order marked as ${nextStatus}`)
      onStatusUpdate(order.order_id, nextStatus)
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setUpdating(true)
    try {
      const res = await fetch(`${API}/orders/${order.order_id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'Cancelled' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Order cancelled')
      onStatusUpdate(order.order_id, 'Cancelled')
    } catch {
      toast.error('Failed to cancel')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-[#F0F7FF] transition-colors"
        onClick={() => setOpen(!open)}>
        <div className="w-12 h-12 bg-[#81C784]/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
          🌾
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#1565C0] font-bold text-sm">#{order.order_id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status] || statusColors['Pending']}`}>
              {order.status}
            </span>
          </div>
          <p className="text-[#455A64] text-xs mt-0.5">
            {order.customer_name || 'Customer'} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[#388E3C] font-black">₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
          {open ? <FiChevronUp className="text-[#455A64] ml-auto mt-1" /> : <FiChevronDown className="text-[#455A64] ml-auto mt-1" />}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-[#E3F2FD] pt-4 space-y-4">
              {/* Progress bar */}
              {order.status !== 'Cancelled' && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    {STATUS_STEPS.map((step, idx) => (
                      <div key={idx} className="flex items-center flex-1">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 transition-colors ${idx <= currentStep ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`} />
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 transition-colors ${idx < currentStep ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    {STATUS_STEPS.map((s, idx) => (
                      <span key={idx} className={`text-[10px] ${idx <= currentStep ? 'text-[#4CAF50] font-medium' : 'text-[#90A4AE]'}`}>
                        {s.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery address */}
              {order.delivery_address && (
                <div className="bg-[#F0F7FF] rounded-xl p-3 text-xs text-[#455A64]">
                  <span className="font-semibold text-[#1565C0]">Delivery: </span>
                  {typeof order.delivery_address === 'string'
                    ? order.delivery_address
                    : JSON.stringify(order.delivery_address)}
                </div>
              )}

              {/* Action buttons */}
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <div className="flex gap-3">
                  {nextStatus && (
                    <button onClick={handleAdvance} disabled={updating}
                      className="flex-1 btn-grape py-2.5 rounded-xl text-sm disabled:opacity-60">
                      {updating ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  )}
                  {order.status === 'Pending' && (
                    <button onClick={handleCancel} disabled={updating}
                      className="px-4 py-2.5 rounded-xl text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60">
                      Cancel
                    </button>
                  )}
                </div>
              )}
              {order.status === 'Delivered' && (
                <div className="bg-[#81C784]/20 border border-[#81C784]/40 rounded-xl p-3 text-center text-[#388E3C] text-sm font-medium">
                  ✓ Order completed
                </div>
              )}
              {order.status === 'Cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center text-red-500 text-sm font-medium">
                  ✗ Order cancelled
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FarmerOrdersPage() {
  const { token, isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated || user?.role !== 'farmer') { router.push('/auth/login'); return }
    fetchOrders()
  }, [isAuthenticated])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch { setOrders([]) }
    finally { setLoading(false) }
  }

  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o))
  }

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)
  const counts = STATUS_STEPS.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.status === s).length }), {})

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back to Dashboard</Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#81C784]/25 rounded-xl flex items-center justify-center">
                <FiPackage className="text-[#4CAF50] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1565C0]">Incoming Orders</h1>
                <p className="text-[#455A64] text-sm">{orders.length} total · {counts['Pending'] || 0} pending action</p>
              </div>
            </div>
            <button onClick={fetchOrders} className="p-2.5 border border-[#81C784]/40 hover:border-[#4CAF50] rounded-xl text-[#455A64] transition-all">
              <FiRefreshCw className="text-sm" />
            </button>
          </div>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {['All', ...STATUS_STEPS, 'Cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                filter === s ? 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]' : 'border-[#81C784]/40 text-[#455A64] hover:border-[#4CAF50] bg-white'
              }`}>
              {s} {s !== 'All' && counts[s] ? `(${counts[s]})` : ''}
            </button>
          ))}
        </div>

        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-[#81C784]/30 animate-pulse" />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#81C784]/30">
            <GiWheat className="text-6xl text-[#81C784] mx-auto mb-4" />
            <p className="text-[#455A64]">{filter === 'All' ? 'No orders yet. List your crops to start receiving orders.' : `No ${filter} orders.`}</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map(order => (
            <OrderCard key={order.order_id} order={order} token={token} onStatusUpdate={handleStatusUpdate} />
          ))}
        </div>
      </div>
    </main>
  )
}
