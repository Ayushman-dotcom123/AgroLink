'use client'
import Link from 'next/link'
import { GiWheat, GiSeedling, GiPlantWatering, GiFarmer } from 'react-icons/gi'
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiArrowRight } from 'react-icons/fi'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden" style={{ background: '#F0F7FF' }}>

      {/* Subtle dot grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(21,101,192,0.6) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #1565C0, #4CAF50, #1565C0)' }} />

      {/* Newsletter strip */}
      <div className="border-b" style={{ borderColor: 'rgba(21,101,192,0.12)', background: '#E3F2FD' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.15)' }}>
              <GiFarmer className="text-[#1565C0] text-xl" />
            </div>
            <div>
              <p className="text-[#1565C0] font-bold text-sm">Stay updated with AgroLink</p>
              <p className="text-[#455A64] text-xs">Get crop prices, weather alerts & farming tips</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-64 rounded-xl px-4 py-2.5 text-[#1565C0] text-sm outline-none transition-colors"
              style={{ background: '#ffffff', border: '1px solid rgba(21,101,192,0.2)' }}
              onFocus={e => e.target.style.borderColor = '#4CAF50'}
              onBlur={e => e.target.style.borderColor = 'rgba(21,101,192,0.2)'}
            />
            <button className="flex items-center gap-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Subscribe <FiArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C8E6C9] to-[#4CAF50] flex items-center justify-center shadow-lg">
              <GiWheat className="text-[#1565C0] text-xl" />
            </div>
            <span className="text-2xl font-bold text-[#1565C0]">AgroLink</span>
          </Link>
          <p className="text-[#455A64] text-sm leading-relaxed mb-2">
            India's smart farm marketplace — connecting farmers directly to consumers for fair, transparent agriculture.
          </p>
          <p className="text-[#4CAF50]/60 text-xs mb-6">भारत का स्मार्ट फार्म मार्केटप्लेस 🌾</p>

          {/* Social */}
          <div className="flex gap-2">
            {[
              { Icon: FiInstagram, href: '#', label: 'Instagram' },
              { Icon: FiTwitter,   href: '#', label: 'Twitter' },
              { Icon: FiFacebook,  href: '#', label: 'Facebook' },
              { Icon: FiYoutube,   href: '#', label: 'YouTube' },
            ].map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#455A64] hover:text-[#1565C0] transition-all"
                style={{ background: '#ffffff', border: '1px solid rgba(21,101,192,0.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E8F5E9'; e.currentTarget.style.borderColor = '#4CAF50' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(21,101,192,0.15)' }}
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="text-[#1565C0] font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#4CAF50] rounded" /> Platform
          </h4>
          <ul className="space-y-3">
            {[
              ['/', 'Home'],
              ['/marketplace', 'Marketplace'],
              ['/auth/register', 'Sell Your Crops'],
              ['/cart', 'My Cart'],
              ['/orders', 'My Orders'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="group flex items-center gap-2 text-sm text-[#455A64] hover:text-[#1565C0] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]/30 group-hover:bg-[#4CAF50] transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* For Farmers */}
        <div>
          <h4 className="text-[#1565C0] font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#4CAF50] rounded" /> For Farmers
          </h4>
          <ul className="space-y-3">
            {[
              ['/auth/register?role=farmer', 'Register as Farmer'],
              ['/dashboard', 'Farmer Dashboard'],
              ['/dashboard/farms', 'Farm Management'],
              ['/dashboard/crops/add', 'List Your Crops'],
              ['/dashboard/weather', 'Weather Advisory'],
              ['/dashboard/ai', 'AI Crop Advisor'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="group flex items-center gap-2 text-sm text-[#455A64] hover:text-[#1565C0] transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]/30 group-hover:bg-[#4CAF50] transition-colors flex-shrink-0" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-[#1565C0] font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#4CAF50] rounded" /> Contact Us
          </h4>
          <ul className="space-y-4 mb-6">
            {[
              { Icon: FiMail,   label: 'Email',     value: 'support@agrolink.in', href: 'mailto:support@agrolink.in' },
              { Icon: FiPhone,  label: 'Toll Free',  value: '1800-XXX-XXXX',      href: null },
              { Icon: FiMapPin, label: 'Location',   value: 'Guwahati, Assam, India', href: null },
            ].map(({ Icon, label, value, href }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.15)' }}>
                  <Icon className="text-[#1565C0] text-xs" />
                </div>
                <div>
                  <p className="text-[#455A64]/50 text-xs mb-0.5">{label}</p>
                  {href
                    ? <a href={href} className="text-[#455A64] hover:text-[#1565C0] text-sm transition-colors">{value}</a>
                    : <p className="text-[#455A64] text-sm">{value}</p>
                  }
                </div>
              </li>
            ))}
          </ul>

          <div>
            <p className="text-[#455A64]/50 text-xs mb-2 uppercase tracking-wide font-medium">Accepted Payments</p>
            <div className="flex gap-2 flex-wrap">
              {['UPI', 'Razorpay', 'COD'].map(p => (
                <span key={p} className="text-xs font-medium px-3 py-1 rounded-full text-white/70"
                  style={{ background: '#ffffff', border: '1px solid rgba(21,101,192,0.2)' }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-b" style={{ borderColor: 'rgba(21,101,192,0.12)', background: 'rgba(0,0,0,0.15)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: GiFarmer,        value: '50,000+',   label: 'Farmers' },
            { icon: GiWheat,         value: '2,00,000+', label: 'Crops Listed' },
            { icon: GiSeedling,      value: '28',        label: 'States Covered' },
            { icon: GiPlantWatering, value: '₹10Cr+',    label: 'Transactions' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(21,101,192,0.08)', border: '1px solid rgba(21,101,192,0.15)' }}>
                <Icon className="text-[#1565C0] text-lg" />
              </div>
              <div>
                <div className="text-[#1565C0] font-black text-base leading-none">{value}</div>
                <div className="text-[#455A64] text-xs mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[#455A64]/60 text-xs text-center sm:text-left">
          © {year} AgroLink India. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-[#455A64]/50">
          <Link href="#" className="hover:text-[#1565C0] transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link href="#" className="hover:text-[#1565C0] transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="#" className="hover:text-[#1565C0] transition-colors">Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}
