import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Get business registration data for the user
    const q = query(
      collection(db, 'business_registrations'),
      where('userId', '==', userId)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (querySnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'No business registration found'
      }, { status: 404 })
    }

    const businessData = querySnapshot.docs[0].data()

    return NextResponse.json({
      success: true,
      businessData
    })

  } catch (error) {
    console.error('Error fetching business registration:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch business registration'
    }, { status: 500 })
  }
}

