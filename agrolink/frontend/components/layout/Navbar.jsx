'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useCartStore } from '../../store/useStore'
import { FiShoppingCart, FiMenu, FiX, FiUser, FiLogOut, FiChevronDown, FiBell } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'
import GoogleTranslate from './GoogleTranslate'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { user, isAuthenticated, logout, _hydrated } = useAuthStore()
  const cartCount = useCartStore(s => s.count())

  // Wait for both component mount AND store hydration
  useEffect(() => { setMounted(true) }, [])
  const authed = mounted && _hydrated && isAuthenticated

  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const unread = notifs.filter(n => !n.is_read).length

  useEffect(() => {
    if (!authed) return
    const token = useAuthStore.getState().token
    fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setNotifs(data) }).catch(() => {})
  }, [authed])

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    const token = useAuthStore.getState().token
    try { await fetch(`${API}/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }) } catch {}
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const markRead = async (id) => {
    const token = useAuthStore.getState().token
    try { await fetch(`${API}/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }) } catch {}
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const navLinks = [
    // Home only shown when NOT logged in as farmer
    ...(!authed || user?.role !== 'farmer' ? [{ href: '/', label: 'Home' }] : []),
    // Marketplace only for guests and customers
    ...(!authed || user?.role === 'customer' ? [{ href: '/marketplace', label: 'Marketplace' }] : []),
    ...(authed && user?.role === 'farmer' ? [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/dashboard/orders', label: 'Orders' },
      { href: '/dashboard/soil', label: 'Soil Detection' },
      { href: '/dashboard/crop-disease', label: 'Disease Detection' },
    ] : []),
    ...(authed && user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <GiWheat className="text-[#C8E6C9] text-lg" />
            </div>
            <span className="text-xl font-bold gradient-text">AgroLink</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">

            {/* Language selector */}
            <GoogleTranslate />


            {/* Notifications bell */}
            {authed && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-[#455A64] hover:text-[#1565C0] transition-colors">
                  <FiBell className="text-xl" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-[#81C784]/30 shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3F2FD]">
                        <span className="text-[#1565C0] font-bold text-sm">Notifications</span>
                        {unread > 0 && (
                          <button onClick={markAllRead} className="text-[#4CAF50] text-xs hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifs.length === 0 ? (
                          <p className="text-[#455A64] text-sm text-center py-6">No notifications</p>
                        ) : notifs.map(n => (
                          <div key={n.id} onClick={() => markRead(n.id)}
                            className={`px-4 py-3 border-b border-[#E3F2FD] cursor-pointer hover:bg-[#F0F7FF] transition-colors ${!n.is_read ? 'bg-[#81C784]/10' : ''}`}>
                            <p className={`text-sm ${!n.is_read ? 'text-[#1565C0] font-semibold' : 'text-[#455A64]'}`}>{n.title}</p>
                            <p className="text-[#455A64] text-xs mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[#90A4AE] text-xs mt-1">{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-[#1A237E] hover:text-[#4CAF50] transition-colors">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1565C0] text-[#C8E6C9] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {authed ? (
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white/40 border border-white/50 hover:bg-white/60 rounded-full px-3 py-1.5 text-sm text-[#1A237E] font-medium transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center">
                    <FiUser className="text-white text-xs" />
                  </div>
                  <span className="hidden sm:block max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                  <FiChevronDown className={`text-xs transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl border border-[#81C784]/30 shadow-lg overflow-hidden"
                    >
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-[#1565C0] hover:bg-[#F0F7FF] transition-colors">
                        <FiUser className="text-[#4CAF50]" /> Profile
                      </Link>
                      <button onClick={() => { logout(); setProfileOpen(false) }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <FiLogOut /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm text-[#1A237E] hover:text-[#4CAF50] font-semibold px-3 py-1.5 transition-colors">Login</Link>
                <Link href="/auth/register" className="btn-primary text-sm px-4 py-2 rounded-xl">Register</Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#1565C0] p-1">
              {menuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t border-white/30"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="text-[#1565C0] font-medium py-3 px-3 rounded-xl hover:bg-[#F0F7FF] transition-colors border-b border-[#81C784]/20">
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
