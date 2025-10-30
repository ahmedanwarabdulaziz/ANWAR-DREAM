/**
 * Customer ID Generation System
 * Format: BC + 4 random numbers (e.g., BC1234)
 * BC prefix indicates "Business Customer" from public signup
 */

export class CustomerIDGenerator {
  private static readonly PREFIX = 'BC'
  private static readonly NUMBER_LENGTH = 4
  private static readonly MAX_ATTEMPTS = 10

  /**
   * Generate a unique customer ID
   * @param existingIds - Array of existing customer IDs to check against
   * @returns Promise<string> - Unique customer ID
   */
  static async generateUniqueId(existingIds: string[] = []): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_ATTEMPTS; attempt++) {
      const id = this.generateId()
      
      if (!existingIds.includes(id)) {
        return id
      }
    }
    
    throw new Error('Unable to generate unique customer ID after multiple attempts')
  }

  /**
   * Generate a single customer ID
   * @returns string - Customer ID in format BC####
   */
  private static generateId(): string {
    const randomNumbers = Math.floor(Math.random() * Math.pow(10, this.NUMBER_LENGTH))
      .toString()
      .padStart(this.NUMBER_LENGTH, '0')
    
    return `${this.PREFIX}${randomNumbers}`
  }

  /**
   * Validate customer ID format
   * @param id - Customer ID to validate
   * @returns boolean - True if valid format
   */
  static isValidFormat(id: string): boolean {
    const regex = new RegExp(`^${this.PREFIX}\\d{${this.NUMBER_LENGTH}}$`)
    return regex.test(id)
  }

  /**
   * Extract prefix from customer ID
   * @param id - Customer ID
   * @returns string - Prefix (e.g., "BC")
   */
  static getPrefix(id: string): string {
    return id.substring(0, 2)
  }

  /**
   * Extract number part from customer ID
   * @param id - Customer ID
   * @returns string - Number part (e.g., "1234")
   */
  static getNumberPart(id: string): string {
    return id.substring(2)
  }
}

export default CustomerIDGenerator



