/**
 * Class Migration Service
 * Handles customer class migrations: task-based, manual, and automatic (points threshold)
 */

import { doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  ClassMigration,
  MigrationTrigger,
  CustomerBusinessRelationship,
  CustomerClass
} from '@/lib/types/customerClass'
import { CustomerBusinessService } from '@/lib/customerBusinessService'
import { CustomerClassService } from '@/lib/customerClassService'
import { ReferralService } from '@/lib/referralService'

export interface MigrationResult {
  success: boolean
  migration: ClassMigration
  previousClass: string
  newClass: string
}

export class ClassMigrationService {
  /**
   * Migrate customer to a new class (manual or task-based)
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param toClassId - Target class ID
   * @param reason - Reason for migration
   * @param initiatedBy - Who initiated the migration
   * @param taskId - Task ID if reason is 'task_completed'
   * @param notes - Optional notes
   * @returns Promise<MigrationResult> - Migration result
   */
  static async migrateCustomer(
    customerId: string,
    businessId: string,
    toClassId: string,
    reason: 'task_completed' | 'manual' | 'points_threshold' | 'system',
    initiatedBy: 'customer' | 'business' | 'system',
    taskId?: string,
    notes?: string
  ): Promise<MigrationResult> {
    try {
      // Get current relationship
      const relationship = await CustomerBusinessService.getRelationship(
        customerId,
        businessId
      )

      if (!relationship) {
        throw new Error('Customer-business relationship not found')
      }

      const fromClassId = relationship.customerClassId

      // Check if already in target class
      if (fromClassId === toClassId) {
        throw new Error('Customer is already in this class')
      }

      // Verify target class exists
      const targetClass = await CustomerClassService.getCustomerClass(businessId, toClassId)
      if (!targetClass) {
        throw new Error(`Target class ${toClassId} not found`)
      }

      // Create migration record
      const migrationId = `MIG${Date.now()}${Math.random().toString(36).substr(2, 9)}`
      const migration: ClassMigration = {
        migrationId,
        businessId,
        customerId,
        fromClassId,
        toClassId,
        reason,
        initiatedBy,
        taskId,
        pointsAtMigration: relationship.totalPoints,
        createdAt: new Date().toISOString(),
        notes
      }

      // Save migration record
      await setDoc(
        doc(db, `businesses/${businessId}/classMigrations`, migrationId),
        migration
      )

      // Update customer relationship
      await CustomerBusinessService.updateCustomerClass(
        customerId,
        businessId,
        toClassId,
        reason
      )

      return {
        success: true,
        migration,
        previousClass: fromClassId,
        newClass: toClassId
      }
    } catch (error: any) {
      console.error('Error migrating customer:', error)
      throw new Error(`Failed to migrate customer: ${error.message}`)
    }
  }

  /**
   * Create a migration trigger for automatic migrations
   * @param triggerData - Migration trigger data
   * @returns Promise<MigrationTrigger> - Created trigger
   */
  static async createMigrationTrigger(
    triggerData: {
      businessId: string
      fromClassId: string
      toClassId: string
      triggerType: 'points_threshold' | 'visit_count' | 'spend_amount'
      thresholdValue: number
    }
  ): Promise<MigrationTrigger> {
    try {
      const triggerId = `TRIG${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      const trigger: MigrationTrigger = {
        triggerId,
        businessId: triggerData.businessId,
        fromClassId: triggerData.fromClassId,
        toClassId: triggerData.toClassId,
        triggerType: triggerData.triggerType,
        thresholdValue: triggerData.thresholdValue,
        isActive: true,
        createdAt: new Date().toISOString()
      }

      await setDoc(
        doc(db, `businesses/${triggerData.businessId}/migrationTriggers`, triggerId),
        trigger
      )

      return trigger
    } catch (error: any) {
      console.error('Error creating migration trigger:', error)
      throw new Error(`Failed to create migration trigger: ${error.message}`)
    }
  }

  /**
   * Check and execute automatic migrations based on triggers
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<MigrationResult[]> - Array of migrations executed
   */
  static async checkAutomaticMigrations(
    customerId: string,
    businessId: string
  ): Promise<MigrationResult[]> {
    try {
      const relationship = await CustomerBusinessService.getRelationship(
        customerId,
        businessId
      )

      if (!relationship) {
        return []
      }

      // Get all active triggers for this business and source class
      const triggersRef = collection(db, `businesses/${businessId}/migrationTriggers`)
      const snapshot = await getDocs(triggersRef)

      const migrations: MigrationResult[] = []

      snapshot.forEach((doc) => {
        const trigger = doc.data() as MigrationTrigger

        // Check if trigger applies to this customer
        if (
          trigger.isActive &&
          trigger.fromClassId === relationship.customerClassId
        ) {
          let shouldMigrate = false

          switch (trigger.triggerType) {
            case 'points_threshold':
              shouldMigrate = relationship.totalPoints >= trigger.thresholdValue
              break

            case 'visit_count':
              shouldMigrate = relationship.totalVisits >= trigger.thresholdValue
              break

            case 'spend_amount':
              // Calculate spend from points redeemed (assuming 100 points = $1)
              const spendAmount = relationship.totalPointsRedeemed / 100
              shouldMigrate = spendAmount >= trigger.thresholdValue
              break
          }

          if (shouldMigrate) {
            // Execute migration
            this.migrateCustomer(
              customerId,
              businessId,
              trigger.toClassId,
              'points_threshold',
              'system'
            ).then((result) => {
              migrations.push(result)
            }).catch((error) => {
              console.error('Error executing automatic migration:', error)
            })
          }
        }
      })

      return migrations
    } catch (error: any) {
      console.error('Error checking automatic migrations:', error)
      return []
    }
  }

  /**
   * Manually migrate customer (by business owner)
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param toClassId - Target class ID
   * @param notes - Optional notes
   * @returns Promise<MigrationResult> - Migration result
   */
  static async manualMigration(
    customerId: string,
    businessId: string,
    toClassId: string,
    notes?: string
  ): Promise<MigrationResult> {
    return await this.migrateCustomer(
      customerId,
      businessId,
      toClassId,
      'manual',
      'business',
      undefined,
      notes
    )
  }

  /**
   * Migrate customer after completing a task
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param toClassId - Target class ID
   * @param taskId - Task ID
   * @returns Promise<MigrationResult> - Migration result
   */
  static async taskBasedMigration(
    customerId: string,
    businessId: string,
    toClassId: string,
    taskId: string
  ): Promise<MigrationResult> {
    return await this.migrateCustomer(
      customerId,
      businessId,
      toClassId,
      'task_completed',
      'customer',
      taskId
    )
  }

  /**
   * Get migration history for a customer
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<ClassMigration[]> - Array of migrations
   */
  static async getMigrationHistory(
    customerId: string,
    businessId: string
  ): Promise<ClassMigration[]> {
    try {
      const migrationsRef = collection(db, `businesses/${businessId}/classMigrations`)
      const snapshot = await getDocs(
        query(migrationsRef, where('customerId', '==', customerId))
      )

      const migrations: ClassMigration[] = []
      snapshot.forEach((doc) => {
        migrations.push(doc.data() as ClassMigration)
      })

      // Sort by date (newest first)
      migrations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return migrations
    } catch (error) {
      console.error('Error getting migration history:', error)
      return []
    }
  }

  /**
   * Get all migration triggers for a business
   * @param businessId - Business ID
   * @returns Promise<MigrationTrigger[]> - Array of triggers
   */
  static async getMigrationTriggers(businessId: string): Promise<MigrationTrigger[]> {
    try {
      const triggersRef = collection(db, `businesses/${businessId}/migrationTriggers`)
      const snapshot = await getDocs(triggersRef)

      const triggers: MigrationTrigger[] = []
      snapshot.forEach((doc) => {
        triggers.push(doc.data() as MigrationTrigger)
      })

      return triggers
    } catch (error) {
      console.error('Error getting migration triggers:', error)
      return []
    }
  }

  /**
   * Update migration trigger status
   * @param businessId - Business ID
   * @param triggerId - Trigger ID
   * @param isActive - Active status
   * @returns Promise<void>
   */
  static async updateTriggerStatus(
    businessId: string,
    triggerId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const triggerRef = doc(db, `businesses/${businessId}/migrationTriggers`, triggerId)
      await updateDoc(triggerRef, { isActive })
    } catch (error: any) {
      console.error('Error updating trigger status:', error)
      throw new Error(`Failed to update trigger status: ${error.message}`)
    }
  }

  /**
   * Delete migration trigger
   * @param businessId - Business ID
   * @param triggerId - Trigger ID
   * @returns Promise<void>
   */
  static async deleteTrigger(
    businessId: string,
    triggerId: string
  ): Promise<void> {
    try {
      const triggerRef = doc(db, `businesses/${businessId}/migrationTriggers`, triggerId)
      await updateDoc(triggerRef, { isActive: false })
      // Note: We mark as inactive instead of deleting for audit trail
    } catch (error: any) {
      console.error('Error deleting trigger:', error)
      throw new Error(`Failed to delete trigger: ${error.message}`)
    }
  }
}

export default ClassMigrationService

