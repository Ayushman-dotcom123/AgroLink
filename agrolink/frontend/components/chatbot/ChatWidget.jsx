'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiX, FiMessageCircle, FiRefreshCw } from 'react-icons/fi'
import { GiWheat } from 'react-icons/gi'

const WELCOME = "Hello! I am AgroLink Agriculture Assistant 🌾\nAsk me anything about crops, soil, fertilizer, pests, irrigation, weather, and farming."
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const QUICK_QUESTIONS = [
  'Best crop for winter?',
  'How to control pests?',
  'Best fertilizer for rice?',
  'When to harvest wheat?',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: WELCOME, time: new Date() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }])
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.response || 'Sorry, something went wrong.', time: new Date() }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Unable to connect. Please check your connection and try again.', time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{ role: 'bot', text: WELCOME, time: new Date() }])
  }

  const fmt = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Invisible backdrop — clicking anywhere outside closes the chat */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1565C0, #4CAF50)' }}
        aria-label="Open Agriculture Assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><FiX className="text-[#C8E6C9] text-xl" /></motion.span>
            : <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><GiWheat className="text-[#C8E6C9] text-xl" /></motion.span>
          }
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#4CAF50' }} />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={e => e.stopPropagation()}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[#81C784]/30"
            style={{ height: '520px', background: '#F0F7FF' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)' }}>
              <div className="w-9 h-9 rounded-full bg-[#C8E6C9]/20 flex items-center justify-center flex-shrink-0">
                <GiWheat className="text-[#C8E6C9] text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-sm">AgroLink Assistant</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8E6C9] animate-pulse" />
                  <span className="text-[#81C784] text-xs">Agriculture Expert</span>
                </div>
              </div>
              <button onClick={clearChat} title="Clear chat"
                className="text-[#81C784]/60 hover:text-[#C8E6C9] transition-colors p-1">
                <FiRefreshCw className="text-sm" />
              </button>
              <button onClick={() => setOpen(false)}
                className="text-[#81C784]/60 hover:text-[#C8E6C9] transition-colors p-1">
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-[#1565C0] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GiWheat className="text-[#C8E6C9] text-xs" />
                    </div>
                  )}
                  <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#1565C0] text-[#C8E6C9] rounded-br-sm'
                        : 'bg-white text-[#1565C0] border border-[#81C784]/30 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[#90A4AE] text-[10px] px-1">{fmt(msg.time)}</span>
                  </div>
                </motion.div>
              ))}

              {/* Loading dots */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1565C0] flex items-center justify-center flex-shrink-0">
                    <GiWheat className="text-[#C8E6C9] text-xs" />
                  </div>
                  <div className="bg-white border border-[#81C784]/30 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs bg-[#81C784]/25 hover:bg-[#81C784]/50 text-[#1565C0] border border-[#81C784]/40 rounded-full px-2.5 py-1 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-[#81C784]/20">
              <div className="flex gap-2 items-end bg-white rounded-xl border border-[#81C784]/40 px-3 py-2 focus-within:border-[#4CAF50] transition-colors shadow-sm">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about crops, soil, pests..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-[#1565C0] text-sm outline-none placeholder-[#90A4AE] max-h-20"
                  style={{ lineHeight: '1.4' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: input.trim() ? 'linear-gradient(135deg, #1565C0, #4CAF50)' : '#e8e4df' }}
                >
                  <FiSend className={`text-sm ${input.trim() ? 'text-[#C8E6C9]' : 'text-[#90A4AE]'}`} />
                </button>
              </div>
              <p className="text-[#90A4AE] text-[10px] text-center mt-1.5">Agriculture questions only · Powered by AgroLink</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
