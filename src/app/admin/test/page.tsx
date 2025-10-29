'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/ui'

export default function AdminDashboardTestPage() {
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalCustomers: 142,
    totalBusinesses: 12,
    totalAdmins: 2,
    recentSignups: 8
  })

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
          <h1 className="text-display text-h1 text-primary mb-2">
            Admin Dashboard
          </h1>
          <p className="text-body text-gray600">
            Welcome back! Manage your rewards platform.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Customers</p>
                <p className="text-2xl font-bold text-primary">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Businesses</p>
                <p className="text-2xl font-bold text-primary">{stats.totalBusinesses}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Admins</p>
                <p className="text-2xl font-bold text-primary">{stats.totalAdmins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray600 mb-1">Recent Signups</p>
                <p className="text-2xl font-bold text-primary">{stats.recentSignups}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* User Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <h2 className="text-h2 text-primary mb-4">User Management</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">View All Users</h3>
                    <p className="text-sm text-gray600">Browse and manage user accounts</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">User Analytics</h3>
                    <p className="text-sm text-gray600">View user activity and insights</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Role Management</h3>
                    <p className="text-sm text-gray600">Assign and modify user roles</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
            </div>
          </div>

          {/* System Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <h2 className="text-h2 text-primary mb-4">System Management</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Rewards Management</h3>
                    <p className="text-sm text-gray600">Create and manage reward programs</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">System Settings</h3>
                    <p className="text-sm text-gray600">Configure platform settings</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Security Logs</h3>
                    <p className="text-sm text-gray600">Monitor security events</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
            </div>
          </div>

          {/* Database Management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray200">
            <h2 className="text-h2 text-primary mb-4">Database Management</h2>
            <div className="space-y-3">
              <a href="/admin/database" className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors block">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">View Collections</h3>
                    <p className="text-sm text-gray600">Browse and manage Firestore collections</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </a>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Data Export</h3>
                    <p className="text-sm text-gray600">Export collection data</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
              <button className="w-full text-left p-4 rounded-lg border border-gray200 hover:bg-gray50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray900">Backup & Restore</h3>
                    <p className="text-sm text-gray600">Manage database backups</p>
                  </div>
                  <span className="text-gray400">→</span>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-h2 text-primary mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="text-center py-8 text-gray500">
              <svg className="w-12 h-12 text-gray400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray900 mb-2">
                No Recent Activity
              </h3>
              <p className="text-gray600">
                Activity will appear here as users interact with the platform
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

