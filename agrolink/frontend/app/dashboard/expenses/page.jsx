'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { FiPlus, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const EXPENSE_CATS = ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment', 'Irrigation', 'Transport', 'Other']
const COLORS = ['#4CAF50', '#81C784', '#1565C0', '#455A64', '#C8E6C9', '#388E3C', '#1976D2', '#90A4AE']

export default function ExpensesPage() {
  const { token } = useAuthStore()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '', category: '', description: '', amount: '', type: 'expense' })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/expenses`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setRecords(Array.isArray(data) ? data : [])
    } catch { setRecords([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExpenses() }, [])

  const totalIncome  = records.filter(r => r.type === 'income').reduce((s, r) => s + +r.amount, 0)
  const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + +r.amount, 0)
  const profit = totalIncome - totalExpense

  const pieData = EXPENSE_CATS.map(cat => ({
    name: cat,
    value: records.filter(r => r.category === cat && r.type === 'expense').reduce((s, r) => s + +r.amount, 0),
  })).filter(d => d.value > 0)

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, amount: +form.amount }),
      })
      if (!res.ok) throw new Error()
      toast.success('Record added!')
      setShowForm(false)
      setForm({ date: '', category: '', description: '', amount: '', type: 'expense' })
      fetchExpenses()
    } catch {
      // Offline fallback
      setRecords(prev => [{ ...form, expense_id: Date.now(), amount: +form.amount }, ...prev])
      toast.success('Record added (offline mode)')
      setShowForm(false)
      setForm({ date: '', category: '', description: '', amount: '', type: 'expense' })
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← {'Back'}</Link>
            <h1 className="text-2xl font-bold text-[#1565C0] mt-1">{'Expense and Revenue Tracker'}</h1>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> {'Add Record'}
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: 'Total Income', value: totalIncome, icon: FiTrendingUp, color: 'text-[#388E3C]', bg: 'bg-[#81C784]/20 border-[#81C784]/40' },
            { label: 'Total Expense', value: totalExpense, icon: FiTrendingDown, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
            { label: 'Net Profit', value: profit, icon: FiTrendingUp, color: profit >= 0 ? 'text-[#388E3C]' : 'text-red-500', bg: 'bg-[#C8E6C9]/20 border-[#81C784]/40' },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-2xl p-4 border ${s.bg} shadow-sm`}>
              <s.icon className={`text-2xl ${s.color} mb-2`} />
              <div className={`text-2xl font-bold ${s.color}`}>₹{Math.abs(s.value).toLocaleString('en-IN')}</div>
              <div className="text-[#455A64] text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Pie chart */}
          <div className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #81C784', borderRadius: 8, color: '#1565C0', fontSize: 12 }}
                  formatter={(v) => [`Rs.${v.toLocaleString('en-IN')}`, '']} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11, color: '#455A64' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Records list */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4">Transaction History</h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-[#E3F2FD] rounded-xl animate-pulse" />)}
                </div>
              ) : records.length === 0 ? (
                <p className="text-[#455A64] text-sm text-center py-8">No records yet. Add your first entry.</p>
              ) : records.map(r => (
                <div key={r.expense_id || r.id} className="flex items-center gap-3 bg-[#F0F7FF] rounded-xl p-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${r.type === 'income' ? 'bg-[#81C784]/30' : 'bg-red-100'}`}>
                    {r.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1565C0] text-sm font-medium truncate">{r.description}</div>
                    <div className="text-[#455A64] text-xs">{r.category} · {r.date?.split('T')[0] || r.date}</div>
                  </div>
                  <div className={`font-bold text-sm ${r.type === 'income' ? 'text-[#388E3C]' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}₹{Number(r.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-[#1565C0]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#81C784]/30"
            >
              <h2 className="text-[#1565C0] font-bold text-lg mb-5">Add Record</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="flex gap-3">
                  {[['expense', 'Expense'], ['income', 'Income']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => update('type', v)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${form.type === v ? (v === 'income' ? 'bg-[#4CAF50] border-[#4CAF50] text-white' : 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]') : 'border-[#4CAF50]/30 text-[#455A64]'}`}
                    >{l}</button>
                  ))}
                </div>
                <input type="date" required value={form.date} onChange={e => update('date', e.target.value)} className="input-field" />
                <select required value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                  <option value="">Category</option>
                  {[...EXPENSE_CATS, 'Crop Sales'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input required value={form.description} onChange={e => update('description', e.target.value)} placeholder="Description" className="input-field" />
                <input type="number" required value={form.amount} onChange={e => update('amount', e.target.value)} placeholder="Amount (Rs.)" className="input-field" />
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 text-sm py-2.5">Add</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}
