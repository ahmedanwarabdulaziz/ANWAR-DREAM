/**
 * QR Code Generation Service
 * Uses Cloudinary to generate QR codes for customer classes and referral links
 */

import { cloudinary } from '@/lib/cloudinary'
import { QRCodeData } from '@/lib/types/customerClass'

export class QRCodeService {
  /**
   * Generate QR code for a customer class signup link
   * Uses relative path so it works on any domain
   * @param businessId - Business ID
   * @param classId - Customer Class ID
   * @returns Promise<QRCodeData> - QR code data and image URL
   */
  static async generateClassQRCode(
    businessId: string,
    classId: string
  ): Promise<QRCodeData> {
    // Use relative path - works on any domain
    const signupLink = `/signup?b=${businessId}&c=${classId}`
    
    return await this.generateQRCode(signupLink, `qr_class_${businessId}_${classId}`)
  }

  /**
   * Generate QR code for a customer referral link
   * Uses relative path so it works on any domain
   * @param customerId - Customer ID (referrer)
   * @param businessId - Business ID
   * @returns Promise<QRCodeData> - QR code data and image URL
   */
  static async generateReferralQRCode(
    customerId: string,
    businessId: string
  ): Promise<QRCodeData> {
    // Use relative path - works on any domain
    const referralLink = `/signup?ref=${customerId}&b=${businessId}`
    
    return await this.generateQRCode(referralLink, `qr_ref_${customerId}_${businessId}`)
  }

  /**
   * Generate QR code using external QR code API service
   * @param data - Data to encode in QR code (URL)
   * @param publicId - Public ID for Cloudinary storage (for future upload)
   * @returns Promise<QRCodeData> - QR code data and image URL
   */
  private static async generateQRCode(
    data: string,
    publicId: string
  ): Promise<QRCodeData> {
    try {
      // Generate QR code using QR Server API (free, reliable service)
      // Alternative: Use a QR code library like 'qrcode' for server-side generation
      const qrCodeSize = 500
      const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrCodeSize}x${qrCodeSize}&data=${encodeURIComponent(data)}`
      
      // Future: Upload QR code to Cloudinary for permanent storage
      // For now, we'll use the generated URL directly
      // const uploadedUrl = await this.uploadQRCodeToCloudinary(qrCodeImageUrl, publicId)

      return {
        data: data,
        imageUrl: qrCodeImageUrl
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw new Error('Failed to generate QR code')
    }
  }

}

export default QRCodeService

