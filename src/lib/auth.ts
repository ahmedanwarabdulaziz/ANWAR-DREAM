import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { CustomerIDGenerator } from '@/lib/customerId'
import { BusinessService } from '@/lib/businessService'
import { ReferralService } from '@/lib/referralService'
import { CustomerBusinessService } from '@/lib/customerBusinessService'
import { PointsService } from '@/lib/pointsService'
import { Business, BusinessAssignment, ReferralSummary } from '@/lib/types/customerClass'

export interface UserData {
  name: string
  email: string
  userId: string
  createdAt: string // Full timestamp as ISO string (date and time)
  role: 'customer' | 'admin' | 'business'
  public: boolean // true if public signup, false if signed up from business/class
  businessAssignments: BusinessAssignment[] // Array of business assignments
  referrals: ReferralSummary[] // Array of referrals made by this customer
}

export interface SignupData {
  name: string
  email: string
  password: string
  businessId?: string // Optional: Business ID from URL parameter
  classId?: string // Optional: Class ID from URL parameter
  referrerId?: string // Optional: Referrer customer ID from URL parameter
}

export class AuthService {
  /**
   * Sign up a new user
   */
  static async signUp(data: SignupData): Promise<{ user: User; userData: UserData }> {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const user = userCredential.user

      // Update user profile with display name
      await updateProfile(user, {
        displayName: data.name
      })

      // Generate unique customer ID
      const existingIds = await this.getExistingCustomerIds()
      const customerId = await CustomerIDGenerator.generateUniqueId(existingIds)

      // Determine if this is a public signup or business/class signup
      const isPublicSignup = !data.businessId && !data.classId
      
      // Create initial user data for Firestore
      const userData: UserData = {
        name: data.name,
        email: data.email,
        userId: customerId,
        createdAt: new Date().toISOString(), // Full timestamp with date and time
        role: 'customer',
        public: isPublicSignup,
        businessAssignments: [], // Start with empty array
        referrals: [] // Start with empty array
      }

      // Save user data to Firestore using customer ID as document ID
      await setDoc(doc(db, 'users', customerId), userData)
      
      // Also create a mapping from Firebase UID to customer ID for easy lookup
      await setDoc(doc(db, 'user_mappings', user.uid), {
        customerId: customerId,
        createdAt: new Date().toISOString()
      })

      // Handle business/class/referrer if provided
      let assignedClassId: string | undefined
      if (data.businessId) {
        console.log('🏢 Starting business signup process:', {
          customerId,
          businessId: data.businessId,
          classId: data.classId,
          referrerId: data.referrerId
        })
        
        // Wait a moment to ensure user document is fully created
        await new Promise(resolve => setTimeout(resolve, 200))
        
        try {
          assignedClassId = await this.handleBusinessSignup(customerId, data)
          
          console.log('✅ Business signup completed:', {
            customerId,
            businessId: data.businessId,
            assignedClassId
          })
          
          // Wait for sync to complete, then reload userData
          await new Promise(resolve => setTimeout(resolve, 300))
          
          // Reload userData to get the synced version from database
          const updatedUserDoc = await getDoc(doc(db, 'users', customerId))
          if (updatedUserDoc.exists()) {
            const updatedData = updatedUserDoc.data() as UserData
            console.log('📋 Reloaded user data:', {
              businessAssignments: updatedData.businessAssignments
            })
            userData.public = updatedData.public
            userData.businessAssignments = updatedData.businessAssignments || []
          } else {
            console.error('❌ User document not found after business signup')
          }
        } catch (error: any) {
          console.error('❌ Error in business signup:', error)
          // Don't fail the entire signup, but log the error
        }
      } else {
        // Public signup - auto-join to businesses with allowPublicCustomer: true
        console.log('🌐 Public signup detected - auto-joining to businesses...')
        await new Promise(resolve => setTimeout(resolve, 300)) // Wait for user doc to be fully created
        
        try {
          await BusinessService.autoJoinPublicCustomerToBusinesses(customerId)
          
          // Reload userData after auto-join
          await new Promise(resolve => setTimeout(resolve, 500))
          const updatedUserDoc = await getDoc(doc(db, 'users', customerId))
          if (updatedUserDoc.exists()) {
            const updatedData = updatedUserDoc.data() as UserData
            userData.public = updatedData.public
            userData.businessAssignments = updatedData.businessAssignments || []
          }
        } catch (error: any) {
          console.error('❌ Error in auto-join process:', error)
          // Don't fail the entire signup
        }
      }

      return { user, userData }
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Sign in an existing user
   */
  static async signIn(email: string, password: string): Promise<{ user: User; userData: UserData }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get user mapping to find customer ID
      const mappingDoc = await getDoc(doc(db, 'user_mappings', user.uid))
      
      if (!mappingDoc.exists()) {
        throw new Error('User mapping not found')
      }

      const mapping = mappingDoc.data()
      const customerId = mapping.customerId

      // Get user data from Firestore using customer ID
      const userDoc = await getDoc(doc(db, 'users', customerId))
      
      if (!userDoc.exists()) {
        throw new Error('User data not found')
      }

      const userData = userDoc.data() as UserData

      // Check for new businesses with allowPublicCustomer: true on login
      // Only for customers with BC prefix who signed up publicly
      if (userData.userId.startsWith('BC') && userData.public) {
        console.log('🔄 Checking for new businesses with allowPublicCustomer: true...')
        try {
          // Run in background - don't wait for it
          BusinessService.autoJoinPublicCustomerToBusinesses(customerId).catch((error) => {
            console.error('Error during auto-join on login:', error)
          })
        } catch (error) {
          console.error('Error checking for new businesses:', error)
          // Don't fail login
        }
      }

      return { user, userData }
    } catch (error: any) {
      console.error('Signin error:', error)
      throw new Error(this.getErrorMessage(error.code))
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error('Signout error:', error)
      throw new Error('Failed to sign out')
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUserData(): Promise<UserData | null> {
    try {
      const user = auth.currentUser
      if (!user) return null

      // Get user mapping to find customer ID
      const mappingDoc = await getDoc(doc(db, 'user_mappings', user.uid))
      
      if (!mappingDoc.exists()) {
        return null
      }

      const mapping = mappingDoc.data()
      const customerId = mapping.customerId

      // Get user data from Firestore using customer ID
      const userDoc = await getDoc(doc(db, 'users', customerId))
      
      if (!userDoc.exists()) {
        return null
      }

      return userDoc.data() as UserData
    } catch (error) {
      console.error('Get current user data error:', error)
      return null
    }
  }

  /**
   * Get user data by customer ID
   */
  static async getUserByCustomerId(customerId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', customerId))
      
      if (!userDoc.exists()) {
        return null
      }

      return userDoc.data() as UserData
    } catch (error) {
      console.error('Error getting user by customer ID:', error)
      return null
    }
  }

  /**
   * Get user data by Firebase UID
   */
  static async getUserData(uid: string): Promise<UserData | null> {
    try {
      // Get user mapping to find customer ID
      const mappingDoc = await getDoc(doc(db, 'user_mappings', uid))
      
      if (!mappingDoc.exists()) {
        return null
      }

      const mapping = mappingDoc.data()
      const customerId = mapping.customerId

      // Get user data from Firestore using customer ID
      const userDoc = await getDoc(doc(db, 'users', customerId))
      
      if (!userDoc.exists()) {
        return null
      }

      return userDoc.data() as UserData
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
    }
  }

  /**
   * Get existing customer IDs to ensure uniqueness
   */
  private static async getExistingCustomerIds(): Promise<string[]> {
    try {
      const usersRef = collection(db, 'users')
      const snapshot = await getDocs(usersRef)
      
      // Since we're using customer ID as document ID, we can get the IDs directly
      const customerIds: string[] = []
      snapshot.forEach((doc) => {
        customerIds.push(doc.id)
      })

      return customerIds
    } catch (error) {
      console.error('Error getting existing customer IDs:', error)
      return []
    }
  }

  /**
   * Handle business signup with class assignment and referral processing
   * @returns assignedClassId - The class ID the customer was assigned to
   */
  private static async handleBusinessSignup(
    customerId: string,
    data: SignupData
  ): Promise<string | undefined> {
    try {
      if (!data.businessId) {
        console.log('⚠️ No businessId provided')
        return undefined
      }

      console.log('🔍 Getting business:', data.businessId)
      // Get business
      const business = await BusinessService.getBusiness(data.businessId)
      if (!business) {
        console.error(`❌ Business ${data.businessId} not found`)
        return undefined
      }

      console.log('✅ Business found:', business.name)

      let assignedClassId: string | undefined
      let referrerClassId: string | undefined

      // Handle referral signup
      if (data.referrerId) {
        console.log('🔗 Processing referral signup:', {
          referrerId: data.referrerId, // This is the customer who shared the link (from URL ref=)
          newCustomerId: customerId, // This is the new customer signing up
          businessId: data.businessId
        })
        
        // Validate referrer ID format
        if (!data.referrerId.startsWith('BC')) {
          console.error(`❌ Invalid referrer ID format: ${data.referrerId}`)
          throw new Error('Invalid referral code')
        }
        
        // Verify referrer exists
        const referrerUser = await this.getUserByCustomerId(data.referrerId)
        if (!referrerUser) {
          console.error(`❌ Referrer ${data.referrerId} not found in database`)
          throw new Error('Referral code is invalid')
        }
        console.log(`✅ Referrer verified: ${data.referrerId} (${referrerUser.name})`)
        
        // Get referrer's relationship with this business
        const referrerRelationship = await CustomerBusinessService.getRelationship(
          data.referrerId,
          data.businessId
        )

        if (referrerRelationship) {
          referrerClassId = referrerRelationship.customerClassId

          // Determine routing based on business settings
          const routingResult = await ReferralService.determineReferralRouting(
            business,
            referrerClassId
          )

          assignedClassId = routingResult.assignedClassId

          // Create referral record
          const referral = await ReferralService.createReferral({
            businessId: data.businessId,
            referrerId: data.referrerId,
            referredId: customerId,
            referrerClassId: referrerClassId,
            assignedClassId,
            referralRouting: routingResult.routing
          })

          // Create customer-business relationship
          await CustomerBusinessService.createRelationship({
            customerId,
            businessId: data.businessId,
            classId: assignedClassId,
            referrerId: data.referrerId,
            referredBy: referrerClassId
          })

          // Distribute referral points
          console.log('💰 Distributing referral points...', {
            referrerId: data.referrerId, // Original customer who shared link (FROM URL ref=)
            referredId: customerId, // New customer signing up (JUST CREATED)
            referrerClassId,
            assignedClassId,
            referralId: referral.referralId
          })
          
          try {
            const pointsResult = await PointsService.distributeReferralPoints(
              referral.referralId,
              data.businessId,
              data.referrerId, // Points go TO this customer (the referrer)
              customerId, // Points go TO this customer (the referred)
              referrerClassId,
              assignedClassId
            )
            console.log('✅ Referral points distributed successfully:', pointsResult)
            console.log('📊 Points Summary:', {
              referrerReceived: pointsResult.pointsDistributed.referrerReceived,
              referredReceived: pointsResult.pointsDistributed.referredReceived,
              referrerTransaction: pointsResult.transactions.referrer?.transactionId,
              referredTransaction: pointsResult.transactions.referred?.transactionId
            })
            
            // Add referral to referrer's user document
            if (pointsResult.pointsDistributed.referrerReceived > 0 || pointsResult.pointsDistributed.referredReceived > 0) {
              await this.addReferralToUserDocument(
                data.referrerId,
                referral.referralId,
                data.businessId,
                customerId,
                data.name,
                pointsResult.pointsDistributed.referrerReceived
              )
            }
          } catch (pointsError: any) {
            console.error('❌ Error distributing referral points:', pointsError)
            console.error('Points error details:', {
              message: pointsError.message,
              stack: pointsError.stack,
              referrerId: data.referrerId,
              referredId: customerId,
              businessId: data.businessId
            })
            // Don't fail the entire signup, but log the error clearly
          }
        } else {
          // Referrer doesn't have relationship with this business yet
          // This can happen if referrer shared link before joining this business
          // Try to auto-join referrer first (if they're a BC customer with allowPublicCustomer)
          console.log(`⚠️ Referrer ${data.referrerId} doesn't have relationship with business ${data.businessId}`)
          console.log('🔄 Attempting to auto-join referrer to business...')
          
          try {
            // Check if referrer is a BC customer and auto-join if business allows
            const referrerUser = await this.getUserByCustomerId(data.referrerId)
            if (referrerUser && referrerUser.userId.startsWith('BC')) {
              // Try to auto-join referrer to this business
              await BusinessService.autoJoinPublicCustomerToBusinesses(data.referrerId)
              
              // Wait a moment for the relationship to be created
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Check again if referrer now has relationship
              const updatedReferrerRelationship = await CustomerBusinessService.getRelationship(
                data.referrerId,
                data.businessId
              )
              
              if (updatedReferrerRelationship) {
                console.log('✅ Referrer auto-joined to business, processing referral...')
                referrerClassId = updatedReferrerRelationship.customerClassId
                
                // Determine routing based on business settings
                const routingResult = await ReferralService.determineReferralRouting(
                  business,
                  referrerClassId
                )
                
                assignedClassId = routingResult.assignedClassId
                
                // Create referral record
                const referral = await ReferralService.createReferral({
                  businessId: data.businessId,
                  referrerId: data.referrerId,
                  referredId: customerId,
                  referrerClassId: referrerClassId,
                  assignedClassId,
                  referralRouting: routingResult.routing
                })
                
                // Create customer-business relationship
                await CustomerBusinessService.createRelationship({
                  customerId,
                  businessId: data.businessId,
                  classId: assignedClassId,
                  referrerId: data.referrerId,
                  referredBy: referrerClassId
                })
                
                // Distribute referral points
                console.log('💰 Distributing referral points (after auto-join)...', {
                  referrerId: data.referrerId,
                  referredId: customerId,
                  referrerClassId,
                  assignedClassId
                })
                
                try {
                  const pointsResult = await PointsService.distributeReferralPoints(
                    referral.referralId,
                    data.businessId,
                    data.referrerId,
                    customerId,
                    referrerClassId,
                    assignedClassId
                  )
                  console.log('✅ Referral points distributed successfully (after auto-join):', pointsResult)
                  
                  // Add referral to referrer's user document
                  if (pointsResult.pointsDistributed.referrerReceived > 0 || pointsResult.pointsDistributed.referredReceived > 0) {
                    await this.addReferralToUserDocument(
                      data.referrerId,
                      referral.referralId,
                      data.businessId,
                      customerId,
                      data.name,
                      pointsResult.pointsDistributed.referrerReceived
                    )
                  }
                } catch (pointsError: any) {
                  console.error('❌ Error distributing referral points (after auto-join):', pointsError)
                  // Don't fail the entire signup
                }
              } else {
                // Still no relationship - proceed without referral points
                console.log('⚠️ Could not auto-join referrer, proceeding without referral points')
                const generalClass = await ReferralService.findGeneralClass(data.businessId)
                assignedClassId = generalClass?.classId || data.classId || undefined
                
                if (assignedClassId) {
                  await CustomerBusinessService.createRelationship({
                    customerId,
                    businessId: data.businessId,
                    classId: assignedClassId
                  })
                }
              }
            } else {
              // Referrer is not a BC customer or does not exist - proceed without referral points
              console.log('⚠️ Referrer is not a BC customer or does not exist')
              const generalClass = await ReferralService.findGeneralClass(data.businessId)
              assignedClassId = generalClass?.classId || data.classId || undefined
              
              if (assignedClassId) {
                await CustomerBusinessService.createRelationship({
                  customerId,
                  businessId: data.businessId,
                  classId: assignedClassId
                })
              }
            }
          } catch (error: any) {
            console.error('❌ Error attempting to auto-join referrer:', error)
            // Fallback: proceed without referral points
            const generalClass = await ReferralService.findGeneralClass(data.businessId)
            assignedClassId = generalClass?.classId || data.classId || undefined
            
            if (assignedClassId) {
              await CustomerBusinessService.createRelationship({
                customerId,
                businessId: data.businessId,
                classId: assignedClassId
              })
            }
          }
        }
      } else {
        // Regular signup (no referral)
        console.log('📝 Processing regular signup (no referral)')
        // Use specified classId or default to General Customers
        if (data.classId) {
          assignedClassId = data.classId
          console.log('✅ Using provided classId:', data.classId)
        } else {
          console.log('🔍 Finding general class for business:', data.businessId)
          const generalClass = await ReferralService.findGeneralClass(data.businessId)
          assignedClassId = generalClass?.classId || undefined
          console.log('✅ Found general class:', assignedClassId)
        }

        if (assignedClassId) {
          console.log('🔗 Creating relationship:', {
            customerId,
            businessId: data.businessId,
            classId: assignedClassId
          })
          await CustomerBusinessService.createRelationship({
            customerId,
            businessId: data.businessId,
            classId: assignedClassId
          })
          console.log('✅ Relationship created successfully')
        } else {
          console.error('❌ No class ID assigned - cannot create relationship')
        }
      }

      // Return assigned class ID for updating user document
      console.log('✅ handleBusinessSignup returning assignedClassId:', assignedClassId)
      return assignedClassId
    } catch (error) {
      // Log error but don't fail signup - business relationship is optional
      console.error('Error handling business signup:', error)
      return undefined
    }
  }

  /**
   * Add referral to referrer's user document
   */
  private static async addReferralToUserDocument(
    referrerId: string,
    referralId: string,
    businessId: string,
    referredCustomerId: string,
    referredCustomerName: string,
    pointsEarned: number
  ): Promise<void> {
    try {
      const referrerUserRef = doc(db, 'users', referrerId)
      const referrerUserDoc = await getDoc(referrerUserRef)
      
      if (!referrerUserDoc.exists()) {
        console.error(`❌ Referrer user document not found: ${referrerId}`)
        return
      }
      
      const userData = referrerUserDoc.data() as UserData
      const existingReferrals = userData.referrals || []
      
      const referralSummary: ReferralSummary = {
        referralId,
        businessId,
        referredCustomerId,
        referredCustomerName,
        pointsEarned,
        createdAt: new Date().toISOString()
      }
      
      // Check if referral already exists (avoid duplicates)
      const referralExists = existingReferrals.some(r => r.referralId === referralId)
      if (referralExists) {
        console.log(`ℹ️ Referral ${referralId} already exists in user document, skipping`)
        return
      }
      
      await updateDoc(referrerUserRef, {
        referrals: arrayUnion(referralSummary)
      })
      
      console.log(`✅ Added referral to referrer's user document: ${referrerId} -> ${referredCustomerId}`)
    } catch (error: any) {
      console.error(`❌ Error adding referral to user document:`, error)
      // Don't throw - this is not critical
    }
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/invalid-email':
        return 'Please enter a valid email address'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/user-not-found':
        return 'No account found with this email'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      default:
        return 'An error occurred. Please try again'
    }
  }
}

export default AuthService
