'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiGlobe, FiChevronDown, FiLoader } from 'react-icons/fi'

const LANGUAGES = [
  { code: 'en',  label: 'English',   native: 'English' },
  { code: 'hi',  label: 'Hindi',     native: 'हिंदी' },
  { code: 'bn',  label: 'Bengali',   native: 'বাংলা' },
  { code: 'te',  label: 'Telugu',    native: 'తెలుగు' },
  { code: 'mr',  label: 'Marathi',   native: 'मराठी' },
  { code: 'ta',  label: 'Tamil',     native: 'தமிழ்' },
  { code: 'gu',  label: 'Gujarati',  native: 'ગુજરાતી' },
  { code: 'kn',  label: 'Kannada',   native: 'ಕನ್ನಡ' },
  { code: 'ml',  label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa',  label: 'Punjabi',   native: 'ਪੰਜਾਬੀ' },
  { code: 'or',  label: 'Odia',      native: 'ଓଡ଼ିଆ' },
  { code: 'as',  label: 'Assamese',  native: 'অসমীয়া' },
  { code: 'ur',  label: 'Urdu',      native: 'اردو' },
  { code: 'ne',  label: 'Nepali',    native: 'नेपाली' },
]

// Read current language from googtrans cookie
function getCookieLang() {
  if (typeof document === 'undefined') return 'en'
  const m = document.cookie.match(/googtrans=\/en\/([^;]+)/)
  return m ? decodeURIComponent(m[1]) : 'en'
}

// Set googtrans cookie on all relevant domains
function setGTCookie(code) {
  const val = code === 'en' ? '/en/en' : `/en/${code}`
  const host = window.location.hostname
  const expires = 'expires=Fri, 31 Dec 2099 23:59:59 GMT'
  document.cookie = `googtrans=${val};path=/;${expires}`
  document.cookie = `googtrans=${val};path=/;domain=${host};${expires}`
  if (host !== 'localhost') {
    document.cookie = `googtrans=${val};path=/;domain=.${host};${expires}`
  }
}

// Poll until .goog-te-combo is available, then trigger translation
function triggerTranslation(code, onDone, onFail) {
  let attempts = 0
  const maxAttempts = 30 // 3 seconds max

  const poll = () => {
    attempts++
    const select = document.querySelector('.goog-te-combo')

    if (select) {
      select.value = code
      // Fire both change and input events for reliability
      select.dispatchEvent(new Event('change', { bubbles: true }))
      select.dispatchEvent(new Event('input', { bubbles: true }))
      onDone()
      return
    }

    if (attempts >= maxAttempts) {
      // GT widget never loaded — fall back to cookie + reload
      onFail()
      return
    }

    setTimeout(poll, 100)
  }

  poll()
}

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('en')
  const [translating, setTranslating] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setCurrent(getCookieLang())
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = useCallback((code) => {
    setOpen(false)
    if (code === current) return

    setCurrent(code)
    setGTCookie(code)
    setTranslating(true)

    if (code === 'en') {
      // Restore to English — reload is the most reliable way
      setTranslating(false)
      window.location.reload()
      return
    }

    triggerTranslation(
      code,
      () => {
        // Success — translation triggered
        setTimeout(() => setTranslating(false), 1500)
      },
      () => {
        // Fallback — reload with cookie set
        window.location.reload()
      }
    )
  }, [current])

  const currentLang = LANGUAGES.find(l => l.code === current) || LANGUAGES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-[#F0F7FF] text-[#455A64] text-xs border border-[#81C784]/50 rounded-lg px-2.5 py-1.5 hover:border-[#4CAF50] transition-colors focus:outline-none"
      >
        {translating
          ? <FiLoader className="text-sm animate-spin text-[#4CAF50]" />
          : <FiGlobe className="text-sm" />
        }
        <span className="max-w-[72px] truncate hidden sm:block">
          {translating ? 'Translating...' : currentLang.native}
        </span>
        <FiChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-[#81C784]/30 shadow-xl overflow-hidden z-50"
          >
            <div className="px-3 py-2 border-b border-[#E3F2FD]">
              <p className="text-[#455A64] text-xs font-medium">Select Language</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-[#F0F7FF] transition-colors ${
                    current === lang.code
                      ? 'bg-[#81C784]/20 text-[#1565C0] font-semibold'
                      : 'text-[#455A64]'
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-xs text-[#4CAF50]">{lang.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
