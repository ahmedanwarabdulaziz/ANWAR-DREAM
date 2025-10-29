'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, deleteDoc, query, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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

interface DatabaseViewerProps {
  collections: CollectionInfo[]
  authUsers: AuthUser[]
  selectedCollection: string | null
  onCollectionSelect: (collectionName: string) => void
  onDocumentSelect: (docId: string) => void
  onSelectAll: (docIds: string[]) => void
  onDocumentDelete: (docIds: string[]) => Promise<void>
  onDeleteAuthUsers: (uids: string[]) => Promise<void>
  selectedDocuments: Set<string>
  isLoading: boolean
  isDeleting: boolean
  error: string | null
}

export function DatabaseViewer({
  collections,
  authUsers,
  selectedCollection,
  onCollectionSelect,
  onDocumentSelect,
  onSelectAll,
  onDocumentDelete,
  onDeleteAuthUsers,
  selectedDocuments,
  isLoading,
  isDeleting,
  error
}: DatabaseViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showRawData, setShowRawData] = useState(false)

  // Add Firebase Auth users as a virtual collection
  const allCollections = [
    ...collections,
    {
      name: 'firebase_auth_users',
      count: authUsers.length,
      documents: authUsers.map(user => ({
        id: user.uid,
        data: {
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          disabled: user.disabled,
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
          customClaims: user.customClaims
        },
        ref: null
      }))
    }
  ]
  
  const isAuthUsersSelected = selectedCollection === 'firebase_auth_users'
  const currentCollection = isAuthUsersSelected 
    ? allCollections.find(c => c.name === 'firebase_auth_users')
    : collections.find(c => c.name === selectedCollection)
  
  const filteredCollections = allCollections.filter(collection => 
    collection.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectAll = () => {
    if (!currentCollection) return
    
    // Get all document IDs
    const allDocIds = currentCollection.documents.map(doc => doc.id)
    
    // Check if any documents are selected
    const hasAnySelected = allDocIds.some(docId => selectedDocuments.has(docId))
    
    if (hasAnySelected) {
      // Deselect all - pass empty array
      onSelectAll([])
    } else {
      // Select all - pass all document IDs
      onSelectAll(allDocIds)
    }
  }

  const handleClearSelection = () => {
    // Clear all selected documents
    selectedDocuments.forEach(docId => onDocumentSelect(docId))
  }

  const handleDeleteSelected = async () => {
    if (selectedDocuments.size === 0) return
    
    if (isAuthUsersSelected) {
      // Delete Firebase Auth users
      await onDeleteAuthUsers(Array.from(selectedDocuments))
    } else {
      // Delete Firestore documents
      await onDocumentDelete(Array.from(selectedDocuments))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Collections Sidebar */}
      <motion.div 
        className="lg:col-span-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
          <h2 className="text-h2 text-primary mb-4">Collections</h2>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Collections List */}
          <div className="space-y-2">
            {filteredCollections.map((collection) => (
              <button
                key={collection.name}
                onClick={() => onCollectionSelect(collection.name)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCollection === collection.name
                    ? 'bg-primary text-white'
                    : 'bg-gray50 hover:bg-gray100 text-gray700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{collection.name}</span>
                  <span className="text-sm opacity-75">
                    {collection.count} docs
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Documents Viewer */}
      <motion.div 
        className="lg:col-span-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {selectedCollection ? (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-h2 text-primary">
                  {selectedCollection}
                </h2>
                <p className="text-sm text-gray600">
                  {currentCollection?.count || 0} documents
                </p>
              </div>
              
              {selectedDocuments.size > 0 && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray600">
                    {selectedDocuments.size} selected
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1 text-sm text-gray600 hover:text-gray800 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Selected'}
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm text-primary hover:text-blue-600 transition-colors"
                >
                  {currentCollection && currentCollection.documents.some(doc => selectedDocuments.has(doc.id))
                    ? 'Deselect All' 
                    : 'Select All'
                  }
                </button>
                <button
                  onClick={() => setShowRawData(!showRawData)}
                  className="px-3 py-1 text-sm text-gray600 hover:text-gray800 transition-colors"
                >
                  {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
              {currentCollection?.documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  isSelected={selectedDocuments.has(document.id)}
                  onSelect={() => onDocumentSelect(document.id)}
                  showRawData={showRawData}
                />
              ))}
              
              {currentCollection?.documents.length === 0 && (
                <div className="text-center py-8 text-gray500">
                  No documents found in this collection
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray900 mb-2">
                Select a Collection
              </h3>
              <p className="text-gray600">
                Choose a collection from the sidebar to view and manage its documents
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

interface DocumentCardProps {
  document: CollectionData
  isSelected: boolean
  onSelect: () => void
  showRawData: boolean
}

function DocumentCard({ document, isSelected, onSelect, showRawData }: DocumentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatValue = (value: any, key?: string): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return `"${value}"`
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (value instanceof Date) return value.toISOString()
    if (Array.isArray(value)) return `[${value.length} items]`
    if (typeof value === 'object') return `{${Object.keys(value).length} fields}`
    return String(value)
  }

  const renderValue = (value: any, key: string, level: number = 0) => {
    const indent = '  '.repeat(level)
    
    if (Array.isArray(value)) {
      return (
        <div className="ml-2">
          <span className="text-gray500">[</span>
          <div className="ml-4">
            {value.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-gray500">{index}:</span>
                <span>{renderValue(item, `${key}[${index}]`, level + 1)}</span>
              </div>
            ))}
            {value.length > 3 && (
              <div className="text-gray500">... and {value.length - 3} more items</div>
            )}
          </div>
          <span className="text-gray500">]</span>
        </div>
      )
    }
    
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="ml-2">
          <span className="text-gray500">{'{'}</span>
          <div className="ml-4">
            {Object.entries(value).slice(0, 5).map(([objKey, objValue]) => (
              <div key={objKey} className="flex items-start space-x-2">
                <span className="font-medium text-gray700">{objKey}:</span>
                <span>{renderValue(objValue, `${key}.${objKey}`, level + 1)}</span>
              </div>
            ))}
            {Object.keys(value).length > 5 && (
              <div className="text-gray500">... and {Object.keys(value).length - 5} more fields</div>
            )}
          </div>
          <span className="text-gray500">{'}'}</span>
        </div>
      )
    }
    
    return <span className="text-gray600">{formatValue(value)}</span>
  }

  return (
    <div
      className={`p-4 border rounded-lg transition-colors ${
        isSelected
          ? 'border-primary bg-blue-50'
          : 'border-gray200 hover:border-gray300'
      }`}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray900 truncate">
              {document.id}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray500">
                Document ID
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary hover:text-blue-600 transition-colors"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </div>
          
          {/* Document Data */}
          <div className="bg-gray50 rounded p-3 text-sm">
            {showRawData ? (
              <pre className="whitespace-pre-wrap text-gray700">
                {JSON.stringify(document.data, null, 2)}
              </pre>
            ) : (
              <div className="space-y-2">
                {Object.entries(document.data).map(([key, value]) => (
                  <div key={key} className="flex items-start space-x-2">
                    <span className="font-medium text-gray700 min-w-0 flex-shrink-0">
                      {key}:
                    </span>
                    <div className="flex-1 min-w-0">
                      {renderValue(value, key)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
