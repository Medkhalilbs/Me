import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyBaY-adPkZ2gQwd6GyCzUCtwptmxbyMVRI',
  authDomain: 'mycv-feb29.firebaseapp.com',
  projectId: 'mycv-feb29',
  storageBucket: 'mycv-feb29.firebasestorage.app',
  messagingSenderId: '481862924160',
  appId: '1:481862924160:web:5b9a23bd5e449404973365',
  measurementId: 'G-2Q6KXX0RFV',
}

export const firebaseApp = initializeApp(firebaseConfig)

// Analytics is only available in browser environments (not SSR)
export const analytics = typeof window !== 'undefined' ? getAnalytics(firebaseApp) : null
