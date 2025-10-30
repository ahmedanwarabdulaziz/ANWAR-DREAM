'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Button } from './Button'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-surface/50">
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
            <a href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="/rewards" className="text-foreground hover:text-primary transition-colors">
              Rewards
            </a>
            <a href="/programs" className="text-foreground hover:text-primary transition-colors">
              Programs
            </a>
            <Button variant="primary" size="sm">
              Install App
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary transition-colors"
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
          <div className="md:hidden border-t border-surface/50">
            <div className="py-4 space-y-4">
              <a href="/" className="block text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="/rewards" className="block text-foreground hover:text-primary transition-colors">
                Rewards
              </a>
              <a href="/programs" className="block text-foreground hover:text-primary transition-colors">
                Programs
              </a>
              <Button variant="primary" size="sm" className="w-full">
                Install App
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}



