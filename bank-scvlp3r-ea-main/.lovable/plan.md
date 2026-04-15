## Plan: Bank Scalper EA Trading App

### Phase 1: Backend Setup
- Enable Lovable Cloud for database
- Create `license_keys` table (key, status, created_at, expires_at, activated_by, activated_at)
- Create edge function for license validation/management

### Phase 2: Admin Panel
- Admin login page (password: stored securely, not hardcoded)
- Dashboard to generate, deactivate, reactivate, delete license keys
- View all keys with status

### Phase 3: License Authentication Flow
- User enters license key → validated against DB
- On success, persist session in localStorage + DB
- Stay logged in until key expires, user removes, or admin deactivates/deletes
- Check key validity on app load

### Phase 4: Trading Dashboard
- TradingView Advanced Chart widget (free embed) with symbol selector
- Symbol search/selection for all trading pairs (Forex, Crypto, Stocks, Indices, Commodities)
- Strategy analysis panel showing signals from:
  - Smart Money Concepts (SMC)
  - CRT (Candle Range Theory)
  - Pure Price Action
  - Asian Range Strategy
  - 50% Fibonacci Entry
  - Quasimodo Pattern
  - Breakout Detection
  - 714 Method
  - NY Session Scalping Impulse

**Important note**: Real-time automated chart analysis requires live market data APIs and complex algorithms. The app will include the TradingView chart for visual analysis and a strategy reference/checklist panel. Fully automated signal generation would require a paid market data API and significant algorithmic development.

### Architecture
- Pages: `/` (license auth), `/dashboard` (trading), `/admin` (admin login + management)
- License state persisted in localStorage, validated against DB on load
