import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: "cadeala-cd61d",
    privateKeyId: "2cf96618f52293a98faeb808e09e15cbc08fcefc",
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: "firebase-adminsdk-fbsvc@cadeala-cd61d.iam.gserviceaccount.com",
    clientId: "109654961443050720184",
    authUri: "https://accounts.google.com/o/oauth2/auth",
    tokenUri: "https://oauth2.googleapis.com/token",
    authProviderX509CertUrl: "https://www.googleapis.com/oauth2/v1/certs",
    clientX509CertUrl: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cadeala-cd61d.iam.gserviceaccount.com",
    universeDomain: "googleapis.com"
  }),
  projectId: "cadeala-cd61d",
  storageBucket: "cadeala-cd61d.firebasestorage.app"
}

// Initialize Firebase Admin (avoid multiple initializations)
const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

// Initialize Firebase Admin services
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

// User management functions
export class UserManager {
  /**
   * Delete a user by UID
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      await adminAuth.deleteUser(uid)
      console.log(`User ${uid} deleted successfully`)
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  /**
   * Delete multiple users by UIDs
   */
  static async deleteUsers(uids: string[]): Promise<{ successCount: number; failureCount: number; errors: any[] }> {
    try {
      const result = await adminAuth.deleteUsers(uids)
      console.log(`Deleted ${result.successCount} users, ${result.failureCount} failures`)
      return result
    } catch (error) {
      console.error('Error deleting users:', error)
      throw error
    }
  }

  /**
   * Get user by UID
   */
  static async getUser(uid: string) {
    try {
      return await adminAuth.getUser(uid)
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  }

  /**
   * List users with pagination
   */
  static async listUsers(maxResults: number = 1000, pageToken?: string) {
    try {
      return await adminAuth.listUsers(maxResults, pageToken)
    } catch (error) {
      console.error('Error listing users:', error)
      throw error
    }
  }

  /**
   * Update user custom claims
   */
  static async setCustomUserClaims(uid: string, customClaims: Record<string, any>) {
    try {
      await adminAuth.setCustomUserClaims(uid, customClaims)
      console.log(`Custom claims set for user ${uid}`)
    } catch (error) {
      console.error('Error setting custom claims:', error)
      throw error
    }
  }

  /**
   * Disable a user account
   */
  static async disableUser(uid: string) {
    try {
      await adminAuth.updateUser(uid, { disabled: true })
      console.log(`User ${uid} disabled`)
    } catch (error) {
      console.error('Error disabling user:', error)
      throw error
    }
  }

  /**
   * Enable a user account
   */
  static async enableUser(uid: string) {
    try {
      await adminAuth.updateUser(uid, { disabled: false })
      console.log(`User ${uid} enabled`)
    } catch (error) {
      console.error('Error enabling user:', error)
      throw error
    }
  }
}

export default adminApp

