/**
 * Referral Service
 * Handles referral tracking, routing, and assignment
 */

import { doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Business } from '@/lib/types/customerClass'
import { CustomerClass } from '@/lib/types/customerClass'
import {
  Referral,
  PointsDistribution,
  CustomerBusinessRelationship,
  CustomerReferralLink,
  QRCodeData
} from '@/lib/types/customerClass'
import { QRCodeService } from '@/lib/qrCode'

export interface ReferralRoutingResult {
  assignedClassId: string
  routing: 'referral_class' | 'referrer_class' | 'custom'
}

export class ReferralService {
  /**
   * Determine which class a referral should be assigned to based on business settings
   * @param business - Business document
   * @param referrerClassId - Class ID of the person making the referral
   * @returns Promise<ReferralRoutingResult> - Routing result with assigned class ID
   */
  static async determineReferralRouting(
    business: Business,
    referrerClassId: string
  ): Promise<ReferralRoutingResult> {
    const { defaultReferralRouting, customReferralClassId } = business.settings

    switch (defaultReferralRouting) {
      case 'referral_class':
        // Find the "Referral Customers" permanent class
        const referralClass = await this.findReferralClass(business.businessId)
        return {
          assignedClassId: referralClass?.classId || referrerClassId,
          routing: 'referral_class'
        }

      case 'referrer_class':
        // Assign to the same class as the referrer
        return {
          assignedClassId: referrerClassId,
          routing: 'referrer_class'
        }

      case 'custom':
        // Assign to custom selected class
        if (customReferralClassId) {
          return {
            assignedClassId: customReferralClassId,
            routing: 'custom'
          }
        }
        // Fallback to referral class if custom not set
        const fallbackClass = await this.findReferralClass(business.businessId)
        return {
          assignedClassId: fallbackClass?.classId || referrerClassId,
          routing: 'referral_class'
        }

      default:
        // Default to referral class
        const defaultClass = await this.findReferralClass(business.businessId)
        return {
          assignedClassId: defaultClass?.classId || referrerClassId,
          routing: 'referral_class'
        }
    }
  }

  /**
   * Find the "Referral Customers" permanent class for a business
   * @param businessId - Business ID
   * @returns Promise<CustomerClass | null> - Referral class or null if not found
   */
  private static async findReferralClass(businessId: string): Promise<CustomerClass | null> {
    try {
      const classesRef = collection(db, `businesses/${businessId}/customerClasses`)
      const snapshot = await getDocs(classesRef)
      
      let referralClass: CustomerClass | null = null
      snapshot.forEach((doc) => {
        const classData = doc.data() as CustomerClass
        if (classData.type === 'permanent' && classData.name === 'Referral Customers') {
          referralClass = classData
        }
      })

      return referralClass
    } catch (error) {
      console.error('Error finding referral class:', error)
      return null
    }
  }

  /**
   * Find the "General Customers" permanent class for a business
   * @param businessId - Business ID
   * @returns Promise<CustomerClass | null> - General class or null if not found
   */
  static async findGeneralClass(businessId: string): Promise<CustomerClass | null> {
    try {
      const classesRef = collection(db, `businesses/${businessId}/customerClasses`)
      const snapshot = await getDocs(classesRef)
      
      let generalClass: CustomerClass | null = null
      snapshot.forEach((doc) => {
        const classData = doc.data() as CustomerClass
        if (classData.type === 'permanent' && classData.name === 'General Customers') {
          generalClass = classData
        }
      })

      return generalClass
    } catch (error) {
      console.error('Error finding general class:', error)
      return null
    }
  }

  /**
   * Create or get customer referral link
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param currentClassId - Current class ID of the customer
   * @returns Promise<CustomerReferralLink> - Customer referral link document
   */
  static async getOrCreateReferralLink(
    customerId: string,
    businessId: string,
    currentClassId: string
  ): Promise<CustomerReferralLink> {
    try {
      const referralLinkRef = doc(
        db,
        `customers/${customerId}/referralLinks`,
        businessId
      )

      // Check if referral link already exists
      const existingLink = await getDoc(referralLinkRef)
      
      if (existingLink.exists()) {
        const linkData = existingLink.data() as CustomerReferralLink
        
        // Update class if it changed
        if (linkData.currentClassId !== currentClassId) {
          const qrCode = await QRCodeService.generateReferralQRCode(
            customerId,
            businessId
          )
          
          await updateDoc(referralLinkRef, {
            currentClassId,
            qrCode,
            referralLink: qrCode.data
          })

          return {
            ...linkData,
            currentClassId,
            qrCode,
            referralLink: qrCode.data
          }
        }

        return linkData
      }

      // Create new referral link (uses relative path)
      const qrCode = await QRCodeService.generateReferralQRCode(
        customerId,
        businessId
      )

      const referralLink: CustomerReferralLink = {
        customerId,
        businessId,
        currentClassId,
        referralLink: qrCode.data,
        qrCode,
        totalReferrals: 0,
        totalReferralPoints: 0,
        createdAt: new Date().toISOString()
      }

      await setDoc(referralLinkRef, referralLink)

      return referralLink
    } catch (error: any) {
      console.error('Error creating referral link:', error)
      throw new Error(`Failed to create referral link: ${error.message}`)
    }
  }

  /**
   * Create a referral record
   * @param referralData - Referral data
   * @returns Promise<Referral> - Created referral document
   */
  static async createReferral(referralData: {
    businessId: string
    referrerId: string
    referredId: string
    referrerClassId: string
    assignedClassId: string
    referralRouting: 'referral_class' | 'referrer_class' | 'custom'
  }): Promise<Referral> {
    try {
      // Generate referral ID
      const referralId = `REF${Date.now()}${Math.random().toString(36).substr(2, 9)}`

      const referral: Referral = {
        referralId,
        businessId: referralData.businessId,
        referrerId: referralData.referrerId,
        referredId: referralData.referredId,
        referrerClassId: referralData.referrerClassId,
        assignedClassId: referralData.assignedClassId,
        referralRouting: referralData.referralRouting,
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      await setDoc(
        doc(db, `businesses/${referralData.businessId}/referrals`, referralId),
        referral
      )

      return referral
    } catch (error: any) {
      console.error('Error creating referral:', error)
      throw new Error(`Failed to create referral: ${error.message}`)
    }
  }

  /**
   * Complete a referral and distribute points
   * @param referralId - Referral ID
   * @param businessId - Business ID
   * @param pointsDistribution - Points distribution data
   * @returns Promise<void>
   */
  static async completeReferral(
    referralId: string,
    businessId: string,
    pointsDistribution: PointsDistribution
  ): Promise<void> {
    try {
      const referralRef = doc(db, `businesses/${businessId}/referrals`, referralId)
      
      await updateDoc(referralRef, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        pointsDistributed: pointsDistribution
      })
    } catch (error: any) {
      console.error('Error completing referral:', error)
      throw new Error(`Failed to complete referral: ${error.message}`)
    }
  }

  /**
   * Update referral link statistics
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @param pointsEarned - Points earned from this referral
   * @returns Promise<void>
   */
  static async updateReferralLinkStats(
    customerId: string,
    businessId: string,
    pointsEarned: number
  ): Promise<void> {
    try {
      const referralLinkRef = doc(
        db,
        `customers/${customerId}/referralLinks`,
        businessId
      )

      // Check if referral link exists
      const linkDoc = await getDoc(referralLinkRef)
      
      if (!linkDoc.exists()) {
        // Referral link doesn't exist - create it first
        console.log(`📝 Creating referral link for ${customerId} (business: ${businessId}) before updating stats`)
        
        // Get referrer's current class ID from their relationship
        const { CustomerBusinessService } = await import('@/lib/customerBusinessService')
        const relationship = await CustomerBusinessService.getRelationship(customerId, businessId)
        
        if (!relationship) {
          console.error(`❌ Cannot create referral link: ${customerId} has no relationship with business ${businessId}`)
          return
        }
        
        // Create the referral link with current class ID
        await this.getOrCreateReferralLink(customerId, businessId, relationship.customerClassId)
        console.log(`✅ Referral link created for ${customerId}`)
      }

      // Now update stats
      await updateDoc(referralLinkRef, {
        totalReferrals: increment(1),
        totalReferralPoints: increment(pointsEarned),
        lastUsed: new Date().toISOString()
      })
      
      console.log(`✅ Updated referral link stats for ${customerId}: +${pointsEarned} points, +1 referral`)
    } catch (error: any) {
      console.error(`❌ Error updating referral link stats for ${customerId}:`, error)
      // Don't throw error - this is not critical, but log it clearly
    }
  }

  /**
   * Get referral statistics for a customer
   * @param customerId - Customer ID
   * @returns Promise<{ totalReferrals: number, totalPointsEarned: number, referralsByBusiness: Record<string, { count: number, points: number }> }>
   */
  static async getCustomerReferralStats(customerId: string): Promise<{
    totalReferrals: number
    totalPointsEarned: number
    referralsByBusiness: Record<string, { count: number, points: number }>
  }> {
    try {
      // Get all referral links for this customer
      const referralLinksRef = collection(db, `customers/${customerId}/referralLinks`)
      const referralLinksSnapshot = await getDocs(referralLinksRef)
      
      let totalReferrals = 0
      let totalPointsEarned = 0
      const referralsByBusiness: Record<string, { count: number, points: number }> = {}
      
      referralLinksSnapshot.forEach((doc) => {
        const linkData = doc.data() as CustomerReferralLink
        totalReferrals += linkData.totalReferrals || 0
        totalPointsEarned += linkData.totalReferralPoints || 0
        
        referralsByBusiness[linkData.businessId] = {
          count: linkData.totalReferrals || 0,
          points: linkData.totalReferralPoints || 0
        }
      })
      
      return {
        totalReferrals,
        totalPointsEarned,
        referralsByBusiness
      }
    } catch (error: any) {
      console.error('Error getting customer referral stats:', error)
      return {
        totalReferrals: 0,
        totalPointsEarned: 0,
        referralsByBusiness: {}
      }
    }
  }

  /**
   * Get referral link for a customer and business
   * @param customerId - Customer ID
   * @param businessId - Business ID
   * @returns Promise<CustomerReferralLink | null> - Referral link or null if not found
   */
  static async getReferralLink(
    customerId: string,
    businessId: string
  ): Promise<CustomerReferralLink | null> {
    try {
      const referralLinkRef = doc(
        db,
        `customers/${customerId}/referralLinks`,
        businessId
      )

      const linkDoc = await getDoc(referralLinkRef)
      
      if (!linkDoc.exists()) {
        return null
      }

      return linkDoc.data() as CustomerReferralLink
    } catch (error) {
      console.error('Error getting referral link:', error)
      return null
    }
  }
}

export default ReferralService

