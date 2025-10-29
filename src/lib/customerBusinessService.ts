/**
 * Customer Business Relationship Service
 * Manages relationships between customers and businesses
 */

import { doc, setDoc, getDoc, collection, getDocs, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { POINTS_TO_DOLLAR_RATE } from '@/lib/types/customerClass'
import {
  CustomerBusinessRelationship,
  ClassHistoryEntry,
  BusinessAssignment
} from '@/lib/types/customerClass'
import { CustomerClassService } from '@/lib/customerClassService'
import { ReferralService } from '@/lib/referralService'
import { PointsService } from '@/lib/pointsService'

export interface CreateRelationshipData {
  customerId: string
  businessId: string
  classId: string
  referrerId?: string
  referredBy?: string
}

export class CustomerBusinessService {
  /**
   * Create a customer-business relationship
   * @param data - Relationship data
   * @returns Promise<CustomerBusinessRelationship> - Created relationship
   */
  static async createRelationship(
    data: CreateRelationshipData
  ): Promise<CustomerBusinessRelationship> {
    try {
      // Verify class exists
      const customerClass = await CustomerClassService.getCustomerClass(
        data.businessId,
        data.classId
      )

      if (!customerClass) {
        throw new Error(`Customer class ${data.classId} not found`)
      }

      const relationshipRef = doc(
        db,
        `customers/${data.customerId}/businesses`,
        data.businessId
      )

      // Check if relationship already exists
      const existingRelationship = await getDoc(relationshipRef)

      if (existingRelationship.exists()) {
        throw new Error('Customer-business relationship already exists')
      }

      // Create class history entry
      const classHistory: ClassHistoryEntry[] = [
        {
          classId: data.classId,
          joinedAt: new Date().toISOString(),
          reason: data.referrerId ? 'referral' : 'initial_signup'
        }
      ]

      // Create relationship document (only include optional fields if they exist)
      const relationship: CustomerBusinessRelationship = {
        customerId: data.customerId,
        businessId: data.businessId,
        customerClassId: data.classId,
        joinedAt: new Date().toISOString(),
        status: 'active',
        totalPoints: 0,
        totalPointsEarned: 0,
        totalPointsRedeemed: 0,
        totalPointsValue: 0,
        totalVisits: 0,
        classHistory
      }

      // Add optional fields only if they exist
      if (data.referrerId) {
        relationship.referrerId = data.referrerId
      }
      if (data.referredBy) {
        relationship.referredBy = data.referredBy
      }
      if (data.referrerId) {
        relationship.referralDate = new Date().toISOString()
      }

      await setDoc(relationshipRef, relationship)
      console.log('✅ Relationship document created in subcollection')

      // Sync business assignment to user document (with retry for timing issues)
      try {
        await this.syncBusinessAssignmentToUser(
          data.customerId,
          data.businessId,
          data.classId,
          'active',
          relationship.joinedAt
        )
        console.log('✅ Business assignment synced to user document')
      } catch (syncError: any) {
        console.error('❌ Failed to sync business assignment:', syncError)
        // Don't fail the entire relationship creation if sync fails
        // But log it clearly so we can debug
      }

      // Create referral link for this customer and business
      await ReferralService.getOrCreateReferralLink(
        data.customerId,
        data.businessId,
        data.classId
      )

      // Distribute welcome points
      await PointsService.distributeWelcomePoints(
        data.customerId,
        data.businessId,
        data.classId
      )

      // Update customer points value
      await updateDoc(relationshipRef, {
        totalPoints: customerClass.points.welcomePoints,
        totalPointsEarned: customerClass.points.welcomePoints,
        totalPointsValue: customerClass.points.welcomePoints / POINTS_TO_DOLLAR_RATE
      })

      // Sync points to businessAssignments array after welcome points are distributed
      try {
        await this.syncPointsToBusinessAssignment(data.customerId, data.businessId)
      } catch (error: any) {
        console.error('Error syncing points after welcome points:', error)
        // Don't fail the relationship creation
      }

      // Update class analytics: increment customer count
      try {
        await CustomerClassService.incrementClassAnalytics(
          data.businessId,
          data.classId,
          'totalCustomers',
          1
        )
        console.log('✅ Updated class customer count')
      } catch (error: any) {
        console.error('❌ Failed to update class customer count:', error)
        // Don't fail the entire relationship creation
      }

      // Get updated relationship
      const updatedDoc = await getDoc(relationshipRef)
      return updatedDoc.data() as CustomerBusinessRelationship
    } catch (error: any) {
      console.error('Error creating customer-business relationship:', error)
      throw new Error(`Failed to create relationship: ${error.message}`)
    }
  }

  /**
   * Get customer-business relationship
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<CustomerBusinessRelationship | null> - Relationship or null if not found
   */
  static async getRelationship(
    customerId: string,
    businessId: string
  ): Promise<CustomerBusinessRelationship | null> {
    try {
      const relationshipRef = doc(
        db,
        `customers/${customerId}/businesses`,
        businessId
      )

      const relationshipDoc = await getDoc(relationshipRef)

      if (!relationshipDoc.exists()) {
        return null
      }

      return relationshipDoc.data() as CustomerBusinessRelationship
    } catch (error) {
      console.error('Error getting customer-business relationship:', error)
      return null
    }
  }

  /**
   * Get all businesses a customer is part of
   * @param customerId - Customer ID
   * @returns Promise<CustomerBusinessRelationship[]> - Array of relationships
   */
  static async getCustomerBusinesses(
    customerId: string
  ): Promise<CustomerBusinessRelationship[]> {
    try {
      const relationshipsRef = collection(db, `customers/${customerId}/businesses`)
      const snapshot = await getDocs(relationshipsRef)

      const relationships: CustomerBusinessRelationship[] = []
      snapshot.forEach((doc) => {
        relationships.push(doc.data() as CustomerBusinessRelationship)
      })

      // Sort by joined date (newest first)
      relationships.sort((a, b) => 
        new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      )

      return relationships
    } catch (error) {
      console.error('Error getting customer businesses:', error)
      return []
    }
  }

  /**
   * Get all customers for a business
   * @param businessId - Business ID
   * @returns Promise<CustomerBusinessRelationship[]> - Array of relationships
   */
  static async getBusinessCustomers(
    businessId: string
  ): Promise<CustomerBusinessRelationship[]> {
    try {
      // This is a more complex query since we need to search across all customers
      // In production, you might want to maintain a separate collection for this
      // For now, we'll return an empty array and note this limitation
      console.warn('Getting all customers for a business requires a different approach')
      return []
    } catch (error) {
      console.error('Error getting business customers:', error)
      return []
    }
  }

  /**
   * Update customer class (migration)
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param newClassId - New class ID
   * @param reason - Reason for migration
   * @returns Promise<void>
   */
  static async updateCustomerClass(
    customerId: string,
    businessId: string,
    newClassId: string,
    reason: 'task_completed' | 'manual' | 'points_threshold' | 'system'
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

      const relationship = relationshipDoc.data() as CustomerBusinessRelationship

      // Update class history
      const updatedHistory = relationship.classHistory.map((entry) => {
        if (entry.classId === relationship.customerClassId && !entry.migratedAt) {
          return {
            ...entry,
            migratedAt: new Date().toISOString()
          }
        }
        return entry
      })

      // Add new class history entry
      updatedHistory.push({
        classId: newClassId,
        joinedAt: new Date().toISOString(),
        reason
      })

      // Update relationship
      await updateDoc(relationshipRef, {
        customerClassId: newClassId,
        classHistory: updatedHistory
      })

      // Update class analytics: decrement old class, increment new class
      try {
        if (relationship.customerClassId !== newClassId) {
          // Decrement old class customer count
          await CustomerClassService.incrementClassAnalytics(
            businessId,
            relationship.customerClassId,
            'totalCustomers',
            -1
          )
          // Increment new class customer count
          await CustomerClassService.incrementClassAnalytics(
            businessId,
            newClassId,
            'totalCustomers',
            1
          )
          console.log(`✅ Updated class counts: removed from ${relationship.customerClassId}, added to ${newClassId}`)
        }
      } catch (error: any) {
        console.error('❌ Failed to update class customer counts during migration:', error)
        // Don't fail the migration
      }

      // Sync updated class to user document
      await this.syncBusinessAssignmentToUser(
        customerId,
        businessId,
        newClassId,
        relationship.status,
        relationship.joinedAt // Use original joinedAt
      )

      // Update referral link with new class
      await ReferralService.getOrCreateReferralLink(
        customerId,
        businessId,
        newClassId
      )
    } catch (error: any) {
      console.error('Error updating customer class:', error)
      throw new Error(`Failed to update customer class: ${error.message}`)
    }
  }

  /**
   * Update customer visit count
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<void>
   */
  static async recordVisit(
    customerId: string,
    businessId: string
  ): Promise<void> {
    try {
      const relationshipRef = doc(
        db,
        `customers/${customerId}/businesses`,
        businessId
      )

      await updateDoc(relationshipRef, {
        totalVisits: increment(1),
        lastVisit: new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error recording visit:', error)
      throw new Error(`Failed to record visit: ${error.message}`)
    }
  }

  /**
   * Calculate offer points from transactions
   * Offer points = points from welcome, referrer, referred, adjustment (admin/task bonuses)
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<number> - Total offer points
   */
  private static async calculateOfferPoints(
    customerId: string,
    businessId: string
  ): Promise<number> {
    try {
      const transactionsRef = collection(db, `customers/${customerId}/transactions`)
      const snapshot = await getDocs(transactionsRef)

      let offerPoints = 0
      snapshot.forEach((doc) => {
        const transaction = doc.data()
        // Only count transactions for this business
        if (transaction.businessId === businessId && transaction.amount > 0) {
          // Offer points come from: welcome, referrer, referred, adjustment
          if (['welcome', 'referrer', 'referred', 'adjustment'].includes(transaction.type)) {
            offerPoints += transaction.amount
          }
        }
      })

      return offerPoints
    } catch (error) {
      console.error('Error calculating offer points:', error)
      return 0
    }
  }

  /**
   * Sync business assignment to user document with points tracking
   * Keeps user.businessAssignments array in sync with relationship subcollection
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param customerClassId - Customer Class ID
   * @param status - Relationship status
   * @param joinedAt - Join timestamp (optional, will fetch if not provided)
   * @returns Promise<void>
   */
  private static async syncBusinessAssignmentToUser(
    customerId: string,
    businessId: string,
    customerClassId: string,
    status: 'active' | 'inactive' | 'suspended',
    joinedAt?: string
  ): Promise<void> {
    try {
      // Retry logic: Wait for user document to exist (handles timing issues during signup)
      let userRef = doc(db, 'users', customerId)
      let userDoc = await getDoc(userRef)
      
      // Retry up to 3 times if user document doesn't exist yet
      let retries = 0
      while (!userDoc.exists() && retries < 3) {
        await new Promise(resolve => setTimeout(resolve, 200))
        userDoc = await getDoc(userRef)
        retries++
      }

      if (!userDoc.exists()) {
        console.error(`User ${customerId} not found when syncing business assignment after ${retries} retries`)
        throw new Error(`User document not found: ${customerId}`)
      }

      const userData = userDoc.data()
      const businessAssignments = (userData.businessAssignments || []) as BusinessAssignment[]

      // Find existing assignment for this business
      const existingIndex = businessAssignments.findIndex(
        (assignment) => assignment.businessId === businessId
      )

      // Use provided joinedAt or fetch from relationship
      let finalJoinedAt = joinedAt
      let relationship: CustomerBusinessRelationship | null = null
      if (!finalJoinedAt) {
        relationship = await this.getRelationship(customerId, businessId)
        finalJoinedAt = relationship?.joinedAt || new Date().toISOString()
      } else {
        relationship = await this.getRelationship(customerId, businessId)
      }

      // Calculate points from transactions
      const offerPoints = await this.calculateOfferPoints(customerId, businessId)
      const purchasePoints = 0 // Will be implemented later
      const totalPoints = offerPoints + purchasePoints

      // If relationship exists, use its totalPoints as fallback (for backward compatibility)
      const finalTotalPoints = relationship?.totalPoints ?? totalPoints
      const finalOfferPoints = offerPoints
      const finalPurchasePoints = purchasePoints

      const businessAssignment: BusinessAssignment = {
        businessId,
        customerClassId,
        joinedAt: finalJoinedAt,
        status,
        offerPoints: finalOfferPoints,
        purchasePoints: finalPurchasePoints,
        totalPoints: finalTotalPoints
      }

      if (existingIndex >= 0) {
        // Update existing assignment
        businessAssignments[existingIndex] = businessAssignment
      } else {
        // Add new assignment
        businessAssignments.push(businessAssignment)
      }

      // Update user document
      await updateDoc(userRef, {
        businessAssignments,
        public: false // Also update public flag if it wasn't set
      })
      
      console.log(`✅ Synced business assignment: ${businessId} -> ${customerId}`, {
        businessId,
        customerClassId,
        status,
        joinedAt: finalJoinedAt
      })
      
      // Verify the update was successful
      const verifyDoc = await getDoc(userRef)
      if (verifyDoc.exists()) {
        const verifyData = verifyDoc.data()
        const verifyAssignments = verifyData.businessAssignments || []
        const found = verifyAssignments.some((a: BusinessAssignment) => 
          a.businessId === businessId && a.customerClassId === customerClassId
        )
        if (!found) {
          console.error(`❌ Verification failed: Assignment not found after sync!`)
          throw new Error(`Failed to verify business assignment sync`)
        }
        console.log(`✅ Verified: Assignment found in user document`)
      }
    } catch (error: any) {
      console.error('❌ Error syncing business assignment to user:', error)
      console.error('Details:', {
        customerId,
        businessId,
        customerClassId,
        status,
        error: error.message,
        stack: error.stack
      })
      // Re-throw to surface the error during signup
      throw error
    }
  }

  /**
   * Remove business assignment from user document
   * Called when relationship is deleted
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<void>
   */
  static async removeBusinessAssignmentFromUser(
    customerId: string,
    businessId: string
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', customerId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return
      }

      const userData = userDoc.data()
      const businessAssignments = (userData.businessAssignments || []) as Array<{
        businessId: string
        customerClassId: string
        joinedAt: string
        status: string
      }>

      // Remove assignment for this business
      const updatedAssignments = businessAssignments.filter(
        (assignment) => assignment.businessId !== businessId
      )

      // Update user document
      await updateDoc(userRef, {
        businessAssignments: updatedAssignments
      })
    } catch (error: any) {
      console.error('Error removing business assignment from user:', error)
      // Don't throw - this is a sync operation
    }
  }

  /**
   * Rebuild businessAssignments array from relationship subcollection with points
   * Useful for fixing inconsistencies or migration
   * @param customerId - Customer ID
   * @returns Promise<void>
   */
  static async rebuildBusinessAssignmentsFromRelationships(
    customerId: string
  ): Promise<void> {
    try {
      const relationships = await this.getCustomerBusinesses(customerId)

      const businessAssignments = await Promise.all(
        relationships.map(async (rel) => {
          // Calculate points for each relationship
          const offerPoints = await this.calculateOfferPoints(customerId, rel.businessId)
          const purchasePoints = 0 // Will be implemented later
          const totalPoints = offerPoints + purchasePoints

          return {
            businessId: rel.businessId,
            customerClassId: rel.customerClassId,
            joinedAt: rel.joinedAt,
            status: rel.status,
            offerPoints,
            purchasePoints,
            totalPoints: rel.totalPoints ?? totalPoints // Use relationship totalPoints as fallback
          } as BusinessAssignment
        })
      )

      const userRef = doc(db, 'users', customerId)
      await updateDoc(userRef, {
        businessAssignments
      })
    } catch (error: any) {
      console.error('Error rebuilding business assignments:', error)
      throw new Error(`Failed to rebuild business assignments: ${error.message}`)
    }
  }

  /**
   * Sync points for a specific business assignment
   * Called after points transactions to update businessAssignments array
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<void>
   */
  static async syncPointsToBusinessAssignment(
    customerId: string,
    businessId: string
  ): Promise<void> {
    try {
      // Get relationship to get current class and status
      const relationship = await this.getRelationship(customerId, businessId)
      if (!relationship) {
        console.log(`⚠️ No relationship found for ${customerId} -> ${businessId}, skipping points sync`)
        return
      }

      // Sync the assignment with updated points
      await this.syncBusinessAssignmentToUser(
        customerId,
        businessId,
        relationship.customerClassId,
        relationship.status,
        relationship.joinedAt
      )

      console.log(`✅ Synced points for ${customerId} -> ${businessId}`)
    } catch (error: any) {
      console.error('Error syncing points to business assignment:', error)
      // Don't throw - this is a sync operation
    }
  }
}

export default CustomerBusinessService

