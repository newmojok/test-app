import { cn, formatPercent, formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  format?: 'percent' | 'currency' | 'number'
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  format = 'number',
  description,
  trend,
  trendValue,
  className,
  onClick,
}: MetricCardProps) {
  const formattedValue = () => {
    switch (format) {
      case 'percent':
        return formatPercent(value)
      case 'currency':
        return formatCurrency(value)
      default:
        return value.toLocaleString()
    }
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColor =
    trend === 'up'
      ? 'text-accent'
      : trend === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground'

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:bg-card/80 hover:border-primary/50',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn('text-2xl font-bold', trendColor)}>{formattedValue()}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1', trendColor)}>
              <TrendIcon className="h-4 w-4" />
              {trendValue && <span className="text-sm font-medium">{trendValue}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
