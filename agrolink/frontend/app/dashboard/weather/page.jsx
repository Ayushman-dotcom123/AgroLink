'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../../components/layout/Navbar'
import Link from 'next/link'
import { FiCloud, FiSearch, FiMapPin, FiRefreshCw } from 'react-icons/fi'
import { useAuthStore } from '../../../store/useStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const FORECAST = [
  { day: 'Today',     icon: '⛅', high: 24, low: 14, rain: 20 },
  { day: 'Tomorrow',  icon: '🌧️', high: 20, low: 12, rain: 75 },
  { day: 'Wed',       icon: '🌦️', high: 22, low: 13, rain: 40 },
  { day: 'Thu',       icon: '☀️', high: 26, low: 15, rain: 5  },
  { day: 'Fri',       icon: '☀️', high: 28, low: 16, rain: 5  },
  { day: 'Sat',       icon: '⛅', high: 25, low: 14, rain: 20 },
  { day: 'Sun',       icon: '🌧️', high: 21, low: 12, rain: 65 },
]

const advisoryColors = {
  warning: 'bg-red-50 border-red-200 text-red-700',
  caution:  'bg-[#C8E6C9]/20 border-[#81C784]/50 text-[#388E3C]',
  info:     'bg-[#1565C0]/5 border-[#1565C0]/15 text-[#1565C0]',
  good:     'bg-[#81C784]/20 border-[#81C784]/40 text-[#388E3C]',
}

function classifyAdvisory(msg) {
  const m = msg.toLowerCase()
  if (m.includes('rain') || m.includes('heat') || m.includes('cold') || m.includes('wind')) return 'warning'
  if (m.includes('humidity') || m.includes('fungal') || m.includes('pest')) return 'caution'
  if (m.includes('favorable') || m.includes('good')) return 'good'
  return 'info'
}

function weatherIcon(data) {
  if (!data) return '🌤️'
  if (data.rain_chance > 60) return '🌧️'
  if (data.rain_chance > 30) return '⛅'
  if (data.temp < 10) return '❄️'
  if (data.temp > 35) return '🌡️'
  return '☀️'
}

export default function WeatherPage() {
  const { user } = useAuthStore()
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')

  const fetchWeather = useCallback(async (cityName) => {
    if (!cityName) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/weather?city=${encodeURIComponent(cityName)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setWeather(data)
      setCity(data.city || cityName)
    } catch (err) {
      setError('Could not fetch weather data. Showing estimated data.')
      // Graceful fallback
      setWeather({
        city: cityName, temp: 24, feels_like: 22, humidity: 65,
        wind: 12, description: 'Partly Cloudy', rain_chance: 20,
        uv: 4, visibility: 10,
        advisories: ['Weather conditions are favorable for farming today'],
      })
      setCity(cityName)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-load farmer's location on mount
  useEffect(() => {
    const loc = user?.village || user?.district || user?.state || 'Delhi'
    fetchWeather(loc)
  }, [user, fetchWeather])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) fetchWeather(search.trim())
  }

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-10 px-4 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-[#4CAF50] text-sm hover:underline">← Back to Dashboard</Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1565C0] mt-1 flex items-center gap-2">
            <FiCloud className="text-[#4CAF50]" /> Weather & Farm Advisory
          </h1>
          {user?.village && (
            <p className="text-[#455A64] text-sm mt-1 flex items-center gap-1">
              <FiMapPin className="text-[#4CAF50] text-xs" />
              Auto-loaded for your location: {user.village}{user.state ? `, ${user.state}` : ''}
            </p>
          )}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#455A64]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search any city in India..."
              className="input-field pl-10" />
          </div>
          <button type="submit" disabled={loading} className="btn-grape px-6 text-sm flex items-center gap-2">
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiSearch />} Search
          </button>
        </form>

        {error && (
          <div className="mb-4 bg-[#C8E6C9]/20 border border-[#81C784]/40 rounded-xl px-4 py-2.5 text-[#388E3C] text-xs flex items-center gap-2">
            ⚠️ {error} — Add <code className="bg-white/60 px-1 rounded">OPENWEATHER_API_KEY</code> in <code className="bg-white/60 px-1 rounded">.env</code> for live data.
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !weather && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-[#81C784]/30 shadow-sm animate-pulse">
            <div className="h-32 bg-[#E3F2FD] rounded-xl" />
          </div>
        )}

        {/* Current weather */}
        {weather && (
          <motion.div key={city} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 mb-6 border border-[#81C784]/30 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-center">
                <div className="text-8xl mb-2">{weatherIcon(weather)}</div>
                <div className="text-5xl font-bold text-[#1565C0]">{weather.temp}°C</div>
                <div className="text-[#455A64] mt-1 capitalize">{weather.description}</div>
                <div className="text-[#455A64] text-sm flex items-center justify-center gap-1 mt-1">
                  <FiMapPin className="text-[#4CAF50] text-xs" /> {weather.city}, India
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ['💧', `${weather.humidity}%`,          'Humidity'],
                  ['💨', `${weather.wind} km/h`,           'Wind Speed'],
                  ['🌧️', `${weather.rain_chance}%`,        'Cloud Cover'],
                  ['🌡️', `${weather.feels_like}°C`,        'Feels Like'],
                  ['☀️', `${weather.uv ?? '—'}/10`,        'UV Index'],
                  ['👁️', `${weather.visibility ?? '—'} km`,'Visibility'],
                ].map(([emoji, val, label]) => (
                  <div key={label} className="bg-[#F0F7FF] rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="text-[#1565C0] font-bold text-sm">{val}</div>
                    <div className="text-[#455A64] text-xs">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 7-day forecast */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 mb-6 border border-[#81C784]/30 shadow-sm">
          <h2 className="text-[#1565C0] font-bold mb-4">7-Day Forecast</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 sm:gap-2">
            {FORECAST.map((f, i) => (
              <div key={f.day} className={`text-center p-2 rounded-xl ${i === 0 ? 'bg-[#81C784]/25 border border-[#81C784]/50' : 'bg-[#F0F7FF]'}`}>
                <div className="text-[#455A64] text-xs mb-1">{f.day}</div>
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-[#1565C0] text-xs font-bold">{f.high}°</div>
                <div className="text-[#455A64] text-xs">{f.low}°</div>
                <div className="text-[#4CAF50] text-xs mt-1">{f.rain}%</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Farm advisories from API */}
        {weather?.advisories?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 border border-[#81C784]/30 shadow-sm">
            <h2 className="text-[#1565C0] font-bold mb-4">Farm Advisory</h2>
            <div className="space-y-3">
              {weather.advisories.map((msg, i) => {
                const type = classifyAdvisory(msg)
                const icons = { warning: '⚠️', caution: '🌿', info: '💡', good: '✅' }
                return (
                  <div key={i} className={`border rounded-xl p-3 flex items-start gap-3 ${advisoryColors[type]}`}>
                    <span className="text-xl flex-shrink-0">{icons[type]}</span>
                    <p className="text-sm">{msg}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  )
}
