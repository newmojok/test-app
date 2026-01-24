import { useMemo } from 'react'
import type { CorrelationMatrix } from '@/types'

interface CorrelationHeatmapProps {
  data: CorrelationMatrix
  height?: number
}

function getCorrelationColor(value: number): string {
  // Map correlation (-1 to 1) to color
  if (value >= 0.7) return 'var(--color-chart-green)'
  if (value >= 0.3) return 'rgba(34, 197, 94, 0.6)'
  if (value >= 0) return 'rgba(34, 197, 94, 0.3)'
  if (value >= -0.3) return 'rgba(239, 68, 68, 0.3)'
  if (value >= -0.7) return 'rgba(239, 68, 68, 0.6)'
  return 'var(--color-chart-red)'
}

export function CorrelationHeatmap({ data, height = 400 }: CorrelationHeatmapProps) {
  const cellSize = useMemo(() => {
    if (!data?.assets) return 60
    const gridSize = Math.min(height - 80, 500)
    return Math.floor(gridSize / data.assets.length)
  }, [data, height])

  if (!data || !data.matrix || data.matrix.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No correlation data available
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4">
      {/* Legend */}
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <span>-1.0</span>
        <div className="flex h-4">
          <div className="w-8 bg-chart-red opacity-100" />
          <div className="w-8 bg-chart-red opacity-60" />
          <div className="w-8 bg-chart-red opacity-30" />
          <div className="w-8 bg-chart-green opacity-30" />
          <div className="w-8 bg-chart-green opacity-60" />
          <div className="w-8 bg-chart-green opacity-100" />
        </div>
        <span>+1.0</span>
      </div>

      {/* Matrix */}
      <div className="relative">
        {/* Column headers */}
        <div className="flex ml-20">
          {data.assets.map((asset, i) => (
            <div
              key={`col-${i}`}
              className="text-xs text-muted-foreground font-medium text-center"
              style={{ width: cellSize }}
            >
              {asset}
            </div>
          ))}
        </div>

        {/* Rows */}
        {data.matrix.map((row, i) => (
          <div key={`row-${i}`} className="flex items-center">
            {/* Row header */}
            <div className="w-20 text-xs text-muted-foreground font-medium text-right pr-2">
              {data.assets[i]}
            </div>

            {/* Cells */}
            {row.map((value, j) => (
              <div
                key={`cell-${i}-${j}`}
                className="flex items-center justify-center border border-border/30 text-xs font-semibold transition-all hover:scale-110 hover:z-10"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: getCorrelationColor(value),
                  color: Math.abs(value) > 0.5 ? 'white' : 'var(--color-foreground)',
                }}
                title={`${data.assets[i]} vs ${data.assets[j]}: ${value.toFixed(3)}`}
              >
                {value.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Period indicator */}
      <div className="mt-4 text-sm text-muted-foreground">
        Period: {data.period}
      </div>
    </div>
  )
}
