# Toolkit App (Vite + React + Express APIs)

This project is now ready for Vercel deployment with:
- Static frontend build from Vite (`dist`)
- Serverless API routes via `api/index.ts`

## Local development

### 1) Install dependencies
```bash
npm install
```

### 2) Configure env vars
Copy `.env.example` to `.env.local` and fill values.

```bash
cp .env.example .env.local
```

### 3) Start dev server
```bash
npm run dev
```

This runs `server.ts` with Vite middleware and API endpoints.

## Production build check

```bash
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import project in Vercel.
3. Framework preset: **Vite**.
4. Ensure build/output values:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables from `.env.example` in Vercel Project Settings.
6. Deploy.

`vercel.json` already rewrites:
- `/api/*` -> serverless function (`api/index.ts`)
- everything else -> SPA `index.html`
