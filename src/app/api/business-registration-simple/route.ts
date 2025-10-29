import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLIFIED BUSINESS REGISTRATION TEST ===')
    
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const {
      businessName,
      businessCategory,
      businessType,
      description,
      address,
      phone,
      email,
      website,
      logoUrl,
      userId
    } = body

    // Generate unique business code: first 2 letters of business name + 4 random numbers
    const businessCode = await generateUniqueBusinessCode(businessName || 'TEST')

    // Create minimal business registration document
    const businessData = {
      businessName: businessName || 'Test Business',
      businessCategory: businessCategory || 'test-category',
      businessType: businessType || 'test-type',
      description: description || 'Test description',
      address: address || 'Test address',
      phone: phone || '123-456-7890',
      email: email || 'test@example.com',
      website: website || '',
      logoUrl: logoUrl || null,
      businessCode,
      userId: userId || 'test-user-id',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }

    console.log('Attempting to add document to business_registrations...')
    console.log('Business data:', JSON.stringify(businessData, null, 2))

    // Try to add to business_registrations collection
    const docRef = await addDoc(collection(db, 'business_registrations'), businessData)
    console.log('✅ SUCCESS! Document added with ID:', docRef.id)

    return NextResponse.json({
      success: true,
      message: 'Business registration submitted successfully',
      businessId: docRef.id,
      businessCode
    })

  } catch (error) {
    console.error('❌ ERROR in simplified business registration:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error code:', (error as any)?.code)
    console.error('Error details:', (error as any)?.details)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process business registration',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code,
      errorDetails: (error as any)?.details
    }, { status: 500 })
  }
}

async function generateUniqueBusinessCode(businessName: string): Promise<string> {
  // Generate a unique business code: unique 2 letters + 4 random numbers
  const cleanName = businessName.trim().replace(/[^a-zA-Z]/g, '') // Remove non-letters
  
  // Get all existing business codes to check for used prefixes
  const existingQuery = query(collection(db, 'business_registrations'))
  const existingDocs = await getDocs(existingQuery)
  
  const usedPrefixes = new Set<string>()
  existingDocs.forEach((doc) => {
    const data = doc.data()
    if (data.businessCode && data.businessCode.length >= 2) {
      usedPrefixes.add(data.businessCode.substring(0, 2).toUpperCase())
    }
  })
  
  console.log('Used prefixes:', Array.from(usedPrefixes))
  
  // Try to find a unique prefix
  let prefix = ''
  let prefixAttempts = 0
  const maxPrefixAttempts = 50
  
  // First, try the business name prefix
  if (cleanName.length >= 2) {
    const businessPrefix = cleanName.substring(0, 2).toUpperCase()
    if (!usedPrefixes.has(businessPrefix)) {
      prefix = businessPrefix
    }
  }
  
  // If business name prefix is taken, try variations
  if (!prefix) {
    const basePrefix = cleanName.length >= 2 
      ? cleanName.substring(0, 2).toUpperCase()
      : (cleanName + 'X').substring(0, 2).toUpperCase()
    
    while (prefixAttempts < maxPrefixAttempts && !prefix) {
      // Try different variations
      const variations = [
        basePrefix,
        basePrefix.charAt(0) + String.fromCharCode(Math.floor(Math.random() * 26) + 65), // Random second letter
        String.fromCharCode(Math.floor(Math.random() * 26) + 65) + basePrefix.charAt(1), // Random first letter
        String.fromCharCode(Math.floor(Math.random() * 26) + 65) + String.fromCharCode(Math.floor(Math.random() * 26) + 65) // Both random
      ]
      
      for (const variation of variations) {
        if (!usedPrefixes.has(variation)) {
          prefix = variation
          break
        }
      }
      
      prefixAttempts++
    }
  }
  
  // Fallback: use timestamp-based prefix
  if (!prefix) {
    const timestamp = Date.now().toString().slice(-2)
    prefix = 'B' + String.fromCharCode(65 + (parseInt(timestamp) % 26)) // B + random letter
    console.log(`⚠️ Using fallback prefix: ${prefix}`)
  }
  
  // Generate unique number part
  let numberAttempts = 0
  const maxAttempts = 100
  
  while (numberAttempts < maxAttempts) {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000
    const businessCode = `${prefix}${randomNumber}`
    
    // Check if this full code already exists
    const codeQuery = query(
      collection(db, 'business_registrations'),
      where('businessCode', '==', businessCode)
    )
    
    const codeDocs = await getDocs(codeQuery)
    
    if (codeDocs.empty) {
      console.log(`✅ Generated unique business code: ${businessCode} (prefix: ${prefix}, attempt ${numberAttempts + 1})`)
      return businessCode
    }
    
    console.log(`⚠️ Business code ${businessCode} already exists, trying again...`)
    numberAttempts++
  }
  
  // Final fallback: add timestamp
  const timestamp = Date.now().toString().slice(-4)
  const fallbackCode = `${prefix}${timestamp}`
  console.log(`⚠️ Using fallback code: ${fallbackCode}`)
  return fallbackCode
}
