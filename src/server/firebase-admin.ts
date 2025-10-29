import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin SDK
let adminApp: any = null

function initializeFirebaseAdmin() {
  if (adminApp) return adminApp
  
  try {
    // Try to use environment variables first
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
    
    if (privateKey) {
      const firebaseAdminConfig = {
        credential: cert({
          projectId: "cadeala-cd61d",
          privateKey,
          clientEmail: "firebase-adminsdk-fbsvc@cadeala-cd61d.iam.gserviceaccount.com",
        }),
        projectId: "cadeala-cd61d",
        storageBucket: "cadeala-cd61d.firebasestorage.app"
      }
      adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
      return adminApp
    }
    
    // Fallback to service account file
    const serviceAccount = require('../../cadeala-cd61d-firebase-adminsdk-fbsvc-2cf96618f5.json')
    const firebaseAdminConfig = {
      credential: cert(serviceAccount),
      projectId: "cadeala-cd61d",
      storageBucket: "cadeala-cd61d.firebasestorage.app"
    }
    
    adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]
    return adminApp
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    return null
  }
}

// Initialize Firebase Admin services
export const adminAuth = () => {
  const app = initializeFirebaseAdmin()
  return app ? getAuth(app) : null
}

export const adminDb = () => {
  const app = initializeFirebaseAdmin()
  return app ? getFirestore(app) : null
}

export const adminStorage = () => {
  const app = initializeFirebaseAdmin()
  return app ? getStorage(app) : null
}

// User management functions
export class UserManager {
  /**
   * Delete a user by UID
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      await auth.deleteUser(uid)
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      const result = await auth.deleteUsers(uids)
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      return await auth.getUser(uid)
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      return await auth.listUsers(maxResults, pageToken)
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      await auth.setCustomUserClaims(uid, customClaims)
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      await auth.updateUser(uid, { disabled: true })
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
      const auth = adminAuth()
      if (!auth) throw new Error('Firebase Admin not initialized')
      await auth.updateUser(uid, { disabled: false })
      console.log(`User ${uid} enabled`)
    } catch (error) {
      console.error('Error enabling user:', error)
      throw error
    }
  }
}

export default adminApp
