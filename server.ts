import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { mockListings } from './src/data/mockListings';

dotenv.config();

const PORT = 3000;

// High-traffic in-memory IP rate limiter for API endpoints
const apiRateLimits = new Map<string, { count: number; resetAt: number }>();
const API_WINDOW_MS = 60 * 1000;
const MAX_API_PER_MINUTE = 120;

function apiRateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();

  if (apiRateLimits.size > 2000) {
    for (const [k, v] of apiRateLimits.entries()) {
      if (v.resetAt <= now) apiRateLimits.delete(k);
    }
  }

  const record = apiRateLimits.get(ip);
  if (!record || record.resetAt <= now) {
    apiRateLimits.set(ip, { count: 1, resetAt: now + API_WINDOW_MS });
    return next();
  }

  if (record.count >= MAX_API_PER_MINUTE) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  record.count++;
  return next();
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));

  // 1. Health check endpoint (exempt from rate limiter for container uptime probes)
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'OldiSotdi Uzbekistan Classifieds API',
      timestamp: new Date().toISOString()
    });
  });

  // Apply rate limiter to all other /api/ routes
  app.use('/api', apiRateLimiter);

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

  // 7. Mount Vite middleware in dev, or serve static dist in prod with high-performance caching
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Long-term immutable caching for hashed assets
    app.use('/assets', express.static(path.join(distPath, 'assets'), {
      maxAge: '1y',
      immutable: true,
      fallthrough: false
    }));
    // Static assets like icons, manifest, fonts with 1 hour caching, index/sw no-cache
    app.use(express.static(distPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js') || filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    // Cached index.html for high performance
    let cachedHtml = '';
    const getIndexHtml = () => {
      if (!cachedHtml) {
        try {
          cachedHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');
        } catch {
          cachedHtml = '';
        }
      }
      return cachedHtml;
    };

    const escapeHtml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    app.get('*', (req, res) => {
      const listingId = typeof req.query.listing === 'string' ? req.query.listing.trim() : null;
      if (listingId) {
        const found = mockListings.find(l => l.id === listingId);
        if (found) {
          try {
            const rawHtml = getIndexHtml();
            if (rawHtml) {
              const host = req.headers.host || 'oldisotdi.uz';
              const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
              const baseUrl = `${protocol}://${host}`;
              const priceFormatted = new Intl.NumberFormat('uz-UZ').format(found.price) + ' ' + (found.currency === 'USD' ? '$' : "so'm");
              const title = `${found.title} — ${priceFormatted} | OldiSotdi`;
              const desc = (found.description || '').replace(/\s+/g, ' ').slice(0, 180);
              const image = (found.images && found.images[0]) || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&h=630&q=80';
              const url = `${baseUrl}/?listing=${encodeURIComponent(found.id)}`;

              let html = rawHtml;
              html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
              html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
              html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(desc)}" />`);
              html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/i, `<meta property="og:image" content="${escapeHtml(image)}" />`);
              html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/i, `<meta property="og:url" content="${escapeHtml(url)}" />`);
              html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`);
              html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(desc)}" />`);
              html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/i, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);

              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              return res.send(html);
            }
          } catch (e) {
            console.error('Failed to inject SSR OpenGraph tags:', e);
          }
        }
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global safe error handler
  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OldiSotdi Uzbekistan full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
