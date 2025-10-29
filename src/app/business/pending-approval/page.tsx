'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { Navbar } from '@/components/ui'

export default function BusinessPendingApprovalPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessData, setBusinessData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.uid)
          if (data && data.role === 'business-pending-approval') {
            setUserData(data)
            // Fetch business registration data
            await fetchBusinessData(user.uid)
          } else {
            // Redirect non-pending users
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

  const fetchBusinessData = async (userId: string) => {
    try {
      const response = await fetch(`/api/business-registration/${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setBusinessData(data.businessData)
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading...</p>
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
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-h1 text-primary mb-4">
            Business Registration Under Review
          </h1>
          <p className="text-body text-gray600 max-w-2xl mx-auto">
            Thank you for registering your business! Your application is currently being reviewed by our admin team. 
            You'll receive an email notification once your business account is approved.
          </p>
        </motion.div>

        {/* Status Card */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h2 text-primary mb-2">Application Status</h2>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray700 font-medium">Pending Approval</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray500">Submitted on</p>
              <p className="text-gray700 font-medium">
                {businessData?.submittedAt ? new Date(businessData.submittedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Business Information */}
        {businessData && (
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-h2 text-primary mb-4">Your Business Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Business Name</h3>
                <p className="text-gray600">{businessData.businessName}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Business Category</h3>
                <p className="text-gray600">{businessData.businessCategory}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Business Type</h3>
                <p className="text-gray600">{businessData.businessType}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray900 mb-2">Description</h3>
                <p className="text-gray600">{businessData.description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Address</h3>
                <p className="text-gray600">{businessData.address}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Phone</h3>
                <p className="text-gray600">{businessData.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray900 mb-2">Email</h3>
                <p className="text-gray600">{businessData.email}</p>
              </div>
              {businessData.website && (
                <div>
                  <h3 className="font-semibold text-gray900 mb-2">Website</h3>
                  <a 
                    href={businessData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-blue-600"
                  >
                    {businessData.website}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div 
          className="bg-blue-50 rounded-xl p-6 border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-h2 text-primary mb-4">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray900">Review Process</h3>
                <p className="text-gray600">Our admin team will review your business information and verify your details.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray900">Email Notification</h3>
                <p className="text-gray600">You'll receive an email notification once your business account is approved.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray900">Access Business Dashboard</h3>
                <p className="text-gray600">Once approved, you'll have full access to the business dashboard and features.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray600 mb-4">
            Have questions about your application?
          </p>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            Contact Support
          </button>
        </motion.div>
      </main>
    </div>
  )
}
