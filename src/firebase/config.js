// Path: src/firebase/config.js
// ⚠️  Replace these values with your own Firebase project credentials
// Go to: Firebase Console → Project Settings → Your Apps → Web App → SDK Config

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDUHSeTdWUwEYtCNg-W6bN82W9Blg_-hRo",
  authDomain: "apexcharts-dea12.firebaseapp.com",
  projectId: "apexcharts-dea12",
  storageBucket: "apexcharts-dea12.firebasestorage.app",
  messagingSenderId: "534970736489",
  appId: "1:534970736489:web:5f542ebf389a7f18dca7f8",
  measurementId: "G-85G7EKEQC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Auth
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// Realtime Database
export const db = getDatabase(app)

export default app
