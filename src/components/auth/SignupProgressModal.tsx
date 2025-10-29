'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Modal, ModalContent } from '@/components/ui/Modal'
import { Business } from '@/lib/types/customerClass'

interface SignupProgressModalProps {
  isOpen: boolean
  businessId?: string
  business?: Business | null
  currentStep: number
}

interface ProgressStep {
  id: number
  title: string
  description: string
  icon: string
}

const steps: ProgressStep[] = [
  {
    id: 1,
    title: 'Creating your account',
    description: 'Setting up your profile',
    icon: '👤'
  },
  {
    id: 2,
    title: 'Joining business program',
    description: 'Connecting you to rewards',
    icon: '🏢'
  },
  {
    id: 3,
    title: 'Activating your points',
    description: 'Welcome bonus incoming',
    icon: '✨'
  },
  {
    id: 4,
    title: 'Almost done',
    description: 'Finalizing everything',
    icon: '🎉'
  }
]

export function SignupProgressModal({ 
  isOpen, 
  businessId, 
  business, 
  currentStep 
}: SignupProgressModalProps) {
  const [displayedStep, setDisplayedStep] = useState(1)

  // Animate step progression
  useEffect(() => {
    if (currentStep > displayedStep) {
      const timer = setTimeout(() => {
        setDisplayedStep(currentStep)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [currentStep, displayedStep])

  return (
    <Modal isOpen={isOpen} onClose={() => {}} size="md">
      <ModalContent>
        <div className="text-center py-8">
          {/* Business Logo and Name */}
          {business && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {(business as any).logoUrl ? (
                <div className="mb-4 flex justify-center">
                  <img
                    src={(business as any).logoUrl}
                    alt={business.name}
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="mb-4 flex justify-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🏢</span>
                  </div>
                </div>
              )}
              <h3 className="text-2xl font-bold text-primary">{business.name}</h3>
              <p className="text-sm text-gray600 mt-2">Welcome to our rewards program!</p>
            </motion.div>
          )}

          {/* Loading Spinner */}
          <div className="mb-8 flex justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
            />
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {steps.map((step) => {
                const isCompleted = displayedStep > step.id
                const isCurrent = displayedStep === step.id
                const isPending = displayedStep < step.id

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: isPending ? 0.4 : 1,
                      x: 0
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                      isCurrent 
                        ? 'bg-primary/5 border-2 border-primary' 
                        : isCompleted
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'bg-gray50 border-2 border-gray200'
                    }`}
                  >
                    {/* Icon/Status */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      ) : isCurrent ? (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xl"
                        >
                          {step.icon}
                        </motion.div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray300 flex items-center justify-center text-gray400 text-xl">
                          {step.icon}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h4 className={`font-semibold ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray600'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isCurrent ? 'text-gray700' : isCompleted ? 'text-green-600' : 'text-gray500'
                      }`}>
                        {step.description}
                      </p>
                      {isCurrent && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden"
                        >
                          <div className="h-full bg-primary rounded-full w-1/3" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Footer Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray600 mt-6"
          >
            This will only take a moment...
          </motion.p>
        </div>
      </ModalContent>
    </Modal>
  )
}

