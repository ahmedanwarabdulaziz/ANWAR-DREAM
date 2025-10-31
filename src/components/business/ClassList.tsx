/**
 * Class List Component
 * Displays all customer classes for a business
 */

'use client'

import { motion } from 'framer-motion'
import { CustomerClass } from '@/lib/types/customerClass'

interface ClassListProps {
  classes: CustomerClass[]
  onViewDetails: (customerClass: CustomerClass) => void
  onEdit: (customerClass: CustomerClass) => void
  onRefresh: () => void
  onCreate?: () => void
}

export function ClassList({ classes, onViewDetails, onEdit, onRefresh, onCreate }: ClassListProps) {
  if (classes.length === 0) {
    return (
      <div>
        {/* Header with Add button */}
        {onCreate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-display text-h1 text-primary mb-2">
                Customer Classes
              </h1>
              <p className="text-body text-gray600">
                Manage your customer classes and configure points settings
              </p>
            </div>
            <button
              onClick={onCreate}
              className="w-10 h-10 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
              title="Create new class"
              aria-label="Create new class"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 shadow-sm border border-gray200 text-center"
        >
          <div className="w-16 h-16 bg-gray100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-gray900 mb-2">No Customer Classes Yet</h3>
          <p className="text-gray600 mb-6">
            Create your first custom customer class to organize your customers
          </p>
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Class
            </button>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with Add button */}
      {onCreate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-display text-h1 text-primary mb-2">
              Customer Classes
            </h1>
            <p className="text-body text-gray600">
              Manage your customer classes and configure points settings
            </p>
          </div>
          <button
            onClick={onCreate}
            className="w-10 h-10 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm"
            title="Create new class"
            aria-label="Create new class"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </motion.div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classes.map((customerClass, index) => (
        <motion.div
          key={customerClass.classId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray200 p-6 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray900">
                  {customerClass.name}
                </h3>
                {customerClass.type === 'permanent' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    Permanent
                  </span>
                )}
                {customerClass.type === 'custom' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">
                    Custom
                  </span>
                )}
              </div>
              {customerClass.description && (
                <p className="text-sm text-gray600 line-clamp-2">
                  {customerClass.description}
                </p>
              )}
            </div>
            <div className={`w-3 h-3 rounded-full ${
              customerClass.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`} title={customerClass.isActive ? 'Active' : 'Inactive'} />
          </div>

          {/* Points Configuration */}
          <div className="mb-4 p-3 bg-gray50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray700 mb-2">Points Configuration</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <span className="block text-gray600 mb-1">Welcome</span>
                <span className="font-semibold text-gray900">
                  {customerClass.points.welcomePoints}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-gray600 mb-1">Referrer</span>
                <span className="font-semibold text-gray900">
                  {customerClass.points.referrerPoints}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-gray600 mb-1">Referred</span>
                <span className="font-semibold text-gray900">
                  {customerClass.points.referredPoints}
                </span>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-xs font-semibold text-gray700 mb-2">Quick Stats</h4>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray600">Customers:</span>
              <span className="font-semibold text-primary">
                {customerClass.analytics.totalCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray600">Points Distributed:</span>
              <span className="font-semibold text-primary">
                {customerClass.analytics.totalPointsDistributed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onViewDetails(customerClass)}
              className="flex-1 px-4 py-2 bg-gray100 text-gray700 rounded-lg hover:bg-gray200 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            <button
              onClick={() => onEdit(customerClass)}
              className="px-3 py-2 bg-gray100 text-gray700 rounded-lg hover:bg-gray200 transition-colors"
              title="Edit class settings"
              aria-label="Edit class"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
      </div>
    </div>
  )
}

