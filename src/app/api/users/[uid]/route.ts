import { NextRequest, NextResponse } from 'next/server'
import { UserManager } from '@/server/firebase-admin'
import { z } from 'zod'

// Validation schemas
const deleteUserSchema = z.object({
  uid: z.string().min(1, 'UID is required')
})

const updateUserSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  disabled: z.boolean().optional(),
  customClaims: z.record(z.string(), z.any()).optional()
})

// DELETE /api/users/[uid] - Delete a single user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params
    
    // Validate input
    const validation = deleteUserSchema.safeParse({ uid })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    await UserManager.deleteUser(uid)
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${uid} deleted successfully` 
    })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/users/[uid] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params
    
    const user = await UserManager.getUser(uid)
    
    return NextResponse.json({ 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled,
        customClaims: user.customClaims,
        createdAt: user.metadata.creationTime,
        lastSignIn: user.metadata.lastSignInTime
      }
    })
  } catch (error: any) {
    console.error('Error getting user:', error)
    return NextResponse.json(
      { error: 'Failed to get user', details: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/users/[uid] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params
    const body = await request.json()
    
    // Validate input
    const validation = updateUserSchema.safeParse({ uid, ...body })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { disabled, customClaims } = validation.data

    // Update user properties
    if (disabled !== undefined) {
      if (disabled) {
        await UserManager.disableUser(uid)
      } else {
        await UserManager.enableUser(uid)
      }
    }

    // Update custom claims
    if (customClaims) {
      await UserManager.setCustomUserClaims(uid, customClaims)
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${uid} updated successfully` 
    })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    )
  }
}