import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

export interface ToggleProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed, onPressedChange, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          pressed && 'bg-secondary text-foreground',
          'h-9 px-3',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'
