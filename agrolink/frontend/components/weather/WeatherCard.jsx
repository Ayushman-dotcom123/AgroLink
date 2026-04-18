'use client'
import { useState, useEffect } from 'react'
import { FiWind, FiDroplet, FiEye } from 'react-icons/fi'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Returns the right emoji based on actual weather description from API
function getWeatherEmoji(description = '', temp = 25, rainChance = 0) {
  const d = description.toLowerCase()
  if (d.includes('thunder') || d.includes('storm'))   return '⛈️'
  if (d.includes('heavy rain') || d.includes('shower')) return '🌧️'
  if (d.includes('rain') || d.includes('drizzle'))    return '🌦️'
  if (d.includes('snow') || d.includes('sleet'))      return '❄️'
  if (d.includes('fog') || d.includes('mist'))        return '🌫️'
  if (d.includes('haze') || d.includes('smoke'))      return '🌁'
  if (d.includes('overcast') || d.includes('broken')) return '☁️'
  if (d.includes('cloud') || d.includes('partly'))    return '⛅'
  if (rainChance > 50)                                return '🌧️'
  if (rainChance > 25)                                return '⛅'
  if (temp < 10)                                      return '🥶'
  if (temp > 38)                                      return '🌡️'
  return '☀️'
}

// Card background gradient based on weather
function getCardGradient(description = '', temp = 25) {
  const d = description.toLowerCase()
  if (d.includes('thunder') || d.includes('storm'))
    return 'linear-gradient(135deg, #1A237E 0%, #37474F 100%)'
  if (d.includes('rain') || d.includes('drizzle') || d.includes('shower'))
    return 'linear-gradient(135deg, #1565C0 0%, #0277BD 100%)'
  if (d.includes('fog') || d.includes('mist') || d.includes('haze'))
    return 'linear-gradient(135deg, #455A64 0%, #607D8B 100%)'
  if (d.includes('cloud') || d.includes('overcast'))
    return 'linear-gradient(135deg, #1976D2 0%, #546E7A 100%)'
  if (temp > 35)
    return 'linear-gradient(135deg, #E65100 0%, #F57C00 100%)'
  // Clear/sunny — vibrant blue to green
  return 'linear-gradient(135deg, #1565C0 0%, #2E7D32 100%)'
}

export default function WeatherCard({ city: propCity, compact = false, className = '' }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const city = propCity || 'Delhi'
    fetch(`${API}/weather?city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => { if (!data.error) setWeather(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [propCity])

  if (loading) {
    return (
      <div className={`animate-pulse rounded-2xl ${compact ? 'h-16' : 'h-52'} ${className}`}
        style={{ background: 'linear-gradient(135deg, #1565C0 0%, #2E7D32 100%)', opacity: 0.4 }} />
    )
  }

  if (!weather) return null

  const desc = weather.description || ''
  const emoji = getWeatherEmoji(desc, weather.temp, weather.rain_chance)
  const gradient = getCardGradient(desc, weather.temp)

  // ── Compact pill (for inline use) ──
  if (compact) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${className}`}
        style={{ background: gradient }}>
        <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{emoji}</span>
        <div>
          <div className="text-white font-black text-xl leading-none">{weather.temp}°C</div>
          <div className="text-white/80 text-xs capitalize mt-0.5">{desc}</div>
        </div>
        <div className="ml-2 pl-3 border-l border-white/25 space-y-1">
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <FiDroplet className="text-[10px]" /> {weather.humidity}%
          </div>
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <FiWind className="text-[10px]" /> {weather.wind} km/h
          </div>
        </div>
      </div>
    )
  }

  // ── Full card ──
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ background: gradient }}>

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }} />

      {/* Glow orb bottom right */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ background: 'rgba(255,255,255,0.4)' }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4">
          <div className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-semibold mb-1">Live Weather</div>
          <div className="text-white font-bold text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse opacity-80" />
            {weather.city}, India
          </div>
        </div>

        {/* Main content: emoji left, data right */}
        <div className="flex items-center gap-4 mb-5">
          {/* Big emoji */}
          <div style={{ fontSize: '5rem', lineHeight: 1, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            {emoji}
          </div>

          {/* Temperature + description */}
          <div>
            <div className="text-white font-black leading-none" style={{ fontSize: '3.5rem' }}>
              {weather.temp}<span className="text-2xl font-bold opacity-70">°C</span>
            </div>
            <div className="text-white font-semibold text-base capitalize mt-1">{desc}</div>
            <div className="text-white/60 text-xs mt-0.5">Feels like {weather.feels_like}°C</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { icon: FiDroplet, label: 'Humidity',   value: `${weather.humidity}%` },
            { icon: FiWind,    label: 'Wind',        value: `${weather.wind} km/h` },
            { icon: FiEye,     label: 'Visibility',  value: `${weather.visibility ?? '—'} km` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center border border-white/20"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Icon className="text-white text-sm mx-auto mb-1.5" />
              <div className="text-white font-bold text-sm">{value}</div>
              <div className="text-white/60 text-[10px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Advisory */}
        {weather.advisories?.[0] && (
          <div className="rounded-xl px-3 py-2.5 text-white/90 text-xs flex items-start gap-2 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="flex-shrink-0 text-sm">💡</span>
            <span className="leading-relaxed line-clamp-2">{weather.advisories[0]}</span>
          </div>
        )}
      </div>
    </div>
  )
}
