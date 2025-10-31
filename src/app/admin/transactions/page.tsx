/**
 * Admin Points Transactions Page
 * View all points transactions across the system
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthService, UserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { PointsTransaction } from '@/lib/types/customerClass'

interface TransactionWithDetails extends PointsTransaction {
  customerName?: string
  customerEmail?: string
  businessName?: string
}

export default function AdminTransactionsPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterBusinessId, setFilterBusinessId] = useState<string>('all')
  const [filterCustomerId, setFilterCustomerId] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'customer'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [totalTransactions, setTotalTransactions] = useState(0)
  const router = useRouter()

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (filterCustomerId && filterCustomerId !== 'all') {
        params.append('customerId', filterCustomerId)
      }
      if (filterBusinessId && filterBusinessId !== 'all') {
        params.append('businessId', filterBusinessId)
      }
      if (filterType && filterType !== 'all') {
        params.append('type', filterType)
      }
      params.append('limit', '500')

      const response = await fetch(`/api/admin/transactions?${params.toString()}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transactions')
      }

      // Enrich transactions with customer and business names
      const enrichedTransactions = await Promise.all(
        data.transactions.map(async (txn: PointsTransaction) => {
          const enriched: TransactionWithDetails = { ...txn }
          
          try {
            // Get customer info
            const customerResponse = await fetch(`/api/users?customerId=${txn.customerId}`)
            if (customerResponse.ok) {
              const customerData = await customerResponse.json()
              if (customerData.user) {
                enriched.customerName = customerData.user.name
                enriched.customerEmail = customerData.user.email
              }
            }

            // Get business info
            const businessResponse = await fetch(`/api/admin/businesses/${txn.businessId}`)
            if (businessResponse.ok) {
              const businessData = await businessResponse.json()
              if (businessData.business?.name) {
                enriched.businessName = businessData.business.name
              }
            }
          } catch (err) {
            console.error(`Error enriching transaction ${txn.transactionId}:`, err)
          }

          return enriched
        })
      )

      setTransactions(enrichedTransactions)
      setTotalTransactions(data.total)
    } catch (err: any) {
      console.error('Error loading transactions:', err)
      setError(err.message || 'Failed to load transactions')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort transactions
  const filteredAndSorted = transactions
    .filter((txn) => {
      const matchesSearch =
        !searchQuery ||
        txn.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.businessId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === 'all' || txn.type === filterType
      const matchesBusiness = filterBusinessId === 'all' || txn.businessId === filterBusinessId
      const matchesCustomer = filterCustomerId === 'all' || txn.customerId === filterCustomerId

      return matchesSearch && matchesType && matchesBusiness && matchesCustomer
    })
    .sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount)
          break
        case 'customer':
          comparison = (a.customerName || a.customerId || '').localeCompare(
            b.customerName || b.customerId || ''
          )
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const data = await AuthService.getUserData(user.uid)
          if (data && data.role === 'admin') {
            setUserData(data)
            await loadTransactions()
          } else {
            router.push('/customer/dashboard')
          }
        } catch (error) {
          console.error('Error checking user role:', error)
          router.push('/customer/signin')
        }
      } else {
        router.push('/customer/signin')
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(transactions.map((t) => t.type))).sort()
  const uniqueBusinessIds = Array.from(
    new Set(transactions.map((t) => t.businessId))
  ).sort()
  const uniqueCustomerIds = Array.from(
    new Set(transactions.map((t) => t.customerId))
  ).sort()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'welcome':
        return 'bg-blue-100 text-blue-800'
      case 'referrer':
        return 'bg-green-100 text-green-800'
      case 'referred':
        return 'bg-purple-100 text-purple-800'
      case 'purchase':
        return 'bg-orange-100 text-orange-800'
      case 'redemption':
        return 'bg-red-100 text-red-800'
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return '👋'
      case 'referrer':
        return '🎁'
      case 'referred':
        return '🎉'
      case 'purchase':
        return '🛒'
      case 'redemption':
        return '💸'
      case 'adjustment':
        return '⚙️'
      default:
        return '📝'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
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
                Points Transactions
              </h1>
              <p className="text-body text-gray600">
                View and manage all points transactions across the system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
                {totalTransactions} Total
              </div>
              <button
                onClick={loadTransactions}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
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

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Filter */}
            <div>
              <select
                value={filterBusinessId}
                onChange={(e) => setFilterBusinessId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">All Businesses</option>
                {uniqueBusinessIds.map((bid) => (
                  <option key={bid} value={bid}>
                    {bid}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={filterCustomerId}
                onChange={(e) => setFilterCustomerId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">All Customers</option>
                {uniqueCustomerIds.map((cid) => (
                  <option key={cid} value={cid}>
                    {cid}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'customer')}
                className="px-3 py-2 rounded-lg border border-gray200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-lg border border-gray200 hover:bg-gray50 transition-colors flex items-center space-x-1 text-sm"
            >
              <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
              <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
            </button>
            <div className="text-sm text-gray600">
              Showing {filteredAndSorted.length} of {transactions.length} transactions
            </div>
          </div>
        </motion.div>

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

        {/* Transactions List */}
        {filteredAndSorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-12 shadow-sm border border-gray200 text-center"
          >
            <div className="w-16 h-16 bg-gray100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray900 mb-2">
              {searchQuery || filterType !== 'all' || filterBusinessId !== 'all' || filterCustomerId !== 'all'
                ? 'No transactions found'
                : 'No transactions yet'}
            </h3>
            <p className="text-gray600">
              {searchQuery || filterType !== 'all' || filterBusinessId !== 'all' || filterCustomerId !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Transactions will appear here once customers start earning or redeeming points'}
            </p>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray50 border-b border-gray200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray200">
                  {filteredAndSorted.map((txn, index) => (
                    <motion.tr
                      key={txn.transactionId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-gray50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray600">
                          {txn.transactionId?.substring(0, 12)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray900">
                            {txn.customerName || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray500 font-mono">
                            {txn.customerId}
                          </span>
                          {txn.customerEmail && (
                            <span className="text-xs text-gray500">{txn.customerEmail}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray900">
                            {txn.businessName || txn.businessId}
                          </span>
                          <span className="text-xs text-gray500 font-mono">
                            {txn.businessId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                            txn.type
                          )}`}
                        >
                          <span className="mr-1">{getTypeIcon(txn.type)}</span>
                          {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`text-sm font-semibold ${
                            txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {txn.amount >= 0 ? '+' : ''}
                          {txn.amount.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray500">
                          ${Math.abs(txn.amount / 100).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-sm text-gray900 truncate">{txn.description}</p>
                          {txn.relatedId && (
                            <p className="text-xs text-gray500 font-mono mt-1">
                              Related: {txn.relatedId.substring(0, 12)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray600">
                        {new Date(txn.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray200">
              {filteredAndSorted.map((txn, index) => (
                <motion.div
                  key={txn.transactionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                            txn.type
                          )}`}
                        >
                          <span className="mr-1">{getTypeIcon(txn.type)}</span>
                          {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray900 mb-1">
                        {txn.customerName || 'Unknown'} ({txn.customerId})
                      </p>
                      <p className="text-xs text-gray500 mb-2">{txn.businessName || txn.businessId}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          txn.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {txn.amount >= 0 ? '+' : ''}
                        {txn.amount.toLocaleString()}
                      </span>
                      <div className="text-xs text-gray500">
                        ${Math.abs(txn.amount / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray700 mb-2">{txn.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray500">
                    <span className="font-mono">{txn.transactionId?.substring(0, 16)}...</span>
                    <span>
                      {new Date(txn.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {txn.relatedId && (
                    <p className="text-xs text-gray500 font-mono mt-1">
                      Related: {txn.relatedId.substring(0, 16)}...
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

