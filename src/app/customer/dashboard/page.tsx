'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Navbar } from '@/components/ui'
import { RoleRouter } from '@/lib/roleRouter'
import { CustomerBusinessService } from '@/lib/customerBusinessService'
import { ReferralService } from '@/lib/referralService'
import { BusinessService } from '@/lib/businessService'
import { CustomerBusinessRelationship, CustomerReferralLink, Business } from '@/lib/types/customerClass'

interface BusinessWithRelationship {
  business: Business
  relationship: CustomerBusinessRelationship
  referralLink: CustomerReferralLink | null
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businesses, setBusinesses] = useState<BusinessWithRelationship[]>([])
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number
    totalPointsEarned: number
    referralsByBusiness: Record<string, { count: number, points: number }>
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await AuthService.getCurrentUserData()
          setUserData(data)
          
          // Load customer businesses if user data is available
          if (data) {
            await loadCustomerBusinesses(data.userId)
            // Load referral stats
            const stats = await ReferralService.getCustomerReferralStats(data.userId)
            setReferralStats(stats)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      } else {
        router.push('/customer/signin')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const loadCustomerBusinesses = async (customerId: string) => {
    try {
      const relationships = await CustomerBusinessService.getCustomerBusinesses(customerId)
      
      const businessesData: BusinessWithRelationship[] = await Promise.all(
        relationships.map(async (relationship) => {
          const business = await BusinessService.getBusiness(relationship.businessId)
          const referralLink = await ReferralService.getReferralLink(
            customerId,
            relationship.businessId
          )
          
          return {
            business: business!,
            relationship,
            referralLink
          }
        })
      )
      
      setBusinesses(businessesData.filter(b => b.business !== null))
    } catch (error) {
      console.error('Error loading customer businesses:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

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

          {/* Referral Stats Card */}
          {referralStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-8 mb-8"
            >
              <h2 className="text-h2 text-primary mb-6">📊 Your Referral Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray600 mb-1">Total Successful Referrals</p>
                      <p className="text-3xl font-bold text-primary">{referralStats.totalReferrals}</p>
                      <p className="text-xs text-gray500 mt-1">People you've referred</p>
                    </div>
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">👥</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray600 mb-1">Total Points Earned</p>
                      <p className="text-3xl font-bold text-primary">{referralStats.totalPointsEarned}</p>
                      <p className="text-xs text-gray500 mt-1">From referrals</p>
                    </div>
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">💰</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Referrals by Business */}
              {Object.keys(referralStats.referralsByBusiness).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray900 mb-4">Breakdown by Business</h3>
                  <div className="space-y-3">
                    {Object.entries(referralStats.referralsByBusiness).map(([businessId, stats]) => {
                      const business = businesses.find(b => b.business.businessId === businessId)
                      return (
                        <div key={businessId} className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray900">{business?.business.name || businessId}</p>
                              <p className="text-sm text-gray600">
                                {stats.count} {stats.count === 1 ? 'referral' : 'referrals'} • {stats.points} points
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary">{stats.count}</p>
                              <p className="text-xs text-gray500">referrals</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Start Earning</h3>
              <p className="text-gray600 text-sm mb-4">
                Scan QR codes and start earning rewards points
              </p>
              <div className="w-full bg-gray100 text-gray500 py-2 px-4 rounded-lg">
                Coming Soon
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 text-xl">🎁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Redeem Rewards</h3>
              <p className="text-gray600 text-sm mb-4">
                Use your points to redeem exclusive rewards
              </p>
              <div className="w-full bg-gray100 text-gray500 py-2 px-4 rounded-lg">
                Coming Soon
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray200 p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray900 mb-2">Track Progress</h3>
              <p className="text-gray600 text-sm mb-4">
                Monitor your points and activity history
              </p>
              <div className="w-full bg-gray100 text-gray500 py-2 px-4 rounded-lg">
                Coming Soon
              </div>
            </div>
          </motion.div>

          {/* Businesses & Referral Links Section */}
          {businesses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-h2 text-primary mb-6">My Businesses & Referral Links</h2>
              
              {businesses.map((item, index) => (
                <motion.div
                  key={item.business.businessId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray900 mb-1">
                        {item.business.name}
                      </h3>
                      <p className="text-sm text-gray600">
                        Points: <span className="font-semibold text-primary">
                          {item.relationship.totalPoints} 
                        </span> 
                        (${item.relationship.totalPointsValue.toFixed(2)})
                      </p>
                      <p className="text-xs text-gray500 mt-1">
                        Visits: {item.relationship.totalVisits} • Joined: {' '}
                        {new Date(item.relationship.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {item.referralLink && (
                    <div className="mt-4 pt-4 border-t border-gray200">
                      <h4 className="text-sm font-semibold text-gray700 mb-2">
                        Your Referral Link
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          readOnly
                          value={item.referralLink.referralLink}
                          className="flex-1 px-3 py-2 bg-gray50 border border-gray200 rounded-lg text-sm text-gray700"
                        />
                        <button
                          onClick={() => copyToClipboard(item.referralLink!.referralLink)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Copy
                        </button>
                      </div>
                      {item.referralLink.qrCode?.imageUrl && (
                        <div className="mt-3 flex items-center gap-4">
                          <img
                            src={item.referralLink.qrCode.imageUrl}
                            alt="Referral QR Code"
                            className="w-24 h-24 border border-gray200 rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray600 mb-1">
                              Share this QR code or link with friends to earn bonus points!
                            </p>
                            <p className="text-xs text-gray500">
                              Referrals: {item.referralLink.totalReferrals} • 
                              Points earned: {item.referralLink.totalReferralPoints}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
