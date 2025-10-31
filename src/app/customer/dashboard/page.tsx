'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { RoleRouter } from '@/lib/roleRouter'
import { CustomerBusinessService } from '@/lib/customerBusinessService'
import { ReferralService } from '@/lib/referralService'
import { BusinessService } from '@/lib/businessService'
import { CustomerBusinessRelationship, CustomerReferralLink, Business } from '@/lib/types/customerClass'
import { Modal, ModalHeader, ModalContent, ModalActions } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ClipboardIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { BusinessRegistrationModal } from '@/components/BusinessRegistrationModal'

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
  const [qrOpen, setQrOpen] = useState(false)
  const [businessModalOpen, setBusinessModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const data = await AuthService.getCurrentUserData()
          setUserData(data)
          
          if (data) {
            await loadCustomerBusinesses(data.userId)
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
  }

  const shareLink = async (url: string, title?: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: title || 'Referral Link', url })
      } else {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard')
      }
    } catch (e) {
      // user cancelled or share failed; fallback copy
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard')
      } catch {}
    }
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
    <div className="min-h-screen bg-white relative">
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-display text-h1 text-primary mb-2 text-center">
              Customer Dashboard
            </h1>
            <p className="text-body text-gray700 font-medium text-lg text-center">
              {userData.name}
            </p>
            <p className="text-body text-gray600 mt-1 text-center">
              Your account has been created successfully
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-gray200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h2 text-primary">Account Information</h2>
              {userData.role === 'customer' && (
                <Button
                  variant="primary"
                  onClick={() => setBusinessModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Upgrade to Business</span>
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm font-medium text-gray700 mb-1">Full Name</label><p className="text-gray900 font-medium">{userData.name}</p></div>
              <div><label className="block text-sm font-medium text-gray700 mb-1">Email Address</label><p className="text-gray900 font-medium">{userData.email}</p></div>
              <div><label className="block text-sm font-medium text-gray700 mb-1">Customer ID</label><p className="text-gray900 font-medium font-mono bg-gray50 px-3 py-1 rounded">{userData.userId}</p></div>
              <div><label className="block text-sm font-medium text-gray700 mb-1">Account Type</label><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</span></div>
              <div><label className="block text-sm font-medium text-gray700 mb-1">Member Since</label><p className="text-gray900 font-medium">{new Date(userData.createdAt).toLocaleDateString('en-US', {year: 'numeric',month: 'long',day: 'numeric',hour: '2-digit',minute: '2-digit'})}</p></div>
            </div>
          </motion.div>

          {referralStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-8 mb-8">
              <h2 className="text-h2 text-primary mb-6">📊 Your Referral Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray600 mb-1">Total Successful Referrals</p><p className="text-3xl font-bold text-primary">{referralStats.totalReferrals}</p><p className="text-xs text-gray500 mt-1">People you've referred</p></div><div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center"><span className="text-3xl">👥</span></div></div></div>
                <div className="bg-white rounded-lg p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-gray600 mb-1">Total Points Earned</p><p className="text-3xl font-bold text-primary">{referralStats.totalPointsEarned}</p><p className="text-xs text-gray500 mt-1">From referrals</p></div><div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center"><span className="text-3xl">💰</span></div></div></div>
              </div>
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
                              <p className="text-sm text-gray600">{stats.count} {stats.count === 1 ? 'referral' : 'referrals'} • {stats.points} points</p>
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

          {businesses.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="space-y-6">
              <h2 className="text-h2 text-primary mb-6">My Businesses & Referral Links</h2>
              {businesses.map((item, index) => (
                <motion.div key={item.business.businessId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + index * 0.1 }} className="bg-white rounded-xl shadow-sm border border-gray200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray900 mb-1">{item.business.name}</h3>
                      <p className="text-sm text-gray600">Points: <span className="font-semibold text-primary">{item.relationship.totalPoints}</span> (${item.relationship.totalPointsValue.toFixed(2)})</p>
                      <p className="text-xs text-gray500 mt-1">Visits: {item.relationship.totalVisits} • Joined: {new Date(item.relationship.joinedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {item.referralLink && (
                    <div className="mt-4 pt-4 border-t border-gray200">
                      <h4 className="text-sm font-semibold text-gray700 mb-2">Your Referral Link</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <input type="text" readOnly value={item.referralLink.referralLink} className="flex-1 px-3 py-2 bg-gray50 border border-gray200 rounded-lg text-sm text-gray700" />
                        <button onClick={() => copyToClipboard(item.referralLink!.referralLink)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">Copy</button>
                      </div>
                      {item.referralLink.qrCode?.imageUrl && (
                        <div className="mt-3 flex items-center gap-4">
                          <img src={item.referralLink.qrCode.imageUrl} alt="Referral QR Code" className="w-24 h-24 border border-gray200 rounded-lg" />
                          <div className="flex-1">
                            <p className="text-xs text-gray600 mb-1">Share this QR code or link with friends to earn bonus points!</p>
                            <p className="text-xs text-gray500">Referrals: {item.referralLink.totalReferrals} • Points earned: {item.referralLink.totalReferralPoints}</p>
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

      {/* Floating QR button */}
      <button
        onClick={() => setQrOpen(true)}
        className="fixed right-4 bottom-4 z-40 h-12 w-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        aria-label="Show my QR code"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h3v3h-3v-3zm3 3h4v4h-4v-4z" /></svg>
      </button>

      {qrOpen && (
        <Modal isOpen={true} onClose={() => setQrOpen(false)}>
          <ModalHeader onClose={() => setQrOpen(false)}>My QR Code</ModalHeader>
          <ModalContent>
            {businesses.length === 0 && (
              <div className="text-center text-gray600 py-8">No QR code available yet.</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {businesses.map(b => (
                <div key={b.business.businessId} className="flex flex-col items-center">
                  <div className="text-lg font-semibold mb-4 text-gray900 text-center">{b.business.name}</div>
                  {b.referralLink?.qrCode?.imageUrl ? (
                    <div className="mb-6">
                      <img src={b.referralLink.qrCode.imageUrl} alt={`${b.business.name} QR`} className="w-48 h-48 self-center" />
                    </div>
                  ) : (
                    <div className="text-sm text-gray600 mb-6 text-center">QR not available</div>
                  )}
                  {b.referralLink?.referralLink && (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(b.referralLink!.referralLink)}
                        className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                        aria-label="Copy link"
                        title="Copy link"
                      >
                        <ClipboardIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => shareLink(b.referralLink!.referralLink, `${b.business.name} Referral`)}
                        className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
                        aria-label="Share link"
                        title="Share link"
                      >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ModalContent>
          <ModalActions>
            <Button variant="ghost" onClick={() => setQrOpen(false)}>Close</Button>
          </ModalActions>
        </Modal>
      )}

      {/* Business Registration Modal */}
      <BusinessRegistrationModal
        isOpen={businessModalOpen}
        onClose={() => setBusinessModalOpen(false)}
      />
    </div>
  )
}
