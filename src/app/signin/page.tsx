'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService } from '@/lib/auth'
import { RoleRouter } from '@/lib/roleRouter'
import { SigninForm } from '@/components/ui/SigninForm'

export default function SigninPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { userData } = await AuthService.signIn(email, password)
      
      // Redirect to appropriate dashboard based on role
      RoleRouter.redirectToDashboard(userData.role, router)
    } catch (error: any) {
      console.error('Signin failed:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-md px-4 py-12">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-display text-h1 text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-body text-gray600">
            Sign in to your account to continue
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl p-8 shadow-sm border border-gray200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <SigninForm
            onSubmit={handleSignin}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>

        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray600">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="text-primary hover:text-blue-600 font-medium transition-colors"
            >
              Sign up
            </a>
          </p>
        </motion.div>

        {/* Demo Accounts Info */}
        <motion.div
          className="mt-8 p-4 bg-gray50 rounded-lg border border-gray200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-sm font-medium text-gray900 mb-2">Demo Accounts</h3>
          <div className="space-y-1 text-xs text-gray600">
            <p><strong>Customer:</strong> Use any account created via signup</p>
            <p><strong>Admin:</strong> Change role to "admin" in Firestore</p>
            <p><strong>Business:</strong> Change role to "business" in Firestore</p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}







