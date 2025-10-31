'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button, RewardTile, InstallPrompt } from '@/components/ui'
import { staggerContainer, staggerItem } from '@/components/providers/MotionProvider'
import { BusinessRegistrationModal } from '@/components/BusinessRegistrationModal'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)
  const { isAuthenticated, userData } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto max-w-6xl px-4 py-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        >
          <h1 className="text-display text-h1 text-primary mb-6">
            Unlock rewards. Redeem in seconds.
          </h1>
          <p className="text-body text-gray600 mb-8 max-w-2xl mx-auto">
            Experience the luxury of instant rewards with our premium rewards platform. 
            Scan, earn, and redeem with elegance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="navy" size="lg" onClick={() => window.location.href = '/signup'}>
              Sign Up
            </Button>
            <Button variant="orange" size="lg">
              Learn More
            </Button>
            {/* Only show Upgrade to Business button for authenticated customers */}
            {isAuthenticated && userData?.role === 'customer' && (
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setIsBusinessModalOpen(true)}
              >
                Upgrade to Business
              </Button>
            )}
          </div>
        </motion.div>
        
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <RewardTile
              title="Scan & Earn"
              description="Use your camera to scan QR codes and instantly earn rewards points."
              pointsRequired={0}
              isAvailable={true}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <RewardTile
              title="Instant Redemption"
              description="Redeem your points for exclusive rewards in seconds, not days."
              pointsRequired={0}
              isAvailable={true}
            />
          </motion.div>
          <motion.div variants={staggerItem}>
            <RewardTile
              title="Premium Experience"
              description="Enjoy a luxury rewards experience designed for discerning users."
              pointsRequired={0}
              isAvailable={true}
            />
          </motion.div>
        </motion.div>
      </main>
      
      <InstallPrompt />
      
      {/* Business Registration Modal */}
      <BusinessRegistrationModal 
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
      />
    </div>
  );
}