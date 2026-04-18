'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Link from 'next/link'
import { FiCpu, FiArrowRight } from 'react-icons/fi'
import { useAuthStore } from '../../../store/useStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATES = ['Punjab', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'West Bengal', 'Andhra Pradesh']

export default function AIRecommendationsPage() {
  const { token } = useAuthStore()
  const [form, setForm] = useState({ soil_type: '', season: '', state: '', rainfall: '', temperature: '', farm_size: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAnalyze = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      // Map backend response to frontend format with icons
      const cropIcons = { Wheat: '🌾', Rice: '🌾', Cotton: '🌿', Soybean: '🫘', Groundnut: '🥜', Bajra: '🌾', Vegetables: '🥦', Sugarcane: '🎋', Jute: '🌿', Jowar: '🌾', Peas: '🫛', Maize: '🌽', Onion: '🧅', Ragi: '🌾', Cashew: '🌰' }
      const mapped = (data.recommendations || []).map(r => ({
        ...r,
        icon: Object.entries(cropIcons).find(([k]) => r.crop.includes(k))?.[1] || '🌱'
      }))
      setResults(mapped.length ? mapped : null)
      if (!mapped.length) alert('No specific recommendations for these conditions. Try different inputs.')
    } catch {
      // Fallback to local rule engine if backend is down
      const fallback = localRecommend(form)
      setResults(fallback.length ? fallback : null)
    } finally {
      setLoading(false)
    }
  }

  // Local fallback rule engine (used when backend is offline)
  function localRecommend({ soil_type, season, state, rainfall, temperature }) {
    const recs = []
    if (soil_type === 'Alluvial' && season === 'Rabi') recs.push({ crop: 'Wheat', confidence: 95, reason: 'Alluvial soil is ideal for wheat in Rabi season.', icon: '🌾' })
    if (soil_type === 'Alluvial' && season === 'Kharif') recs.push({ crop: 'Rice', confidence: 92, reason: 'Alluvial soil with Kharif rains is perfect for paddy.', icon: '🌾' })
    if (soil_type === 'Black') recs.push({ crop: 'Cotton', confidence: 90, reason: 'Black soil retains moisture, ideal for cotton.', icon: '🌿' })
    if (soil_type === 'Loamy') recs.push({ crop: 'Vegetables', confidence: 93, reason: 'Loamy soil is versatile for vegetable farming.', icon: '🥦' })
    if (soil_type === 'Red') recs.push({ crop: 'Groundnut', confidence: 88, reason: 'Red soil with good drainage is excellent for groundnut.', icon: '🥜' })
    if (state === 'Punjab' || state === 'Haryana') recs.push({ crop: 'Wheat + Rice Rotation', confidence: 96, reason: 'Traditional profitable rotation for this region.', icon: '🔄' })
    if (state === 'Maharashtra') recs.push({ crop: 'Onion', confidence: 89, reason: "Maharashtra is India's largest onion producer.", icon: '🧅' })
    if (rainfall === 'low') recs.push({ crop: 'Jowar', confidence: 85, reason: 'Drought-tolerant crop for low rainfall regions.', icon: '🌾' })
    if (temperature === 'hot') recs.push({ crop: 'Maize', confidence: 84, reason: 'Maize thrives in warm temperatures.', icon: '🌽' })
    const seen = new Set()
    return recs.filter(r => { if (seen.has(r.crop)) return false; seen.add(r.crop); return true }).sort((a, b) => b.confidence - a.confidence).slice(0, 5)
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← {'Back'}</Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0] mt-1 flex items-center gap-2">
            <FiCpu className="text-[#1565C0]" /> {'AI Crop Recommendations'}
          </h1>
          <p className="text-[#455A64] text-sm mt-1">{'Get smart crop suggestions based on your farm conditions'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm"
          >
            <h2 className="text-[#1565C0] font-bold mb-5">Farm Conditions</h2>
            <form onSubmit={handleAnalyze} className="space-y-4">
              {[
                { key: 'soil_type', label: 'Soil Type', options: ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy'] },
                { key: 'season', label: 'Season', options: ['Kharif', 'Rabi', 'Zaid'] },
                { key: 'state', label: 'State', options: STATES },
                { key: 'rainfall', label: 'Rainfall Level', options: ['low', 'medium', 'high'] },
                { key: 'temperature', label: 'Temperature', options: ['cold', 'moderate', 'hot'] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="text-[#455A64] text-xs mb-1.5 block">{label}</label>
                  <select required value={form[key]} onChange={e => update(key, e.target.value)} className="input-field capitalize">
                    <option value="">Select {label}</option>
                    {options.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-[#455A64] text-xs mb-1.5 block">Farm Size (Acres)</label>
                <input type="number" value={form.farm_size} onChange={e => update('farm_size', e.target.value)} placeholder="e.g. 5" className="input-field" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-grape flex items-center justify-center gap-2 py-3.5 disabled:opacity-60"
              >
                {loading ? <><div className="spinner w-4 h-4" /> {'Analyzing...'}</> : <><FiCpu /> {'Get AI Recommendations'}</>}
              </button>
            </form>
          </motion.div>

          {/* Results */}
          <div>
            <AnimatePresence>
              {results && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="text-[#1565C0] font-bold mb-4">Recommended Crops</h2>
                  <div className="space-y-3">
                    {results.map((rec, i) => (
                      <motion.div key={rec.crop} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-4 border border-[#81C784]/30 hover:border-[#81C784] shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{rec.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-[#1565C0] font-bold">{rec.crop}</h3>
                              <span className="text-[#388E3C] font-bold text-sm">{rec.confidence}%</span>
                            </div>
                            <div className="w-full bg-[#E3F2FD] rounded-full h-1.5 mt-1">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${rec.confidence}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                                className="h-1.5 rounded-full"
                                style={{ background: 'linear-gradient(to right, #4CAF50, #81C784)' }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-[#455A64] text-xs leading-relaxed">{rec.reason}</p>
                        <Link href={`/marketplace?category=${rec.crop.split(' ')[0].toLowerCase()}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-[#4CAF50] hover:text-[#1565C0] transition-colors"
                        >
                          View in marketplace <FiArrowRight className="text-xs" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!results && (
              <div className="bg-white rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center border border-[#81C784]/30 shadow-sm">
                <div className="w-16 h-16 bg-[#1565C0]/8 rounded-2xl flex items-center justify-center mb-4">
                  <FiCpu className="text-3xl text-[#1565C0]/40" />
                </div>
                <p className="text-[#455A64]">Fill in your farm conditions to get AI-powered crop recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
