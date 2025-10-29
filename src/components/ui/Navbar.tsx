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
                          variant="ghost" 
                          size="sm"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                        >
                          {isLoggingOut ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray600 mr-2"></div>
                              Logging out...
                            </div>
                          ) : (
                            'Logout'
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

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden border-t border-gray200">
                <div className="py-4 space-y-4">
                  <a href="/" className="block text-gray700 hover:text-primary transition-colors">
                    Home
                  </a>
                  
                  {isAuthenticated ? (
                    <>
                      {/* Admin Menu Items */}
                      {userData?.role === 'admin' && (
                        <>
                          <a href="/admin/dashboard" className="block text-gray700 hover:text-primary transition-colors">
                            Dashboard
                          </a>
                          <a href="/admin/database" className="block text-gray700 hover:text-primary transition-colors">
                            Database
                          </a>
                          <a href="/admin/categories" className="block text-gray700 hover:text-primary transition-colors">
                            Categories
                          </a>
                          <a href="/admin/business-approval" className="block text-gray700 hover:text-primary transition-colors">
                            Business Approval
                          </a>
                        </>
                      )}
                      
                      {/* Business Menu Items */}
                      {userData?.role === 'business' && (
                        <>
                          <a href="/business/dashboard" className="block text-gray700 hover:text-primary transition-colors">
                            Dashboard
                          </a>
                          <a href="/business/classes" className="block text-gray700 hover:text-primary transition-colors">
                            Customer Classes
                          </a>
                        </>
                      )}
                      
                      {/* Customer Menu Items */}
                      {userData?.role === 'customer' && (
                        <>
                          <a href="/customer/dashboard" className="block text-gray700 hover:text-primary transition-colors">
                            Dashboard
                          </a>
                        </>
                      )}
                      
                      <div className="pt-2 border-t border-gray200">
                        <div className="px-2 py-1 text-sm text-gray600">
                          Welcome, {userData?.name || 'User'}
                        </div>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="block w-full text-left px-2 py-2 text-gray700 hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {isLoggingOut ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray600 mr-2"></div>
                              Logging out...
                            </div>
                          ) : (
                            'Logout'
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <a href="/signin" className="block text-gray700 hover:text-primary transition-colors">
                        Sign In
                      </a>
                      <a href="/signup" className="block text-gray700 hover:text-primary transition-colors">
                        Sign Up
                      </a>
                    </>
                  )}
                  
                  <Button variant="navy" size="sm" className="w-full">
                    Install App
                  </Button>
                </div>
              </div>
            )}
      </div>
    </nav>
  )
}
