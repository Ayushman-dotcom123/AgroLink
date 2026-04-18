'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { GiWheat, GiFarmer, GiMineralHeart, GiSpottedBug } from 'react-icons/gi'
import { FiArrowRight, FiShield, FiTrendingUp, FiCloud } from 'react-icons/fi'
import WeatherCard from '../components/weather/WeatherCard'
import { useAuthStore } from '../store/useStore'


const getStats = () => [
  { label: 'Farmers Registered', value: '50,000+', icon: GiFarmer },
  { label: 'Crops Listed', value: '2,00,000+', icon: GiWheat },
  { label: 'States Covered', value: '28', icon: FiShield },
  { label: 'Orders Delivered', value: '10 Lakh+', icon: FiTrendingUp },
]

const getFeatures = () => [
  { icon: GiWheat, title: 'Direct Marketplace', desc: 'Buy fresh crops directly from farmers. No middlemen, fair prices for everyone.', accent: '#4CAF50' },
  { icon: GiFarmer, title: 'Farm Management', desc: 'Digital tools for farmers to manage crops, inventory, and track profits.', accent: '#1565C0' },
  { icon: FiCloud, title: 'Weather Advisory', desc: 'Real-time weather data and smart farming advisories powered by OpenWeather.', accent: '#455A64' },
  { icon: FiTrendingUp, title: 'AI Recommendations', desc: 'Rule-based AI suggests best crops based on soil type, season, and weather.', accent: '#81C784' },
  { icon: GiMineralHeart, title: 'Soil Detection', desc: 'Analyze soil type, pH, and nutrient levels to get personalized crop and fertilizer recommendations.', accent: '#4CAF50' },
  { icon: GiSpottedBug, title: 'Crop Disease Detection', desc: 'Identify crop diseases and pest infestations early with AI-powered image analysis and treatment advice.', accent: '#1565C0' },
]

// SVG icons for each category — styled to match site palette
const CategoryIcons = {
  Vegetables: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Carrot body */}
      <path d="M30 52 Q24 44 24 34 Q24 26 30 24 Q36 26 36 34 Q36 44 30 52 Z"
        fill="#4CAF50" fillOpacity="0.2" stroke="#4CAF50" strokeWidth="2" />
      {/* Carrot ridges */}
      <line x1="27" y1="34" x2="33" y2="34" stroke="#4CAF50" strokeWidth="1.2" />
      <line x1="26" y1="40" x2="34" y2="40" stroke="#4CAF50" strokeWidth="1.2" />
      {/* Carrot leaves */}
      <path d="M30 24 Q28 18 22 14" stroke="#4CAF50" strokeWidth="2" fill="none" />
      <path d="M30 24 Q30 16 30 10" stroke="#4CAF50" strokeWidth="2" fill="none" />
      <path d="M30 24 Q32 18 38 14" stroke="#4CAF50" strokeWidth="2" fill="none" />
      {/* Broccoli head left */}
      <circle cx="14" cy="28" r="7" fill="#81C784" fillOpacity="0.25" stroke="#4CAF50" strokeWidth="2" />
      <circle cx="10" cy="24" r="4" fill="#81C784" fillOpacity="0.25" stroke="#4CAF50" strokeWidth="2" />
      <circle cx="18" cy="23" r="4" fill="#81C784" fillOpacity="0.25" stroke="#4CAF50" strokeWidth="2" />
      <line x1="14" y1="35" x2="14" y2="44" stroke="#4CAF50" strokeWidth="2" />
      <path d="M10 44 Q14 42 18 44" stroke="#4CAF50" strokeWidth="2" fill="none" />
      {/* Tomato right */}
      <circle cx="50" cy="32" r="10" fill="#4CAF50" fillOpacity="0.15" stroke="#4CAF50" strokeWidth="2" />
      <path d="M50 22 Q50 18 54 16" stroke="#4CAF50" strokeWidth="2" fill="none" />
      <path d="M50 22 Q47 17 44 18" stroke="#4CAF50" strokeWidth="2" fill="none" />
    </svg>
  ),
  Grains: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#81C784" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* left wheat stalk */}
      <line x1="22" y1="52" x2="22" y2="18" />
      {[44,40,36,32,28,24,20].map((y, i) => (
        <g key={i}>
          <path d={`M22 ${y} Q16 ${y-3} 15 ${y-8}`} />
          <path d={`M22 ${y} Q28 ${y-3} 29 ${y-8}`} />
        </g>
      ))}
      {/* right wheat stalk */}
      <line x1="42" y1="52" x2="42" y2="18" />
      {[44,40,36,32,28,24,20].map((y, i) => (
        <g key={i}>
          <path d={`M42 ${y} Q36 ${y-3} 35 ${y-8}`} />
          <path d={`M42 ${y} Q48 ${y-3} 49 ${y-8}`} />
        </g>
      ))}
    </svg>
  ),
  Fruits: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* apple body */}
      <path d="M20 22 Q12 22 12 34 Q12 46 22 48 Q28 50 32 46 Q36 50 42 48 Q52 46 52 34 Q52 22 44 22 Q40 18 36 20 Q34 16 32 18 Q30 16 28 20 Q24 18 20 22 Z"
        fill="#81C784" fillOpacity="0.25" stroke="#4CAF50" strokeWidth="2.2" />
      {/* stem */}
      <path d="M32 18 Q34 12 40 10" stroke="#1565C0" strokeWidth="2" fill="none" />
      {/* leaf */}
      <path d="M36 14 Q42 10 44 16 Q40 18 36 14 Z" fill="#81C784" stroke="#4CAF50" strokeWidth="1.5" />
      {/* strawberry overlay */}
      <path d="M38 32 Q36 26 42 26 Q48 26 46 32 Q44 40 40 42 Q38 40 38 32 Z"
        fill="#C8E6C9" fillOpacity="0.3" stroke="#455A64" strokeWidth="1.8" />
      <circle cx="41" cy="30" r="1" fill="#1565C0" />
      <circle cx="43" cy="34" r="1" fill="#1565C0" />
      <circle cx="39" cy="35" r="1" fill="#1565C0" />
      <path d="M40 26 Q42 22 44 24" stroke="#4CAF50" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  Pulses: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* 3 round lentil grains — top row */}
      <circle cx="20" cy="24" r="8" fill="#455A64" fillOpacity="0.2" stroke="#455A64" strokeWidth="2.2" />
      <path d="M14 24 Q20 20 26 24" stroke="#455A64" strokeWidth="1.2" strokeOpacity="0.5" />
      <circle cx="44" cy="24" r="8" fill="#455A64" fillOpacity="0.2" stroke="#455A64" strokeWidth="2.2" />
      <path d="M38 24 Q44 20 50 24" stroke="#455A64" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* bottom center grain */}
      <circle cx="32" cy="42" r="8" fill="#455A64" fillOpacity="0.2" stroke="#455A64" strokeWidth="2.2" />
      <path d="M26 42 Q32 38 38 42" stroke="#455A64" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* small highlight dots */}
      <circle cx="17" cy="21" r="1.5" fill="#455A64" fillOpacity="0.4" />
      <circle cx="41" cy="21" r="1.5" fill="#455A64" fillOpacity="0.4" />
      <circle cx="29" cy="39" r="1.5" fill="#455A64" fillOpacity="0.4" />
    </svg>
  ),
  Spices: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Background circle */}
      <circle cx="32" cy="34" r="24" fill="#C8E6C9" fillOpacity="0.35" />
      {/* Flames */}
      <path d="M20 52 Q16 44 20 36 Q22 30 18 24 Q24 29 23 36 Q26 30 24 22 Q30 28 28 36 Q31 30 30 24 Q35 30 33 38 Q35 34 36 30 Q39 36 37 44 Q39 40 40 36 Q43 42 41 50 Q38 54 28 54 Q22 54 20 52 Z"
        fill="#81C784" fillOpacity="0.8" stroke="#455A64" strokeWidth="1.4" />
      {/* Chilli body — diagonal curved pepper */}
      <path d="M40 10 Q48 14 52 24 Q56 36 50 48 Q46 56 40 54 Q34 52 32 44 Q28 34 32 22 Q34 10 40 10 Z"
        fill="#1565C0" fillOpacity="0.22" stroke="#1565C0" strokeWidth="2" />
      {/* Chilli highlight crease */}
      <path d="M38 18 Q36 30 38 46" stroke="#1565C0" strokeWidth="1.2" strokeOpacity="0.3" />
      {/* Stem */}
      <path d="M40 10 Q41 5 39 3" stroke="#4CAF50" strokeWidth="2" fill="none" />
      {/* Stem cap */}
      <circle cx="40" cy="10" r="2" fill="#4CAF50" />
    </svg>
  ),
  Organic: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" stroke="#4CAF50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* stem */}
      <path d="M32 52 Q32 36 32 24" />
      {/* main leaf */}
      <path d="M32 24 Q20 16 16 8 Q28 8 36 18 Q38 20 32 24 Z" fill="#4CAF50" fillOpacity="0.2" />
      {/* right leaf */}
      <path d="M32 34 Q44 28 48 20 Q38 22 34 30 Q33 32 32 34 Z" fill="#81C784" fillOpacity="0.3" />
      {/* small left leaf */}
      <path d="M32 42 Q24 38 22 32 Q30 34 32 42 Z" fill="#C8E6C9" fillOpacity="0.4" />
    </svg>
  ),
}

const getCropCategories = () => [
  { name: 'Vegetables', label: 'Vegetables', count: '45+', key: 'vegetables' },
  { name: 'Grains', label: 'Grains', count: '20+', key: 'grains' },
  { name: 'Fruits', label: 'Fruits', count: '35+', key: 'fruits' },
  { name: 'Pulses', label: 'Pulses', count: '15+', key: 'pulses' },
  { name: 'Spices', label: 'Spices', count: '25+', key: 'spices' },
  { name: 'Organic', label: 'Organic', count: '100+', key: 'organic' },
]

// Parallax wrapper — moves element at a fraction of scroll speed
function ParallaxLayer({ children, speed = 0.3, className = '' }) {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed])
  const springY = (y, { stiffness: 80, damping: 20 })
  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  )
}


function HeroWeather() {
  const { user } = useAuthStore()
  const city = user?.village || user?.district || user?.state || 'Delhi'
  return (
    <WeatherCard
      city={city}
      className="w-full max-w-sm"
    />
  )
}

export default function HomePage() {
  const stats = getStats()
  const features = getFeatures()
  const cropCategories = getCropCategories()
  const { scrollY } = useScroll()

  // Hero tractor parallax — moves up as user scrolls
  const heroTextY = useTransform(scrollY, [0, 600], [0, -60])

  return (
    <main className="min-h-screen bg-[#F0F7FF] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/wheat-field.mp4" type="video/mp4" />
        </video>

        {/* Light overlay — keeps original text colors readable over the video */}
        <div className="absolute inset-0 bg-white/50" style={{ zIndex: 1 }} />

        {/* Grid layout: text left */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 min-h-screen pt-20 pb-12" style={{ zIndex: 2 }}>

          {/* Left — hero text */}
          <motion.div
            style={{ y: heroTextY }}
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-tight">
              <span className="gradient-text">AgroLink</span>
              <br />
              <span className="text-[#1565C0] text-lg sm:text-2xl md:text-3xl font-semibold leading-snug block mt-2">
                India's Smart Farm Marketplace
              </span>
            </h1>

            <p className="text-[#455A64] text-base sm:text-lg max-w-md mb-8 sm:mb-10 leading-relaxed">
              Connecting Farmers and Consumers for Fair Agriculture
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/marketplace"
                className="flex items-center justify-center gap-2 bg-[#C8E6C9] hover:bg-[#81C784] text-[#1565C0] font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-md shadow-[#C8E6C9]/30 text-base">
                Explore Marketplace <FiArrowRight />
              </Link>
              <Link href="/auth/register?role=farmer"
                className="flex items-center justify-center gap-2 bg-[#4CAF50] hover:bg-[#2E7D32] text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-md shadow-[#1565C0]/20 text-base">
                Sell Your Crops <GiWheat />
              </Link>
            </div>

            <div className="flex gap-6 sm:gap-10 mt-8 sm:mt-12">
              {[['50K+', 'Farmers'], ['2L+', 'Crops'], ['28', 'States']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-[#1565C0]">{val}</div>
                  <div className="text-[#455A64] text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Live Weather Card */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <HeroWeather />
          </motion.div>
        </div>


      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4 bg-white relative overflow-hidden">
        <motion.div
          style={{ y: useTransform(scrollY, [300, 900], [40, -20]) }}
          className="absolute inset-0 bg-gradient-to-r from-[#C8E6C9]/8 to-transparent pointer-events-none"
        />
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 relative z-10">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="stat-card text-center cursor-default"
            >
              <s.icon className="text-3xl mx-auto mb-2" style={{ color: '#4CAF50' }} />
              <div className="text-2xl font-bold text-[#1565C0]">{s.value}</div>
              <div className="text-[#455A64] text-sm mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 bg-[#F0F7FF] relative overflow-hidden">
        {/* Parallax background accent */}
        <ParallaxLayer speed={0.15} className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#81C784]/15 rounded-full blur-3xl pointer-events-none" />
        <ParallaxLayer speed={0.25} className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#1565C0]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="badge-olive mb-3 inline-block">Platform Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1565C0] mb-3">Everything You Need</h2>
            <p className="text-[#455A64] max-w-xl mx-auto">A complete agritech platform built for India's farming community</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-[#81C784]/20 hover:border-[#4CAF50]/50 hover:shadow-olive transition-all group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: `${f.accent}18` }}>
                  <f.icon className="text-2xl" style={{ color: f.accent }} />
                </div>
                <h3 className="text-[#1565C0] font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#455A64] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-20 px-4 bg-white relative overflow-hidden">
        <ParallaxLayer speed={0.1} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C8E6C9]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1565C0] mb-3">Browse by Category</h2>
            <p className="text-[#455A64]">Fresh produce from farms across India</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cropCategories.map((c, i) => (
              <motion.div key={c.name}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.08, y: -4, transition: { duration: 0.2 } }}
              >
                <Link href={`/marketplace?category=${c.name.toLowerCase()}`}
                  className="bg-[#F0F7FF] hover:bg-[#C8E6C9]/20 border border-[#81C784]/30 hover:border-[#4CAF50] rounded-2xl p-4 text-center block transition-all">
                  <div className="flex justify-center mb-2">
                    {(() => { const Icon = CategoryIcons[c.name]; return Icon ? <Icon size={48} /> : null })()}
                  </div>
                  <div className="text-[#1565C0] font-semibold text-sm">{c.label}</div>
                  <div className="text-[#455A64] text-xs mt-1">{c.count}+ {c.name === 'Organic' ? 'products' : 'varieties'}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 section-grape relative overflow-hidden">
        {/* Parallax orbs inside CTA */}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#1565C0] mb-4">
              Are you a <span className="text-[#4CAF50]">Farmer?</span>
            </h2>
            <p className="text-[#455A64] text-lg mb-8 max-w-2xl mx-auto">
              Join 50,000+ farmers already selling directly to customers. No commission, no middlemen. Just fair prices.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link href="/auth/register?role=farmer"
                className="inline-flex items-center gap-2 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black px-10 py-4 rounded-2xl transition-all shadow-xl shadow-[#1565C0]/20 text-lg">
                Start Selling Today <FiArrowRight />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
