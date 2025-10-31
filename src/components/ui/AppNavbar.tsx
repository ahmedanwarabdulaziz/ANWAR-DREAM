'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from './Button'

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { user, userData, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

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

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

  // Admin navigation items with icons
  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/database', label: 'Database', icon: '🗄️' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
    { href: '/admin/customers', label: 'Customers', icon: '👥' },
    { href: '/admin/businesses', label: 'Businesses', icon: '🏢' },
    { href: '/admin/business-approval', label: 'Approvals', icon: '✅' },
    { href: '/admin/transactions', label: 'Transactions', icon: '💳' },
  ]

  // Business navigation items with icons
  const businessNavItems = [
    { href: '/business/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/business/customers', label: 'Customers', icon: '👥' },
    { href: '/business/classes', label: 'Customer Classes', icon: '🎯' },
    { href: '/business/settings', label: 'Settings', icon: '⚙️' },
  ]

  // Customer navigation items with icons
  const customerNavItems = [
    { href: '/customer/dashboard', label: 'Dashboard', icon: '📊' },
  ]

  // Get navigation items based on role OR current path (fallback)
  const getNavItems = () => {
    // First try to get from userData role
    if (userData?.role === 'admin') return adminNavItems
    if (userData?.role === 'business') return businessNavItems
    if (userData?.role === 'customer') return customerNavItems
    
    // Fallback: detect from pathname
    if (pathname?.startsWith('/admin/')) return adminNavItems
    if (pathname?.startsWith('/business/')) return businessNavItems
    if (pathname?.startsWith('/customer/')) return customerNavItems
    
    return []
  }

  const navItems = getNavItems()
  
  const getRoleLabel = () => {
    if (userData?.role === 'admin') return 'Admin'
    if (userData?.role === 'business') return 'Business'
    if (userData?.role === 'customer') return 'Customer'
    
    // Fallback: detect from pathname
    if (pathname?.startsWith('/admin/')) return 'Admin'
    if (pathname?.startsWith('/business/')) return 'Business'
    if (pathname?.startsWith('/customer/')) return 'Customer'
    
    return ''
  }

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/95 border-b border-gray200 shadow-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <a href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl font-bold text-primary group-hover:text-blue-600 transition-colors">
                Rewards
              </span>
              {isAuthenticated && userData && (
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-primary bg-blue-50 rounded-full border border-blue-100">
                  {getRoleLabel()}
                </span>
              )}
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.length > 0 ? (
              <>
                <div className="flex items-center space-x-1 bg-gray50 rounded-lg p-1">
                  {navItems.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray700 hover:bg-white hover:text-primary'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
                {(isAuthenticated && userData) && (
                  <div className="ml-6 pl-6 border-l border-gray200 flex items-center space-x-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray500">{getRoleLabel()}</span>
                      <span className="text-sm font-semibold text-gray900">
                        {userData.name || 'User'}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="min-w-[100px]"
                    >
                      {isLoggingOut ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing out...
                        </span>
                      ) : (
                        'Sign Out'
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <a
                  href="/signin"
                  className="px-4 py-2 text-sm font-medium text-gray700 hover:text-primary transition-colors"
                >
                  Sign In
                </a>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/signup')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray700 hover:text-primary hover:bg-gray50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray200 bg-white shadow-lg">
          <div className="px-4 py-4 space-y-1">
              {navItems.length > 0 ? (
              <>
                {(isAuthenticated && userData) && (
                  <div className="pb-3 mb-3 border-b border-gray200">
                    <div className="text-xs font-semibold text-gray500 uppercase tracking-wider mb-2">
                      {getRoleLabel()} Menu
                    </div>
                    <div className="text-sm font-semibold text-gray900">
                      {userData.name || 'User'}
                    </div>
                  </div>
                )}
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray700 hover:bg-gray50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
                {(isAuthenticated && userData) && (
                  <div className="pt-4 mt-4 border-t border-gray200">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isLoggingOut ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing out...
                        </span>
                      ) : (
                        'Sign Out'
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <a
                  href="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-gray700 hover:bg-gray50 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-white bg-primary hover:bg-blue-700 transition-colors text-center"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

