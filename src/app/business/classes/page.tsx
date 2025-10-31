/**
 * Customer Classes Management Page
 * Business dashboard for managing customer classes
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { BusinessService } from '@/lib/businessService'
import { CustomerClassService } from '@/lib/customerClassService'
import { CustomerClass, ClassPointsConfig, ClassBenefits } from '@/lib/types/customerClass'
import { ClassList, CreateClassModal, EditClassModal, ClassDetailsModal } from '@/components/business'

export default function CustomerClassesPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [business, setBusiness] = useState<any>(null)
  const [classes, setClasses] = useState<CustomerClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<CustomerClass | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.uid)
          if (data && data.role === 'business') {
            setUserData(data)
            
            // Load business
            const businessData = await BusinessService.getBusinessByOwner(data.userId)
            if (businessData) {
              setBusiness(businessData)
              await loadClasses(businessData.businessId)
            } else {
              // Business not found - try to initialize it
              console.warn('Business not found for owner:', data.userId)
              try {
                const initializedBusiness = await BusinessService.initializeBusinessForUser(data.userId)
                setBusiness(initializedBusiness)
                await loadClasses(initializedBusiness.businessId)
              } catch (error) {
                console.error('Error initializing business:', error)
                setIsLoading(false)
              }
            }
          } else {
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

  const loadClasses = async (businessId: string) => {
    try {
      // Update counts when loading classes (defaults to true)
      const classesData = await CustomerClassService.getBusinessClasses(businessId, true, true)
      setClasses(classesData)
      console.log('✅ Classes loaded with updated customer counts')
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const handleCreateClass = async (classData: {
    name: string
    description?: string
    points: ClassPointsConfig
    benefits?: Partial<ClassBenefits>
  }) => {
    if (!business) return

    try {
      await CustomerClassService.createCustomClass({
        businessId: business.businessId,
        ...classData
      })
      await loadClasses(business.businessId)
      setIsCreateModalOpen(false)
    } catch (error: any) {
      console.error('Error creating class:', error)
      alert(`Failed to create class: ${error.message}`)
    }
  }

  const handleEditClass = async (classId: string, updates: {
    name?: string
    description?: string
    points?: Partial<ClassPointsConfig>
    benefits?: Partial<ClassBenefits>
  }) => {
    if (!business) return

    try {
      await CustomerClassService.updateCustomerClass(
        business.businessId,
        classId,
        updates
      )
      await loadClasses(business.businessId)
      setIsEditModalOpen(false)
      setSelectedClass(null)
    } catch (error: any) {
      console.error('Error updating class:', error)
      alert(`Failed to update class: ${error.message}`)
    }
  }

  const handleViewDetails = (customerClass: CustomerClass) => {
    setSelectedClass(customerClass)
    setIsDetailsModalOpen(true)
  }

  const handleEdit = (customerClass: CustomerClass) => {
    setSelectedClass(customerClass)
    setIsEditModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading customer classes...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  if (!business && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-h1 text-primary mb-4">Setting Up Your Business</h1>
            <p className="text-gray600 mb-6">Please wait while we set up your business account...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Classes List */}
        <ClassList
          classes={classes}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onRefresh={() => loadClasses(business.businessId)}
          onCreate={() => setIsCreateModalOpen(true)}
        />

        {/* Modals */}
        <CreateClassModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateClass}
        />

        {selectedClass && (
          <>
            <EditClassModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false)
                setSelectedClass(null)
              }}
              customerClass={selectedClass}
              onSave={handleEditClass}
            />

            <ClassDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => {
                setIsDetailsModalOpen(false)
                setSelectedClass(null)
              }}
              customerClass={selectedClass}
              businessId={business.businessId}
              onRefresh={() => loadClasses(business.businessId)}
            />
          </>
        )}
      </main>
    </div>
  )
}

