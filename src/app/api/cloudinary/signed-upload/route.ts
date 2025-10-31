import { NextRequest, NextResponse } from 'next/server'
import { generateSignedUploadParams } from '@/lib/cloudinary-utils'

/**
 * Generate signed upload parameters for secure uploads
 * Use this endpoint for admin/sensitive content uploads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folder, publicId, resourceType, transformations } = body

    // Generate signed upload parameters
    const uploadParams = await generateSignedUploadParams({
      folder: folder || 'secure-uploads',
      publicId,
      resourceType: resourceType || 'image',
      transformations
    })

    return NextResponse.json({
      success: true,
      uploadParams
    })

  } catch (error) {
    console.error('Error generating signed upload params:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate upload parameters'
    }, { status: 500 })
  }
}







