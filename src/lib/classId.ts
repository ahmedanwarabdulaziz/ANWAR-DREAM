/**
 * Customer Class ID Generation System
 * Format: CLASS + 6 random numbers (e.g., CLASS123456)
 */

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export class ClassIDGenerator {
  private static readonly PREFIX = 'CLASS'
  private static readonly NUMBER_LENGTH = 6
  private static readonly MAX_ATTEMPTS = 10

  /**
   * Generate a unique customer class ID for a specific business
   * @param businessId - Business ID to check uniqueness within
   * @param existingIds - Array of existing class IDs to check against (optional)
   * @returns Promise<string> - Unique class ID
   */
  static async generateUniqueId(
    businessId: string,
    existingIds: string[] = []
  ): Promise<string> {
    // If no existing IDs provided, fetch from database
    if (existingIds.length === 0) {
      existingIds = await this.getExistingClassIds(businessId)
    }

    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const id = this.generateId()
      
      if (!existingIds.includes(id)) {
        return id
      }
    }
    
    throw new Error('Unable to generate unique class ID after multiple attempts')
  }

  /**
   * Generate a single class ID
   * @returns string - Class ID in format CLASS######
   */
  private static generateId(): string {
    const randomNumbers = Math.floor(Math.random() * Math.pow(10, this.NUMBER_LENGTH))
      .toString()
      .padStart(this.NUMBER_LENGTH, '0')
    
    return `${this.PREFIX}${randomNumbers}`
  }

  /**
   * Get existing class IDs for a business from Firestore
   * @param businessId - Business ID to get classes for
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

  /**
   * Validate class ID format
   * @param id - Class ID to validate
   * @returns boolean - True if valid format
   */
  static isValidFormat(id: string): boolean {
    const regex = new RegExp(`^${this.PREFIX}\\d{${this.NUMBER_LENGTH}}$`)
    return regex.test(id)
  }

  /**
   * Extract prefix from class ID
   * @param id - Class ID
   * @returns string - Prefix (e.g., "CLASS")
   */
  static getPrefix(id: string): string {
    return id.substring(0, 5)
  }

  /**
   * Extract number part from class ID
   * @param id - Class ID
   * @returns string - Number part (e.g., "123456")
   */
  static getNumberPart(id: string): string {
    return id.substring(5)
  }
}

export default ClassIDGenerator

