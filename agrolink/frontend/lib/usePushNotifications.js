'use client'
import { useEffect } from 'react'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { initializeApp, getApps } from 'firebase/app'
import toast from 'react-hot-toast'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// VAPID key — generate from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
// For now using a placeholder — replace with your actual VAPID key
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

export function usePushNotifications(token) {
  useEffect(() => {
    if (!token || typeof window === 'undefined' || !VAPID_KEY) return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return

    const setup = async () => {
      try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
        const messaging = getMessaging(app)

        const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY })
        if (!fcmToken) return

        // Save FCM token to backend
        await fetch(`${API}/notifications/fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fcm_token: fcmToken }),
        }).catch(() => {})

        // Handle foreground messages
        onMessage(messaging, (payload) => {
          const { title, body } = payload.notification || {}
          toast(
            <div>
              <p className="font-bold text-sm">{title || 'AgroLink'}</p>
              <p className="text-xs text-gray-600">{body}</p>
            </div>,
            { duration: 5000, icon: '🌾' }
          )
        })
      } catch (err) {
        // FCM setup failed silently — in-app notifications still work
        console.warn('FCM setup:', err.message)
      }
    }

    setup()
  }, [token])
}
