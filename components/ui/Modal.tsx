import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { clsx } from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-normal"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-fast"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-normal"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-fast"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={clsx(
                  'w-full transform overflow-hidden rounded-xl bg-surface shadow-xl transition-all',
                  sizeClasses[size]
                )}
              >
                {title && (
                  <Dialog.Title className="sr-only">
                    {title}
                  </Dialog.Title>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

interface ModalHeaderProps {
  children: React.ReactNode
  onClose?: () => void
}

export function ModalHeader({ children, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-surface/50">
      <div className="text-h2 text-foreground">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

interface ModalContentProps {
  children: React.ReactNode
}

export function ModalContent({ children }: ModalContentProps) {
  return (
    <div className="p-6">
      {children}
    </div>
  )
}

interface ModalActionsProps {
  children: React.ReactNode
}

export function ModalActions({ children }: ModalActionsProps) {
  return (
    <div className="flex gap-3 justify-end p-6 pt-4 border-t border-surface/50">
      {children}
    </div>
  )
}

