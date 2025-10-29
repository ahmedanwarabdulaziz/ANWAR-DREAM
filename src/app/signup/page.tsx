'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { SignupForm } from '@/components/auth/SignupForm'
import { SignupProgressModal } from '@/components/auth/SignupProgressModal'
import { AuthService, SignupData } from '@/lib/auth'
import { BusinessService } from '@/lib/businessService'
import { RoleRouter } from '@/lib/roleRouter'
import { Navbar } from '@/components/ui'
import { SignupURLParams, Business } from '@/lib/types/customerClass'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [urlParams, setUrlParams] = useState<SignupURLParams>({})
  const [business, setBusiness] = useState<Business | null>(null)
  const [progressStep, setProgressStep] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract URL parameters on component mount
  useEffect(() => {
    const params: SignupURLParams = {
      b: searchParams.get('b') || undefined,
      c: searchParams.get('c') || undefined,
      ref: searchParams.get('ref') || undefined
    }
    setUrlParams(params)

    // Fetch business info if businessId is provided
    if (params.b) {
      BusinessService.getBusiness(params.b)
        .then((businessData) => {
          if (businessData) {
            setBusiness(businessData)
          }
        })
        .catch((error) => {
          console.error('Error fetching business:', error)
        })
    }
  }, [searchParams])

  const handleSignup = async (data: SignupData) => {
    setIsLoading(true)
    setError(null)
    setProgressStep(1)

    try {
      // Merge URL parameters with signup data
      const signupDataWithParams: SignupData = {
        ...data,
        businessId: urlParams.b,
        classId: urlParams.c,
        referrerId: urlParams.ref
      }

      // Debug: Log the referral info
      if (urlParams.ref) {
        console.log('🔗 Referral signup detected:', {
          referrerId: urlParams.ref, // This is the customer who shared the link
          businessId: urlParams.b,
          classId: urlParams.c,
          newCustomerEmail: data.email
        })
      }

      // Step 1: Creating account
      setProgressStep(1)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Joining business program
      if (urlParams.b) {
        setProgressStep(2)
        await new Promise(resolve => setTimeout(resolve, 800))
      } else {
        setProgressStep(2)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Step 3: Activating points
      setProgressStep(3)
      
      const { user, userData } = await AuthService.signUp(signupDataWithParams)
      
      // Step 4: Almost done
      setProgressStep(4)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('User created successfully:', {
        uid: user.uid,
        customerId: userData.userId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt
      })

      // Redirect to appropriate dashboard based on role
      RoleRouter.redirectToDashboard(userData.role, router)
    } catch (error: any) {
      console.error('Signup failed:', error)
      setError(error.message || 'Failed to create account. Please try again.')
      setIsLoading(false)
      setProgressStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Signup Progress Modal */}
      <SignupProgressModal
        isOpen={isLoading}
        businessId={urlParams.b}
        business={business}
        currentStep={progressStep}
      />
      
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md">
            {/* Business/Class Info Banner */}
            {urlParams.b && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm text-blue-800">
                  {urlParams.ref 
                    ? '🎁 You were referred! You\'ll receive bonus points when you sign up.'
                    : urlParams.c
                    ? '📋 Joining a specific customer class'
                    : '🏢 Joining a business rewards program'}
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}

            {/* Signup Form */}
            <SignupForm onSubmit={handleSignup} isLoading={isLoading} />

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-gray600">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-primary hover:text-blue-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:text-blue-700">
                  Privacy Policy
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
