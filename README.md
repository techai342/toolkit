# Vite + React + Express (Vercel Ready)

This project is a full-stack application with a Vite-powered React frontend and an Express backend, optimized for deployment on Vercel.

## Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in the values.
   ```bash
   cp .env.example .env
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Build and Verification

To check if the project builds and lints correctly:
```bash
npm run build && npm run lint
```

## Vercel Deployment

1. **Push to GitHub:**
   Ensure your code is pushed to a GitHub repository.

2. **Connect to Vercel:**
    - Log in to [Vercel](https://vercel.com).
    - Click "Add New" -> "Project" and select your repository.
    - Vercel will automatically detect the Vite + React setup.

3. **Environment Variables:**
   Add the following variables in the Vercel Dashboard (Settings -> Environment Variables):
    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_ANON_KEY`
    - `GEMINI_API_KEY`
    - `IMAGEKIT_PUBLIC_KEY` (Optional)
    - `IMAGEKIT_PRIVATE_KEY` (Optional)
    - `IMAGEKIT_URL_ENDPOINT` (Optional)
    - `CLOUDINARY_CLOUD_NAME` (Optional)
    - `CLOUDINARY_API_KEY` (Optional)
    - `CLOUDINARY_API_SECRET` (Optional)

4. **Verify Deployment:**
   - Go to `https://your-app.vercel.app/api/health` to verify the backend is running.
   - It should return a JSON response with status "ok".

## Debugging Common Issues

### "Unexpected token '<'..."
This error usually means your frontend tried to fetch an API route but received an HTML page (like a 404 or a login page) instead of JSON. 
- Ensure your environment variables are correctly set in the Vercel Dashboard.
- Check that the API route exists in `app.ts`.
- Verify the `vercel.json` rewrites are correctly pointing to `api/index.ts`.

## Project Structure

- `app.ts`: Shared Express app factory (reusable across dev/prod/serverless).
- `server.ts`: Local development and production entry point.
- `api/index.ts`: Vercel serverless function entry point.
- `vercel.json`: Vercel routing configuration.
- `src/`: React frontend source code.
