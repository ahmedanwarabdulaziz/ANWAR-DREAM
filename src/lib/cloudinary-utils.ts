import { cloudinary } from './cloudinary'

/**
 * Generate signed upload parameters for secure uploads
 * Use this for sensitive/admin content uploads
 */
export async function generateSignedUploadParams(options: {
  folder?: string
  publicId?: string
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
  transformations?: any
}) {
  const timestamp = Math.round(new Date().getTime() / 1000)
  
  const params = {
    timestamp,
    folder: options.folder || 'secure-uploads',
    ...options
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

  return {
    signature,
    timestamp,
    cloudName: 'dbo3xd0df',
    apiKey: '984549417134457',
    ...params
  }
}

/**
 * Upload file with signed parameters (server-side)
 * Use this for admin/sensitive uploads
 */
export async function uploadSignedFile(file: Buffer | string, options: {
  folder?: string
  publicId?: string
  resourceType?: 'image' | 'video' | 'raw' | 'auto'
  transformations?: any
}) {
  try {
    const uploadParams = await generateSignedUploadParams(options)
    
    const result = await cloudinary.uploader.upload(file, {
      ...uploadParams,
      signature: uploadParams.signature,
      timestamp: uploadParams.timestamp
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }
  } catch (error) {
    console.error('Signed upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteCloudinaryFile(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      result: result.result
    }
  } catch (error) {
    console.error('Delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

