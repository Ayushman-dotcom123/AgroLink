'use client'
import dynamic from 'next/dynamic'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '../../store/useStore'
import { usePushNotifications } from '../../lib/usePushNotifications'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const ChatWidget = dynamic(() => import('../chatbot/ChatWidget'), { ssr: false, loading: () => null })
const PageProgress = dynamic(() => import('./PageProgress'), { ssr: false, loading: () => null })

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password']

function PushSetup() {
  const { token } = useAuthStore()
  usePushNotifications(token)
  return null
}

export default function ClientProviders({ children }) {
  const pathname = usePathname()
  const showChat = !AUTH_PATHS.some(p => pathname?.startsWith(p))
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <PageProgress />
      {mounted && <PushSetup />}
      {children}
      {mounted && showChat && <ChatWidget />}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1565C0',
            border: '1px solid rgba(182,220,118,0.5)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#4CAF50', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </>
  )
}
