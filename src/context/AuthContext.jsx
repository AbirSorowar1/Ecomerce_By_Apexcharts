// Path: src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { ref, set, get, onValue } from 'firebase/database'
import { auth, googleProvider, db } from '../firebase/config'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState(null)

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const u = result.user

      // Save user to DB if new
      const userRef = ref(db, `users/${u.uid}`)
      const snapshot = await get(userRef)
      // Upgrade photo URL to higher resolution (Google gives 96px by default)
      const highResPhoto = u.photoURL ? u.photoURL.replace('=s96-c', '=s400-c').replace('s96', 's400') : null
      if (!snapshot.exists()) {
        await set(userRef, {
          uid: u.uid,
          displayName: u.displayName,
          email: u.email,
          photoURL: highResPhoto || u.photoURL,
          createdAt: new Date().toISOString(),
          totalOrders: 0,
          totalSpent: 0,
        })
      } else {
        // Update photo URL if it changed
        await set(ref(db, `users/${u.uid}/photoURL`), highResPhoto || u.photoURL)
      }
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: err.message }
    }
  }

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    }
  }

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Subscribe to user data in realtime
        const userRef = ref(db, `users/${u.uid}`)
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val())
          }
        })
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const value = {
    user,
    userData,
    loading,
    signInWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}