'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MotionProviderProps {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
    >
      {children}
    </motion.div>
  )
}

// Page transition variants
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const pageTransition = {
  duration: 0.25,
  ease: [0.33, 1, 0.68, 1],
}

// Stagger animation for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.4,
    ease: [0.33, 1, 0.68, 1],
  },
}

// QR success animation
export const qrSuccessVariants = {
  initial: { scale: 1, borderColor: 'transparent' },
  animate: { 
    scale: [1, 1.05, 1],
    borderColor: ['transparent', '#16A34A', 'transparent'],
    backgroundColor: ['transparent', 'rgba(22, 163, 74, 0.1)', 'transparent'],
  },
  transition: {
    duration: 0.18,
    ease: 'easeOut',
  },
}

