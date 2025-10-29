/**
 * Business ID Generation System
 * Format: BIZ + 4 random numbers (e.g., BIZ1234)
 */

import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export class BusinessIDGenerator {
  private static readonly PREFIX = 'BIZ'
  private static readonly NUMBER_LENGTH = 4
  private static readonly MAX_ATTEMPTS = 10

  /**
   * Generate a unique business ID
   * @param existingIds - Array of existing business IDs to check against (optional)
   * @returns Promise<string> - Unique business ID
   */
  static async generateUniqueId(existingIds: string[] = []): Promise<string> {
    // If no existing IDs provided, fetch from database
    if (existingIds.length === 0) {
      existingIds = await this.getExistingBusinessIds()
    }

    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const id = this.generateId()
      
      if (!existingIds.includes(id)) {
        return id
      }
    }
    
    throw new Error('Unable to generate unique business ID after multiple attempts')
  }

  /**
   * Generate a single business ID
   * @returns string - Business ID in format BIZ####
   */
  private static generateId(): string {
    const randomNumbers = Math.floor(Math.random() * Math.pow(10, this.NUMBER_LENGTH))
      .toString()
      .padStart(this.NUMBER_LENGTH, '0')
    
    return `${this.PREFIX}${randomNumbers}`
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

  /**
   * Validate business ID format
   * @param id - Business ID to validate
   * @returns boolean - True if valid format
   */
  static isValidFormat(id: string): boolean {
    const regex = new RegExp(`^${this.PREFIX}\\d{${this.NUMBER_LENGTH}}$`)
    return regex.test(id)
  }

  /**
   * Extract prefix from business ID
   * @param id - Business ID
   * @returns string - Prefix (e.g., "BIZ")
   */
  static getPrefix(id: string): string {
    return id.substring(0, 3)
  }

  /**
   * Extract number part from business ID
   * @param id - Business ID
   * @returns string - Number part (e.g., "1234")
   */
  static getNumberPart(id: string): string {
    return id.substring(3)
  }
}

export default BusinessIDGenerator

