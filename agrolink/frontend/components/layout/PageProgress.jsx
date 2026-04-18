'use client'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function PageProgress() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)
  const prevPath = useRef(pathname)

  useEffect(() => {
    if (pathname === prevPath.current) return
    prevPath.current = pathname

    // Start progress
    setVisible(true)
    setProgress(20)

    timerRef.current = setTimeout(() => setProgress(60), 100)
    const t2 = setTimeout(() => setProgress(85), 300)
    const t3 = setTimeout(() => {
      setProgress(100)
      setTimeout(() => { setVisible(false); setProgress(0) }, 300)
    }, 500)

    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #4CAF50, #81C784)',
          boxShadow: '0 0 8px rgba(21,101,192,0.6)',
        }}
      />
    </div>
  )
}
