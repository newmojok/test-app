import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Key, Bell, Moon, Database, Download, ExternalLink } from 'lucide-react'

export function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState('daily')

  return (
    <div className="space-y-6 max-w-4xl">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Configuration
          </CardTitle>
          <CardDescription>Manage your data source API keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">FRED API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter your FRED API key"
                className="flex-1 h-9 px-3 rounded-md border border-border bg-transparent text-sm"
              />
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free tier: 1000 requests/day.{' '}
              <a href="https://fred.stlouisfed.org/docs/api/api_key.html" className="text-primary">
                Sign up here
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Alpha Vantage API Key (optional)</label>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="Enter your Alpha Vantage key"
                className="flex-1 h-9 px-3 rounded-md border border-border bg-transparent text-sm"
              />
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Required for real-time asset price correlations
            </p>
          </div>

          <div className="flex justify-end">
            <Button>Save API Keys</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts via email</p>
            </div>
            <Toggle
              pressed={emailNotifications}
              onPressedChange={setEmailNotifications}
            />
          </div>

          {emailNotifications && (
            <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full h-9 px-3 rounded-md border border-border bg-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Digest Frequency</label>
                <Select className="w-48">
                  <option value="instant">Instant</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Telegram Bot</p>
              <p className="text-sm text-muted-foreground">Real-time alerts via Telegram</p>
            </div>
            <Toggle pressed={telegramEnabled} onPressedChange={setTelegramEnabled} />
          </div>

          {telegramEnabled && (
            <div className="ml-4 space-y-2 border-l-2 border-border pl-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Telegram Chat ID</label>
                <input
                  type="text"
                  placeholder="Your Telegram chat ID"
                  className="w-full h-9 px-3 rounded-md border border-border bg-transparent text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Message @LiquidityTrackerBot to get your chat ID
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button>Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme</p>
            </div>
            <Toggle pressed={darkMode} onPressedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-Refresh Interval</p>
              <p className="text-sm text-muted-foreground">How often to check for new data</p>
            </div>
            <Select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-40"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="manual">Manual only</option>
            </Select>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <p className="font-medium">Export Data</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export M2 Data (CSV)
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All Data (JSON)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">Your active subscription</p>
            </div>
            <Badge variant="secondary" className="text-lg py-1 px-3">
              Free
            </Badge>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <p className="font-medium">Upgrade to Pro ($29/mo)</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All 5 economies M2 tracking</li>
              <li>• Credit impulse + correlations</li>
              <li>• 10-year historical data</li>
              <li>• Real-time Telegram alerts</li>
              <li>• Debt maturity calendar</li>
              <li>• CSV/API export</li>
            </ul>
            <Button className="mt-2">Upgrade Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
