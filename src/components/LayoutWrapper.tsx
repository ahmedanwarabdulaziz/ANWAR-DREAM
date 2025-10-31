'use client'

import { AppNavbar } from '@/components/ui/AppNavbar'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  )
}

