'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import { useAuthStore } from '../../store/useStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiUsers, FiShoppingBag, FiTrendingUp, FiCheckCircle, FiXCircle, FiBell, FiAlertTriangle, FiMessageCircle, FiTrash2, FiPlus } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'



const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CHATBOT_CATEGORIES = [
  'Crop Suggestion', 'Fertilizer', 'Pest Control', 'Soil Health',
  'Irrigation', 'Harvest Time', 'Weather Advice', 'Crop Disease',
  'Storage Methods', 'Market Price', 'Government Schemes', 'Farm Management',
  'Seed Selection', 'Organic Farming',
]

const statusColors = {
  'Delivered': 'text-[#388E3C] bg-[#81C784]/20',
  'Out for Delivery': 'text-[#1565C0] bg-[#1565C0]/10',
  'Packed': 'text-[#455A64] bg-[#455A64]/10',
  'Confirmed': 'text-[#4CAF50] bg-[#4CAF50]/10',
  'Pending': 'text-[#455A64] bg-[#455A64]/8',
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [tab, setTab] = useState('overview')
  const [farmers, setFarmers] = useState([])
  const [adminOrders, setAdminOrders] = useState([])
  const [adminStats, setAdminStats] = useState({})
  const [dataLoading, setDataLoading] = useState(true)
  const [notifMsg, setNotifMsg] = useState('')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifTarget, setNotifTarget] = useState('all')

  // Chatbot training state
  const [trainForm, setTrainForm] = useState({ question: '', answer: '', category: CHATBOT_CATEGORIES[0] })
  const [trainData, setTrainData] = useState([])
  const [trainLoading, setTrainLoading] = useState(false)
  const [trainFilter, setTrainFilter] = useState('All')

  const fetchTraining = async () => {
    try {
      const res = await fetch(`${API}/chatbot/training`)
      const data = await res.json()
      if (Array.isArray(data)) setTrainData(data)
    } catch { /* backend may be offline */ }
  }

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') { router.push('/auth/login'); return }
    const token = useAuthStore.getState().token
    const headers = { Authorization: `Bearer ${token}` }
    setDataLoading(true)
    Promise.all([
      fetch(`${API}/admin/farmers`, { headers }).then(r => r.json()),
      fetch(`${API}/admin/orders`, { headers }).then(r => r.json()),
      fetch(`${API}/admin/stats`, { headers }).then(r => r.json()),
    ]).then(([f, o, s]) => {
      if (Array.isArray(f)) setFarmers(f.map(farmer => ({ ...farmer, id: farmer.user_id, status: farmer.is_approved ? 'approved' : 'pending', joined: farmer.created_at?.split('T')[0] })))
      if (Array.isArray(o)) setAdminOrders(o)
      if (s && !s.error) setAdminStats(s)
    }).catch(() => {}).finally(() => setDataLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    if (tab === 'chatbot') fetchTraining()
  }, [tab])

  const handleTrain = async (e) => {
    e.preventDefault()
    if (!trainForm.question.trim() || !trainForm.answer.trim()) return
    setTrainLoading(true)
    try {
      const res = await fetch(`${API}/chatbot/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainForm),
      })
      if (res.ok) {
        toast.success('Training data saved!')
        setTrainForm({ question: '', answer: '', category: CHATBOT_CATEGORIES[0] })
        fetchTraining()
      } else {
        toast.error('Failed to save. Is backend running?')
      }
    } catch {
      // Offline mode — add locally
      setTrainData(prev => [{ id: Date.now(), ...trainForm, created_at: new Date().toISOString() }, ...prev])
      toast.success('Saved locally (backend offline)')
      setTrainForm({ question: '', answer: '', category: CHATBOT_CATEGORIES[0] })
    } finally {
      setTrainLoading(false)
    }
  }

  const handleDeleteTrain = async (id) => {
    try {
      await fetch(`${API}/chatbot/training/${id}`, { method: 'DELETE' })
    } catch { /* offline */ }
    setTrainData(prev => prev.filter(r => r.id !== id))
    toast.success('Deleted')
  }

  const approveFarmer = async (id) => {
    const token = useAuthStore.getState().token
    try { await fetch(`${API}/admin/farmers/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }) } catch {}
    setFarmers(farmers.map(f => f.id === id ? { ...f, status: 'approved' } : f))
    toast.success('Farmer approved!')
  }
  const rejectFarmer = async (id) => {
    const token = useAuthStore.getState().token
    try { await fetch(`${API}/admin/farmers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }) } catch {}
    setFarmers(farmers.filter(f => f.id !== id))
    toast.success('Farmer removed')
  }

  const stats = [
    { label: 'Total Farmers', value: adminStats.total_farmers || farmers.length, icon: FiUsers, color: 'text-[#388E3C]' },
    { label: 'Pending Approvals', value: farmers.filter(f => f.status === 'pending').length, icon: FiAlertTriangle, color: 'text-[#455A64]' },
    { label: 'Total Orders', value: adminStats.total_orders || adminOrders.length, icon: FiShoppingBag, color: 'text-[#1565C0]' },
    { label: 'Revenue', value: adminStats.total_revenue ? `₹${Number(adminStats.total_revenue).toLocaleString('en-IN')}` : '₹0', icon: FiTrendingUp, color: 'text-[#4CAF50]' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'farmers', label: `Farmers (${farmers.filter(f => f.status === 'pending').length} pending)` },
    { id: 'orders', label: 'Orders' },
    { id: 'chatbot', label: 'Chatbot Training' },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">{'Admin Panel'}</h1>
          <p className="text-[#455A64] text-sm">Manage the AgroLink platform</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <s.icon className={`text-2xl ${s.color} mb-2`} />
              <div className="text-xl sm:text-2xl font-bold text-[#1565C0]">{s.value}</div>
              <div className="text-[#455A64] text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-[#1565C0] text-[#C8E6C9]' : 'bg-white border border-[#81C784]/30 text-[#455A64] hover:text-[#1565C0]'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Farmers tab */}
        {tab === 'farmers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl overflow-hidden border border-[#81C784]/30 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#81C784]/30 bg-[#F0F7FF]">
                    {['Farmer', 'Location', 'Farm Size', 'Joined', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[#455A64] text-xs font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f, i) => (
                    <motion.tr key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-[#E3F2FD] hover:bg-[#F0F7FF] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="text-[#1565C0] text-sm font-medium">{f.name}</div>
                        <div className="text-[#455A64] text-xs">{f.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[#455A64] text-sm">{f.village}, {f.state}</td>
                      <td className="px-4 py-3 text-[#455A64] text-sm">{f.farm_size} Acres</td>
                      <td className="px-4 py-3 text-[#455A64] text-sm">{f.joined}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${f.status === 'approved' ? 'badge-olive' : 'badge-lime'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {f.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => approveFarmer(f.id)} className="flex items-center gap-1 text-xs bg-[#4CAF50] hover:bg-[#81C784] text-white px-3 py-1.5 rounded-lg transition-colors">
                              <FiCheckCircle /> Approve
                            </button>
                            <button onClick={() => rejectFarmer(f.id)} className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                              <FiXCircle /> Reject
                            </button>
                          </div>
                        )}
                        {f.status === 'approved' && <span className="text-[#388E3C] text-xs font-medium">✓ Active</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl overflow-hidden border border-[#81C784]/30 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#81C784]/30 bg-[#F0F7FF]">
                    {['Order ID', 'Customer', 'Amount', 'Date', 'Status', 'Update'].map(h => (
                      <th key={h} className="text-left text-[#455A64] text-xs font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map((o, i) => (
                    <motion.tr key={o.order_id || o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b border-[#E3F2FD] hover:bg-[#F0F7FF] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#4CAF50] text-sm font-mono">#{o.order_id || o.id}</td>
                      <td className="px-4 py-3 text-[#1565C0] text-sm">{o.customer_name || o.customer || '—'}</td>
                      <td className="px-4 py-3 text-[#388E3C] text-sm font-bold">₹{Number(o.total_amount || o.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-[#455A64] text-sm">{(o.created_at || o.date || '').split('T')[0]}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[o.status] || ''}`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                          <select
                            defaultValue={o.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value
                              if (!confirm(`Change order #${o.order_id} status to "${newStatus}"?`)) {
                                e.target.value = o.status  // revert dropdown
                                return
                              }
                              const token = useAuthStore.getState().token
                              try {
                                await fetch(`${API}/orders/${o.order_id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ status: newStatus }),
                                })
                                setAdminOrders(prev => prev.map(ord => ord.order_id === o.order_id ? { ...ord, status: newStatus } : ord))
                                toast.success(`Order #${o.order_id} → ${newStatus}`)
                              } catch { toast.error('Failed to update') }
                            }}
                            className="text-xs border border-[#81C784]/40 rounded-lg px-2 py-1 text-[#1565C0] bg-white focus:outline-none focus:border-[#4CAF50]"
                          >
                            {['Pending','Confirmed','Packed','Out for Delivery','Delivered','Cancelled'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        )}
                        {(o.status === 'Delivered' || o.status === 'Cancelled') && (
                          <span className="text-xs text-[#90A4AE]">{o.status}</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg">
            <div className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-4 flex items-center gap-2"><FiBell className="text-[#455A64]" /> Broadcast Notification</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block">Send To</label>
                  <select id="notif-target" className="input-field">
                    <option value="all">All Users</option>
                    <option value="farmers">All Farmers</option>
                    <option value="customers">All Customers</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block">Title</label>
                  <input id="notif-title" placeholder="Notification title" className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block">Message</label>
                  <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)} rows={3}
                    placeholder="Type your notification message..." className="input-field resize-none" />
                </div>
                <button onClick={async () => {
                  const title = notifTitle.trim()
                  const target = notifTarget
                  if (!title || !notifMsg.trim()) { toast.error('Title and message required'); return }
                  const token = useAuthStore.getState().token
                  try {
                    const res = await fetch(`${API}/notifications/broadcast`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ title, message: notifMsg, target, type: 'info' }),
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error)
                    toast.success(`Notification sent to ${data.sent_to} users!`)
                    setNotifMsg('')
                    setNotifTitle('')
                  } catch (err) {
                    toast.error(err.message || 'Failed to send')
                  }
                }} className="w-full btn-grape flex items-center justify-center gap-2">
                  <FiBell /> Send Notification
                </button>
              </div>
            </div>
            <div className="bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl p-4 text-sm text-[#388E3C]">
              <p className="font-semibold mb-1">How it works:</p>
              <p className="text-xs text-[#455A64]">Notifications are stored in the database and shown in the bell icon in the navbar for each user. Users see a red badge with unread count and can mark them as read.</p>
            </div>
          </motion.div>
        )}

        {/* Chatbot Training tab */}
        {tab === 'chatbot' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-4 flex items-center gap-2">
                <FiMessageCircle className="text-[#4CAF50]" /> Add Training Data
              </h2>
              <form onSubmit={handleTrain} className="space-y-3">
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block uppercase tracking-wide">Category</label>
                  <select value={trainForm.category} onChange={e => setTrainForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                    {CHATBOT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block uppercase tracking-wide">Question</label>
                  <input required value={trainForm.question} onChange={e => setTrainForm(f => ({ ...f, question: e.target.value }))}
                    placeholder="e.g. Which crop grows best in winter?" className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block uppercase tracking-wide">Answer</label>
                  <textarea required rows={3} value={trainForm.answer} onChange={e => setTrainForm(f => ({ ...f, answer: e.target.value }))}
                    placeholder="e.g. Wheat and mustard grow best in winter season..." className="input-field resize-none" />
                </div>
                <button type="submit" disabled={trainLoading}
                  className="btn-grape flex items-center gap-2 px-6 py-2.5 rounded-xl disabled:opacity-60">
                  <FiPlus /> {trainLoading ? 'Saving...' : 'Add Training Entry'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3F2FD] flex-wrap gap-3">
                <h2 className="text-[#1565C0] font-bold flex items-center gap-2">
                  <GiWheat className="text-[#4CAF50]" /> Training Dataset ({trainData.length} entries)
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {['All', ...CHATBOT_CATEGORIES].map(c => (
                    <button key={c} onClick={() => setTrainFilter(c)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${trainFilter === c ? 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]' : 'border-[#81C784]/40 text-[#455A64] hover:border-[#4CAF50]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {trainData.length === 0 ? (
                <div className="text-center py-12 text-[#455A64]">
                  <FiMessageCircle className="text-4xl mx-auto mb-3 text-[#81C784]" />
                  <p className="text-sm">No training data yet. Add entries above or run the chatbot_seed.sql file.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E3F2FD] max-h-[500px] overflow-y-auto">
                  {trainData
                    .filter(r => trainFilter === 'All' || r.category === trainFilter)
                    .map((row, i) => (
                      <motion.div key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="px-5 py-4 hover:bg-[#F0F7FF] transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs bg-[#81C784]/25 text-[#388E3C] border border-[#81C784]/40 rounded-full px-2 py-0.5 font-medium">{row.category}</span>
                            </div>
                            <p className="text-[#1565C0] text-sm font-semibold mb-1">Q: {row.question}</p>
                            <p className="text-[#455A64] text-xs leading-relaxed">A: {row.answer}</p>
                          </div>
                          <button onClick={() => handleDeleteTrain(row.id)}
                            className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1">
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Overview tab */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-4">Pending Approvals</h2>
              {farmers.filter(f => f.status === 'pending').map(f => (
                <div key={f.id} className="flex items-center gap-3 bg-[#C8E6C9]/15 border border-[#81C784]/30 rounded-xl p-3 mb-2">
                  <div className="w-8 h-8 bg-[#81C784]/30 rounded-full flex items-center justify-center text-sm">👨‍🌾</div>
                  <div className="flex-1">
                    <div className="text-[#1565C0] text-sm font-medium">{f.name}</div>
                    <div className="text-[#455A64] text-xs">{f.village}, {f.state}</div>
                  </div>
                  <button onClick={() => approveFarmer(f.id)} className="text-xs bg-[#4CAF50] hover:bg-[#81C784] text-white px-3 py-1.5 rounded-lg transition-colors">Approve</button>
                </div>
              ))}
              {farmers.filter(f => f.status === 'pending').length === 0 && <p className="text-[#455A64] text-sm">No pending approvals</p>}
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-4">Recent Orders</h2>
              {adminOrders.slice(0, 4).map(o => (
                <div key={o.order_id || o.id} className="flex items-center gap-3 bg-[#F0F7FF] rounded-xl p-3 mb-2">
                  <GiWheat className="text-[#4CAF50] text-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1565C0] text-sm truncate">{o.crop}</div>
                    <div className="text-[#455A64] text-xs">{o.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#388E3C] text-sm font-bold">₹{o.amount.toLocaleString('en-IN')}</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
