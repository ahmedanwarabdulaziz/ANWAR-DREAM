'use client'

import { useState, useEffect } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AuthService, UserData } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const data = await AuthService.getUserData(firebaseUser.uid)
          setUserData(data)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      setUserData(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  return {
    user,
    userData,
    isLoading,
    isAuthenticated: !!user,
    logout
  }
}



