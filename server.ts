import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;


async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // 1. Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  // Use the same authenticated handlers locally and on Vercel.
  const routes = [
    ['/api/telegram/test-connection', await import('./api/telegram/test-connection')],
    ['/api/telegram/post-listing', await import('./api/telegram/post-listing')],
    ['/api/telegram/send-notification', await import('./api/telegram/send-notification')],
    ['/api/payments/click-link', await import('./api/payments/click-link')],
    ['/api/payments/payme-link', await import('./api/payments/payme-link')],
    ['/api/support-chat', await import('./api/support-chat')],
    ['/api/ai-product-image', await import('./api/ai-product-image')]
  ] as const;
  for (const [route, module] of routes) {
    app.all(route, (req, res, next) => { Promise.resolve(module.default(req, res)).catch(next); });
  }

  // 7. Mount Vite middleware in dev, or serve static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Oldisotti Uzbekistan full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
