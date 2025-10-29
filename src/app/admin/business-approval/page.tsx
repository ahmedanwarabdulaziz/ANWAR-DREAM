'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { Navbar } from '@/components/ui'
import { BusinessService } from '@/lib/businessService'

interface BusinessRegistration {
  id: string
  businessName: string
  businessCategory: string
  businessType: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  logoUrl: string | null
  businessCode: string
  userId: string
  status: 'pending' | 'active' | 'rejected'
  submittedAt: string
  createdAt: string
}

export default function BusinessApprovalPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessRegistrations, setBusinessRegistrations] = useState<BusinessRegistration[]>([])
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.uid)
          if (data && data.role === 'admin') {
            setUserData(data)
            await loadBusinessRegistrations()
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

  const loadBusinessRegistrations = async () => {
    try {
      const q = query(
        collection(db, 'business_registrations'),
        orderBy('submittedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      const registrations: BusinessRegistration[] = []
      querySnapshot.forEach((doc) => {
        registrations.push({
          id: doc.id,
          ...doc.data()
        } as BusinessRegistration)
      })
      
      setBusinessRegistrations(registrations)
    } catch (error) {
      console.error('Error loading business registrations:', error)
    }
  }

  const handleApprove = async (registrationId: string, userId: string) => {
    setIsProcessing(registrationId)
    
    try {
      console.log('🔄 Starting approval process...')
      console.log('Registration ID:', registrationId)
      console.log('User ID (Firebase UID):', userId)
      
      // Get the registration data first
      const registrationDoc = await getDoc(doc(db, 'business_registrations', registrationId))
      if (!registrationDoc.exists()) {
        throw new Error('Registration not found')
      }
      const registrationData = registrationDoc.data() as BusinessRegistration
      
      // Get customer ID from user_mappings
      console.log('🔍 Looking up customer ID for Firebase UID:', userId)
      const mappingDoc = await getDoc(doc(db, 'user_mappings', userId))
      
      if (!mappingDoc.exists()) {
        console.error('❌ User mapping not found for UID:', userId)
        throw new Error('User mapping not found')
      }

      const mapping = mappingDoc.data()
      const customerId = mapping.customerId
      console.log('✅ Found customer ID:', customerId)

      // Check if business already exists
      const existingBusiness = await BusinessService.getBusinessByOwner(customerId)
      if (existingBusiness) {
        console.log('⚠️ Business already exists for this owner')
        // Still update role and status
        await updateDoc(doc(db, 'users', customerId), {
          role: 'business'
        })
        await updateDoc(doc(db, 'business_registrations', registrationId), {
          status: 'active',
          approvedAt: new Date().toISOString()
        })
        await loadBusinessRegistrations()
        alert('Business already exists. User role updated to business.')
        return
      }

      // Create business document with permanent classes
      console.log('🏢 Creating business document...')
      const business = await BusinessService.createBusiness({
        name: registrationData.businessName,
        ownerId: customerId,
        email: registrationData.email,
        phone: registrationData.phone || undefined,
        address: registrationData.address || undefined,
        businessType: registrationData.businessType || undefined,
        website: registrationData.website && registrationData.website.trim() ? registrationData.website : undefined
      })
      console.log('✅ Business created with ID:', business.businessId)
      console.log('✅ Permanent classes created automatically')

      // Update business registration status to 'active'
      console.log('📝 Updating registration status to active...')
      await updateDoc(doc(db, 'business_registrations', registrationId), {
        status: 'active',
        approvedAt: new Date().toISOString(),
        businessId: business.businessId // Link registration to business
      })
      console.log('✅ Registration status updated')

      // Update user role to business
      console.log('👤 Updating user role to business...')
      await updateDoc(doc(db, 'users', customerId), {
        role: 'business'
      })
      console.log('✅ User role updated to business')

      // Reload registrations
      await loadBusinessRegistrations()
      
      alert('Business approved successfully! Business document and permanent classes created.')
    } catch (error: any) {
      console.error('❌ Error approving business registration:', error)
      alert('Failed to approve business registration: ' + (error.message || error))
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (registrationId: string, userId: string) => {
    setIsProcessing(registrationId)
    
    try {
      console.log('🔄 Starting rejection process...')
      console.log('Registration ID:', registrationId)
      console.log('User ID (Firebase UID):', userId)
      
      // Update business registration status to 'rejected'
      console.log('📝 Updating registration status to rejected...')
      await updateDoc(doc(db, 'business_registrations', registrationId), {
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      })
      console.log('✅ Registration status updated to rejected')

      // Get customer ID from user_mappings
      console.log('🔍 Looking up customer ID for Firebase UID:', userId)
      const mappingDoc = await getDoc(doc(db, 'user_mappings', userId))
      
      if (!mappingDoc.exists()) {
        console.error('❌ User mapping not found for UID:', userId)
        throw new Error('User mapping not found')
      }

      const mapping = mappingDoc.data()
      const customerId = mapping.customerId
      console.log('✅ Found customer ID:', customerId)

      // Update user role back to customer
      console.log('👤 Updating user role back to customer...')
      await updateDoc(doc(db, 'users', customerId), {
        role: 'customer'
      })
      console.log('✅ User role updated to customer')

      // Reload registrations
      await loadBusinessRegistrations()
      
      alert('Business registration rejected')
    } catch (error) {
      console.error('❌ Error rejecting business registration:', error)
      alert('Failed to reject business registration: ' + error)
    } finally {
      setIsProcessing(null)
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

  const pendingRegistrations = businessRegistrations.filter(r => r.status === 'pending')
  const approvedRegistrations = businessRegistrations.filter(r => r.status === 'active')
  const rejectedRegistrations = businessRegistrations.filter(r => r.status === 'rejected')

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-h1 text-primary mb-4">Business Registration Management</h1>
          <p className="text-body text-gray600">
            Review and approve business registration requests
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray600">Pending</p>
                <p className="text-2xl font-bold text-gray900">{pendingRegistrations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray600">Approved</p>
                <p className="text-2xl font-bold text-gray900">{approvedRegistrations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">❌</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray600">Rejected</p>
                <p className="text-2xl font-bold text-gray900">{rejectedRegistrations.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Registrations */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-h2 text-primary mb-4">Pending Approvals</h2>
          {pendingRegistrations.length === 0 ? (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray200 text-center">
              <p className="text-gray600">No pending business registrations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((registration) => (
                <div key={registration.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray900">{registration.businessName}</h3>
                      <p className="text-sm text-gray600 capitalize">{registration.businessType}</p>
                      <p className="text-xs text-gray500">
                        Submitted: {new Date(registration.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(registration.id, registration.userId)}
                        disabled={isProcessing === registration.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing === registration.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(registration.id, registration.userId)}
                        disabled={isProcessing === registration.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isProcessing === registration.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray700">Category:</p>
                      <p className="text-gray600">{registration.businessCategory}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray700">Type:</p>
                      <p className="text-gray600">{registration.businessType}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray700">Description:</p>
                      <p className="text-gray600">{registration.description}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray700">Address:</p>
                      <p className="text-gray600">{registration.address}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray700">Phone:</p>
                      <p className="text-gray600">{registration.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray700">Email:</p>
                      <p className="text-gray600">{registration.email}</p>
                    </div>
                    {registration.website && (
                      <div>
                        <p className="font-medium text-gray700">Website:</p>
                        <a 
                          href={registration.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-blue-600"
                        >
                          {registration.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* All Registrations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-h2 text-primary mb-4">All Registrations</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray200">
                  {businessRegistrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray900">{registration.businessName}</div>
                          <div className="text-sm text-gray500">{registration.businessCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray600 capitalize">
                        {registration.businessType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          registration.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {registration.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray600">
                        {new Date(registration.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray600">
                        {registration.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprove(registration.id, registration.userId)}
                              disabled={isProcessing === registration.id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(registration.id, registration.userId)}
                              disabled={isProcessing === registration.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
