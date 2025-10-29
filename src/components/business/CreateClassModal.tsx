/**
 * Create Class Modal Component
 * Form for creating a new customer class
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal, ModalHeader, ModalContent, ModalActions } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ClassPointsConfig, ClassBenefits } from '@/lib/types/customerClass'

interface CreateClassModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: {
    name: string
    description?: string
    points: ClassPointsConfig
    benefits?: Partial<ClassBenefits>
  }) => Promise<void>
}

export function CreateClassModal({ isOpen, onClose, onCreate }: CreateClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    welcomePoints: '100',
    referrerPoints: '50',
    referredPoints: '50',
    pointsMultiplier: '1.0',
    discountPercentage: '0',
    specialOffers: false,
    freeShipping: false,
    earlyAccess: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required'
    }

    const welcomePoints = parseInt(formData.welcomePoints)
    const referrerPoints = parseInt(formData.referrerPoints)
    const referredPoints = parseInt(formData.referredPoints)

    if (isNaN(welcomePoints) || welcomePoints < 0) {
      newErrors.welcomePoints = 'Must be a valid number (0 or greater)'
    }
    if (isNaN(referrerPoints) || referrerPoints < 0) {
      newErrors.referrerPoints = 'Must be a valid number (0 or greater)'
    }
    if (isNaN(referredPoints) || referredPoints < 0) {
      newErrors.referredPoints = 'Must be a valid number (0 or greater)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await onCreate({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        points: {
          welcomePoints: parseInt(formData.welcomePoints),
          referrerPoints: parseInt(formData.referrerPoints),
          referredPoints: parseInt(formData.referredPoints)
        },
        benefits: {
          pointsMultiplier: parseFloat(formData.pointsMultiplier),
          discountPercentage: parseFloat(formData.discountPercentage),
          specialOffers: formData.specialOffers,
          freeShipping: formData.freeShipping,
          earlyAccess: formData.earlyAccess
        }
      })

      // Reset form
      setFormData({
        name: '',
        description: '',
        welcomePoints: '100',
        referrerPoints: '50',
        referredPoints: '50',
        pointsMultiplier: '1.0',
        discountPercentage: '0',
        specialOffers: false,
        freeShipping: false,
        earlyAccess: false
      })
      setErrors({})
    } catch (error) {
      console.error('Error creating class:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Customer Class" size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          Create New Customer Class
        </ModalHeader>
        <ModalContent>
          <div className="space-y-6">
            {/* Class Name */}
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">
                Class Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name ? 'border-error' : 'border-gray200'
                } focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder="e.g., VIP Customers, Students, etc."
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe this customer class..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Points Configuration */}
            <div className="border-t border-gray200 pt-4">
              <h3 className="text-lg font-semibold text-gray900 mb-4">Points Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray700 mb-2">
                    Welcome Points
                  </label>
                  <input
                    type="number"
                    value={formData.welcomePoints}
                    onChange={(e) => setFormData({ ...formData, welcomePoints: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.welcomePoints ? 'border-error' : 'border-gray200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                    min="0"
                    disabled={isLoading}
                  />
                  {errors.welcomePoints && (
                    <p className="mt-1 text-sm text-error">{errors.welcomePoints}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray700 mb-2">
                    Referrer Points
                  </label>
                  <input
                    type="number"
                    value={formData.referrerPoints}
                    onChange={(e) => setFormData({ ...formData, referrerPoints: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.referrerPoints ? 'border-error' : 'border-gray200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                    min="0"
                    disabled={isLoading}
                  />
                  {errors.referrerPoints && (
                    <p className="mt-1 text-sm text-error">{errors.referrerPoints}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray700 mb-2">
                    Referred Points
                  </label>
                  <input
                    type="number"
                    value={formData.referredPoints}
                    onChange={(e) => setFormData({ ...formData, referredPoints: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.referredPoints ? 'border-error' : 'border-gray200'
                    } focus:outline-none focus:ring-2 focus:ring-primary`}
                    min="0"
                    disabled={isLoading}
                  />
                  {errors.referredPoints && (
                    <p className="mt-1 text-sm text-error">{errors.referredPoints}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="border-t border-gray200 pt-4">
              <h3 className="text-lg font-semibold text-gray900 mb-4">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray700 mb-2">
                    Points Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.pointsMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0.1"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray600">1.0 = normal, 1.5 = 50% bonus</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray700 mb-2">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    max="100"
                    disabled={isLoading}
                  />
                  <p className="mt-1 text-xs text-gray600">0-100% discount</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.specialOffers}
                    onChange={(e) => setFormData({ ...formData, specialOffers: e.target.checked })}
                    className="rounded border-gray300 text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray700">Special Offers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="rounded border-gray300 text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray700">Free Shipping</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.earlyAccess}
                    onChange={(e) => setFormData({ ...formData, earlyAccess: e.target.checked })}
                    className="rounded border-gray300 text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray700">Early Access</span>
                </label>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalActions>
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Class'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}

