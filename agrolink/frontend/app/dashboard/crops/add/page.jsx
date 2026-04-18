'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../../components/layout/Navbar'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../../store/useStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
import Link from 'next/link'
import { GiWheat } from 'react-icons/gi'

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Flowers', 'Other']
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-round']
const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy']

export default function AddCropPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', category: '', price_per_kg: '', quantity_kg: '', is_organic: false,
    harvest_date: '', sowing_date: '', season: '', expected_yield: '',
    description: '', min_order_kg: 1,
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/crops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price_per_kg: +form.price_per_kg, quantity_kg: +form.quantity_kg, min_order_kg: +form.min_order_kg || 1 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create listing')
      toast.success('Crop listing published!')
      router.push('/dashboard/crops')
    } catch (err) {
      toast.error(err.message || 'Failed to publish. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← {'Back'}</Link>
          <h1 className="text-2xl font-bold text-[#1565C0] mt-1">{'List a New Crop'}</h1>
          <p className="text-[#455A64] text-sm mt-1">Add your crop to the marketplace for customers to buy directly</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-[#4CAF50] font-semibold text-sm mb-3 uppercase tracking-wide">Crop Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Crop Name *</label>
                  <input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Basmati Rice" className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Category *</label>
                  <select required value={form.category} onChange={e => update('category', e.target.value)} className="input-field">
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#4CAF50] font-semibold text-sm mb-3 uppercase tracking-wide">Pricing and Quantity</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Price per kg (Rs.) *</label>
                  <input type="number" required min="1" value={form.price_per_kg} onChange={e => update('price_per_kg', e.target.value)} placeholder="85" className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Available Qty (kg) *</label>
                  <input type="number" required min="1" value={form.quantity_kg} onChange={e => update('quantity_kg', e.target.value)} placeholder="500" className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Min Order (kg)</label>
                  <input type="number" min="1" value={form.min_order_kg} onChange={e => update('min_order_kg', e.target.value)} placeholder="1" className="input-field" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[#4CAF50] font-semibold text-sm mb-3 uppercase tracking-wide">Crop Cycle</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Sowing Date</label>
                  <input type="date" value={form.sowing_date} onChange={e => update('sowing_date', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Harvest Date *</label>
                  <input type="date" required value={form.harvest_date} onChange={e => update('harvest_date', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Season</label>
                  <select value={form.season} onChange={e => update('season', e.target.value)} className="input-field">
                    <option value="">Season</option>
                    {SEASONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs mb-1.5 block">Expected Yield (Q)</label>
                  <input type="number" value={form.expected_yield} onChange={e => update('expected_yield', e.target.value)} placeholder="Quintal" className="input-field" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => update('is_organic', !form.is_organic)}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.is_organic ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_organic ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-[#455A64] text-sm">Organically grown (no chemical pesticides)</span>
            </div>

            <div>
              <label className="text-[#455A64] text-xs mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Describe your crop quality, farming method, etc."
                className="input-field resize-none"
              />
            </div>

            {form.name && form.price_per_kg && (
              <div className="bg-[#81C784]/15 border border-[#81C784]/40 rounded-xl p-4">
                <p className="text-[#388E3C] text-xs font-semibold mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌾</span>
                  <div>
                    <div className="text-[#1565C0] font-bold">{form.name}</div>
                    <div className="text-[#4CAF50] text-sm">Rs.{form.price_per_kg}/kg · {form.quantity_kg || 0} kg available</div>
                    {form.is_organic && <span className="badge-olive mt-1 inline-block">Organic</span>}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full btn-grape flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-60"
            >
              {loading ? <><div className="spinner w-5 h-5" /> Publishing...</> : <><GiWheat /> Publish Listing</>}
            </button>
          </form>
        </motion.div>
      </div>
    </main>
  )
}
