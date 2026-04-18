importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCjQAG4irqpBY_kOm2BPPrxYkybHAkTgxI',
  authDomain: 'agrolink-25358.firebaseapp.com',
  projectId: 'agrolink-25358',
  storageBucket: 'agrolink-25358.firebasestorage.app',
  messagingSenderId: '99693351080',
  appId: '1:99693351080:web:b1d50fa63fe829022bf29d',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'AgroLink', {
    body: body || '',
    icon: icon || '/farmer.png',
    badge: '/farmer.png',
    data: payload.data,
  })
})
