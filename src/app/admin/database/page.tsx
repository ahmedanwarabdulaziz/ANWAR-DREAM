'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Navbar } from '@/components/ui'
import { DatabaseViewer } from '@/components/admin/DatabaseViewer'

interface CollectionData {
  id: string
  data: any
  ref: any
}

interface CollectionInfo {
  name: string
  count: number
  documents: CollectionData[]
}

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  emailVerified: boolean
  disabled: boolean
  metadata: {
    creationTime: string
    lastSignInTime: string | null
    lastRefreshTime: string | null
  }
  customClaims: any
  providerData: any[]
}

export default function DatabaseManagementPage() {
  const [collections, setCollections] = useState<CollectionInfo[]>([])
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [customCollectionName, setCustomCollectionName] = useState('')
  const router = useRouter()

  // Define the collections we want to manage (with fallback for dynamic detection)
  const KNOWN_COLLECTIONS = ['users', 'user_mappings', 'anonymous_tokens', 'business_categories', 'business_registrations']

  useEffect(() => {
    loadCollections()
    loadAuthUsers()
  }, [])

  const loadCollections = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const collectionsData: CollectionInfo[] = []
      
      // Try to load known collections first
      for (const collectionName of KNOWN_COLLECTIONS) {
        try {
          const collectionRef = collection(db, collectionName)
          const snapshot = await getDocs(collectionRef)
          
          const documents: CollectionData[] = []
          snapshot.forEach((doc) => {
            documents.push({
              id: doc.id,
              data: doc.data(),
              ref: doc.ref
            })
          })

          console.log(`Loaded ${collectionName}:`, documents.length, 'documents')
          if (collectionName === 'users') {
            console.log('Users data:', documents)
          }

          collectionsData.push({
            name: collectionName,
            count: documents.length,
            documents: documents
          })
        } catch (err) {
          console.error(`Error loading collection ${collectionName}:`, err)
          // Still add the collection with 0 count so it shows up
          collectionsData.push({
            name: collectionName,
            count: 0,
            documents: []
          })
        }
      }
      
      // Try to detect additional collections by checking for common patterns
      const additionalCollections = [
        'campaigns', 'rewards', 'transactions', 'points', 'devices', 
        'notifications', 'settings', 'logs', 'analytics', 'reports',
        'test_connection', 'business_logos', 'uploads', 'files'
      ]
      
      for (const collectionName of additionalCollections) {
        // Skip if already loaded
        if (KNOWN_COLLECTIONS.includes(collectionName)) continue
        
        try {
          const collectionRef = collection(db, collectionName)
          const snapshot = await getDocs(collectionRef)
          
          // Only add if collection has documents
          if (!snapshot.empty) {
            const documents: CollectionData[] = []
            snapshot.forEach((doc) => {
              documents.push({
                id: doc.id,
                data: doc.data(),
                ref: doc.ref
              })
            })

            console.log(`Detected additional collection ${collectionName}:`, documents.length, 'documents')
            collectionsData.push({
              name: collectionName,
              count: documents.length,
              documents: documents
            })
          }
        } catch (err) {
          // Collection doesn't exist or no access - skip silently
          console.log(`Collection ${collectionName} not found or no access`)
        }
      }
      
      setCollections(collectionsData)
      setSuccessMessage(`Database refreshed successfully! Found ${collectionsData.length} collections.`)
      setTimeout(() => setSuccessMessage(null), 3000)
      console.log('All collections loaded successfully:', collectionsData)
    } catch (error) {
      console.error('Error loading collections:', error)
      setError('Failed to load collections')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAuthUsers = async () => {
    try {
      const response = await fetch('/api/auth-users')
      const data = await response.json()
      
      if (data.success) {
        setAuthUsers(data.users)
        console.log('Loaded auth users:', data.users.length)
      } else {
        console.error('Error loading auth users:', data.error)
      }
    } catch (error) {
      console.error('Error loading auth users:', error)
    }
  }

  const handleDeleteAuthUsers = async (uids: string[]) => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/auth-users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uids }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage(data.message)
        setTimeout(() => setSuccessMessage(null), 3000)
        // Reload auth users
        await loadAuthUsers()
        // Clear selection
        setSelectedDocuments(new Set())
      } else {
        setError(data.error || 'Failed to delete auth users')
      }
    } catch (error) {
      console.error('Error deleting auth users:', error)
      setError('Failed to delete auth users')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedDocuments.size === 0 || !selectedCollection) return

    setIsDeleting(true)
    setError(null)

    try {
      const collectionData = collections.find(c => c.name === selectedCollection)
      if (!collectionData) return

      const deletePromises = Array.from(selectedDocuments).map(async (docId) => {
        const docRef = doc(db, selectedCollection, docId)
        await deleteDoc(docRef)
      })

      await Promise.all(deletePromises)
      
      // Reload the collection
      await loadCollections()
      setSelectedDocuments(new Set())
      
    } catch (error) {
      console.error('Error deleting documents:', error)
      setError('Failed to delete documents')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleDocumentSelection = (docId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(docId)) {
      newSelected.delete(docId)
    } else {
      newSelected.add(docId)
    }
    setSelectedDocuments(newSelected)
  }

  const handleSelectAll = (docIds: string[]) => {
    setSelectedDocuments(new Set(docIds))
  }

  const handleAddCustomCollection = async () => {
    if (!customCollectionName.trim()) return
    
    const collectionName = customCollectionName.trim()
    
    // Check if collection already exists
    const existingCollection = collections.find(c => c.name === collectionName)
    if (existingCollection) {
      setError(`Collection '${collectionName}' already exists`)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)
      
      const documents: CollectionData[] = []
      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          data: doc.data(),
          ref: doc.ref
        })
      })

      const newCollection: CollectionInfo = {
        name: collectionName,
        count: documents.length,
        documents: documents
      }
      
      setCollections(prev => [...prev, newCollection])
      setCustomCollectionName('')
      setSuccessMessage(`Added collection '${collectionName}' with ${documents.length} documents`)
      setTimeout(() => setSuccessMessage(null), 3000)
      
      console.log(`Added custom collection ${collectionName}:`, documents.length, 'documents')
    } catch (err) {
      console.error(`Error loading custom collection ${collectionName}:`, err)
      setError(`Failed to load collection '${collectionName}'. It may not exist or you may not have access.`)
    } finally {
      setIsLoading(false)
    }
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray600">Loading database collections...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-display text-h1 text-primary mb-2">
                Database Management
              </h1>
              <p className="text-body text-gray600">
                Manage Firestore collections and documents
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add Custom Collection */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Collection name"
                  value={customCollectionName}
                  onChange={(e) => setCustomCollectionName(e.target.value)}
                  className="px-3 py-2 border border-gray300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCollection()}
                />
                <button
                  onClick={handleAddCustomCollection}
                  disabled={isLoading || !customCollectionName.trim()}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add</span>
                </button>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={() => {
                  loadCollections()
                  loadAuthUsers()
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        <DatabaseViewer
          collections={collections}
          authUsers={authUsers}
          selectedCollection={selectedCollection}
          onCollectionSelect={setSelectedCollection}
          onDocumentSelect={toggleDocumentSelection}
          onSelectAll={handleSelectAll}
          onDocumentDelete={handleDeleteSelected}
          onDeleteAuthUsers={handleDeleteAuthUsers}
          selectedDocuments={selectedDocuments}
          isLoading={isLoading}
          isDeleting={isDeleting}
          error={error}
        />
      </main>
    </div>
  )
}
