/**
 * Customer Class Service
 * Manages customer classes: creation, updates, retrieval, and analytics
 */

import { doc, setDoc, getDoc, collection, getDocs, updateDoc, increment, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ClassIDGenerator } from '@/lib/classId'
import { QRCodeService } from '@/lib/qrCode'
import {
  CustomerClass,
  ClassPointsConfig,
  ClassBenefits,
  ClassAnalytics
} from '@/lib/types/customerClass'
import { UserData } from '@/lib/auth'

export interface CreateCustomerClassData {
  businessId: string
  name: string
  description?: string
  points: ClassPointsConfig
  benefits?: Partial<ClassBenefits>
}

export class CustomerClassService {
  /**
   * Create a new custom customer class
   * @param data - Class creation data
   * @returns Promise<CustomerClass> - Created class document
   */
  static async createCustomClass(
    data: CreateCustomerClassData
  ): Promise<CustomerClass> {
    try {
      // Generate unique class ID
      const existingClassIds = await this.getExistingClassIds(data.businessId)
      const classId = await ClassIDGenerator.generateUniqueId(data.businessId, existingClassIds)

      // Generate QR code and signup link (uses relative path)
      const qrCode = await QRCodeService.generateClassQRCode(data.businessId, classId)

      // Create default benefits if not provided
      const defaultBenefits: ClassBenefits = {
        pointsMultiplier: 1.0,
        discountPercentage: 0,
        specialOffers: false,
        freeShipping: false,
        earlyAccess: false
      }

      const benefits: ClassBenefits = {
        ...defaultBenefits,
        ...data.benefits
      }

      // Create class document
      const customerClass: CustomerClass = {
        classId,
        businessId: data.businessId,
        name: data.name,
        type: 'custom',
        description: data.description,
        isActive: true,
        createdAt: new Date().toISOString(),
        qrCode,
        signupLink: qrCode.data,
        points: data.points,
        benefits,
        analytics: {
          totalCustomers: 0,
          totalPointsDistributed: 0,
          totalWelcomePointsGiven: 0,
          totalReferrerPointsGiven: 0,
          totalReferredPointsGiven: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      // Save class to Firestore
      await setDoc(
        doc(db, `businesses/${data.businessId}/customerClasses`, classId),
        customerClass
      )

      return customerClass
    } catch (error: any) {
      console.error('Error creating customer class:', error)
      throw new Error(`Failed to create customer class: ${error.message}`)
    }
  }

  /**
   * Get customer class by ID
   * @param businessId - Business ID
   * @param classId - Class ID
   * @returns Promise<CustomerClass | null> - Class document or null if not found
   */
  static async getCustomerClass(
    businessId: string,
    classId: string
  ): Promise<CustomerClass | null> {
    try {
      const classDoc = await getDoc(
        doc(db, `businesses/${businessId}/customerClasses`, classId)
      )
      
      if (!classDoc.exists()) {
        return null
      }

      return classDoc.data() as CustomerClass
    } catch (error) {
      console.error('Error getting customer class:', error)
      return null
    }
  }

  /**
   * Count customers in a specific class
   * Queries user documents to find customers with matching businessId and customerClassId
   * @param businessId - Business ID
   * @param classId - Class ID
   * @returns Promise<number> - Number of customers in the class
   */
  static async countCustomersInClass(
    businessId: string,
    classId: string
  ): Promise<number> {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      let count = 0
      snapshot.forEach((doc) => {
        const userData = doc.data() as UserData
        if (userData.businessAssignments && Array.isArray(userData.businessAssignments)) {
          const hasMatch = userData.businessAssignments.some(
            (assignment) => 
              assignment.businessId === businessId &&
              assignment.customerClassId === classId &&
              assignment.status === 'active'
          )
          if (hasMatch) {
            count++
          }
        }
      })
      
      return count
    } catch (error) {
      console.error('Error counting customers in class:', error)
      return 0
    }
  }

  /**
   * Update class analytics with current customer count
   * @param businessId - Business ID
   * @param classId - Class ID
   * @returns Promise<void>
   */
  static async updateClassCustomerCount(
    businessId: string,
    classId: string
  ): Promise<void> {
    try {
      const customerCount = await this.countCustomersInClass(businessId, classId)
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      
      await updateDoc(classRef, {
        'analytics.totalCustomers': customerCount,
        'analytics.lastUpdated': new Date().toISOString()
      })
      
      console.log(`✅ Updated class ${classId} customer count: ${customerCount}`)
    } catch (error: any) {
      console.error('Error updating class customer count:', error)
      throw new Error(`Failed to update class customer count: ${error.message}`)
    }
  }

  /**
   * Get all customer classes for a business with updated customer counts
   * @param businessId - Business ID
   * @param includeInactive - Whether to include inactive classes (default: false)
   * @param updateCounts - Whether to update customer counts before returning (default: true)
   * @returns Promise<CustomerClass[]> - Array of customer classes with updated counts
   */
  static async getBusinessClasses(
    businessId: string,
    includeInactive: boolean = false,
    updateCounts: boolean = true
  ): Promise<CustomerClass[]> {
    try {
      const classesRef = collection(db, `businesses/${businessId}/customerClasses`)
      const snapshot = await getDocs(classesRef)
      
      const classes: CustomerClass[] = []
      snapshot.forEach((doc) => {
        const classData = doc.data() as CustomerClass
        if (includeInactive || classData.isActive) {
          classes.push(classData)
        }
      })

      // Sort: permanent classes first, then custom classes by creation date
      classes.sort((a, b) => {
        if (a.type === 'permanent' && b.type !== 'permanent') return -1
        if (a.type !== 'permanent' && b.type === 'permanent') return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })

      // Update customer counts if requested
      if (updateCounts) {
        await Promise.all(
          classes.map((customerClass) =>
            this.updateClassCustomerCount(businessId, customerClass.classId)
          )
        )
        
        // Reload classes to get updated counts
        const updatedSnapshot = await getDocs(classesRef)
        classes.length = 0 // Clear array
        updatedSnapshot.forEach((doc) => {
          const classData = doc.data() as CustomerClass
          if (includeInactive || classData.isActive) {
            classes.push(classData)
          }
        })
        
        // Re-sort after reload
        classes.sort((a, b) => {
          if (a.type === 'permanent' && b.type !== 'permanent') return -1
          if (a.type !== 'permanent' && b.type === 'permanent') return 1
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })
      }

      return classes
    } catch (error) {
      console.error('Error getting business classes:', error)
      return []
    }
  }

  /**
   * Update customer class
   * @param businessId - Business ID
   * @param classId - Class ID
   * @param updates - Partial class data to update
   * @returns Promise<void>
   */
  static async updateCustomerClass(
    businessId: string,
    classId: string,
    updates: Partial<Omit<CustomerClass, 'classId' | 'businessId' | 'createdAt' | 'points' | 'benefits' | 'analytics'>> & {
      points?: Partial<ClassPointsConfig>
      benefits?: Partial<ClassBenefits>
      analytics?: Partial<ClassAnalytics>
    }
  ): Promise<void> {
    try {
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      
      // Build update object with nested field updates
      const updateData: any = {}
      
      // Handle top-level fields
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive
      
      // Handle nested points updates
      if (updates.points) {
        if (updates.points.welcomePoints !== undefined) updateData['points.welcomePoints'] = updates.points.welcomePoints
        if (updates.points.referrerPoints !== undefined) updateData['points.referrerPoints'] = updates.points.referrerPoints
        if (updates.points.referredPoints !== undefined) updateData['points.referredPoints'] = updates.points.referredPoints
      }
      
      // Handle nested benefits updates
      if (updates.benefits) {
        updateData.benefits = updates.benefits
      }
      
      // Always update analytics lastUpdated timestamp
      updateData['analytics.lastUpdated'] = new Date().toISOString()
      
      // Update analytics fields if provided
      if (updates.analytics) {
        Object.keys(updates.analytics).forEach(key => {
          if (updates.analytics && updates.analytics[key as keyof ClassAnalytics] !== undefined) {
            updateData[`analytics.${key}`] = updates.analytics[key as keyof ClassAnalytics]
          }
        })
      }

      await updateDoc(classRef, updateData)
    } catch (error: any) {
      console.error('Error updating customer class:', error)
      throw new Error(`Failed to update customer class: ${error.message}`)
    }
  }

  /**
   * Update class points configuration
   * @param businessId - Business ID
   * @param classId - Class ID
   * @param points - Updated points configuration
   * @returns Promise<void>
   */
  static async updateClassPoints(
    businessId: string,
    classId: string,
    points: Partial<ClassPointsConfig>
  ): Promise<void> {
    try {
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      await updateDoc(classRef, {
        'points.welcomePoints': points.welcomePoints,
        'points.referrerPoints': points.referrerPoints,
        'points.referredPoints': points.referredPoints,
        'analytics.lastUpdated': new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error updating class points:', error)
      throw new Error(`Failed to update class points: ${error.message}`)
    }
  }

  /**
   * Update class benefits
   * @param businessId - Business ID
   * @param classId - Class ID
   * @param benefits - Updated benefits configuration
   * @returns Promise<void>
   */
  static async updateClassBenefits(
    businessId: string,
    classId: string,
    benefits: Partial<ClassBenefits>
  ): Promise<void> {
    try {
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      await updateDoc(classRef, {
        benefits,
        'analytics.lastUpdated': new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error updating class benefits:', error)
      throw new Error(`Failed to update class benefits: ${error.message}`)
    }
  }

  /**
   * Increment class analytics
   * @param businessId - Business ID
   * @param classId - Class ID
   * @param field - Analytics field to increment
   * @param amount - Amount to increment (default: 1)
   * @returns Promise<void>
   */
  static async incrementClassAnalytics(
    businessId: string,
    classId: string,
    field: keyof ClassAnalytics,
    amount: number = 1
  ): Promise<void> {
    try {
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      
      // Update analytics field
      await updateDoc(classRef, {
        [`analytics.${field}`]: increment(amount),
        'analytics.lastUpdated': new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error incrementing class analytics:', error)
      throw new Error(`Failed to increment class analytics: ${error.message}`)
    }
  }

  /**
   * Activate or deactivate a customer class
   * @param businessId - Business ID
   * @param classId - Class ID
   * @param isActive - Active status
   * @returns Promise<void>
   */
  static async setClassActiveStatus(
    businessId: string,
    classId: string,
    isActive: boolean
  ): Promise<void> {
    try {
      const classRef = doc(db, `businesses/${businessId}/customerClasses`, classId)
      await updateDoc(classRef, {
        isActive,
        'analytics.lastUpdated': new Date().toISOString()
      })
    } catch (error: any) {
      console.error('Error setting class active status:', error)
      throw new Error(`Failed to set class active status: ${error.message}`)
    }
  }

  /**
   * Get existing class IDs for a business
   * @param businessId - Business ID
   * @returns Promise<string[]> - Array of existing class IDs
   */
  private static async getExistingClassIds(businessId: string): Promise<string[]> {
    try {
      const classesRef = collection(db, `businesses/${businessId}/customerClasses`)
      const snapshot = await getDocs(classesRef)
      
      const classIds: string[] = []
      snapshot.forEach((doc) => {
        classIds.push(doc.id)
      })

      return classIds
    } catch (error) {
      console.error('Error getting existing class IDs:', error)
      return []
    }
  }
}

export default CustomerClassService

