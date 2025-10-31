'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, setDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface BusinessType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
}

interface BusinessCategory {
  id: string
  name: string
  description?: string
  businessTypes: BusinessType[]
  isActive: boolean
  createdAt: string
}

export default function BusinessCategoriesPage() {
  const [categories, setCategories] = useState<BusinessCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddType, setShowAddType] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newType, setNewType] = useState({ name: '', description: '' })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const categoriesRef = collection(db, 'business_categories')
      const snapshot = await getDocs(query(categoriesRef, orderBy('name')))
      
      const categoriesData: BusinessCategory[] = []
      snapshot.forEach((doc) => {
        categoriesData.push({
          id: doc.id,
          ...doc.data()
        } as BusinessCategory)
      })
      
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading categories:', error)
      setError('Failed to load business categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    try {
      // Generate unique ID for category
      const categoryId = 'CAT_' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase()
      
      const categoryData = {
        id: categoryId,
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        businessTypes: [],
        isActive: true,
        createdAt: new Date().toISOString()
      }

      // Use setDoc with custom ID instead of addDoc
      await setDoc(doc(db, 'business_categories', categoryId), categoryData)
      setNewCategory({ name: '', description: '' })
      setShowAddCategory(false)
      loadCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Failed to add category')
    }
  }

  const handleAddBusinessType = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newType.name.trim() || !selectedCategory) {
      return
    }

    try {
      const category = categories.find(c => c.id === selectedCategory)
      if (!category) {
        return
      }

      // Generate unique ID for business type
      const businessTypeId = 'BT_' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase()

      const businessType: BusinessType = {
        id: businessTypeId,
        name: newType.name.trim(),
        description: newType.description.trim(),
        isActive: true,
        createdAt: new Date().toISOString()
      }

      const updatedTypes = [...category.businessTypes, businessType]

      await updateDoc(doc(db, 'business_categories', selectedCategory), {
        businessTypes: updatedTypes
      })

      setNewType({ name: '', description: '' })
      setShowAddType(false)
      setSelectedCategory(null)
      loadCategories()
    } catch (error) {
      console.error('Error adding business type:', error)
      setError('Failed to add business type: ' + (error as Error).message)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category and all its business types?')) return

    try {
      await deleteDoc(doc(db, 'business_categories', categoryId))
      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category')
    }
  }

  const handleDeleteBusinessType = async (categoryId: string, typeId: string) => {
    if (!confirm('Are you sure you want to delete this business type?')) return

    try {
      const category = categories.find(c => c.id === categoryId)
      if (!category) return

      const updatedTypes = category.businessTypes.filter(type => type.id !== typeId)
      await updateDoc(doc(db, 'business_categories', categoryId), {
        businessTypes: updatedTypes
      })

      loadCategories()
    } catch (error) {
      console.error('Error deleting business type:', error)
      setError('Failed to delete business type')
    }
  }

  const initializeDefaultCategories = async () => {
    const defaultCategories = [
      {
        name: 'Food & Beverage',
        description: 'Restaurants, cafes, food trucks, and beverage establishments',
        businessTypes: [
          { name: 'Cafe', description: 'Coffee shops and casual dining cafes' },
          { name: 'Restaurant', description: 'Full-service dining establishments' },
          { name: 'Fast Food Restaurant', description: 'Quick service restaurants' },
          { name: 'Food Truck', description: 'Mobile food service vehicles' }
        ]
      },
      {
        name: 'Health & Wellness',
        description: 'Healthcare, fitness, and wellness services',
        businessTypes: [
          { name: 'Gym', description: 'Fitness centers and gyms' },
          { name: 'Spa', description: 'Beauty and wellness spas' },
          { name: 'Clinic', description: 'Medical and health clinics' },
          { name: 'Yoga Studio', description: 'Yoga and meditation centers' }
        ]
      },
      {
        name: 'Retail',
        description: 'Stores and retail establishments',
        businessTypes: [
          { name: 'Clothing Store', description: 'Fashion and apparel retail' },
          { name: 'Electronics Store', description: 'Technology and electronics retail' },
          { name: 'Grocery Store', description: 'Food and household goods retail' },
          { name: 'Bookstore', description: 'Books and educational materials' }
        ]
      }
    ]

    try {
      for (const category of defaultCategories) {
        // Generate unique ID for category
        const categoryId = 'CAT_' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase()
        
        const businessTypes = category.businessTypes.map(type => ({
          id: 'BT_' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase(),
          name: type.name,
          description: type.description,
          isActive: true,
          createdAt: new Date().toISOString()
        }))

        await setDoc(doc(db, 'business_categories', categoryId), {
          id: categoryId,
          name: category.name,
          description: category.description,
          businessTypes,
          isActive: true,
          createdAt: new Date().toISOString()
        })
      }

      loadCategories()
    } catch (error) {
      console.error('Error initializing categories:', error)
      setError('Failed to initialize default categories')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray600">Loading business categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-display text-h1 text-primary">
                  Business Categories & Types
                </h1>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="p-2 text-primary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Add New Category"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <p className="text-body text-gray600">
                Manage business categories and their associated business types
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Initialize Default Categories */}
        {categories.length === 0 && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">No Categories Found</h3>
            <p className="text-blue-700 mb-4">
              Initialize the system with default business categories and types.
            </p>
            <button
              onClick={initializeDefaultCategories}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Initialize Default Categories
            </button>
          </div>
        )}


        {/* Categories List */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray900">{category.name}</h3>
                  {category.description && (
                    <p className="text-gray600 mt-1">{category.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setShowAddType(true)
                    }}
                    className="p-2 text-primary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Add Business Type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Business Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.businessTypes.map((type) => (
                  <div key={type.id} className="p-4 bg-gray50 rounded-lg border border-gray200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray900">{type.name}</h4>
                        {type.description && (
                          <p className="text-sm text-gray600 mt-1">{type.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBusinessType(category.id, type.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete Business Type"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>


      </main>

      {/* Add Category Popup Dialog */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray900 mb-4">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Food & Beverage"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief description of the category"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Category
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-4 py-2 bg-gray200 text-gray700 rounded-lg hover:bg-gray300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Business Type Popup Dialog */}
      {showAddType && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray900 mb-4">Add Business Type</h3>
            <p className="text-sm text-gray600 mb-4">
              Adding to: <span className="font-medium">{categories.find(c => c.id === selectedCategory)?.name}</span>
            </p>
            <form onSubmit={handleAddBusinessType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Business Type Name
                </label>
                <input
                  type="text"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Cafe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray700 mb-1">
                  Description
                </label>
                <textarea
                  value={newType.description}
                  onChange={(e) => setNewType({ ...newType, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Brief description of the business type"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Business Type
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddType(false)
                    setSelectedCategory(null)
                  }}
                  className="px-4 py-2 bg-gray200 text-gray700 rounded-lg hover:bg-gray300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
