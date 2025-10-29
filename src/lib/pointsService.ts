/**
 * Points Distribution Service
 * Handles points distribution for welcome, referrer, and referred scenarios
 */

import { doc, setDoc, getDoc, collection, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { POINTS_TO_DOLLAR_RATE } from '@/lib/types/customerClass'
import {
  PointsTransaction,
  CustomerBusinessRelationship,
  CustomerClass,
  PointsDistribution
} from '@/lib/types/customerClass'
import { CustomerClassService } from '@/lib/customerClassService'
import { ReferralService } from '@/lib/referralService'

export interface PointsDistributionResult {
  success: boolean
  pointsDistributed: PointsDistribution
  transactions: {
    welcome?: PointsTransaction
    referrer?: PointsTransaction
    referred?: PointsTransaction
  }
}

export class PointsService {
  /**
   * Distribute welcome points to a new customer
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param classId - Customer class ID
   * @returns Promise<PointsTransaction> - Created transaction
   */
  static async distributeWelcomePoints(
    customerId: string,
    businessId: string,
    classId: string
  ): Promise<PointsTransaction> {
    try {
      // Get customer class to get welcome points
      const customerClass = await CustomerClassService.getCustomerClass(businessId, classId)
      
      if (!customerClass) {
        throw new Error(`Customer class ${classId} not found`)
      }

      const welcomePoints = customerClass.points.welcomePoints

      // Create points transaction
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      const transaction: PointsTransaction = {
        transactionId,
        customerId,
        businessId,
        amount: welcomePoints,
        type: 'welcome',
        description: `Welcome points for joining ${customerClass.name}`,
        createdAt: new Date().toISOString()
      }

      // Save transaction
      await setDoc(
        doc(db, `customers/${customerId}/transactions`, transactionId),
        transaction
      )

      // Update customer-business relationship
      await this.updateCustomerPoints(customerId, businessId, welcomePoints)

      // Update class analytics
      await CustomerClassService.incrementClassAnalytics(
        businessId,
        classId,
        'totalWelcomePointsGiven',
        welcomePoints
      )
      await CustomerClassService.incrementClassAnalytics(
        businessId,
        classId,
        'totalPointsDistributed',
        welcomePoints
      )

      // Sync points to businessAssignments array in user document
      try {
        const { CustomerBusinessService } = await import('@/lib/customerBusinessService')
        await CustomerBusinessService.syncPointsToBusinessAssignment(customerId, businessId)
      } catch (error: any) {
        console.error('Error syncing points to business assignment:', error)
        // Don't fail the transaction if sync fails
      }

      return transaction
    } catch (error: any) {
      console.error('Error distributing welcome points:', error)
      throw new Error(`Failed to distribute welcome points: ${error.message}`)
    }
  }

  /**
   * Distribute points for a referral (both referrer and referred)
   * @param referralId - Referral ID
   * @param businessId - Business ID
   * @param referrerId - Customer ID who made the referral
   * @param referredId - Customer ID who was referred
   * @param referrerClassId - Class ID of the referrer
   * @param referredClassId - Class ID of the referred customer
   * @returns Promise<PointsDistributionResult> - Distribution result
   */
  static async distributeReferralPoints(
    referralId: string,
    businessId: string,
    referrerId: string,
    referredId: string,
    referrerClassId: string,
    referredClassId: string
  ): Promise<PointsDistributionResult> {
    try {
      // Get both classes
      const referrerClass = await CustomerClassService.getCustomerClass(businessId, referrerClassId)
      const referredClass = await CustomerClassService.getCustomerClass(businessId, referredClassId)

      if (!referrerClass || !referredClass) {
        throw new Error('Customer classes not found')
      }

      const referrerPoints = referrerClass.points.referrerPoints
      const referredPoints = referredClass.points.referredPoints
      
      console.log(`📋 Class points configuration:`, {
        referrerClass: referrerClass.name,
        referrerClassId: referrerClassId,
        referrerPoints,
        referredClass: referredClass.name,
        referredClassId: referredClassId,
        referredPoints
      })

      const transactions: PointsDistributionResult['transactions'] = {}

      // Distribute points to referrer
      if (referrerPoints > 0) {
        console.log(`💰 Distributing ${referrerPoints} points to referrer ${referrerId}...`)
        
        // Verify referrer has relationship with business before distributing points
        const { CustomerBusinessService } = await import('@/lib/customerBusinessService')
        const referrerRelationship = await CustomerBusinessService.getRelationship(referrerId, businessId)
        
        if (!referrerRelationship) {
          console.error(`❌ Referrer ${referrerId} does not have relationship with business ${businessId}`)
          throw new Error(`Referrer ${referrerId} must have a relationship with business ${businessId} to receive referral points`)
        }
        
        console.log(`✅ Referrer relationship verified: ${referrerId} -> ${businessId} (class: ${referrerClassId})`)
        
        const referrerTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        const referrerTransaction: PointsTransaction = {
          transactionId: referrerTransactionId,
          customerId: referrerId,
          businessId,
          amount: referrerPoints,
          type: 'referrer',
          description: `Referral bonus for referring ${referredId}`,
          relatedId: referralId,
          createdAt: new Date().toISOString()
        }

        await setDoc(
          doc(db, `customers/${referrerId}/transactions`, referrerTransactionId),
          referrerTransaction
        )
        console.log(`✅ Created referrer transaction: ${referrerTransactionId}`)

        await this.updateCustomerPoints(referrerId, businessId, referrerPoints)
        console.log(`✅ Updated referrer points: ${referrerId} received ${referrerPoints} points`)

        // Update referrer class analytics
        await CustomerClassService.incrementClassAnalytics(
          businessId,
          referrerClassId,
          'totalReferrerPointsGiven',
          referrerPoints
        )
        await CustomerClassService.incrementClassAnalytics(
          businessId,
          referrerClassId,
          'totalPointsDistributed',
          referrerPoints
        )

        // Sync points to businessAssignments array in user document
        try {
          const { CustomerBusinessService } = await import('@/lib/customerBusinessService')
          await CustomerBusinessService.syncPointsToBusinessAssignment(referrerId, businessId)
        } catch (error: any) {
          console.error('Error syncing points to business assignment:', error)
          // Don't fail the transaction if sync fails
        }

        transactions.referrer = referrerTransaction

        // Update referral link stats (non-blocking)
        try {
          await ReferralService.updateReferralLinkStats(
            referrerId,
            businessId,
            referrerPoints
          )
        } catch (linkStatsError: any) {
          console.error(`⚠️ Failed to update referral link stats for ${referrerId}:`, linkStatsError)
          // Don't fail the transaction - points are already distributed
        }
      } else {
        console.log(`ℹ️ Referrer points is 0 for ${referrerId} (class: ${referrerClassId})`)
      }

      // Distribute points to referred customer
      if (referredPoints > 0) {
        console.log(`💰 Distributing ${referredPoints} points to referred customer ${referredId}...`)
        
        const referredTransactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
        const referredTransaction: PointsTransaction = {
          transactionId: referredTransactionId,
          customerId: referredId,
          businessId,
          amount: referredPoints,
          type: 'referred',
          description: `Referral bonus for being referred by ${referrerId}`,
          relatedId: referralId,
          createdAt: new Date().toISOString()
        }

        await setDoc(
          doc(db, `customers/${referredId}/transactions`, referredTransactionId),
          referredTransaction
        )
        console.log(`✅ Created referred transaction: ${referredTransactionId}`)

        await this.updateCustomerPoints(referredId, businessId, referredPoints)
        console.log(`✅ Updated referred customer points: ${referredId} received ${referredPoints} points`)

        // Update referred class analytics
        await CustomerClassService.incrementClassAnalytics(
          businessId,
          referredClassId,
          'totalReferredPointsGiven',
          referredPoints
        )
        await CustomerClassService.incrementClassAnalytics(
          businessId,
          referredClassId,
          'totalPointsDistributed',
          referredPoints
        )

        // Sync points to businessAssignments array in user document
        try {
          const { CustomerBusinessService } = await import('@/lib/customerBusinessService')
          await CustomerBusinessService.syncPointsToBusinessAssignment(referredId, businessId)
        } catch (error: any) {
          console.error('Error syncing points to business assignment:', error)
          // Don't fail the transaction if sync fails
        }

        transactions.referred = referredTransaction
      }

      // Complete the referral
      await ReferralService.completeReferral(
        referralId,
        businessId,
        {
          referrerReceived: referrerPoints,
          referredReceived: referredPoints,
          distributedAt: new Date().toISOString()
        }
      )

      // Final verification log
      console.log('✅ Referral points distribution completed:', {
        referralId,
        referrerId,
        referredId,
        referrerPointsReceived: referrerPoints,
        referredPointsReceived: referredPoints,
        referrerTransactionId: transactions.referrer?.transactionId,
        referredTransactionId: transactions.referred?.transactionId
      })

      return {
        success: true,
        pointsDistributed: {
          referrerReceived: referrerPoints,
          referredReceived: referredPoints,
          distributedAt: new Date().toISOString()
        },
        transactions
      }
    } catch (error: any) {
      console.error('Error distributing referral points:', error)
      throw new Error(`Failed to distribute referral points: ${error.message}`)
    }
  }

  /**
   * Update customer points in customer-business relationship
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param points - Points to add (can be negative for redemption)
   * @returns Promise<void>
   */
  static async updateCustomerPoints(
    customerId: string,
    businessId: string,
    points: number
  ): Promise<void> {
    try {
      const relationshipRef = doc(
        db,
        `customers/${customerId}/businesses`,
        businessId
      )

      const relationshipDoc = await getDoc(relationshipRef)

      if (!relationshipDoc.exists()) {
        throw new Error('Customer-business relationship not found')
      }

      const currentData = relationshipDoc.data() as CustomerBusinessRelationship
      const newTotalPoints = currentData.totalPoints + points
      const newTotalPointsValue = newTotalPoints / POINTS_TO_DOLLAR_RATE

      // Update points
      await updateDoc(relationshipRef, {
        totalPoints: newTotalPoints,
        totalPointsValue: newTotalPointsValue,
        totalPointsEarned: points > 0 
          ? currentData.totalPointsEarned + points 
          : currentData.totalPointsEarned,
        totalPointsRedeemed: points < 0 
          ? currentData.totalPointsRedeemed + Math.abs(points)
          : currentData.totalPointsRedeemed
      })
    } catch (error: any) {
      console.error('Error updating customer points:', error)
      throw new Error(`Failed to update customer points: ${error.message}`)
    }
  }

  /**
   * Redeem points (negative transaction)
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param amount - Points to redeem (positive number)
   * @param description - Description of redemption
   * @returns Promise<PointsTransaction> - Created transaction
   */
  static async redeemPoints(
    customerId: string,
    businessId: string,
    amount: number,
    description: string
  ): Promise<PointsTransaction> {
    try {
      // Check if customer has enough points
      const relationshipRef = doc(
        db,
        `customers/${customerId}/businesses`,
        businessId
      )

      const relationshipDoc = await getDoc(relationshipRef)

      if (!relationshipDoc.exists()) {
        throw new Error('Customer-business relationship not found')
      }

      const relationship = relationshipDoc.data() as CustomerBusinessRelationship

      if (relationship.totalPoints < amount) {
        throw new Error('Insufficient points')
      }

      // Create redemption transaction (negative amount)
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      const transaction: PointsTransaction = {
        transactionId,
        customerId,
        businessId,
        amount: -amount, // Negative for redemption
        type: 'redemption',
        description,
        createdAt: new Date().toISOString()
      }

      // Save transaction
      await setDoc(
        doc(db, `customers/${customerId}/transactions`, transactionId),
        transaction
      )

      // Update customer points
      await this.updateCustomerPoints(customerId, businessId, -amount)

      return transaction
    } catch (error: any) {
      console.error('Error redeeming points:', error)
      throw new Error(`Failed to redeem points: ${error.message}`)
    }
  }

  /**
   * Get customer points for a specific business
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<number> - Total points
   */
  static async getCustomerPoints(
    customerId: string,
    businessId: string
  ): Promise<number> {
    try {
      const relationshipRef = doc(
        db,
        `customers/${customerId}/businesses`,
        businessId
      )

      const relationshipDoc = await getDoc(relationshipRef)

      if (!relationshipDoc.exists()) {
        return 0
      }

      const relationship = relationshipDoc.data() as CustomerBusinessRelationship
      return relationship.totalPoints
    } catch (error) {
      console.error('Error getting customer points:', error)
      return 0
    }
  }

  /**
   * Get all transactions for a customer and business
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<PointsTransaction[]> - Array of transactions
   */
  static async getCustomerTransactions(
    customerId: string,
    businessId: string
  ): Promise<PointsTransaction[]> {
    try {
      const transactionsRef = collection(db, `customers/${customerId}/transactions`)
      const snapshot = await getDocs(transactionsRef)

      const transactions: PointsTransaction[] = []
      snapshot.forEach((doc) => {
        const transaction = doc.data() as PointsTransaction
        if (transaction.businessId === businessId) {
          transactions.push(transaction)
        }
      })

      // Sort by date (newest first)
      transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return transactions
    } catch (error) {
      console.error('Error getting customer transactions:', error)
      return []
    }
  }
}

export default PointsService

