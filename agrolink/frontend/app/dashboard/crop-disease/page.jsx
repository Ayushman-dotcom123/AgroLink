'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import ImageUploadCard from '../../../components/ai/ImageUploadCard'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiLoader, FiSave, FiTrash2, FiChevronDown, FiChevronUp, FiAlertTriangle } from 'react-icons/fi'
import { GiSpottedBug, GiLeafSwirl } from 'react-icons/gi'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const LS_KEY = 'agrolink_disease_history'

const SEVERITY_STYLES = {
  Low:    'text-[#388E3C] bg-[#81C784]/20 border-[#81C784]/40',
  Medium: 'text-[#455A64] bg-[#455A64]/10 border-[#455A64]/20',
  High:   'text-orange-600 bg-orange-50 border-orange-200',
  Severe: 'text-red-600 bg-red-50 border-red-200',
}

function ResultCard({ result }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E3F2FD] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GiSpottedBug className="text-[#4CAF50] text-xl" />
          <h3 className="text-[#1565C0] font-bold">Disease Detection Result</h3>
        </div>
        <span className="text-xs bg-[#81C784]/25 text-[#388E3C] border border-[#81C784]/40 rounded-full px-2.5 py-0.5 font-medium">
          {result.confidence}% confidence
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Main info */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="bg-[#F0F7FF] rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">🌱</div>
            <div className="text-[#1565C0] font-bold">{result.crop}</div>
            <div className="text-[#455A64] text-xs">Crop</div>
          </div>
          <div className="bg-[#F0F7FF] rounded-xl p-4 text-center">
            <div className="text-3xl mb-1">🦠</div>
            <div className="text-[#1565C0] font-bold text-sm">{result.disease}</div>
            <div className="text-[#455A64] text-xs">Disease</div>
          </div>
        </div>

        {/* Severity badge */}
        <div className={`border rounded-xl p-3 flex items-center gap-3 ${SEVERITY_STYLES[result.severity] || SEVERITY_STYLES.Medium}`}>
          <FiAlertTriangle className="text-xl flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Severity: {result.severity}</p>
            <p className="text-xs opacity-80">{result.cause}</p>
          </div>
        </div>

        {/* Treatment & Pesticide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#1565C0]/5 border border-[#1565C0]/15 rounded-xl p-4">
            <p className="text-[#1565C0] text-xs font-semibold uppercase tracking-wide mb-1">💊 Treatment</p>
            <p className="text-[#455A64] text-sm">{result.treatment}</p>
          </div>
          <div className="bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-xl p-4">
            <p className="text-[#388E3C] text-xs font-semibold uppercase tracking-wide mb-1">🧪 Recommended Pesticide</p>
            <p className="text-[#455A64] text-sm font-medium">{result.pesticide}</p>
          </div>
        </div>

        {/* Prevention */}
        <div className="bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl p-4">
          <p className="text-[#388E3C] text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
            <GiLeafSwirl className="text-sm" /> Prevention Tips
          </p>
          <p className="text-[#455A64] text-sm">{result.prevention}</p>
        </div>
      </div>
    </motion.div>
  )
}

function HistoryItem({ item, onDelete }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-[#81C784]/30 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F0F7FF] transition-colors" onClick={() => setOpen(!open)}>
        {item.preview && <img src={item.preview} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-[#1565C0] font-semibold text-sm">{item.result.crop} — {item.result.disease}</p>
          <p className="text-[#455A64] text-xs">{new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border hidden sm:block ${SEVERITY_STYLES[item.result.severity] || ''}`}>
            {item.result.severity}
          </span>
          <button onClick={e => { e.stopPropagation(); onDelete(item.id) }} className="text-red-400 hover:text-red-600 p-1 transition-colors">
            <FiTrash2 className="text-sm" />
          </button>
          {open ? <FiChevronUp className="text-[#455A64]" /> : <FiChevronDown className="text-[#455A64]" />}
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4">
              <ResultCard result={item.result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CropDiseasePage() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]')
      setHistory(saved)
    } catch { setHistory([]) }
  }, [])

  const handleImageSelect = (file, preview) => {
    setImageFile(file)
    setImagePreview(preview)
    setResult(null)
  }

  const handleDetect = async () => {
    if (!imageFile) { toast.error('Please upload a crop image first'); return }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', imageFile)
      const res = await fetch(`${API}/crop/disease-detect`, { method: 'POST', body: formData })
      const data = await res.json()
      setResult(data.result)
      toast.success('Disease detection complete!')
    } catch {
      const mock = { crop: 'Tomato', disease: 'Leaf Spot', severity: 'Medium', cause: 'Fungal infection (Alternaria solani)', treatment: 'Apply Mancozeb or Chlorothalonil fungicide spray every 7 days', pesticide: 'Mancozeb 75% WP', prevention: 'Avoid overhead irrigation, ensure proper plant spacing, remove infected leaves', confidence: 88 }
      setResult(mock)
      toast.success('Detection complete (demo mode)')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!result) return
    const entry = { id: Date.now(), date: new Date().toISOString(), preview: imagePreview, result }
    const updated = [entry, ...history].slice(0, 20)
    setHistory(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
    toast.success('Report saved!')
  }

  const handleDelete = (id) => {
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
    toast.success('Deleted')
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back to Dashboard</Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 bg-[#81C784]/25 rounded-xl flex items-center justify-center">
              <GiSpottedBug className="text-[#4CAF50] text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1565C0]">Crop Disease Detection</h1>
              <p className="text-[#455A64] text-sm">Upload a crop or leaf image to detect diseases and get treatment advice</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Upload card */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4 flex items-center gap-2">
              <GiLeafSwirl className="text-[#4CAF50]" /> Upload Crop Image
            </h2>
            <ImageUploadCard onImageSelect={handleImageSelect} label="Drop your crop or leaf photo here" />
            <button onClick={handleDetect} disabled={!imageFile || loading}
              className="w-full mt-4 btn-grape flex items-center justify-center gap-2 py-3.5 rounded-xl disabled:opacity-50">
              {loading ? <><FiLoader className="animate-spin" /> Detecting Disease...</> : '🔬 Detect Disease'}
            </button>
          </motion.div>

          {/* Tips card */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4">📸 Tips for Best Results</h2>
            <div className="space-y-3">
              {[
                ['🍃', 'Capture the affected leaf or stem clearly'],
                ['🌞', 'Use natural daylight for best color accuracy'],
                ['🔍', 'Focus on the diseased area of the plant'],
                ['📐', 'Fill the frame with the affected part'],
                ['🚫', 'Avoid blurry or dark images'],
                ['🌿', 'Include both healthy and diseased parts if possible'],
              ].map(([icon, tip]) => (
                <div key={tip} className="flex items-start gap-3 bg-[#F0F7FF] rounded-xl p-3">
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <p className="text-[#455A64] text-sm">{tip}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl p-3 text-xs text-[#388E3C]">
              🤖 AI model integration coming soon — currently showing demo detection results
            </div>
          </motion.div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
              <ResultCard result={result} />
              <button onClick={handleSave}
                className="mt-4 flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-sm">
                <FiSave /> Save Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h2 className="text-[#1565C0] font-bold mb-4 flex items-center gap-2">
              📋 Previous Disease Reports ({history.length})
            </h2>
            <div className="space-y-3">
              {history.map(item => (
                <HistoryItem key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
