import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { howellIndicators, type HowellIndicator } from '@/data/howellIndicators'
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Database,
  BookOpen,
  AlertCircle,
} from 'lucide-react'

interface IndicatorCardProps {
  indicator: HowellIndicator
  isExpanded: boolean
  onToggle: () => void
}

function IndicatorCard({ indicator, isExpanded, onToggle }: IndicatorCardProps) {
  const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
      if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
      if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`
      return `$${value.toLocaleString()}`
    }
    if (unit === 'EUR') {
      if (value >= 1e12) return `EUR ${(value / 1e12).toFixed(2)}T`
      return `EUR ${value.toLocaleString()}`
    }
    if (unit === '%') return `${value.toFixed(1)}%`
    if (unit === 'Month') return `Month ${value} of 65`
    return value.toString()
  }

  const getChangeIndicator = () => {
    const change = indicator.currentValue - indicator.previousValue
    const changePercent = (change / indicator.previousValue) * 100

    if (Math.abs(changePercent) < 0.5) return null

    return (
      <span
        className={`text-sm ${changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}
      >
        {changePercent > 0 ? '+' : ''}
        {changePercent.toFixed(1)}%
      </span>
    )
  }

  const SignalIcon = () => {
    switch (indicator.signal) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />
    }
  }

  const categoryColors: Record<string, string> = {
    fed: 'bg-blue-500',
    treasury: 'bg-green-500',
    market: 'bg-purple-500',
    cycle: 'bg-orange-500',
    global: 'bg-cyan-500',
  }

  const categoryLabels: Record<string, string> = {
    fed: 'Federal Reserve',
    treasury: 'Treasury',
    market: 'Market',
    cycle: 'Cycle',
    global: 'Global',
  }

  return (
    <Card className={`transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-12 rounded-full ${categoryColors[indicator.category]}`}
            />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{indicator.shortName}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {categoryLabels[indicator.category]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{indicator.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">
                  {formatValue(indicator.currentValue, indicator.unit)}
                </span>
                {getChangeIndicator()}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <SignalIcon />
                <Badge
                  variant={
                    indicator.signal === 'bullish'
                      ? 'default'
                      : indicator.signal === 'bearish'
                        ? 'destructive'
                        : 'secondary'
                  }
                >
                  {indicator.signal.charAt(0).toUpperCase() + indicator.signal.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({indicator.signalStrength}%)
                </span>
              </div>
            </div>

            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-border pt-4 space-y-4">
          {/* Data Source */}
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium flex items-center gap-2">
                Data Source
                <a
                  href={indicator.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </h4>
              <p className="text-sm text-muted-foreground">{indicator.source.name}</p>
              {indicator.source.seriesId && (
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {indicator.source.seriesId}
                </code>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {indicator.updateFrequency}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated: {indicator.lastUpdated}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">What It Measures</h4>
              <p className="text-sm text-muted-foreground">{indicator.description}</p>
            </div>
          </div>

          {/* How To Use */}
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">How To Use (Howell's Framework)</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-line mt-1 bg-muted/30 p-3 rounded-lg">
                {indicator.howToUse}
              </div>
            </div>
          </div>

          {/* Current Interpretation */}
          <div
            className={`p-4 rounded-lg ${
              indicator.signal === 'bullish'
                ? 'bg-green-500/10 border border-green-500/30'
                : indicator.signal === 'bearish'
                  ? 'bg-red-500/10 border border-red-500/30'
                  : 'bg-yellow-500/10 border border-yellow-500/30'
            }`}
          >
            <h4 className="font-medium flex items-center gap-2">
              {indicator.signal === 'bullish' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : indicator.signal === 'bearish' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Minus className="h-4 w-4 text-yellow-500" />
              )}
              Current Interpretation
            </h4>
            <p className="text-sm mt-1">{indicator.interpretation}</p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <a
              href={indicator.source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                View Live Data <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function HowellToolsPage() {
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set())

  const toggleIndicator = (id: string) => {
    setExpandedIndicators((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedIndicators(new Set(howellIndicators.map((i) => i.id)))
  }

  const collapseAll = () => {
    setExpandedIndicators(new Set())
  }

  // Group indicators by category
  const categories = [
    { key: 'fed', label: 'Federal Reserve', description: 'Core US liquidity indicators' },
    { key: 'treasury', label: 'Treasury', description: 'Government cash management' },
    { key: 'market', label: 'Market Indicators', description: 'Dollar and volatility signals' },
    { key: 'cycle', label: 'Cycle Position', description: 'Structural liquidity cycle' },
    { key: 'global', label: 'Global Central Banks', description: 'International liquidity' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Liquidity Tools</h1>
          <p className="text-muted-foreground mt-1">
            Detailed breakdown of each indicator with sources and interpretation guides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Quick Reference */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Bullish = Liquidity expanding</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span>Bearish = Liquidity contracting</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-yellow-500" />
              <span>Neutral = Mixed signals</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>13-week lead time</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicators by Category */}
      {categories.map((category) => {
        const categoryIndicators = howellIndicators.filter(
          (i) => i.category === category.key
        )

        if (categoryIndicators.length === 0) return null

        return (
          <div key={category.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{category.label}</h2>
              <span className="text-sm text-muted-foreground">{category.description}</span>
            </div>

            <div className="space-y-3">
              {categoryIndicators.map((indicator) => (
                <IndicatorCard
                  key={indicator.id}
                  indicator={indicator}
                  isExpanded={expandedIndicators.has(indicator.id)}
                  onToggle={() => toggleIndicator(indicator.id)}
                />
              ))}
            </div>
          </div>
        )
      })}

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Indicator Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3">Indicator</th>
                  <th className="text-left py-2 px-3">Source</th>
                  <th className="text-left py-2 px-3">What It Tells You</th>
                </tr>
              </thead>
              <tbody>
                {howellIndicators.map((ind) => (
                  <tr key={ind.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-2 px-3 font-medium">{ind.shortName}</td>
                    <td className="py-2 px-3">
                      <a
                        href={ind.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {ind.source.name.split(' - ')[0]}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="py-2 px-3 text-muted-foreground">
                      {ind.description.slice(0, 80)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
