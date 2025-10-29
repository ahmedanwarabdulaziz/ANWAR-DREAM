/**
 * Public Customer Utility
 * Utility functions for retroactively adding existing BC customers to businesses
 */

import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BusinessService } from '@/lib/businessService'
import { UserData } from '@/lib/auth'

/**
 * Retroactively add all existing BC customers to businesses with allowPublicCustomer: true
 * This is a one-time migration utility
 * WARNING: This can be slow if there are many customers. Use with caution.
 * @returns Promise<{ processed: number; joined: number; errors: number }>
 */
export async function retroactivelyAddExistingCustomers(): Promise<{
  processed: number
  joined: number
  errors: number
}> {
  const stats = {
    processed: 0,
    joined: 0,
    errors: 0
  }

  try {
    console.log('🚀 Starting retroactive customer addition process...')

    // Get all users
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)

    const bcCustomers: UserData[] = []
    snapshot.forEach((doc) => {
      const userData = doc.data() as UserData
      // Only process customers with BC prefix who signed up publicly
      if (userData.userId.startsWith('BC') && userData.public === true) {
        bcCustomers.push(userData)
      }
    })

    console.log(`📋 Found ${bcCustomers.length} BC customers to process`)

    // Process each customer
    for (const customer of bcCustomers) {
      stats.processed++
      try {
        console.log(`\n[${stats.processed}/${bcCustomers.length}] Processing customer ${customer.userId}...`)
        await BusinessService.autoJoinPublicCustomerToBusinesses(customer.userId)
        stats.joined++
        console.log(`✅ Customer ${customer.userId} processed successfully`)
      } catch (error: any) {
        stats.errors++
        console.error(`❌ Error processing customer ${customer.userId}:`, error)
      }
    }

    console.log('\n📊 Retroactive addition completed!')
    console.log(`✅ Processed: ${stats.processed}`)
    console.log(`✅ Successfully joined: ${stats.joined}`)
    console.log(`❌ Errors: ${stats.errors}`)

    return stats
  } catch (error: any) {
    console.error('❌ Critical error in retroactive addition:', error)
    throw error
  }
}

export default {
  retroactivelyAddExistingCustomers
}

