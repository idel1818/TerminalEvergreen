# GTM Terminal

A white-label Bloomberg-style sales intelligence platform that auto-configures itself for any company. Type a company name, and in under 15 seconds the entire terminal reconfigures: competitors with battlecards, selling points by buyer persona, target accounts, outreach templates, ROI model, trigger events, battle map.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite with better-sqlite3
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Company Data**: Clearbit Enrichment API + NewsAPI + Hacker News Algolia API
- **Charts**: Recharts
- **Icons**: Lucide React
- **3D Globe**: Three.js (r128)
- **Deployment**: Fly.dev

## Setup

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Build client
cd client && npm run build && cd ..

# Start server
npm start
```

## Development

```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Start frontend dev server
cd client && npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |
| `CLEARBIT_API_KEY` | Clearbit Enrichment API key |
| `NEWS_API_KEY` | NewsAPI key |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |

## Features

- **Company Search**: Type any company name to auto-configure the terminal
- **Command Dashboard**: Metrics, pipeline funnel, activity feed, trigger events
- **Accounts**: AI-generated target accounts with CRUD operations
- **Outreach**: AI-powered message composer with email templates
- **Intelligence**: Hacker News and news feeds for sector signals
- **Competition**: Competitor battlecards with live news feeds
- **Battle Map**: Interactive 3D globe with account locations
- **Sales Kit**: Selling points, ROI calculator, objection handler, email templates
- **Settings**: Workspace management, integrations, API usage tracking, white label
