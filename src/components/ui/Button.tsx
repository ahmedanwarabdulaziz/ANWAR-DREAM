import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'navy' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    
    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-blue-600 hover:shadow-lg hover:scale-[0.97]',
      secondary: 'bg-secondary text-white hover:bg-orange-500 hover:shadow-lg hover:scale-[0.97]',
      navy: 'bg-blue-800 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-[0.97]',
      orange: 'bg-orange-500 text-white hover:bg-orange-400 hover:shadow-lg hover:scale-[0.97]',
      ghost: 'text-gray700 hover:bg-gray100 border border-gray200',
    }
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm rounded-md',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-lg',
    }
    
    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
