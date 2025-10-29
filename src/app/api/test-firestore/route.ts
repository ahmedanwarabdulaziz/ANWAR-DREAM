import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    console.log('=== FIRESTORE CONNECTION TEST ===')
    
    // Try to add a simple test document
    const testDoc = await addDoc(collection(db, 'test_connection'), {
      message: 'Firestore connection test',
      timestamp: new Date().toISOString()
    })
    
    console.log('✅ Firestore connection successful, test doc ID:', testDoc.id)
    
    return NextResponse.json({
      success: true,
      message: 'Firestore connection working',
      testDocId: testDoc.id
    })
    
  } catch (error) {
    console.error('❌ Firestore connection failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Firestore connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

