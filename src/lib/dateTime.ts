/**
 * Date and Time Utility Functions
 */

export class DateTimeUtils {
  /**
   * Format a timestamp to a user-friendly date and time string
   * @param timestamp - ISO timestamp string
   * @returns Formatted date and time string
   */
  static formatDateTime(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Format a timestamp to a short date string
   * @param timestamp - ISO timestamp string
   * @returns Formatted date string (e.g., "Jan 15, 2024")
   */
  static formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Format a timestamp to a time string
   * @param timestamp - ISO timestamp string
   * @returns Formatted time string (e.g., "2:30 PM")
   */
  static formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Get relative time (e.g., "2 hours ago", "3 days ago")
   * @param timestamp - ISO timestamp string
   * @returns Relative time string
   */
  static getRelativeTime(timestamp: string): string {
    const now = new Date()
    const date = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    }

    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
  }

  /**
   * Get current timestamp as ISO string
   * @returns Current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString()
  }

  /**
   * Check if a timestamp is today
   * @param timestamp - ISO timestamp string
   * @returns True if the timestamp is today
   */
  static isToday(timestamp: string): boolean {
    const today = new Date()
    const date = new Date(timestamp)
    
    return today.getDate() === date.getDate() &&
           today.getMonth() === date.getMonth() &&
           today.getFullYear() === date.getFullYear()
  }

  /**
   * Check if a timestamp is yesterday
   * @param timestamp - ISO timestamp string
   * @returns True if the timestamp is yesterday
   */
  static isYesterday(timestamp: string): boolean {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const date = new Date(timestamp)
    
    return yesterday.getDate() === date.getDate() &&
           yesterday.getMonth() === date.getMonth() &&
           yesterday.getFullYear() === date.getFullYear()
  }
}

export default DateTimeUtils

