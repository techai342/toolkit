import * as dotenv from 'dotenv';
import { createApp } from './app';

dotenv.config();

async function startServer() {
  const PORT = Number(process.env.PORT || 3000);
  const app = createApp({ serveStatic: process.env.NODE_ENV === 'production' });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
