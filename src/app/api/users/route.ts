import { NextRequest, NextResponse } from 'next/server'
import { UserManager } from '@/server/firebase-admin'
import { adminDb } from '@/server/firebase-admin'
import { z } from 'zod'

// Validation schemas
const deleteUsersSchema = z.object({
  uids: z.array(z.string()).min(1, 'At least one UID is required').max(100, 'Maximum 100 users at once')
})

const listUsersSchema = z.object({
  maxResults: z.number().min(1).max(1000).default(1000),
  pageToken: z.string().optional()
})

// POST /api/users/bulk-delete - Delete multiple users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = deleteUsersSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { uids } = validation.data
    const result = await UserManager.deleteUsers(uids)
    
    return NextResponse.json({ 
      success: true, 
      message: `Bulk delete completed`,
      result: {
        successCount: result.successCount,
        failureCount: result.failureCount,
        errors: result.errors
      }
    })
  } catch (error: any) {
    console.error('Error bulk deleting users:', error)
    return NextResponse.json(
      { error: 'Failed to bulk delete users', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/users - List users with pagination or get user by customer ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    
    // If customerId is provided, return single user
    if (customerId) {
      const db = adminDb()
      if (!db) {
        return NextResponse.json(
          { error: 'Firebase Admin not initialized' },
          { status: 500 }
        )
      }

      const userDoc = await db.collection('users').doc(customerId).get()

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        user: userDoc.data()
      })
    }
    
    // Otherwise, list all users (Auth users)
    const maxResults = parseInt(searchParams.get('maxResults') || '1000')
    const pageToken = searchParams.get('pageToken') || undefined
    
    // Validate input
    const validation = listUsersSchema.safeParse({ maxResults, pageToken })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const result = await UserManager.listUsers(maxResults, pageToken)
    
    const users = result.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      disabled: user.disabled,
      customClaims: user.customClaims,
      createdAt: user.metadata.creationTime,
      lastSignIn: user.metadata.lastSignInTime
    }))
    
    return NextResponse.json({ 
      success: true, 
      users,
      pageToken: result.pageToken,
      hasMore: !!result.pageToken
    })
  } catch (error: any) {
    console.error('Error in users route:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}
