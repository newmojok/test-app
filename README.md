# Liquidity Cycle Tracker

Real-time dashboard tracking global liquidity conditions through M2 aggregates, credit impulse, and sovereign/corporate debt maturity schedules. Alert system flags inflection points that historically precede asset price movements (equities, Bitcoin, commodities).

## Features

- **Global M2 Dashboard**: Track M2 money supply for US, China, Eurozone, Japan, and UK (~70% of global liquidity)
- **Credit Impulse Tracker**: Monitor net new credit creation that leads GDP/asset prices by 6-9 months
- **Debt Maturity Calendar**: View upcoming sovereign and corporate debt maturities with refinancing risk analysis
- **Alert System**: Get notified when key metrics cross thresholds (M2 RoC > 5%, credit impulse reversals, maturity spikes)
- **Correlation Matrix**: Analyze relationships between liquidity metrics and asset prices with lag analysis

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Recharts for visualizations
- Zustand for state management
- TanStack Query for data fetching

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL for data storage
- Redis for caching
- Node-cron for scheduled data updates

### Data Sources
- FRED API (Federal Reserve Economic Data)
- World Bank API
- Treasury.gov debt schedules

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)
- FRED API key (free at https://fred.stlouisfed.org/docs/api/api_key.html)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/liquidity-cycle-tracker.git
cd liquidity-cycle-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys and database URL
```

4. Set up the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development servers:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3001`.

## Project Structure

```
liquidity-cycle-tracker/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   │   ├── charts/      # Recharts visualizations
│   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   └── pages/       # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state management
│   │   ├── types/           # TypeScript types
│   │   └── lib/             # Utility functions
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── db/              # Database setup and migrations
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (FRED API, calculations, alerts)
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   └── package.json
└── package.json              # Root package.json
```

## API Endpoints

### M2 Data
- `GET /api/m2` - Get M2 data for all countries
- `GET /api/m2/:country` - Get M2 data for a specific country
- `GET /api/m2/latest` - Get latest M2 data points
- `GET /api/m2/aggregate` - Get weighted global M2 aggregate

### Credit Impulse
- `GET /api/credit-impulse` - Get credit impulse data
- `GET /api/credit-impulse/:country` - Get credit impulse for US or CN

### Debt Maturities
- `GET /api/maturities` - Get debt maturities with filters
- `GET /api/maturities/quarterly` - Get quarterly aggregated maturities

### Alerts
- `GET /api/alerts` - Get all alerts
- `PATCH /api/alerts/:id/read` - Mark alert as read
- `GET /api/alerts/thresholds` - Get alert thresholds
- `PUT /api/alerts/thresholds` - Update alert thresholds

### Correlations
- `GET /api/correlations` - Get correlation matrix
- `GET /api/correlations/pair` - Get correlation for specific pair

### Dashboard
- `GET /api/stats` - Get dashboard statistics
- `GET /api/health` - Health check

## Key Metrics

### 6-Month Rate of Change (RoC)
Per Michael Howell's research, this metric leads global asset prices by 3-6 months. A cross above +5% typically signals risk-on conditions.

### Credit Impulse
Measures the change in new credit creation as a percentage of GDP. China accounts for ~40% of global credit creation.

### Maturity Wall
High concentration of debt maturities can create refinancing pressure and market stress.

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/liquidity_tracker
REDIS_URL=redis://localhost:6379

# API Keys
FRED_API_KEY=your_fred_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# Email Alerts (optional)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your_resend_api_key
ALERT_FROM_EMAIL=alerts@yourapp.com
ALERT_TO_EMAIL=your@email.com

# Telegram Alerts (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## License

MIT
