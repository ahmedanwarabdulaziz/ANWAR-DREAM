'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/ui'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await AuthService.getCurrentUserData()
          setUserData(data)
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        router.push('/signin')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-error">Error</h1>
          <p className="text-gray600">Unable to load user data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-h1 text-primary mb-4">
              Welcome, {userData.name}!
            </h1>
            <p className="text-body text-gray600">
              Your account has been created successfully
            </p>
          </div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray200 p-8 mb-8"
          >
            <h2 className="text-h2 text-primary mb-6">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Full Name
                </label>
                <p className="text-gray900 font-medium">{userData.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Email Address
                </label>
                <p className="text-gray900 font-medium">{userData.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Customer ID
                </label>
                <p className="text-gray900 font-medium font-mono bg-gray50 px-3 py-1 rounded">
                  {userData.userId}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Account Type
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Member Since
                </label>
                <p className="text-gray900 font-medium">
                  {new Date(userData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Start Earning</h3>
              <p className="text-gray600 text-sm mb-4">
                Scan QR codes and start earning rewards points
              </p>
              <button className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-xl">🎁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Redeem Rewards</h3>
              <p className="text-gray600 text-sm mb-4">
                Use your points to redeem exclusive rewards
              </p>
              <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-400 transition-colors">
                View Rewards
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Track Progress</h3>
              <p className="text-gray600 text-sm mb-4">
                Monitor your points and activity history
              </p>
              <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500 transition-colors">
                View History
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
