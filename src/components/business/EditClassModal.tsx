/**
 * Edit Class Modal Component
 * Form for editing an existing customer class
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalContent, ModalActions } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CustomerClass, ClassPointsConfig, ClassBenefits } from '@/lib/types/customerClass'

interface EditClassModalProps {
  isOpen: boolean
  onClose: () => void
  customerClass: CustomerClass
  onSave: (classId: string, updates: {
    name?: string
    description?: string
    points?: Partial<ClassPointsConfig>
    benefits?: Partial<ClassBenefits>
  }) => Promise<void>
}

export function EditClassModal({ isOpen, onClose, customerClass, onSave }: EditClassModalProps) {
  const [formData, setFormData] = useState({
    name: customerClass.name,
    description: customerClass.description || '',
    welcomePoints: customerClass.points.welcomePoints.toString(),
    referrerPoints: customerClass.points.referrerPoints.toString(),
    referredPoints: customerClass.points.referredPoints.toString(),
    pointsMultiplier: customerClass.benefits.pointsMultiplier.toString(),
    discountPercentage: customerClass.benefits.discountPercentage.toString(),
    specialOffers: customerClass.benefits.specialOffers,
    freeShipping: customerClass.benefits.freeShipping || false,
    earlyAccess: customerClass.benefits.earlyAccess || false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form data when customerClass changes
  useEffect(() => {
    setFormData({
      name: customerClass.name,
      description: customerClass.description || '',
      welcomePoints: customerClass.points.welcomePoints.toString(),
      referrerPoints: customerClass.points.referrerPoints.toString(),
      referredPoints: customerClass.points.referredPoints.toString(),
      pointsMultiplier: customerClass.benefits.pointsMultiplier.toString(),
      discountPercentage: customerClass.benefits.discountPercentage.toString(),
      specialOffers: customerClass.benefits.specialOffers,
      freeShipping: customerClass.benefits.freeShipping || false,
      earlyAccess: customerClass.benefits.earlyAccess || false
    })
  }, [customerClass])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Only validate name for custom classes (permanent classes can't be edited)
    if (customerClass.type === 'custom' && !formData.name.trim()) {
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
      // Build updates object - exclude name/description for permanent classes
      const updates: {
        name?: string
        description?: string
        points?: Partial<ClassPointsConfig>
        benefits?: Partial<ClassBenefits>
      } = {
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
      }

      // Only include name/description for custom classes
      if (customerClass.type === 'custom') {
        updates.name = formData.name.trim()
        updates.description = formData.description.trim() || undefined
      }

      await onSave(customerClass.classId, updates)
    } catch (error) {
      console.error('Error updating class:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${customerClass.name}`} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          Edit {customerClass.name}
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
                disabled={isLoading || customerClass.type === 'permanent'}
              />
              {customerClass.type === 'permanent' && (
                <p className="mt-1 text-xs text-gray600">Permanent classes cannot be renamed</p>
              )}
              {errors.name && (
                <p className="mt-1 text-sm text-error">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary ${
                  customerClass.type === 'permanent' ? 'bg-gray50 text-gray500' : ''
                }`}
                rows={3}
                disabled={isLoading || customerClass.type === 'permanent'}
              />
              {customerClass.type === 'permanent' && (
                <p className="mt-1 text-xs text-gray600">Permanent classes cannot have their description changed</p>
              )}
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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </ModalActions>
      </form>
    </Modal>
  )
}

