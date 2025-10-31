'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { Button } from './Button'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, userData, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-gray200">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-display text-xl font-bold text-primary">
              Rewards
            </h1>
          </div>

          {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-gray700 hover:text-primary transition-colors">
                  Home
                </a>
                
                {isAuthenticated ? (
                  <>
                    {/* Admin Menu Items */}
                    {userData?.role === 'admin' && (
                      <>
                        <a href="/admin/dashboard" className="text-gray700 hover:text-primary transition-colors">
                          Dashboard
                        </a>
                        <a href="/admin/database" className="text-gray700 hover:text-primary transition-colors">
                          Database
                        </a>
                        <a href="/admin/categories" className="text-gray700 hover:text-primary transition-colors">
                          Categories
                        </a>
                        <a href="/admin/customers" className="text-gray700 hover:text-primary transition-colors">
                          Customers
                        </a>
                        <a href="/admin/business-approval" className="text-gray700 hover:text-primary transition-colors">
                          Business Approval
                        </a>
                      </>
                    )}
                    
                    {/* Business Menu Items */}
                    {userData?.role === 'business' && (
                      <>
                        <a href="/business/dashboard" className="text-gray700 hover:text-primary transition-colors">
                          Dashboard
                        </a>
                        <a href="/business/classes" className="text-gray700 hover:text-primary transition-colors">
                          Customer Classes
                        </a>
                      </>
                    )}
                    
                    {/* Customer Menu Items */}
                    {userData?.role === 'customer' && (
                      <>
                        <a href="/customer/dashboard" className="text-gray700 hover:text-primary transition-colors">
                          Dashboard
                        </a>
                      </>
                    )}
                    
                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray600">
                        Welcome, {userData?.name || 'User'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Signing out...
                            </div>
                          ) : (
                            'Sign Out'
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <a href="/signin" className="text-gray700 hover:text-primary transition-colors">
                      Sign In
                    </a>
                    <a href="/signup" className="text-gray700 hover:text-primary transition-colors">
                      Sign Up
                    </a>
                  </>
                )}
                
                <Button variant="navy" size="sm">
                  Install App
                </Button>
              </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray700 hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - slide-in drawer */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMenuOpen(false)} />
          {/* panel */}
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray200">
              <span className="text-primary font-semibold">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-gray700 hover:text-primary transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <a href="/" className="block text-gray700 hover:text-primary transition-colors">
                Home
              </a>

              {isAuthenticated ? (
                <>
                  {/* Admin Menu Items */}
                  {userData?.role === 'admin' && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray500 mb-2">Admin</div>
                      <div className="space-y-2">
                        <a href="/admin/dashboard" className="block text-gray700 hover:text-primary transition-colors">Dashboard</a>
                        <a href="/admin/database" className="block text-gray700 hover:text-primary transition-colors">Database</a>
                        <a href="/admin/categories" className="block text-gray700 hover:text-primary transition-colors">Categories</a>
                        <a href="/admin/customers" className="block text-gray700 hover:text-primary transition-colors">Customers</a>
                        <a href="/admin/business-approval" className="block text-gray700 hover:text-primary transition-colors">Business Approval</a>
                        <a href="/admin/businesses" className="block text-gray700 hover:text-primary transition-colors">Businesses</a>
                      </div>
                    </div>
                  )}

                  {/* Business Menu Items */}
                  {userData?.role === 'business' && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray500 mb-2">Business</div>
                      <div className="space-y-2">
                        <a href="/business/dashboard" className="block text-gray700 hover:text-primary transition-colors">Dashboard</a>
                        <a href="/business/classes" className="block text-gray700 hover:text-primary transition-colors">Customer Classes</a>
                      </div>
                    </div>
                  )}

                  {/* Customer Menu Items */}
                  {userData?.role === 'customer' && (
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray500 mb-2">Customer</div>
                      <div className="space-y-2">
                        <a href="/customer/dashboard" className="block text-gray700 hover:text-primary transition-colors">Dashboard</a>
                      </div>
                    </div>
                  )}

                  {/* User actions */}
                  <div className="pt-2 border-t border-gray200">
                    <div className="px-1 py-2 text-sm text-gray600">
                      Welcome, {userData?.name || 'User'}
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-1 py-2 text-gray700 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {isLoggingOut ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray600 mr-2"></div>
                          Signing out...
                        </div>
                      ) : (
                        'Sign Out'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <a href="/signin" className="block text-gray700 hover:text-primary transition-colors">Sign In</a>
                  <a href="/signup" className="block text-gray700 hover:text-primary transition-colors">Sign Up</a>
                </div>
              )}

              <Button variant="navy" size="sm" className="w-full mt-2">
                Install App
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
