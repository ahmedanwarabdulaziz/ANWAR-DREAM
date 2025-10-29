/**
 * Class Details Modal Component
 * Displays detailed information about a customer class including QR code and analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { Modal, ModalHeader, ModalContent, ModalActions } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { CustomerClass } from '@/lib/types/customerClass'
import { CustomerClassService } from '@/lib/customerClassService'

interface ClassDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  customerClass: CustomerClass
  businessId: string
  onRefresh?: () => void // Callback to refresh the class list
}

export function ClassDetailsModal({ isOpen, onClose, customerClass, businessId, onRefresh }: ClassDetailsModalProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentClass, setCurrentClass] = useState(customerClass)

  // Update current class when prop changes
  useEffect(() => {
    setCurrentClass(customerClass)
  }, [customerClass])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add toast notification here
  }

  const downloadQRCode = () => {
    if (currentClass.qrCode?.imageUrl) {
      const link = document.createElement('a')
      link.href = currentClass.qrCode.imageUrl
      link.download = `qr-code-${currentClass.classId}.png`
      link.click()
    }
  }

  const handleRefreshCount = async () => {
    setIsRefreshing(true)
    try {
      await CustomerClassService.updateClassCustomerCount(businessId, currentClass.classId)
      // Reload the class data
      const updatedClass = await CustomerClassService.getCustomerClass(businessId, currentClass.classId)
      if (updatedClass) {
        setCurrentClass(updatedClass)
      }
      // Trigger parent refresh if callback provided
      if (onRefresh) {
        onRefresh()
      }
    } catch (error: any) {
      console.error('Error refreshing customer count:', error)
      alert(`Failed to refresh count: ${error.message}`)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={currentClass.name} size="xl">
      <ModalHeader onClose={onClose}>
        {currentClass.name}
        {currentClass.type === 'permanent' && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            Permanent
          </span>
        )}
      </ModalHeader>
      <ModalContent>
        <div className="space-y-6">
          {/* Description */}
          {currentClass.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray700 mb-2">Description</h3>
              <p className="text-gray600">{currentClass.description}</p>
            </div>
          )}

          {/* QR Code and Signup Link */}
          <div className="border-t border-gray200 pt-6">
            <h3 className="text-lg font-semibold text-gray900 mb-4">QR Code & Signup Link</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray700 mb-2">
                  QR Code
                </label>
                {currentClass.qrCode?.imageUrl ? (
                  <div className="bg-white p-4 rounded-lg border border-gray200 inline-block">
                    <img
                      src={currentClass.qrCode.imageUrl}
                      alt={`QR Code for ${currentClass.name}`}
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray100 rounded-lg flex items-center justify-center">
                    <span className="text-gray400">No QR code</span>
                  </div>
                )}
                <button
                  onClick={downloadQRCode}
                  className="mt-2 px-4 py-2 bg-gray100 text-gray700 rounded-lg hover:bg-gray200 transition-colors text-sm font-medium"
                  disabled={!currentClass.qrCode?.imageUrl}
                >
                  Download QR Code
                </button>
              </div>

              {/* Signup Link */}
              <div>
                <label className="block text-sm font-medium text-gray700 mb-2">
                  Signup Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={currentClass.signupLink}
                    className="flex-1 px-4 py-2 bg-gray50 border border-gray200 rounded-lg text-sm text-gray700"
                  />
                  <button
                    onClick={() => copyToClipboard(currentClass.signupLink)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray600">
                  Share this link or QR code to allow customers to join this class
                </p>
              </div>
            </div>
          </div>

          {/* Points Configuration */}
          <div className="border-t border-gray200 pt-6">
            <h3 className="text-lg font-semibold text-gray900 mb-4">Points Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Welcome Points</p>
                <p className="text-2xl font-bold text-primary">
                  {currentClass.points.welcomePoints}
                </p>
                <p className="text-xs text-gray500 mt-1">
                  Given when customer joins
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Referrer Points</p>
                <p className="text-2xl font-bold text-primary">
                  {currentClass.points.referrerPoints}
                </p>
                <p className="text-xs text-gray500 mt-1">
                  Given to person who refers
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Referred Points</p>
                <p className="text-2xl font-bold text-primary">
                  {currentClass.points.referredPoints}
                </p>
                <p className="text-xs text-gray500 mt-1">
                  Given to person referred
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="border-t border-gray200 pt-6">
            <h3 className="text-lg font-semibold text-gray900 mb-4">Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-sm text-gray600 mb-1">Points Multiplier</p>
                <p className="text-xl font-semibold text-gray900">
                  {currentClass.benefits.pointsMultiplier}x
                </p>
              </div>
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-sm text-gray600 mb-1">Discount Percentage</p>
                <p className="text-xl font-semibold text-gray900">
                  {currentClass.benefits.discountPercentage}%
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {currentClass.benefits.specialOffers && (
                <div className="flex items-center text-sm text-gray700">
                  <span className="mr-2">✓</span>
                  Special Offers Enabled
                </div>
              )}
              {currentClass.benefits.freeShipping && (
                <div className="flex items-center text-sm text-gray700">
                  <span className="mr-2">✓</span>
                  Free Shipping
                </div>
              )}
              {currentClass.benefits.earlyAccess && (
                <div className="flex items-center text-sm text-gray700">
                  <span className="mr-2">✓</span>
                  Early Access
                </div>
              )}
            </div>
          </div>

          {/* Analytics */}
          <div className="border-t border-gray200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray900">Analytics</h3>
              <button
                onClick={handleRefreshCount}
                disabled={isRefreshing}
                className="px-3 py-1.5 text-sm bg-gray100 text-gray700 rounded-lg hover:bg-gray200 transition-colors disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : '🔄 Refresh Count'}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Total Customers</p>
                <p className="text-2xl font-bold text-primary">
                  {currentClass.analytics.totalCustomers}
                </p>
              </div>
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Points Distributed</p>
                <p className="text-xl font-bold text-primary">
                  {currentClass.analytics.totalPointsDistributed.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Welcome Points</p>
                <p className="text-xl font-bold text-primary">
                  {currentClass.analytics.totalWelcomePointsGiven.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Referrer Points</p>
                <p className="text-xl font-bold text-primary">
                  {currentClass.analytics.totalReferrerPointsGiven.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-gray50 rounded-lg">
                <p className="text-xs text-gray600 mb-1">Referred Points</p>
                <p className="text-xl font-bold text-primary">
                  {currentClass.analytics.totalReferredPointsGiven.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray500">
              Last updated: {new Date(currentClass.analytics.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </ModalContent>

      <ModalActions>
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </ModalActions>
    </Modal>
  )
}

