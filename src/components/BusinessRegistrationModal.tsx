'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

interface BusinessRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
}

interface BusinessType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

interface BusinessCategory {
  id: string
  name: string
  description?: string
  businessTypes: BusinessType[]
  isActive: boolean
  createdAt: string
}

interface BusinessFormData {
  businessName: string
  businessCategory: string
  businessType: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  logo: File | null
}

export function BusinessRegistrationModal({ isOpen, onClose }: BusinessRegistrationModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    businessCategory: '',
    businessType: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: null
  })

  useEffect(() => {
    if (isOpen) {
      loadCategories()
    }
  }, [isOpen])

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const categoriesRef = collection(db, 'business_categories')
      const snapshot = await getDocs(query(categoriesRef, orderBy('name')))
      
      const categoriesData: BusinessCategory[] = []
      snapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          ...doc.data()
        } as BusinessCategory)
      })
      
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({
      ...prev,
      logo: file
    }))

    // Create preview URL
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoPreview(null)
    }
  }

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.businessCategory)
  }

  const getBusinessTypes = () => {
    const category = getSelectedCategory()
    return category ? category.businessTypes.filter(type => type.isActive) : []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please sign in to register a business')
      return
    }

    setIsSubmitting(true)

    try {
      // Upload logo to Cloudinary first if provided
      let logoUrl = null
      if (formData.logo) {
        console.log('Uploading logo to Cloudinary...', formData.logo.name, formData.logo.size)
        
        try {
          const cloudinaryFormData = new FormData()
          cloudinaryFormData.append('file', formData.logo)
          cloudinaryFormData.append('upload_preset', 'business_logos')
          cloudinaryFormData.append('folder', 'business-logos')
          cloudinaryFormData.append('tags', 'business-logo')
          
          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/dbo3xd0df/image/upload`,
            {
              method: 'POST',
              body: cloudinaryFormData
            }
          )
          
          if (cloudinaryResponse.ok) {
            const cloudinaryData = await cloudinaryResponse.json()
            logoUrl = cloudinaryData.secure_url
            console.log('Logo uploaded successfully:', logoUrl)
          } else {
            const errorData = await cloudinaryResponse.json()
            console.error('Cloudinary upload error:', errorData)
            throw new Error(`Failed to upload logo: ${errorData.error?.message || 'Unknown error'}`)
          }
        } catch (uploadError: any) {
          console.error('Error uploading logo:', uploadError)
          throw new Error(`Failed to upload logo: ${uploadError.message || 'Please try again'}`)
        }
      }

      // Submit business registration
      const submitData = {
        businessName: formData.businessName,
        businessCategory: formData.businessCategory,
        businessType: formData.businessType,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logoUrl,
        userId: user.uid
      }

      console.log('Submitting business registration with data:', submitData)

             const response = await fetch('/api/business-registration-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)

      if (result.success) {
        alert('Business registration submitted successfully! Your request is under review.')
        onClose()
        // Reset form
        setFormData({
          businessName: '',
          businessCategory: '',
          businessType: '',
          description: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          logo: null
        })
        setLogoPreview(null)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      console.error('Error submitting business registration:', error)
      const errorMessage = error.message || 'Failed to submit business registration. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h2 text-primary">Register Your Business</h2>
            <button
              onClick={onClose}
              className="text-gray400 hover:text-gray600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your business name"
              />
            </div>

            {/* Business Category */}
            <div>
              <label htmlFor="businessCategory" className="block text-sm font-medium text-gray700 mb-2">
                Business Category *
              </label>
              {isLoadingCategories ? (
                <div className="w-full px-3 py-2 border border-gray200 rounded-lg bg-gray50">
                  <span className="text-gray500">Loading categories...</span>
                </div>
              ) : (
                <select
                  id="businessCategory"
                  name="businessCategory"
                  value={formData.businessCategory}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select business category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray700 mb-2">
                Business Type *
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                disabled={!formData.businessCategory}
                className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray50 disabled:text-gray500"
              >
                <option value="">Select business type</option>
                {getBusinessTypes().map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {formData.businessCategory && getBusinessTypes().length === 0 && (
                <p className="text-sm text-gray500 mt-1">No business types available for this category</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray700 mb-2">
                Business Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your business and what you offer"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray700 mb-2">
                Business Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your business address"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter business email"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray700 mb-2">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://your-website.com"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray700 mb-2">
                Business Logo (Optional)
              </label>
              
              {/* Image Preview */}
              {logoPreview && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, logo: null }))
                        setLogoPreview(null)
                        // Reset file input
                        const fileInput = document.getElementById('logo') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray600 mt-2">
                    Preview of your logo
                  </p>
                </div>
              )}

              {/* Upload Area */}
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray600">
                    <label htmlFor="logo" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                      <span>Upload a file</span>
                      <input
                        id="logo"
                        name="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {formData.logo && (
                <p className="mt-2 text-sm text-gray600">
                  Selected: {formData.logo.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
