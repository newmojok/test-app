import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { frameworkContent } from '@/data/howellIndicators'
import {
  ExternalLink,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Clock,
  Coins,
  Globe,
  Database,
  ArrowRight,
  Lightbulb,
} from 'lucide-react'

export function HowellFrameworkPage() {
  const { coreThesis, cycleStages, goldVsBitcoin, dataSources } = frameworkContent

  const stageColors: Record<string, string> = {
    Recovery: 'bg-green-500',
    Expansion: 'bg-blue-500',
    Slowdown: 'bg-yellow-500',
    Contraction: 'bg-red-500',
  }

  const stageIcons: Record<string, React.ReactNode> = {
    Recovery: <TrendingUp className="h-5 w-5" />,
    Expansion: <TrendingUp className="h-5 w-5" />,
    Slowdown: <TrendingDown className="h-5 w-5" />,
    Contraction: <TrendingDown className="h-5 w-5" />,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Howell Liquidity Framework</h1>
        <p className="text-muted-foreground mt-1">
          Understanding global liquidity through Michael Howell's research
        </p>
      </div>

      {/* Core Thesis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{coreThesis.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {coreThesis.content}
            </div>
          </div>

          {/* Key Formula Highlight */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Net Liquidity Formula</h4>
            <div className="flex items-center gap-2 text-lg font-mono">
              <span className="px-3 py-1 bg-blue-500/20 rounded">Fed Balance Sheet</span>
              <span>-</span>
              <span className="px-3 py-1 bg-red-500/20 rounded">TGA</span>
              <span>-</span>
              <span className="px-3 py-1 bg-orange-500/20 rounded">RRP</span>
              <span>=</span>
              <span className="px-3 py-1 bg-green-500/20 rounded font-bold">
                Net Liquidity
              </span>
            </div>
          </div>

          {/* 13-Week Lead Time */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-500" />
            <div>
              <span className="font-medium">13-Week Lead Time:</span>
              <span className="text-muted-foreground ml-2">
                Changes in net liquidity precede risk asset price movements by approximately
                3 months
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 65-Month Cycle Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle className="text-2xl">{cycleStages.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Howell identifies a recurring ~65-month (5.4 year) global liquidity cycle with four
            distinct stages. Understanding where we are in the cycle provides crucial context
            for investment decisions.
          </p>

          {/* Cycle Timeline Visual */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Cycle Timeline</span>
              <span className="text-sm text-muted-foreground">65 months total</span>
            </div>
            <div className="flex h-8 rounded-lg overflow-hidden">
              <div
                className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: '24.6%' }}
              >
                Recovery
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: '24.6%' }}
              >
                Expansion
              </div>
              <div
                className="bg-yellow-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: '24.6%' }}
              >
                Slowdown
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: '26.2%' }}
              >
                Contraction
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Month 1</span>
              <span>Month 17</span>
              <span>Month 33</span>
              <span>Month 49</span>
              <span>Month 65</span>
            </div>
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cycleStages.stages.map((stage) => (
              <Card key={stage.name} className="border-l-4" style={{
                borderLeftColor: stageColors[stage.name].replace('bg-', '').includes('green')
                  ? '#22c55e'
                  : stageColors[stage.name].replace('bg-', '').includes('blue')
                    ? '#3b82f6'
                    : stageColors[stage.name].replace('bg-', '').includes('yellow')
                      ? '#eab308'
                      : '#ef4444'
              }}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${stageColors[stage.name]} text-white`}>
                        {stageIcons[stage.name]}
                      </div>
                      <h4 className="font-semibold text-lg">{stage.name}</h4>
                    </div>
                    <Badge variant="outline">Months {stage.months}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">{stage.action}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Current Position Indicator */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge className="bg-yellow-500">Current: Month 48</Badge>
              <span className="font-medium">Late Slowdown Phase</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Approaching transition to Contraction phase. Historical pattern suggests
              reducing risk exposure and waiting for the cycle to trough before aggressive
              re-entry.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gold vs Bitcoin Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Coins className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">{goldVsBitcoin.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
            {goldVsBitcoin.content}
          </div>

          {/* Comparison Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Characteristic</th>
                  <th className="text-left py-3 px-4">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      Gold
                    </span>
                  </th>
                  <th className="text-left py-3 px-4">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Bitcoin
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium">Liquidity Beta</td>
                  <td className="py-3 px-4">Low-Medium</td>
                  <td className="py-3 px-4">Very High</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium">Lead/Lag</td>
                  <td className="py-3 px-4">Often leads</td>
                  <td className="py-3 px-4">~13 week lag</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium">Central Bank Buying</td>
                  <td className="py-3 px-4">Significant bid</td>
                  <td className="py-3 px-4">Emerging</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium">Dollar Sensitivity</td>
                  <td className="py-3 px-4">Inverse correlation</td>
                  <td className="py-3 px-4">Strong inverse</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 px-4 font-medium">Best Environment</td>
                  <td className="py-3 px-4">Stagflation</td>
                  <td className="py-3 px-4">Liquidity expansion</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Database className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle className="text-2xl">{dataSources.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            All the data you need to track the Howell framework is available for free. Here
            are the primary sources:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.sources.map((source) => (
              <Card key={source.name} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{source.name}</h4>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {source.series.map((s) => (
                      <code
                        key={s}
                        className="text-xs bg-muted px-2 py-0.5 rounded"
                      >
                        {s}
                      </code>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Further Reading */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">Further Reading</h3>
              <p className="text-muted-foreground mb-4">
                To dive deeper into Michael Howell's liquidity framework:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>
                    <strong>Capital Wars</strong> - Michael Howell's book on global liquidity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <a
                    href="https://www.crossbordercapital.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    CrossBorder Capital <ExternalLink className="h-3 w-3" />
                  </a>
                  <span className="text-muted-foreground">- Howell's research firm</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span>
                    Search for Michael Howell interviews on YouTube for accessible explanations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center p-4">
        This dashboard is for educational purposes only. Always do your own research and
        consult with a financial advisor before making investment decisions.
      </div>
    </div>
  )
}
