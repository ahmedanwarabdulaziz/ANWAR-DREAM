/**
 * Business Service
 * Handles business registration, creation, and automatic customer class setup
 */

import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BusinessIDGenerator } from '@/lib/businessId'
import { ClassIDGenerator } from '@/lib/classId'
import { QRCodeService } from '@/lib/qrCode'
import { AuthService } from '@/lib/auth'
import {
  Business,
  BusinessSettings,
  CustomerClass,
  ClassPointsConfig,
  ClassBenefits,
  POINTS_TO_DOLLAR_RATE
} from '@/lib/types/customerClass'
import { CustomerBusinessService } from '@/lib/customerBusinessService'
import { CustomerClassService } from '@/lib/customerClassService'

export interface CreateBusinessData {
  name: string
  ownerId: string // Customer ID of business owner
  email: string
  phone?: string
  address?: string
  businessType?: string
  website?: string
}

export class BusinessService {
  /**
   * Create a new business and automatically create permanent customer classes
   * @param data - Business creation data
   * @returns Promise<Business> - Created business document
   */
  static async createBusiness(
    data: CreateBusinessData
  ): Promise<Business> {
    try {
      // Generate unique business ID
      const existingBusinessIds = await this.getExistingBusinessIds()
      const businessId = await BusinessIDGenerator.generateUniqueId(existingBusinessIds)

      // Create business settings with defaults
      const settings: BusinessSettings = {
        pointsToDollarRate: POINTS_TO_DOLLAR_RATE, // Permanent: 100 points = $1
        allowCustomClasses: true,
        defaultReferralRouting: 'referral_class'
      }

      // Add customReferralClassId only if needed (don't include undefined)

      // Create business document
      const business: Partial<Business> = {
        businessId,
        name: data.name,
        ownerId: data.ownerId,
        email: data.email,
        isActive: true,
        allowPublicCustomer: true, // Default to true (opt-out)
        createdAt: new Date().toISOString(),
        settings
      }

      // Add optional fields only if they exist and are not empty
      if (data.phone && data.phone.trim()) {
        business.phone = data.phone
      }
      if (data.address && data.address.trim()) {
        business.address = data.address
      }
      if (data.businessType && data.businessType.trim()) {
        business.businessType = data.businessType
      }
      if (data.website && data.website.trim()) {
        business.website = data.website
      }

      // Remove undefined values before saving to Firestore
      const cleanBusiness: Record<string, any> = {}
      Object.keys(business).forEach((key) => {
        const value = business[key as keyof typeof business]
        if (value !== undefined && value !== null) {
          cleanBusiness[key] = value
        }
      })

      // Save business to Firestore (clean object with no undefined values)
      await setDoc(doc(db, 'businesses', businessId), cleanBusiness)

      // Create permanent customer classes
      await this.createPermanentClasses(businessId)

      // Return business object (ensure all required fields are present)
      return {
        businessId,
        name: data.name,
        ownerId: data.ownerId,
        email: data.email,
        isActive: true,
        allowPublicCustomer: true, // Default to true (opt-out)
        createdAt: new Date().toISOString(),
        settings,
        ...(data.phone && { phone: data.phone }),
        ...(data.address && { address: data.address }),
        ...(data.businessType && { businessType: data.businessType }),
        ...(data.website && { website: data.website })
      } as Business
    } catch (error: any) {
      console.error('Error creating business:', error)
      throw new Error(`Failed to create business: ${error.message}`)
    }
  }

  /**
   * Create the two permanent customer classes for a business
   * @param businessId - Business ID
   */
  private static async createPermanentClasses(
    businessId: string
  ): Promise<void> {
    try {
      // Create "General Customers" class
      const generalClassId = await ClassIDGenerator.generateUniqueId(businessId)
      const generalQR = await QRCodeService.generateClassQRCode(businessId, generalClassId)

      const generalClass: CustomerClass = {
        classId: generalClassId,
        businessId,
        name: 'General Customers',
        type: 'permanent',
        description: 'Regular customers who visit our store',
        isActive: true,
        createdAt: new Date().toISOString(),
        qrCode: generalQR,
        signupLink: generalQR.data,
        points: {
          welcomePoints: 100, // Default - business owner can change
          referrerPoints: 0,
          referredPoints: 0
        },
        benefits: {
          pointsMultiplier: 1.0,
          discountPercentage: 0,
          specialOffers: true,
          freeShipping: false,
          earlyAccess: false
        },
        analytics: {
          totalCustomers: 0,
          totalPointsDistributed: 0,
          totalWelcomePointsGiven: 0,
          totalReferrerPointsGiven: 0,
          totalReferredPointsGiven: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      await setDoc(
        doc(db, `businesses/${businessId}/customerClasses`, generalClassId),
        generalClass
      )

      // Create "Referral Customers" class
      const referralClassId = await ClassIDGenerator.generateUniqueId(businessId, [generalClassId])
      const referralQR = await QRCodeService.generateClassQRCode(businessId, referralClassId)

      const referralClass: CustomerClass = {
        classId: referralClassId,
        businessId,
        name: 'Referral Customers',
        type: 'permanent',
        description: 'Customers who joined through referrals',
        isActive: true,
        createdAt: new Date().toISOString(),
        qrCode: referralQR,
        signupLink: referralQR.data,
        points: {
          welcomePoints: 100, // Default - business owner can change
          referrerPoints: 50, // Default - business owner can change
          referredPoints: 50 // Default - business owner can change
        },
        benefits: {
          pointsMultiplier: 1.0,
          discountPercentage: 0,
          specialOffers: true,
          freeShipping: false,
          earlyAccess: false
        },
        analytics: {
          totalCustomers: 0,
          totalPointsDistributed: 0,
          totalWelcomePointsGiven: 0,
          totalReferrerPointsGiven: 0,
          totalReferredPointsGiven: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      await setDoc(
        doc(db, `businesses/${businessId}/customerClasses`, referralClassId),
        referralClass
      )

      console.log(`Created permanent classes for business ${businessId}:`, {
        generalClassId,
        referralClassId
      })
    } catch (error: any) {
      console.error('Error creating permanent classes:', error)
      throw new Error(`Failed to create permanent classes: ${error.message}`)
    }
  }

  /**
   * Get business by ID
   * @param businessId - Business ID
   * @returns Promise<Business | null> - Business document or null if not found
   */
  static async getBusiness(businessId: string): Promise<Business | null> {
    try {
      const businessDoc = await getDoc(doc(db, 'businesses', businessId))
      
      if (!businessDoc.exists()) {
        return null
      }

      return businessDoc.data() as Business
    } catch (error) {
      console.error('Error getting business:', error)
      return null
    }
  }

  /**
   * Get business by owner ID
   * @param ownerId - Owner customer ID
   * @returns Promise<Business | null> - Business document or null if not found
   */
  static async getBusinessByOwner(ownerId: string): Promise<Business | null> {
    try {
      const businessesRef = collection(db, 'businesses')
      const snapshot = await getDocs(businessesRef)
      
      let business: Business | null = null
      snapshot.forEach((doc) => {
        const data = doc.data() as Business
        if (data.ownerId === ownerId) {
          business = { ...data, businessId: doc.id }
        }
      })

      return business
    } catch (error) {
      console.error('Error getting business by owner:', error)
      return null
    }
  }

  /**
   * Initialize business for existing business user (if business doesn't exist)
   * This is useful for users who were manually set to business role
   * @param ownerId - Owner customer ID
   * @param businessData - Business data (can be partial)
   * @returns Promise<Business> - Created or existing business document
   */
  static async initializeBusinessForUser(
    ownerId: string,
    businessData: Partial<CreateBusinessData> = {}
  ): Promise<Business> {
    try {
      // Check if business already exists
      const existingBusiness = await this.getBusinessByOwner(ownerId)
      if (existingBusiness) {
        console.log('Business already exists for owner:', ownerId)
        return existingBusiness
      }

      // Get user data to get email and name
      const userData = await AuthService.getUserByCustomerId(ownerId)

      if (!userData) {
        throw new Error('User not found')
      }

      // Create business with user data + provided data
      const createData: CreateBusinessData = {
        name: businessData.name || userData.name || 'My Business',
        ownerId,
        email: businessData.email || userData.email,
        phone: businessData.phone,
        address: businessData.address,
        businessType: businessData.businessType,
        website: businessData.website
      }

      return await this.createBusiness(createData)
    } catch (error: any) {
      console.error('Error initializing business for user:', error)
      throw new Error(`Failed to initialize business: ${error.message}`)
    }
  }

  /**
   * Update business settings
   * @param businessId - Business ID
   * @param settings - Updated settings
   * @returns Promise<void>
   */
  static async updateBusinessSettings(
    businessId: string,
    settings: Partial<BusinessSettings>
  ): Promise<void> {
    try {
      // Ensure pointsToDollarRate always remains 100 (permanent rule)
      const updatedSettings = {
        ...settings,
        pointsToDollarRate: POINTS_TO_DOLLAR_RATE // Force permanent value
      }

      await setDoc(
        doc(db, 'businesses', businessId),
        { settings: updatedSettings },
        { merge: true }
      )
    } catch (error: any) {
      console.error('Error updating business settings:', error)
      throw new Error(`Failed to update business settings: ${error.message}`)
    }
  }

  /**
   * Auto-join customer to all businesses with allowPublicCustomer: true
   * This is called during public signup and on login to check for new businesses
   * @param customerId - Customer ID (must start with "BC")
   * @returns Promise<void>
   */
  static async autoJoinPublicCustomerToBusinesses(customerId: string): Promise<void> {
    try {
      // Only process customers with BC prefix
      if (!customerId.startsWith('BC')) {
        console.log(`⚠️ Skipping auto-join: Customer ${customerId} doesn't have BC prefix`)
        return
      }

      console.log(`🔄 Auto-joining customer ${customerId} to businesses with allowPublicCustomer: true`)

      // Get all businesses with allowPublicCustomer: true and isActive: true
      const businessesRef = collection(db, 'businesses')
      const q = query(
        businessesRef,
        where('allowPublicCustomer', '==', true),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)

      const businessesToJoin: Business[] = []
      snapshot.forEach((doc) => {
        businessesToJoin.push(doc.data() as Business)
      })

      console.log(`📋 Found ${businessesToJoin.length} businesses with allowPublicCustomer: true`)

      // Get customer's current business assignments to avoid duplicates
      const existingAssignments = await CustomerBusinessService.getCustomerBusinesses(customerId)
      const existingBusinessIds = new Set(existingAssignments.map((rel) => rel.businessId))

      // Join customer to each business (skip if already joined)
      for (const business of businessesToJoin) {
        if (existingBusinessIds.has(business.businessId)) {
          console.log(`⏭️ Customer ${customerId} already joined to business ${business.businessId}`)
          continue
        }

        try {
          // Find the "General Customers" class for this business
          const classes = await CustomerClassService.getBusinessClasses(business.businessId, true, false)
          const generalClass = classes.find((c) => c.name === 'General Customers' && c.type === 'permanent')

          if (!generalClass) {
            console.error(`❌ General Customers class not found for business ${business.businessId}`)
            continue
          }

          console.log(`➕ Joining customer ${customerId} to business ${business.businessId} (class: ${generalClass.classId})`)

          // Create relationship (this will auto-distribute welcome points)
          await CustomerBusinessService.createRelationship({
            customerId,
            businessId: business.businessId,
            classId: generalClass.classId
          })

          console.log(`✅ Successfully joined customer ${customerId} to business ${business.businessId}`)
        } catch (error: any) {
          console.error(`❌ Error joining customer ${customerId} to business ${business.businessId}:`, error)
          // Continue with other businesses even if one fails
        }
      }

      console.log(`✅ Auto-join process completed for customer ${customerId}`)
    } catch (error: any) {
      console.error('Error auto-joining public customer to businesses:', error)
      // Don't throw - this shouldn't fail the signup/login process
    }
  }

  /**
   * Get existing business IDs from Firestore
   * @returns Promise<string[]> - Array of existing business IDs
   */
  private static async getExistingBusinessIds(): Promise<string[]> {
    try {
      const businessesRef = collection(db, 'businesses')
      const snapshot = await getDocs(businessesRef)
      
      const businessIds: string[] = []
      snapshot.forEach((doc) => {
        businessIds.push(doc.id)
      })

      return businessIds
    } catch (error) {
      console.error('Error getting existing business IDs:', error)
      return []
    }
  }
}

export default BusinessService

