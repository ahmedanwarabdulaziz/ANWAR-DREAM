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
}

export function ClassList({ classes, onViewDetails, onEdit, onRefresh }: ClassListProps) {
  if (classes.length === 0) {
    return (
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
      </motion.div>
    )
  }

  return (
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
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onViewDetails(customerClass)}
              className="flex-1 px-4 py-2 bg-gray100 text-gray700 rounded-lg hover:bg-gray200 transition-colors text-sm font-medium"
            >
              View Details
            </button>
            {customerClass.type === 'custom' && (
              <button
                onClick={() => onEdit(customerClass)}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

