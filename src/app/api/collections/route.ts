import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/server/firebase-admin'

export async function GET() {
  try {
    const db = adminDb()
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase Admin not initialized' },
        { status: 500 }
      )
    }

    // List all collections (returns an array of CollectionReference objects)
    const collectionsList = await db.listCollections()
    const collections: any[] = []

    // For each collection, get all documents
    for (const collectionRef of collectionsList) {
      try {
        const collectionName = collectionRef.id
        const snapshot = await collectionRef.get()
        
        const documents: any[] = []
        snapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            data: doc.data(),
            ref: null // Can't serialize document reference
          })
        })

        collections.push({
          name: collectionName,
          count: documents.length,
          documents: documents
        })
        
        console.log(`Loaded collection ${collectionName}: ${documents.length} documents`)
      } catch (error) {
        console.error(`Error loading collection ${collectionRef.id}:`, error)
        // Still add the collection with 0 documents
        collections.push({
          name: collectionRef.id,
          count: 0,
          documents: []
        })
      }
    }

    return NextResponse.json({
      success: true,
      collections,
      totalCollections: collections.length
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
