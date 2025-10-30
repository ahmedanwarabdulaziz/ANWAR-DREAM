import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ListRowProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  density?: 'compact' | 'cozy'
  onClick?: () => void
}

export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(
  ({ children, density = 'cozy', onClick, className, ...props }, ref) => {
    const densityClasses = {
      compact: 'py-2',
      cozy: 'py-4',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-center px-4 border-b border-surface/50 last:border-b-0 transition-colors',
          densityClasses[density],
          onClick && 'cursor-pointer hover:bg-surface/50',
          className
        )}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ListRow.displayName = 'ListRow'



