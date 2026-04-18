'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '../../components/layout/Navbar'
import { useAuthStore } from '../../store/useStore'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { FiTrendingUp, FiPackage, FiAlertTriangle, FiCloud, FiPlus, FiDollarSign, FiShoppingBag } from 'react-icons/fi'
import { GiWheat, GiFarmer } from 'react-icons/gi'
import WeatherCard from '../../components/weather/WeatherCard'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const statusColors = {
  'Delivered': 'text-[#388E3C] bg-[#81C784]/20 border border-[#81C784]/40',
  'Out for Delivery': 'text-[#1565C0] bg-[#1565C0]/10 border border-[#1565C0]/20',
  'Packed': 'text-[#455A64] bg-[#455A64]/10 border border-[#455A64]/20',
  'Confirmed': 'text-[#4CAF50] bg-[#4CAF50]/10 border border-[#4CAF50]/20',
  'Pending': 'text-[#455A64] bg-[#455A64]/10 border border-[#455A64]/20',
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [weather, setWeather] = useState(null)

  const [recentOrders, setRecentOrders] = useState([])
  const [inventoryAlerts, setInventoryAlerts] = useState([])
  const [cropYieldData, setCropYieldData] = useState([])
  const [cropListings, setCropListings] = useState([])
  const [incomeData, setIncomeData] = useState([
    { month: 'Jul', income: 0, expense: 0 }, { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 0, expense: 0 }, { month: 'Oct', income: 0, expense: 0 },
    { month: 'Nov', income: 0, expense: 0 }, { month: 'Dec', income: 0, expense: 0 },
  ])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) { router.push('/auth/login'); return }
    const token = useAuthStore.getState().token
    const city = user?.village || user?.district || user?.state || 'Delhi'

    // Weather
    fetch(`${API}/weather?city=${encodeURIComponent(city)}`)
      .then(r => r.json()).then(setWeather)
      .catch(() => setWeather({ temp: 24, humidity: 68, wind: 12, description: 'Partly Cloudy', rain_chance: 20, city }))

    // Recent orders (farmer's incoming orders)
    fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => setRecentOrders(Array.isArray(data) ? data.slice(0, 4) : []))
      .catch(() => setRecentOrders([]))

    // Inventory low-stock alerts
    fetch(`${API}/inventory`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        if (Array.isArray(data)) setInventoryAlerts(data.filter(i => +i.quantity < +i.min_stock).slice(0, 3))
      }).catch(() => setInventoryAlerts([]))

    // Expenses summary for chart
    fetch(`${API}/expenses/summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        if (data.summary) {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
          const chart = months.slice(-6).map((m, i) => {
            const mNum = (new Date().getMonth() - 5 + i + 12) % 12 + 1
            const inc = data.summary.filter(s => s.type === 'income' && +s.month === mNum).reduce((a, s) => a + +s.total, 0)
            const exp = data.summary.filter(s => s.type === 'expense' && +s.month === mNum).reduce((a, s) => a + +s.total, 0)
            return { month: m, income: inc, expense: exp }
          })
          setIncomeData(chart)
        }
      }).catch(() => {})
    // Fetch farmer's crop listings for yield chart
    fetch(`${API}/crops/my/listings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => {
        if (Array.isArray(data)) {
          setCropListings(data)
      const chart = data.slice(0, 5).map(c => ({
            crop: c.name.split(' ')[0],
            yield: +c.quantity_kg,
            target: +c.quantity_kg * 1.2,
          }))
          setCropYieldData(chart.length ? chart : [{ crop: 'No crops', yield: 0, target: 0 }])
        }
      }).catch(() => setCropYieldData([]))
  }, [isAuthenticated])

  const activeListings = cropListings.filter(c => c.is_available === 1 || c.is_available === true).length
  const pendingOrders = recentOrders.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length
  const monthlyIncome = incomeData.reduce((s, d) => s + (d.income || 0), 0)
  const monthlyExpense = incomeData.reduce((s, d) => s + (d.expense || 0), 0)
  const monthlyProfit = monthlyIncome - monthlyExpense

  const stats = [
    { label: "Today's Sales", value: monthlyIncome > 0 ? `₹${monthlyIncome.toLocaleString('en-IN')}` : '₹0', change: '', icon: FiTrendingUp, color: 'text-[#388E3C]', bg: 'bg-[#81C784]/20' },
    { label: 'Active Listings', value: String(activeListings), change: '', icon: GiWheat, color: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/15' },
    { label: 'Pending Orders', value: String(pendingOrders), change: '', icon: FiShoppingBag, color: 'text-[#1565C0]', bg: 'bg-[#1565C0]/10' },
    { label: 'Monthly Profit', value: `₹${Math.abs(monthlyProfit).toLocaleString('en-IN')}`, change: monthlyProfit >= 0 ? '+' : '-', icon: FiDollarSign, color: monthlyProfit >= 0 ? 'text-[#388E3C]' : 'text-red-500', bg: 'bg-[#C8E6C9]/25' },
  ]

  const quickLinks = [
    { href: '/dashboard/crops/add', icon: FiPlus, label: 'Add Crop Listing' },
    { href: '/dashboard/crops', icon: GiWheat, label: 'My Listings' },
    { href: '/dashboard/orders', icon: FiShoppingBag, label: 'Incoming Orders' },
    { href: '/dashboard/farms', icon: GiFarmer, label: 'Manage Farms' },
    { href: '/dashboard/inventory', icon: FiPackage, label: 'Inventory' },
    { href: '/dashboard/expenses', icon: FiDollarSign, label: 'Expenses' },
    { href: '/dashboard/soil', icon: GiWheat, label: 'Soil Detection' },
    { href: '/dashboard/crop-disease', icon: FiAlertTriangle, label: 'Disease Detection' },
  ]

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1565C0]">
              Namaste, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-[#455A64] text-sm mt-1">{[user?.village, user?.state].filter(Boolean).join(', ')}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/crops/add" className="btn-primary text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4">
              <FiPlus /> Add Crop
            </Link>
            <Link href="/dashboard/crops" className="btn-grape text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4">
              <GiWheat /> My Listings
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                  <s.icon className={`text-xl ${s.color}`} />
                </div>
                <span className="text-[#388E3C] text-xs font-medium bg-[#81C784]/20 px-2 py-0.5 rounded-full">{s.change}</span>
              </div>
              <div className="text-2xl font-bold text-[#1565C0]">{s.value}</div>
              <div className="text-[#455A64] text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Income Chart */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4">Income & Expense Overview</h2>
            {incomeData.every(d => d.income === 0 && d.expense === 0) ? (
              <div className="h-[220px] flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-[#455A64] text-sm font-medium">No financial data yet</p>
                <p className="text-[#90A4AE] text-xs mt-1">Add expenses and income to see your chart</p>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={incomeData}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4CAF50" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1565C0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,110,96,0.1)" />
                <XAxis dataKey="month" stroke="#455A64" tick={{ fontSize: 12 }} />
                <YAxis stroke="#455A64" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #81C784', borderRadius: 8, color: '#1565C0' }} />
                <Area type="monotone" dataKey="income" stroke="#4CAF50" fill="url(#income)" strokeWidth={2} name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#1565C0" fill="url(#expense)" strokeWidth={2} name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </motion.div>

          {/* Weather */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <WeatherCard
              city={user?.village || user?.district || user?.state || 'Delhi'}
              className="h-full"
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1565C0] font-bold">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-[#4CAF50] text-xs hover:underline">View all</Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-[#455A64] text-sm font-medium">No orders yet</p>
                <p className="text-[#90A4AE] text-xs mt-1">Orders from customers will appear here</p>
                <Link href="/dashboard/crops/add" className="inline-block mt-3 text-xs text-[#4CAF50] hover:underline">
                  List a crop to start receiving orders →
                </Link>
              </div>
            ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.order_id || order.id} className="flex items-center gap-3 bg-[#F0F7FF] rounded-xl p-3">
                  <div className="w-8 h-8 bg-[#81C784]/30 rounded-lg flex items-center justify-center text-sm">🌾</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1565C0] text-sm font-medium">{order.crops || order.crop || 'Order'}</div>
                    <div className="text-[#455A64] text-xs">{order.customer_name || order.customer || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#388E3C] text-sm font-bold">₹{Number(order.total_amount || order.amount || 0).toLocaleString('en-IN')}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </motion.div>

          {/* Inventory Alerts + Quick Links */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-3 flex items-center gap-2"><FiAlertTriangle className="text-[#455A64]" /> </h2>
              {inventoryAlerts.map(a => (
                <div key={a.item} className="bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl p-3 mb-2">
                  <div className="text-[#1565C0] text-sm font-medium">{a.item}</div>
                  <div className="text-[#455A64] text-xs">{a.current} {a.unit}  (: {a.min})</div>
                  <div className="w-full bg-[#E3F2FD] rounded-full h-1.5 mt-2">
                    <div className="bg-[#4CAF50] h-1.5 rounded-full" style={{ width: `${(a.current / a.min) * 100}%` }} />
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
              <h2 className="text-[#1565C0] font-bold mb-3"></h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {quickLinks.map(l => (
                  <Link key={l.href} href={l.href}
                    className="bg-[#F0F7FF] hover:bg-[#81C784]/20 border border-[#81C784]/30 hover:border-[#81C784] text-[#1565C0] text-xs font-medium p-3 rounded-xl transition-all flex flex-col items-center gap-1.5 text-center"
                  >
                    <l.icon className="text-lg text-[#4CAF50]" />
                    {l.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Crop Yield Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
          <h2 className="text-[#1565C0] font-bold mb-4"></h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cropYieldData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(114,110,96,0.1)" />
              <XAxis dataKey="crop" stroke="#455A64" tick={{ fontSize: 12 }} />
              <YAxis stroke="#455A64" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #81C784', borderRadius: 8, color: '#1565C0' }} />
              <Bar dataKey="yield" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Actual Yield" />
              <Bar dataKey="target" fill="#81C784" radius={[4, 4, 0, 0]} name="Target" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </main>
  )
}
