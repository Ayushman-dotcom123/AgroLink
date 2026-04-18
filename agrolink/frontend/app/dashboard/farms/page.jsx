'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import { useAuthStore } from '../../../store/useStore'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi'
import { GiFarmer } from 'react-icons/gi'

import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const SOIL_TYPES = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy']
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const BLANK_FORM = { name: '', village: '', district: '', state: '', soil_type: '', size_acres: '' }

export default function FarmsPage() {
  const { user } = useAuthStore()

  // Each farmer starts with no farms — they add their own
  const { token } = useAuthStore()
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK_FORM)

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => {
    // Pre-fill village/state from the farmer's profile
    setForm({
      ...BLANK_FORM,
      name: `${user?.name?.split(' ')[0]}'s Farm`,
      village: user?.village || '',
      state: user?.state || '',
    })
    setEditing(null)
    setShowForm(true)
  }

  const fetchFarms = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/farms`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setFarms(Array.isArray(data) ? data : [])
    } catch { setFarms([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchFarms() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (editing) {
      setFarms(farms.map(f => f.farm_id === editing ? { ...f, ...form } : f))
      toast.success('Farm updated!')
    } else {
      setFarms([...farms, { ...form, farm_id: Date.now(), crops: [] }])
      toast.success('Farm added!')
    }
    setShowForm(false)
    setEditing(null)
    setForm(BLANK_FORM)
  }

  const handleEdit = (farm) => {
    setForm(farm)
    setEditing(farm.farm_id)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    setFarms(farms.filter(f => f.farm_id !== id))
    toast.success('Farm removed')
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back</Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0] mt-1">My Farms</h1>
            <p className="text-[#455A64] text-sm mt-0.5">
              {user?.name} · {user?.village}{user?.state ? `, ${user.state}` : ''}
            </p>
          </div>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus /> Add Farm
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5 mb-8">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-[#81C784]/30 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E3F2FD] rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#E3F2FD] rounded w-1/2" />
                    <div className="h-3 bg-[#E3F2FD] rounded w-3/4" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(j => <div key={j} className="h-12 bg-[#E3F2FD] rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && farms.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl border border-[#81C784]/30 shadow-sm">
            <GiFarmer className="text-6xl text-[#81C784] mx-auto mb-4" />
            <h2 className="text-[#1565C0] font-bold text-lg mb-2">No farms added yet</h2>
            <p className="text-[#455A64] text-sm mb-6">Add your farm to start managing crops, soil, and more.</p>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 mx-auto text-sm">
              <FiPlus /> Add Your First Farm
            </button>
          </motion.div>
        )}

        {/* Farm cards */}
        {!loading && farms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mb-6 sm:mb-8">
          {farms.map((farm, i) => (
            <motion.div key={farm.farm_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 border border-[#81C784]/30 hover:border-[#81C784] shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#81C784]/25 rounded-xl flex items-center justify-center">
                    <GiFarmer className="text-[#4CAF50] text-xl" />
                  </div>
                  <div>
                    <h3 className="text-[#1565C0] font-bold">{farm.name}</h3>
                    <div className="flex items-center gap-1 text-[#455A64] text-xs">
                      <FiMapPin className="text-[#4CAF50]" />
                      {[farm.village, farm.district, farm.state].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(farm)} className="p-1.5 text-[#455A64] hover:text-[#4CAF50] transition-colors"><FiEdit2 className="text-sm" /></button>
                  <button onClick={() => handleDelete(farm.farm_id)} className="p-1.5 text-[#455A64] hover:text-red-500 transition-colors"><FiTrash2 className="text-sm" /></button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[['Soil', farm.soil_type || '—'], ['Size', farm.size_acres ? `${farm.size_acres} Acres` : '—'], ['Crops', farm.crops?.length || 0]].map(([label, val]) => (
                  <div key={label} className="bg-[#F0F7FF] rounded-lg p-2 text-center">
                    <div className="text-[#1565C0] text-sm font-bold">{val}</div>
                    <div className="text-[#455A64] text-xs">{label}</div>
                  </div>
                ))}
              </div>
              {farm.crops?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {farm.crops.map(c => <span key={c} className="badge-olive">{c}</span>)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        )}

        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1565C0]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={e => e.target === e.currentTarget && setShowForm(false)}>
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-[#81C784]/30">
                <h2 className="text-[#1565C0] font-bold text-lg mb-5">{editing ? 'Edit Farm' : 'Add New Farm'}</h2>
                <form onSubmit={handleSave} className="space-y-3">
                  <input required value={form.name} onChange={e => update('name', e.target.value)} placeholder="Farm Name" className="input-field" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={form.village} onChange={e => update('village', e.target.value)} placeholder="Village" className="input-field" />
                    <input required value={form.district} onChange={e => update('district', e.target.value)} placeholder="District" className="input-field" />
                  </div>
                  <select required value={form.state} onChange={e => update('state', e.target.value)} className="input-field">
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.soil_type} onChange={e => update('soil_type', e.target.value)} className="input-field">
                      <option value="">Soil Type</option>
                      {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <input type="number" value={form.size_acres} onChange={e => update('size_acres', e.target.value)} placeholder="Size (Acres)" className="input-field" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2.5">Cancel</button>
                    <button type="submit" className="btn-primary flex-1 text-sm py-2.5">{editing ? 'Update' : 'Add Farm'}</button>
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
