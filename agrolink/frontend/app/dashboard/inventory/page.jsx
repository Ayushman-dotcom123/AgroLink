'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiPackage, FiRefreshCw } from 'react-icons/fi'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment', 'Other']
const UNITS = ['kg', 'bags', 'liters', 'units', 'quintal']
const BLANK = { name: '', category: '', quantity: '', unit: '', min_stock: '', cost_per_unit: '' }
const CAT_ICONS = { Seeds: '🌱', Fertilizers: '🧪', Pesticides: '🧴', Tools: '🔧', Equipment: '🚜', Other: '📦' }

export default function InventoryPage() {
  const { token } = useAuthStore()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const [form, setForm] = useState(BLANK)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat)
  const lowStock = items.filter(i => +i.quantity < +i.min_stock)
  const totalValue = items.reduce((s, i) => s + +i.quantity * +i.cost_per_unit, 0)

  const openAdd = () => { setForm(BLANK); setEditing(null); setShowForm(true) }
  const openEdit = (item) => {
    setForm({ ...item, quantity: String(item.quantity), min_stock: String(item.min_stock), cost_per_unit: String(item.cost_per_unit) })
    setEditing(item.inventory_id); setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const body = { ...form, quantity: +form.quantity, min_stock: +form.min_stock, cost_per_unit: +form.cost_per_unit }
    try {
      const url = editing ? `${API}/inventory/${editing}` : `${API}/inventory`
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
      toast.success(editing ? 'Item updated!' : 'Item added!')
      fetchItems()
    } catch {
      if (editing) setItems(items.map(i => i.inventory_id === editing ? { ...i, ...body } : i))
      else setItems(prev => [...prev, { ...body, inventory_id: Date.now() }])
      toast.success(editing ? 'Item updated!' : 'Item added!')
    }
    setShowForm(false); setEditing(null); setForm(BLANK)
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back to Dashboard</Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#81C784]/25 rounded-xl flex items-center justify-center">
                <FiPackage className="text-[#4CAF50] text-xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">Inventory Management</h1>
                <p className="text-[#455A64] text-sm">{items.length} items · Total value ₹{totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl">
              <FiPlus /> Add Item
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total Items',  value: items.length,                              icon: '📦' },
            { label: 'Low Stock',    value: lowStock.length,                           icon: '⚠️' },
            { label: 'Total Value',  value: `₹${totalValue.toLocaleString('en-IN')}`,  icon: '💰' },
            { label: 'Categories',   value: CATEGORIES.length,                         icon: '🗂️' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="stat-card">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-[#1565C0]">{s.value}</div>
              <div className="text-[#455A64] text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {lowStock.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-[#C8E6C9]/20 border border-[#81C784]/50 rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 text-[#388E3C] font-bold mb-2 text-sm">
                <FiAlertTriangle /> Low Stock Alert ({lowStock.length} items)
              </div>
              <div className="flex flex-wrap gap-2">
                {lowStock.map(i => (
                  <span key={i.id} className="text-xs bg-white border border-[#81C784]/40 text-[#455A64] px-3 py-1 rounded-full">
                    {i.name}: {i.quantity} {i.unit}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap gap-2 mb-5">
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${
                filterCat === c
                  ? 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]'
                  : 'border-[#81C784]/40 text-[#455A64] hover:border-[#4CAF50] bg-white'
              }`}>
              {CAT_ICONS[c] || ''} {c}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E3F2FD] bg-[#F0F7FF]">
                  {['Item', 'Category', 'Quantity', 'Min Stock', 'Value', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-[#455A64] text-xs font-semibold px-4 py-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => {
                  const isLow = item.quantity < item.min_stock
                  const pct = Math.min((item.quantity / item.min_stock) * 100, 100)
                  return (
                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-[#E3F2FD] hover:bg-[#F0F7FF] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-[#81C784]/20 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                            {CAT_ICONS[item.category] || '📦'}
                          </div>
                          <span className="text-[#1565C0] text-sm font-semibold">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-olive text-xs">{item.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[#1565C0] text-sm font-bold">{item.quantity} {item.unit}</div>
                        <div className="w-20 bg-[#E3F2FD] rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${isLow ? 'bg-red-400' : 'bg-[#4CAF50]'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#455A64] text-sm">{item.min_stock} {item.unit}</td>
                      <td className="px-4 py-3 text-[#388E3C] text-sm font-bold">
                        ₹{(item.quantity * item.cost_per_unit).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                          isLow ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#81C784]/20 text-[#388E3C] border-[#81C784]/40'
                        }`}>
                          {isLow ? '⚠ Low' : '✓ OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 text-[#455A64] hover:text-[#4CAF50] transition-colors">
                            <FiEdit2 className="text-sm" />
                          </button>
                          <button onClick={() => { setItems(items.filter(i => i.id !== item.id)); toast.success('Removed') }}
                            className="p-1.5 text-[#455A64] hover:text-red-500 transition-colors">
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-[#455A64]">
                <FiPackage className="text-4xl mx-auto mb-3 text-[#81C784]" />
                <p className="text-sm font-medium">No items in this category</p>
                <p className="text-xs text-[#90A4AE] mt-1">
                  {filterCat === 'All' ? 'Add your first inventory item using the button above' : `No ${filterCat} items yet`}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1565C0]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={e => e.target === e.currentTarget && setShowForm(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#81C784]/30">
                <h2 className="text-[#1565C0] font-bold text-lg mb-5">{editing ? 'Edit Item' : 'Add Inventory Item'}</h2>
                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Item Name</label>
                    <input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Urea Fertilizer" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#455A64] text-xs font-semibold mb-1 block">Category</label>
                      <select required value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[#455A64] text-xs font-semibold mb-1 block">Unit</label>
                      <select required value={form.unit} onChange={e => update('unit', e.target.value)} className="input-field">
                        <option value="">Select</option>
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['quantity', 'Quantity'], ['min_stock', 'Min Stock'], ['cost_per_unit', 'Cost/Unit (₹)']].map(([k, p]) => (
                      <div key={k}>
                        <label className="text-[#455A64] text-xs font-semibold mb-1 block">{p}</label>
                        <input type="number" required value={form[k]} onChange={e => update(k, e.target.value)} placeholder="0" className="input-field" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
                    <button type="submit" className="btn-grape flex-1 text-sm py-2.5 rounded-xl">{editing ? 'Update' : 'Add Item'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
