import { useAppStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Select } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CountryCode } from '@/types'

const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'EU', name: 'Eurozone', flag: '🇪🇺' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
]

export function ChartControls() {
  const {
    chartConfig,
    setViewMode,
    toggleRecessions,
    toggleAnnotations,
    setSelectedCountries,
  } = useAppStore()

  const handleCountryToggle = (country: CountryCode) => {
    const current = chartConfig.selectedCountries
    if (current.includes(country)) {
      // Don't allow deselecting all countries
      if (current.length > 1) {
        setSelectedCountries(current.filter((c) => c !== country))
      }
    } else {
      setSelectedCountries([...current, country])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
      {/* View mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">View:</span>
        <div className="flex rounded-md border border-border">
          <Button
            variant={chartConfig.viewMode === 'absolute' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-r-none"
            onClick={() => setViewMode('absolute')}
          >
            Absolute
          </Button>
          <Button
            variant={chartConfig.viewMode === 'roc' ? 'default' : 'ghost'}
            size="sm"
            className="rounded-l-none"
            onClick={() => setViewMode('roc')}
          >
            6M RoC
          </Button>
        </div>
      </div>

      {/* Country selection */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Countries:</span>
        <div className="flex gap-1">
          {COUNTRIES.map(({ code, name, flag }) => (
            <Toggle
              key={code}
              pressed={chartConfig.selectedCountries.includes(code)}
              onPressedChange={() => handleCountryToggle(code)}
              className={cn(
                'px-2 py-1 text-sm',
                chartConfig.selectedCountries.includes(code) && 'bg-primary text-primary-foreground'
              )}
              title={name}
            >
              <span className="mr-1">{flag}</span>
              {code}
            </Toggle>
          ))}
        </div>
      </div>

      {/* Chart options */}
      <div className="flex items-center gap-2">
        <Toggle
          pressed={chartConfig.showRecessions}
          onPressedChange={toggleRecessions}
          className="text-sm"
        >
          Recessions
        </Toggle>
        <Toggle
          pressed={chartConfig.showAnnotations}
          onPressedChange={toggleAnnotations}
          className="text-sm"
        >
          Annotations
        </Toggle>
      </div>
    </div>
  )
}
