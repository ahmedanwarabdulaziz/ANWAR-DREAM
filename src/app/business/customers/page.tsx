/**
 * Business Customers Page
 * Shows all customers with their classes
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { AuthService, UserData } from '@/lib/auth'
import { auth, db } from '@/lib/firebase'
import { BusinessService } from '@/lib/businessService'
import { CustomerClassService } from '@/lib/customerClassService'
import { BusinessAssignment } from '@/lib/types/customerClass'
import { CustomerClass } from '@/lib/types/customerClass'

interface CustomerWithClass {
  user: UserData
  assignment: BusinessAssignment
  customerClass: CustomerClass | null
}

export default function BusinessCustomersPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [business, setBusiness] = useState<any>(null)
  const [customers, setCustomers] = useState<CustomerWithClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all')
  const [availableClasses, setAvailableClasses] = useState<CustomerClass[]>([])
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
              await loadCustomers(businessData.businessId)
              await loadClasses(businessData.businessId)
            } else {
              console.warn('Business not found for owner:', data.userId)
              router.push('/business/dashboard')
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
      const classesData = await CustomerClassService.getBusinessClasses(businessId, true, false)
      setAvailableClasses(classesData)
    } catch (error) {
      console.error('Error loading classes:', error)
    }
  }

  const loadCustomers = async (businessId: string) => {
    try {
      setIsLoading(true)
      
      // Get all users
      const usersRef = collection(db, 'users')
      const usersSnapshot = await getDocs(usersRef)
      
      const customersData: CustomerWithClass[] = []
      
      // Filter users who have this business in their businessAssignments
      usersSnapshot.forEach((userDoc) => {
        const user = userDoc.data() as UserData
        const assignments = user.businessAssignments || []
        
        // Find assignment for this business
        const assignment = assignments.find((a: BusinessAssignment) => 
          a.businessId === businessId && a.status === 'active'
        )
        
        if (assignment) {
          customersData.push({
            user,
            assignment,
            customerClass: null // Will be loaded separately
          })
        }
      })

      // Load class information for each customer
      const customersWithClasses = await Promise.all(
        customersData.map(async (customer) => {
          const customerClass = await CustomerClassService.getCustomerClass(
            businessId,
            customer.assignment.customerClassId
          )
          return {
            ...customer,
            customerClass
          }
        })
      )

      // Sort by joined date (newest first)
      customersWithClasses.sort((a, b) => 
        new Date(b.assignment.joinedAt).getTime() - new Date(a.assignment.joinedAt).getTime()
      )

      setCustomers(customersWithClasses)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter customers based on search and class filter
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = 
      customer.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.user.userId?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesClass = 
      selectedClassFilter === 'all' || 
      customer.assignment.customerClassId === selectedClassFilter

    return matchesSearch && matchesClass
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading customers...</p>
        </div>
      </div>
    )
  }

  if (!userData || !business) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-display text-h1 text-primary mb-2">
                Customers
              </h1>
              <p className="text-body text-gray600">
                Manage and view all your customers and their classes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
                {customers.length} {customers.length === 1 ? 'Customer' : 'Customers'}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or customer ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Class Filter */}
            <div className="sm:w-64">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">All Classes</option>
                {availableClasses.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-12 shadow-sm border border-gray200 text-center"
          >
            <div className="w-16 h-16 bg-gray100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-semibold text-gray900 mb-2">
              {searchQuery || selectedClassFilter !== 'all'
                ? 'No customers found'
                : 'No customers yet'}
            </h3>
            <p className="text-gray600">
              {searchQuery || selectedClassFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Customers will appear here once they join your rewards program'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Customer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {customer.user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray900 truncate">
                          {customer.user.name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray600 truncate">
                          {customer.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray50 text-gray700 border border-gray200">
                        {customer.user.userId}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      customer.assignment.status === 'active'
                        ? 'bg-green-500'
                        : customer.assignment.status === 'inactive'
                        ? 'bg-gray-300'
                        : 'bg-red-500'
                    }`}
                    title={customer.assignment.status}
                  />
                </div>

                {/* Class Info */}
                {customer.customerClass && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue700 uppercase tracking-wide">
                        Customer Class
                      </span>
                      {customer.customerClass.type === 'permanent' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Permanent
                        </span>
                      )}
                      {customer.customerClass.type === 'custom' && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray900 text-sm">
                      {customer.customerClass.name}
                    </h4>
                    {customer.customerClass.description && (
                      <p className="text-xs text-gray600 mt-1 line-clamp-2">
                        {customer.customerClass.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Points Info */}
                <div className="mb-4 p-3 bg-gray50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray600 mb-1">Total Points</p>
                      <p className="font-semibold text-gray900">
                        {customer.assignment.totalPoints.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray500">
                        ${(customer.assignment.totalPoints / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray600 mb-1">Offer Points</p>
                      <p className="font-semibold text-gray900">
                        {customer.assignment.offerPoints?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-gray500">
                        From welcome, referrals, bonuses
                      </p>
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="pt-4 border-t border-gray200">
                  <p className="text-xs text-gray600">
                    Joined:{' '}
                    <span className="font-medium text-gray900">
                      {new Date(customer.assignment.joinedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

