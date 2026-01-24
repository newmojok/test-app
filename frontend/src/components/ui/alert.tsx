import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, HTMLAttributes } from 'react'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-primary/50 bg-primary/10 text-primary [&>svg]:text-primary',
        success: 'border-accent/50 bg-accent/10 text-accent [&>svg]:text-accent',
        warning: 'border-chart-yellow/50 bg-chart-yellow/10 text-chart-yellow [&>svg]:text-chart-yellow',
        destructive: 'border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

export function AlertIcon({ variant }: { variant?: 'info' | 'success' | 'warning' | 'destructive' }) {
  const iconProps = { className: 'h-4 w-4' }
  switch (variant) {
    case 'success':
      return <CheckCircle {...iconProps} />
    case 'warning':
      return <AlertTriangle {...iconProps} />
    case 'destructive':
      return <AlertCircle {...iconProps} />
    default:
      return <Info {...iconProps} />
  }
}

export { Alert, AlertTitle, AlertDescription }
