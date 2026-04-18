'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Footer from '../../../components/layout/Footer'
import { useCartStore } from '../../../store/useStore'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiMapPin, FiStar, FiCalendar, FiPackage, FiUser, FiArrowLeft } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const cropEmojis = { Grains: '🌾', Vegetables: '🥦', Fruits: '🍎', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Other: '🌱' }

export default function CropDetailPage({ params }) {
  const [crop, setCrop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const { addItem } = useCartStore()

  useEffect(() => {
    fetch(`${API}/crops/${params.id}`)
      .then(r => r.json())
      .then(data => { setCrop(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleAddCart = () => {
    if (!crop) return
    addItem(crop, qty)
    toast.success(`${crop.name} (${qty}kg) added to cart!`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 pb-10 px-4 max-w-6xl mx-auto animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
            <div className="h-80 bg-[#E3F2FD] rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-[#E3F2FD] rounded w-3/4" />
              <div className="h-4 bg-[#E3F2FD] rounded w-1/2" />
              <div className="h-20 bg-[#E3F2FD] rounded" />
              <div className="grid grid-cols-2 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-[#E3F2FD] rounded-xl" />)}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!crop || crop.error) {
    return (
      <main className="min-h-screen bg-[#F0F7FF]">
        <Navbar />
        <div className="pt-24 text-center py-20">
          <GiWheat className="text-6xl text-[#81C784] mx-auto mb-4" />
          <p className="text-[#455A64] mb-4">Crop not found.</p>
          <Link href="/marketplace" className="btn-primary px-6 py-2.5 rounded-xl text-sm">Back to Marketplace</Link>
        </div>
      </main>
    )
  }

  const isOrganic = crop.is_organic === 1 || crop.is_organic === true
  const maxQty = Number(crop.quantity_kg) || 999

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-24 pb-10 px-4 max-w-6xl mx-auto">
        <Link href="/marketplace" className="inline-flex items-center gap-1 text-[#4CAF50] text-sm hover:underline mb-6">
          <FiArrowLeft className="text-xs" /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl h-80 lg:h-auto flex items-center justify-center border border-[#81C784]/30 shadow-sm">
            <div className="text-center">
              <span className="text-9xl">{cropEmojis[crop.category] || '🌱'}</span>
              {isOrganic && (
                <div className="mt-4 inline-block bg-[#4CAF50] text-white text-sm px-4 py-1 rounded-full">Certified Organic</div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-olive">{crop.category}</span>
              {isOrganic && <span className="badge-lime">Organic</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1565C0] mb-2">{crop.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 text-[#81C784]">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={i < Math.floor(Number(crop.rating) || 4) ? 'fill-current' : ''} />
                ))}
              </div>
              <span className="text-[#455A64] text-sm">
                {crop.rating ? Number(crop.rating).toFixed(1) : '4.5'} · {crop.total_sold || 0} kg sold
              </span>
            </div>

            {crop.description && (
              <p className="text-[#455A64] text-sm leading-relaxed mb-6">{crop.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: FiMapPin,   label: 'Location',     value: [crop.village, crop.state].filter(Boolean).join(', ') || '—' },
                { icon: FiCalendar, label: 'Harvest Date',  value: crop.harvest_date ? new Date(crop.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                { icon: FiPackage,  label: 'Available',     value: `${crop.quantity_kg} kg` },
                { icon: GiWheat,    label: 'Season',        value: crop.season || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 border border-[#81C784]/25">
                  <div className="flex items-center gap-2 text-[#455A64] text-xs mb-1"><Icon className="text-[#4CAF50]" />{label}</div>
                  <div className="text-[#1565C0] text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>

            {/* Farmer info */}
            <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-3 border border-[#81C784]/25">
              <div className="w-10 h-10 bg-[#81C784]/25 rounded-full flex items-center justify-center">
                <FiUser className="text-[#4CAF50]" />
              </div>
              <div>
                <div className="text-[#1565C0] font-medium">{crop.farmer_name}</div>
                <div className="text-[#455A64] text-xs">{[crop.village, crop.district].filter(Boolean).join(', ')}</div>
              </div>
            </div>

            {/* Price + qty + cart */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <span className="text-3xl sm:text-4xl font-bold text-[#1565C0]">₹{Number(crop.price_per_kg).toFixed(0)}</span>
                <span className="text-[#455A64] text-sm">/kg</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-[#81C784]/30">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                  className="text-[#1565C0] font-bold w-6 h-6 flex items-center justify-center hover:bg-[#81C784]/20 rounded transition-colors">-</button>
                <span className="text-[#1565C0] font-bold w-8 text-center">{qty}</span>
                <button onClick={() => setQty(Math.min(maxQty, qty + 1))}
                  className="text-[#1565C0] font-bold w-6 h-6 flex items-center justify-center hover:bg-[#81C784]/20 rounded transition-colors">+</button>
              </div>
              <span className="text-[#455A64] text-sm">kg</span>
            </div>
            <div className="text-[#455A64] text-sm mb-4">
              Total: <span className="text-[#388E3C] font-bold">₹{(Number(crop.price_per_kg) * qty).toLocaleString('en-IN')}</span>
            </div>

            <button onClick={handleAddCart}
              className="w-full btn-grape flex items-center justify-center gap-2 py-4 text-lg hover:scale-[1.02] transition-transform">
              <FiShoppingCart /> Add to Cart
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
