import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface RewardTileProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  pointsRequired: number
  imageUrl?: string
  isAvailable?: boolean
  onClick?: () => void
}

export const RewardTile = forwardRef<HTMLDivElement, RewardTileProps>(
  ({ 
    title, 
    description, 
    pointsRequired, 
    imageUrl, 
    isAvailable = true, 
    onClick,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'bg-surface rounded-xl p-6 cursor-pointer transition-all duration-normal hover:scale-[1.02] hover:shadow-lg group',
          !isAvailable && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={isAvailable ? onClick : undefined}
        {...props}
      >
        {imageUrl && (
          <div className="aspect-video bg-surface/50 rounded-lg mb-4 overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-h2 text-primary font-semibold">{title}</h3>
          <p className="text-caption text-muted">{description}</p>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-primary">
              {pointsRequired.toLocaleString()} points
            </span>
            {isAvailable ? (
              <span className="text-xs text-success">Available</span>
            ) : (
              <span className="text-xs text-error">Unavailable</span>
            )}
          </div>
        </div>
      </div>
    )
  }
)

RewardTile.displayName = 'RewardTile'

