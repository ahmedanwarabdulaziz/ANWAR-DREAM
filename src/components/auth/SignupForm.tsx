'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface SignupFormData {
  name: string
  email: string
  password: string
}

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>
  isLoading?: boolean
}

export function SignupForm({ onSubmit, isLoading = false }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Partial<SignupFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      try {
        await onSubmit(formData)
      } catch (error) {
        console.error('Signup error:', error)
      }
    }
  }

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card>
        <CardHeader className="text-center">
          <h2 className="text-h2 text-primary font-semibold">Create Account</h2>
          <p className="text-caption text-gray600 mt-2">
            Join our rewards program and start earning today
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.name 
                    ? 'border-error focus:ring-error' 
                    : 'border-gray200 focus:border-primary'
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email 
                    ? 'border-error focus:ring-error' 
                    : 'border-gray200 focus:border-primary'
                }`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.password 
                    ? 'border-error focus:ring-error' 
                    : 'border-gray200 focus:border-primary'
                }`}
                placeholder="Create a password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="navy"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray600">
              Already have an account?{' '}
              <a href="/signin" className="text-primary hover:text-blue-700 font-medium">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

