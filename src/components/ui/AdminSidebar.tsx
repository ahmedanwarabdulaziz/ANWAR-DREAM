"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/businesses', label: 'Businesses' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/database', label: 'Database' },
  { href: '/admin/business-approval', label: 'Business Approval' },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavLinks = () => (
    <nav className="mt-4 space-y-1">
      {navItems.map(item => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${active ? 'bg-gray100 text-primary' : 'text-gray700 hover:bg-gray50'}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray200">
        <div className="px-4 h-14 flex items-center justify-between">
          <button aria-label="Open menu" className="text-gray700" onClick={() => setOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="text-primary font-bold">Admin</div>
          <div className="w-6" />
        </div>
      </div>

      {/* Layout */}
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 border-r border-gray200 min-h-screen sticky top-0">
          <div className="h-16 flex items-center px-4 text-primary font-bold">Admin</div>
          <div className="px-3 pb-6 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="flex-1 overflow-y-auto">
              <NavLinks />
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 w-full px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Sidebar - mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
              <div className="h-12 flex items-center justify-between px-4 border-b border-gray200">
                <div className="text-primary font-bold">Admin</div>
                <button aria-label="Close menu" className="text-gray700" onClick={() => setOpen(false)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-gray200">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
