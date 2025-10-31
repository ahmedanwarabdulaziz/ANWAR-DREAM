import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/server/firebase-admin'

export async function GET(req: NextRequest) {
  try {
    const db = adminDb()
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId') || ''
    const businessId = searchParams.get('businessId') || ''
    const type = searchParams.get('type') || ''
    const limit = parseInt(searchParams.get('limit') || '100', 10)

    // Get all users to find their customer IDs
    const usersSnapshot = await db.collection('users').get()
    const customerIds = new Set<string>()
    
    usersSnapshot.forEach((userDoc) => {
      const userId = userDoc.id
      if (userId) {
        customerIds.add(userId)
      }
    })

    // Collect all transactions from all customers
    // Transactions are stored in /customers/{customerId}/transactions/{transactionId}
    const allTransactions: any[] = []
    
    for (const customerIdValue of customerIds) {
      try {
        // Skip if filtering by customer ID and doesn't match
        if (customerId && customerIdValue !== customerId) {
          continue
        }

        // Check if customers collection exists (it's a subcollection path)
        const customersRef = db.collection('customers')
        const customerDoc = customersRef.doc(customerIdValue)
        const transactionsRef = customerDoc.collection('transactions')
        
        const transactionsSnapshot = await transactionsRef.get()

        if (transactionsSnapshot.empty) {
          continue
        }

        transactionsSnapshot.forEach((transactionDoc) => {
          const transaction = transactionDoc.data()
          
          // Apply filters
          if (businessId && transaction.businessId !== businessId) {
            return
          }
          if (type && transaction.type !== type) {
            return
          }

          allTransactions.push({
            id: transactionDoc.id,
            ...transaction
          })
        })
      } catch (error) {
        // Skip customers that don't have transactions subcollection
        // This is expected for many customers
      }
    }

    // Sort by date (newest first)
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateB - dateA
    })

    // Apply limit
    const limitedTransactions = allTransactions.slice(0, limit)

    return NextResponse.json({
      success: true,
      transactions: limitedTransactions,
      total: allTransactions.length,
      returned: limitedTransactions.length
    })
  } catch (error: any) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    )
  }
}

