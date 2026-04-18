'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff,
  FiMapPin, FiPackage, FiRefreshCw, FiAlertCircle,
} from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const cropEmojis = { Grains: '🌾', Vegetables: '🥦', Fruits: '🍎', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Flowers: '🌸', Other: '🌱' }

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Flowers', 'Other']
const SEASONS = ['Kharif', 'Rabi', 'Zaid', 'Year-round']

export default function MyListingsPage() {
  const { token, isAuthenticated, user } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCrop, setEditingCrop] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated || user?.role !== 'farmer') { router.push('/auth/login'); return }
    fetchListings()
  }, [isAuthenticated])

  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/crops/my/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCrops(Array.isArray(data) ? data : [])
    } catch {
      setCrops([])
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailability = async (crop) => {
    const newVal = crop.is_available ? 0 : 1
    try {
      await fetch(`${API}/crops/${crop.crop_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...crop, is_available: newVal }),
      })
      setCrops(prev => prev.map(c => c.crop_id === crop.crop_id ? { ...c, is_available: newVal } : c))
      toast.success(newVal ? 'Listing activated' : 'Listing paused')
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this crop listing from the marketplace?')) return
    try {
      await fetch(`${API}/crops/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setCrops(prev => prev.filter(c => c.crop_id !== id))
      toast.success('Listing removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openEdit = (crop) => {
    setEditForm({
      name: crop.name,
      category: crop.category,
      price_per_kg: String(crop.price_per_kg),
      quantity_kg: String(crop.quantity_kg),
      is_organic: crop.is_organic === 1 || crop.is_organic === true,
      harvest_date: crop.harvest_date?.split('T')[0] || '',
      season: crop.season || '',
      description: crop.description || '',
      min_order_kg: String(crop.min_order_kg || 1),
      is_available: crop.is_available,
    })
    setEditingCrop(crop.crop_id)
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API}/crops/${editingCrop}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...editForm,
          price_per_kg: +editForm.price_per_kg,
          quantity_kg: +editForm.quantity_kg,
          min_order_kg: +editForm.min_order_kg || 1,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Listing updated!')
      setEditingCrop(null)
      fetchListings()
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const totalValue = crops.reduce((s, c) => s + Number(c.price_per_kg) * Number(c.quantity_kg), 0)
  const activeCount = crops.filter(c => c.is_available === 1 || c.is_available === true).length

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back to Dashboard</Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#81C784]/25 rounded-xl flex items-center justify-center">
                <GiWheat className="text-[#4CAF50] text-xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0]">My Crop Listings</h1>
                <p className="text-[#455A64] text-sm">
                  {loading ? 'Loading...' : `${crops.length} listings · ${activeCount} active · ₹${totalValue.toLocaleString('en-IN')} total value`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={fetchListings} className="p-2.5 border border-[#81C784]/40 hover:border-[#4CAF50] rounded-xl text-[#455A64] hover:text-[#1565C0] transition-all">
                <FiRefreshCw className="text-sm" />
              </button>
              <Link href="/dashboard/crops/add" className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl">
                <FiPlus /> Add Listing
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: 'Total Listings', value: crops.length, icon: '📋' },
            { label: 'Active',         value: activeCount,  icon: '✅' },
            { label: 'Paused',         value: crops.length - activeCount, icon: '⏸️' },
            { label: 'Total Value',    value: `₹${totalValue.toLocaleString('en-IN')}`, icon: '💰' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="stat-card">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-bold text-[#1565C0]">{s.value}</div>
              <div className="text-[#455A64] text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-[#E3F2FD] rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-[#E3F2FD] rounded w-1/3" />
                    <div className="h-3 bg-[#E3F2FD] rounded w-1/2" />
                    <div className="h-3 bg-[#E3F2FD] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && crops.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-2xl border border-[#81C784]/30 shadow-sm">
            <GiWheat className="text-6xl text-[#81C784] mx-auto mb-4" />
            <h2 className="text-[#1565C0] font-bold text-lg mb-2">No listings yet</h2>
            <p className="text-[#455A64] text-sm mb-6">Add your first crop to start selling on the marketplace.</p>
            <Link href="/dashboard/crops/add" className="btn-primary flex items-center gap-2 mx-auto text-sm px-6 py-2.5 rounded-xl w-fit">
              <FiPlus /> Add Your First Crop
            </Link>
          </motion.div>
        )}

        {/* Listings */}
        {!loading && crops.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence>
              {crops.map((crop, i) => {
                const isActive = crop.is_available === 1 || crop.is_available === true
                const isOrganic = crop.is_organic === 1 || crop.is_organic === true
                return (
                  <motion.div key={crop.crop_id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.05 }}
                    className={`bg-white rounded-2xl border shadow-sm transition-all ${isActive ? 'border-[#81C784]/30' : 'border-[#e8e4df] opacity-70'}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Emoji */}
                        <div className="w-16 h-16 bg-gradient-to-br from-[#F0F7FF] to-[#E8F5E9] rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                          {cropEmojis[crop.category] || '🌱'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-[#1565C0] font-bold text-lg">{crop.name}</h3>
                                <span className="badge-olive text-xs">{crop.category}</span>
                                {isOrganic && <span className="badge-lime text-xs">Organic</span>}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${isActive ? 'bg-[#81C784]/20 text-[#388E3C] border-[#81C784]/40' : 'bg-[#E3F2FD] text-[#455A64] border-[#e8e4df]'}`}>
                                  {isActive ? '● Active' : '⏸ Paused'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                <span className="text-[#1565C0] font-black text-xl">₹{Number(crop.price_per_kg).toFixed(0)}<span className="text-[#455A64] text-sm font-normal">/kg</span></span>
                                <span className="flex items-center gap-1 text-[#455A64] text-sm">
                                  <FiPackage className="text-[#4CAF50] text-xs" /> {crop.quantity_kg} kg available
                                </span>
                                {crop.season && <span className="text-[#455A64] text-xs">🌱 {crop.season}</span>}
                                {crop.harvest_date && (
                                  <span className="text-[#455A64] text-xs">
                                    🗓 {new Date(crop.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </span>
                                )}
                              </div>
                              {crop.description && (
                                <p className="text-[#455A64] text-xs mt-1.5 line-clamp-1">{crop.description}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Link href={`/marketplace/${crop.crop_id}`} target="_blank"
                                className="p-2 text-[#455A64] hover:text-[#1565C0] hover:bg-[#F0F7FF] rounded-lg transition-all" title="View in marketplace">
                                <FiEye className="text-sm" />
                              </Link>
                              <button onClick={() => handleToggleAvailability(crop)}
                                className={`p-2 rounded-lg transition-all ${isActive ? 'text-[#455A64] hover:text-orange-500 hover:bg-orange-50' : 'text-[#455A64] hover:text-[#388E3C] hover:bg-[#81C784]/20'}`}
                                title={isActive ? 'Pause listing' : 'Activate listing'}>
                                {isActive ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                              </button>
                              <button onClick={() => openEdit(crop)}
                                className="p-2 text-[#455A64] hover:text-[#4CAF50] hover:bg-[#F0F7FF] rounded-lg transition-all" title="Edit">
                                <FiEdit2 className="text-sm" />
                              </button>
                              <button onClick={() => handleDelete(crop.crop_id)}
                                className="p-2 text-[#455A64] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                <FiTrash2 className="text-sm" />
                              </button>
                            </div>
                          </div>

                          {/* Value bar */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-[#90A4AE] text-xs">Listing value:</span>
                            <span className="text-[#388E3C] text-xs font-bold">
                              ₹{(Number(crop.price_per_kg) * Number(crop.quantity_kg)).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCrop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1565C0]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setEditingCrop(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl border border-[#81C784]/30 max-h-[90vh] overflow-y-auto">
              <h2 className="text-[#1565C0] font-bold text-lg mb-5">Edit Listing</h2>
              <form onSubmit={handleEditSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Crop Name *</label>
                    <input required value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="input-field" />
                  </div>
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Category *</label>
                    <select required value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Price/kg (₹) *</label>
                    <input type="number" required min="1" value={editForm.price_per_kg}
                      onChange={e => setEditForm(f => ({ ...f, price_per_kg: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Qty (kg) *</label>
                    <input type="number" required min="0" value={editForm.quantity_kg}
                      onChange={e => setEditForm(f => ({ ...f, quantity_kg: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Min Order</label>
                    <input type="number" min="1" value={editForm.min_order_kg}
                      onChange={e => setEditForm(f => ({ ...f, min_order_kg: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Harvest Date</label>
                    <input type="date" value={editForm.harvest_date}
                      onChange={e => setEditForm(f => ({ ...f, harvest_date: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1 block">Season</label>
                    <select value={editForm.season} onChange={e => setEditForm(f => ({ ...f, season: e.target.value }))} className="input-field">
                      <option value="">Select</option>
                      {SEASONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1 block">Description</label>
                  <textarea rows={2} value={editForm.description}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="input-field resize-none" />
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditForm(f => ({ ...f, is_organic: !f.is_organic }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${editForm.is_organic ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editForm.is_organic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-[#455A64] text-sm">Organically grown</span>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setEditForm(f => ({ ...f, is_available: f.is_available ? 0 : 1 }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${editForm.is_available ? 'bg-[#4CAF50]' : 'bg-[#e8e4df]'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editForm.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-[#455A64] text-sm">Active in marketplace</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditingCrop(null)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-grape flex-1 text-sm py-2.5 rounded-xl disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
