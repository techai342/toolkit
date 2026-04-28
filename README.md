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

## Ready-to-use prompt for Google Gemini

If you want Gemini to apply the same Vercel-readiness changes in another repo, use this prompt:

```text
You are a senior full-stack engineer. Make my existing Vite + React + Express project production-ready for Vercel.

Goals:
1) Create a shared Express app factory (e.g., `app.ts`) so API routes are reusable in both local dev and Vercel serverless.
2) Add a Vercel serverless entrypoint at `api/index.ts` that imports and exports the shared Express app.
3) Update local `server.ts` to use the shared app; in development it should mount Vite middleware, and in production it should serve static files if needed.
4) Configure `vercel.json` so:
   - `/api/*` rewrites to `api/index`
   - all non-API routes rewrite to `/index.html` (SPA fallback)
5) Keep or improve upload endpoints (`/api/upload`, `/api/upload-media`) and return clear JSON errors when ImageKit or Cloudinary env vars are missing.
6) Update `.env.example` with placeholders for Supabase, Gemini, ImageKit, Cloudinary, and `PORT`.
7) Update README with:
   - local setup steps
   - build check command
   - Vercel deploy steps
   - required env vars

Rules:
- Do not break existing app functionality.
- Keep TypeScript types clean and avoid `any` unless unavoidable.
- Reuse existing project conventions and file structure.
- Show a concise diff-style summary of all changed files.
- Run and report these checks: `npm run build` and `npm run lint`.

After changes, provide:
A) summary of edits by file,
B) list of env vars to set in Vercel,
C) exact verification commands and outputs.
```
