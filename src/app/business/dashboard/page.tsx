'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { Navbar } from '@/components/ui'
import { BusinessService } from '@/lib/businessService'

export default function BusinessDashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalScans: 0,
    totalRewards: 0,
    activeCampaigns: 0,
    monthlyRevenue: 0
  })
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.uid)
          if (data && data.role === 'business') {
            setUserData(data)
            
            // Ensure business exists (create if missing)
            let business = await BusinessService.getBusinessByOwner(data.userId)
            if (!business) {
              // Business doesn't exist - initialize it
              console.log('Business not found, initializing...')
              business = await BusinessService.initializeBusinessForUser(data.userId)
              console.log('Business initialized:', business.businessId)
            }
            
            // TODO: Fetch business stats from Firestore
            setStats({
              totalCustomers: 89,
              totalScans: 1247,
              totalRewards: 156,
              activeCampaigns: 3,
              monthlyRevenue: 2840
            })
          } else {
            // Redirect non-business users
            router.push('/customer/dashboard')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          router.push('/customer/signin')
        }
      } else {
        router.push('/customer/signin')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading business dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-display text-h1 text-primary mb-2">
            Business Dashboard
          </h1>
          <p className="text-body text-gray600">
            Welcome back, {userData.name}! Manage your business rewards program.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-primary">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">QR Scans</p>
                <p className="text-2xl font-bold text-primary">{stats.totalScans.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Rewards Given</p>
                <p className="text-2xl font-bold text-primary">{stats.totalRewards}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Active Campaigns</p>
                <p className="text-2xl font-bold text-primary">{stats.activeCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Campaign Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <h2 className="text-h2 text-primary mb-4">Campaign Management</h2>
            <div className="space-y-3">
              <div className="w-full text-left p-4 rounded-lg border border-gray200 bg-gray50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray500">Campaign Management</h3>
                    <p className="text-sm text-gray400">Coming soon - create and manage campaigns</p>
                  </div>
                  <span className="text-gray300">🚧</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Classes Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <h2 className="text-h2 text-primary mb-4">Customer Classes</h2>
            <div className="space-y-3">
              <a
                href="/business/classes"
                className="w-full text-left p-4 rounded-lg border border-gray200 bg-gray50 hover:bg-gray100 transition-colors block"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Manage Customer Classes</h3>
                    <p className="text-sm text-gray600">Create and manage customer classes, configure points, and view analytics</p>
                  </div>
                  <span className="text-primary">→</span>
                </div>
              </a>
            </div>
          </div>
        </motion.div>

        {/* Active Campaigns */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-h2 text-primary mb-4">Active Campaigns</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">☕</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray900">Free Coffee Campaign</h3>
                  <p className="text-sm text-gray600">Scan QR code to get a free coffee</p>
                  <p className="text-xs text-gray500">Active • 45 scans today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray900">156 scans</p>
                <p className="text-xs text-gray600">This month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🍰</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray900">Dessert Special</h3>
                  <p className="text-sm text-gray600">20% off all desserts</p>
                  <p className="text-xs text-gray500">Active • 23 scans today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray900">89 scans</p>
                <p className="text-xs text-gray600">This month</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray900">Loyalty Points</h3>
                  <p className="text-sm text-gray600">Earn 10 points per visit</p>
                  <p className="text-xs text-gray500">Active • 67 scans today</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray900">234 scans</p>
                <p className="text-xs text-gray600">This month</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-h2 text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">📱</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray900">QR code scanned</p>
                  <p className="text-xs text-gray600">Free Coffee Campaign - BC2085</p>
                </div>
              </div>
              <span className="text-xs text-gray500">5 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🎁</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray900">Reward redeemed</p>
                  <p className="text-xs text-gray600">Free Coffee - BC1234</p>
                </div>
              </div>
              <span className="text-xs text-gray500">12 minutes ago</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👥</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray900">New customer registered</p>
                  <p className="text-xs text-gray600">BC2085 - Alice Johnson</p>
                </div>
              </div>
              <span className="text-xs text-gray500">1 hour ago</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
