import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/server/firebase-admin'
import { z } from 'zod'

const tokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  uid: z.string().optional()
})

// POST /api/fcm-token - Store FCM token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = tokenSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { token, uid } = validation.data
    
    const db = adminDb()
    if (!db) throw new Error('Firebase Admin not initialized')
    
    // If no UID provided, this is an anonymous token
    if (!uid) {
      // Store anonymous token
      await db.collection('anonymous_tokens').doc(token).set({
        token,
        createdAt: new Date(),
        lastUsed: new Date()
      })
    } else {
      // Store user token
      await db.collection('users').doc(uid).collection('devices').doc(token).set({
        token,
        createdAt: new Date(),
        lastUsed: new Date(),
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'FCM token stored successfully' 
    })
  } catch (error: any) {
    console.error('Error storing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to store FCM token', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/fcm-token - Remove FCM token
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const uid = searchParams.get('uid')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const db = adminDb()
    if (!db) throw new Error('Firebase Admin not initialized')

    if (uid) {
      // Remove user token
      await db.collection('users').doc(uid).collection('devices').doc(token).delete()
    } else {
      // Remove anonymous token
      await db.collection('anonymous_tokens').doc(token).delete()
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'FCM token removed successfully' 
    })
  } catch (error: any) {
    console.error('Error removing FCM token:', error)
    return NextResponse.json(
      { error: 'Failed to remove FCM token', details: error.message },
      { status: 500 }
    )
  }
}
