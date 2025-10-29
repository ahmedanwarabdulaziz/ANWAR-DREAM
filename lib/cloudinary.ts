import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbo3xd0df',
  api_key: '984549417134457',
  api_secret: 'zfKeoO4s5EUBljSHZYUmtBcUeSM',
  secure: true
})

export { cloudinary }

// Helper functions for image transformations
export class ImageManager {
  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(
    file: string | Buffer,
    options: {
      folder?: string
      public_id?: string
      transformation?: any
      tags?: string[]
    } = {}
  ) {
    try {
      const uploadOptions = {
        folder: options.folder || 'rewards-app',
        public_id: options.public_id,
        transformation: options.transformation || {
          quality: 'auto',
          fetch_format: 'auto',
          dpr: 'auto',
          crop: 'fill',
          gravity: 'auto'
        },
        tags: options.tags
      }

      const result = await cloudinary.uploader.upload(file as string, uploadOptions)
      return result
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  }

  /**
   * Generate optimized image URL
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      quality?: string | number
      format?: string
      crop?: string
      gravity?: string
      effect?: string
    } = {}
  ) {
    const transformation = {
      quality: options.quality || 'auto',
      fetch_format: options.format || 'auto',
      dpr: 'auto',
      crop: options.crop || 'fill',
      gravity: options.gravity || 'auto',
      width: options.width,
      height: options.height,
      effect: options.effect
    }

    return cloudinary.url(publicId, {
      transformation: [transformation]
    })
  }

  /**
   * Generate reward image URL with luxury styling
   */
  static getRewardImageUrl(publicId: string, width: number = 400, height: number = 300) {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width,
          height,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          dpr: 'auto',
          effect: 'auto_brightness:10'
        }
      ]
    })
  }

  /**
   * Generate hero image URL with vignette effect
   */
  static getHeroImageUrl(publicId: string, width: number = 1200, height: number = 600) {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width,
          height,
          crop: 'fill',
          gravity: 'auto',
          quality: 'auto',
          fetch_format: 'auto',
          dpr: 'auto',
          effect: 'vignette:20'
        }
      ]
    })
  }

  /**
   * Generate avatar image URL
   */
  static getAvatarImageUrl(publicId: string, size: number = 150) {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: size,
          height: size,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
          fetch_format: 'auto',
          dpr: 'auto',
          radius: 'max'
        }
      ]
    })
  }
}

export default cloudinary
