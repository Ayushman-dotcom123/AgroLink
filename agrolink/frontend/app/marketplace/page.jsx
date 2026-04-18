'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useCartStore } from '../../store/useStore'
import toast from 'react-hot-toast'
import { FiSearch, FiFilter, FiShoppingCart, FiMapPin, FiStar, FiRefreshCw } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const CATEGORIES = ['All', 'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Spices', 'Oilseeds', 'Other']
const cropEmojis = { Grains: '🌾', Vegetables: '🥦', Fruits: '🍎', Pulses: '🫘', Spices: '🌶️', Oilseeds: '🌻', Other: '🌱' }

function CropCard({ crop, onAddCart }) {
  return (
    <div className="crop-card overflow-hidden">
      <div className="h-36 sm:h-40 flex items-center justify-center relative"
        style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E8F5E9 100%)' }}>
        <span className="text-6xl">{cropEmojis[crop.category] || '🌱'}</span>
        {(crop.is_organic === 1 || crop.is_organic === true) && (
          <span className="absolute top-2 right-2 badge-lime text-xs">Organic</span>
        )}
        <span className="absolute top-2 left-2 badge-olive">{crop.category}</span>
      </div>
      <div className="p-4">
        <h3 className="text-[#1565C0] font-bold text-lg mb-1">{crop.name}</h3>
        <div className="flex items-center gap-1 text-[#4CAF50] text-xs mb-2">
          <FiStar className="fill-current" />
          <span className="font-semibold">{crop.rating ? Number(crop.rating).toFixed(1) : '4.5'}</span>
        </div>
        <div className="flex items-center gap-1 text-[#455A64] text-xs mb-1">
          <FiMapPin className="text-[#4CAF50] flex-shrink-0" />
          <span className="truncate">{[crop.village, crop.district, crop.state].filter(Boolean).join(', ')}</span>
        </div>
        <p className="text-[#455A64]/70 text-xs mb-3">by {crop.farmer_name}</p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-bold text-[#1565C0]">₹{Number(crop.price_per_kg).toFixed(0)}</span>
            <span className="text-[#455A64] text-xs">/kg</span>
          </div>
          <span className="text-[#455A64] text-xs">{crop.quantity_kg} kg available</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/marketplace/${crop.crop_id}`}
            className="flex-1 text-center text-sm border-2 border-[#81C784] text-[#1565C0] hover:bg-[#81C784]/20 py-2 rounded-xl transition-colors font-medium">
            View Details
          </Link>
          <button onClick={() => onAddCart(crop)}
            className="flex-1 flex items-center justify-center gap-1 text-sm bg-[#1565C0] hover:bg-[#1976D2] text-[#C8E6C9] py-2 rounded-xl transition-colors font-bold">
            <FiShoppingCart className="text-sm" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="crop-card overflow-hidden animate-pulse">
      <div className="h-40 bg-[#E3F2FD]" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#E3F2FD] rounded w-3/4" />
        <div className="h-3 bg-[#E3F2FD] rounded w-1/2" />
        <div className="h-3 bg-[#E3F2FD] rounded w-2/3" />
        <div className="h-8 bg-[#E3F2FD] rounded" />
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [state, setState] = useState('')
  const [organic, setOrganic] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)
  const [states, setStates] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const PAGE_SIZE = 12
  const { addItem } = useCartStore()

  // Fetch live weather for Delhi (general India weather for marketplace)
  useEffect(() => {
    fetch(`${API}/weather?city=Delhi`)
      .then(r => r.json())
      .then(data => { if (!data.error) setWeather(data) })
      .catch(() => {})
  }, [])

  const fetchCrops = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      if (state) params.set('state', state)
      if (organic === 'organic') params.set('is_organic', 'true')
      if (organic === 'non-organic') params.set('is_organic', 'false')
      if (search) params.set('search', search)
      if (sortBy !== 'default') params.set('sort', sortBy)
      params.set('limit', String(PAGE_SIZE))
      params.set('page', String(page))

      const res = await fetch(`${API}/crops?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setCrops(prev => page === 1 ? list : [...prev, ...list])
      setHasMore(list.length === PAGE_SIZE)

      // Extract unique states for filter dropdown (only on first page)
      if (page === 1) {
        const uniqueStates = [...new Set(list.map(c => c.state).filter(Boolean))].sort()
        setStates(uniqueStates)
      }
    } catch {
      setError('Could not load crops. Showing cached data.')
      // Keep existing crops if any
    } finally {
      setLoading(false)
    }
  }, [category, state, organic, search, sortBy, page])

  useEffect(() => {
    const debounce = setTimeout(fetchCrops, search ? 400 : 0)
    return () => clearTimeout(debounce)
  }, [fetchCrops, search])

  // Reset to page 1 and clear crops when filters change to prevent stale flash
  useEffect(() => { setPage(1); setCrops([]) }, [category, state, organic, sortBy, search])

  const handleAddCart = (crop) => { addItem(crop, 1); toast.success(`${crop.name} added to cart!`) }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1565C0] mb-2">Fresh Crops Marketplace</h1>
          <p className="text-[#455A64]">
            {loading ? 'Loading crops...' : `${crops.length} crops available directly from farmers`}
          </p>
        </motion.div>

        {/* Search + Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#455A64]" />
            <input type="text" placeholder="Search crops or farmers..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 border-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${showFilters ? 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]' : 'bg-white border-[#81C784] text-[#1565C0] hover:border-[#4CAF50]'}`}>
            <FiFilter /> Filters
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-field w-full sm:w-auto px-4">
            <option value="default">Sort: Latest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Filters panel */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: showFilters ? '400px' : '0px', opacity: showFilters ? 1 : 0 }}
        >
          <div className="bg-white rounded-2xl p-5 mb-6 border border-[#81C784]/30 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-[#455A64] text-xs font-semibold mb-2 block uppercase tracking-wide">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${category === c ? 'bg-[#1565C0] border-[#1565C0] text-[#C8E6C9]' : 'border-[#81C784] text-[#1565C0] hover:border-[#4CAF50]'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[#455A64] text-xs font-semibold mb-2 block uppercase tracking-wide">State</label>
                <select value={state} onChange={e => setState(e.target.value)} className="input-field">
                  <option value="">All States</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#455A64] text-xs font-semibold mb-2 block uppercase tracking-wide">Type</label>
                <div className="flex gap-2">
                  {[['all', 'All'], ['organic', 'Organic'], ['non-organic', 'Non-Organic']].map(([val, label]) => (
                    <button key={val} onClick={() => setOrganic(val)}
                      className={`text-xs px-3 py-1.5 rounded-full border-2 font-medium transition-all ${organic === val ? 'bg-[#4CAF50] border-[#4CAF50] text-white' : 'border-[#81C784] text-[#1565C0] hover:border-[#4CAF50]'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl px-4 py-2.5 text-[#388E3C] text-sm mb-4 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={fetchCrops} className="flex items-center gap-1 text-xs hover:underline">
              <FiRefreshCw className="text-xs" /> Retry
            </button>
          </div>
        )}

        {!loading && <p className="text-[#455A64] text-sm mb-4 font-medium">{crops.length} crops found</p>}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : crops.map(crop => <CropCard key={crop.crop_id} crop={crop} onAddCart={handleAddCart} />)
          }
        </div>

        {!loading && crops.length === 0 && (
          <div className="text-center py-20">
            <GiWheat className="text-6xl text-[#81C784] mx-auto mb-4" />
            <p className="text-[#455A64] mb-4">No crops found matching your filters.</p>
            <button onClick={() => { setCategory('All'); setState(''); setOrganic('all'); setSearch('') }}
              className="btn-primary px-6 py-2.5 rounded-xl text-sm">Clear Filters</button>
          </div>
        )}

        {/* Load More */}
        {!loading && hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setPage(p => p + 1)}
              className="btn-primary px-8 py-3 rounded-xl text-sm"
            >
              Load More Crops
            </button>
          </div>
        )}
        {loading && page > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 mt-5">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
