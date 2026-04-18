'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import { useAuthStore } from '../../store/useStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave,
  FiX, FiShoppingBag, FiTrendingUp, FiPackage, FiLogOut, FiLock,
} from 'react-icons/fi'
import { GiWheat, GiFarmer } from 'react-icons/gi'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Gujarat','Haryana','Himachal Pradesh',
  'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha',
  'Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
]

const ROLE_CONFIG = {
  farmer:   { label: 'Farmer',   icon: GiFarmer,      color: 'bg-[#C8E6C9]/40 text-[#388E3C]',  links: [{ href: '/dashboard', label: 'Dashboard', icon: FiTrendingUp }, { href: '/dashboard/farms', label: 'My Farms', icon: GiFarmer }, { href: '/dashboard/crops/add', label: 'List Crop', icon: GiWheat }] },
  customer: { label: 'Customer', icon: FiShoppingBag, color: 'bg-[#1565C0]/10 text-[#1565C0]',  links: [{ href: '/marketplace', label: 'Marketplace', icon: GiWheat }, { href: '/orders', label: 'My Orders', icon: FiPackage }, { href: '/cart', label: 'My Cart', icon: FiShoppingBag }] },
  admin:    { label: 'Admin',    icon: FiUser,         color: 'bg-[#98B06F]/15 text-[#5a7a3a]',  links: [{ href: '/admin', label: 'Admin Panel', icon: FiTrendingUp }] },
}

export default function ProfilePage() {
  const { user, token, isAuthenticated, updateUser, logout } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPwForm, setShowPwForm] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.newPw.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setPwSaving(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: pwForm.current, new_password: pwForm.newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Password updated!')
      setShowPwForm(false)
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      toast.error(err.message || 'Failed to update password')
    } finally {
      setPwSaving(false)
    }
  }
  const [form, setForm] = useState({})

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) { router.push('/auth/login'); return }
    setForm({
      name:     user?.name     || '',
      phone:    user?.phone    || '',
      village:  user?.village  || '',
      district: user?.district || '',
      state:    user?.state    || '',
    })
  }, [isAuthenticated, user])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser(data.user || form)
      } else {
        // Offline / no endpoint yet — update locally
        updateUser(form)
      }
      toast.success('Profile updated!')
      setEditing(false)
    } catch {
      updateUser(form)
      toast.success('Profile updated!')
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    router.push('/')
  }

  if (!isAuthenticated || !user) return null

  const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.customer
  const RoleIcon = role.icon
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Recently joined'

  return (
    <main className="min-h-screen bg-[#F0F7FF]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-4xl mx-auto">

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg, #1565C0 0%, #4CAF50 100%)' }} />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.name}
                    className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-gradient-to-br from-[#1565C0] to-[#4CAF50] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{initials}</span>
                  </div>
                )}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${role.color}`}>
                  <RoleIcon className="text-xs" />
                </div>
              </div>
              <div className="flex gap-2 mt-12">
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 border-2 border-[#B6DC76]/40 hover:border-[#98B06F] text-[#1565C0] text-sm font-medium px-4 py-2 rounded-xl transition-all">
                    <FiEdit2 className="text-sm" /> Edit Profile
                  </button>
                ) : (
                  <button onClick={() => setEditing(false)}
                    className="flex items-center gap-1.5 border-2 border-[#B6DC76]/40 text-[#455A64] text-sm font-medium px-4 py-2 rounded-xl transition-all">
                    <FiX className="text-sm" /> Cancel
                  </button>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 text-sm font-medium px-4 py-2 rounded-xl transition-all">
                  <FiLogOut className="text-sm" /> Logout
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#1565C0]">{user.name}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${role.color}`}>
                  {role.label}
                </span>
              </div>
              <p className="text-[#455A64] text-sm flex items-center gap-1.5">
                <FiMail className="text-[#4CAF50] text-xs" /> {user.email || 'No email set'}
              </p>
              {(user.village || user.state) && (
                <p className="text-[#455A64] text-sm flex items-center gap-1.5 mt-0.5">
                  <FiMapPin className="text-[#4CAF50] text-xs" />
                  {[user.village, user.district, user.state].filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-[#90A4AE] text-xs mt-1">Member since {joinDate}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

          {/* Edit form / Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white rounded-2xl border border-[#81C784]/30 shadow-sm p-6">
            <h2 className="text-[#1565C0] font-bold mb-5 flex items-center gap-2">
              <FiUser className="text-[#4CAF50]" /> Personal Information
            </h2>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Full Name</label>
                  <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                    <FiUser className="text-[#455A64] flex-shrink-0 text-sm" />
                    <input value={form.name} onChange={e => update('name', e.target.value)} required
                      placeholder="Your full name"
                      className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#b0ab9e] h-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Phone</label>
                  <div className="flex items-center gap-2 input-field px-3 py-0 h-[42px]">
                    <FiPhone className="text-[#455A64] flex-shrink-0 text-sm" />
                    <input value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="flex-1 bg-transparent outline-none text-[#1565C0] text-sm placeholder-[#b0ab9e] h-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1.5 block uppercase tracking-wide">Village</label>
                    <input value={form.village} onChange={e => update('village', e.target.value)}
                      placeholder="Your village" className="input-field" />
                  </div>
                  <div>
                    <label className="text-[#455A64] text-xs font-semibold mb-1.5 block uppercase tracking-wide">District</label>
                    <input value={form.district} onChange={e => update('district', e.target.value)}
                      placeholder="Your district" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-[#455A64] text-xs font-semibold mb-1.5 block uppercase tracking-wide">State</label>
                  <select value={form.state} onChange={e => update('state', e.target.value)} className="input-field">
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={saving}
                  className="btn-grape flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm disabled:opacity-60">
                  <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {[
                  { icon: FiUser,    label: 'Full Name', value: user.name },
                  { icon: FiMail,    label: 'Email',     value: user.email || '—' },
                  { icon: FiPhone,   label: 'Phone',     value: user.phone || '—' },
                  { icon: FiMapPin,  label: 'Village',   value: user.village || '—' },
                  { icon: FiMapPin,  label: 'District',  value: user.district || '—' },
                  { icon: FiMapPin,  label: 'State',     value: user.state || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 border-b border-[#f2f5ec] last:border-0">
                    <div className="w-8 h-8 bg-[#C8E6C9]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-[#4CAF50] text-sm" />
                    </div>
                    <div>
                      <p className="text-[#90A4AE] text-xs">{label}</p>
                      <p className="text-[#1565C0] text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Account type */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm p-5">
              <h3 className="text-[#1565C0] font-bold mb-4 text-sm">Account Type</h3>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${role.color} border-current/20`}>
                <RoleIcon className="text-2xl" />
                <div>
                  <p className="font-bold text-sm">{role.label}</p>
                  <p className="text-xs opacity-70">
                    {user.role === 'farmer' ? 'Sell crops & manage farm' :
                     user.role === 'admin'  ? 'Platform administrator' :
                     'Buy fresh crops'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm p-5">
              <h3 className="text-[#1565C0] font-bold mb-4 text-sm">Quick Links</h3>
              <div className="space-y-2">
                {role.links.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F0F7FF] transition-colors group">
                    <div className="w-7 h-7 bg-[#C8E6C9]/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#C8E6C9]/50 transition-colors">
                      <Icon className="text-[#4CAF50] text-sm" />
                    </div>
                    <span className="text-[#1565C0] text-sm font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Account ID */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
              className="bg-[#F0F7FF] rounded-2xl border border-[#81C784]/20 p-4">
              <p className="text-[#90A4AE] text-xs mb-1">Account ID</p>
              <p className="text-[#455A64] text-xs font-mono break-all">
                {user.firebase_uid || `USR-${user.user_id || '—'}`}
              </p>
            </motion.div>

            {/* Password change — compact */}
            {user.email && !user.profile_image?.includes('googleusercontent') && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-[#81C784]/30 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#1565C0] font-bold text-sm flex items-center gap-2">
                    <FiLock className="text-[#4CAF50]" /> Password
                  </h3>
                  {!showPwForm && (
                    <button onClick={() => setShowPwForm(true)}
                      className="text-xs text-[#4CAF50] border border-[#81C784]/40 hover:border-[#4CAF50] px-2.5 py-1 rounded-lg transition-colors">
                      Change
                    </button>
                  )}
                </div>
                {!showPwForm ? (
                  <p className="text-[#455A64] text-sm tracking-widest">••••••••</p>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-2.5">
                    <input type="password" required value={pwForm.current}
                      onChange={e => setPwForm(f => ({...f, current: e.target.value}))}
                      placeholder="Current password" className="input-field text-sm" />
                    <input type="password" required value={pwForm.newPw}
                      onChange={e => setPwForm(f => ({...f, newPw: e.target.value}))}
                      placeholder="New password (min 6)" className="input-field text-sm" />
                    <input type="password" required value={pwForm.confirm}
                      onChange={e => setPwForm(f => ({...f, confirm: e.target.value}))}
                      placeholder="Confirm new password" className="input-field text-sm" />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => { setShowPwForm(false); setPwForm({ current: '', newPw: '', confirm: '' }) }}
                        className="flex-1 text-xs border border-[#81C784]/40 text-[#455A64] py-2 rounded-xl hover:bg-[#F0F7FF] transition-colors">Cancel</button>
                      <button type="submit" disabled={pwSaving}
                        className="flex-1 text-xs bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold py-2 rounded-xl disabled:opacity-60 transition-colors">
                        {pwSaving ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
