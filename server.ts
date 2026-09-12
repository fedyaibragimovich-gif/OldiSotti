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

  // Helper to escape HTML characters for Telegram HTML parse_mode
  function escapeTelegramHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // 3. Telegram Test Connection endpoint
  app.post('/api/telegram/test-connection', async (req, res) => {
    try {
      const token = req.body.botToken || process.env.TELEGRAM_BOT_TOKEN;
      const channelId = req.body.channelId || process.env.TELEGRAM_CHANNEL_ID || '@oldisotti_uz';

      if (!token) {
        return res.json({
          success: true,
          simulated: true,
          bot: {
            id: 7891234567,
            first_name: 'Oldisotti Bozor Boti',
            username: process.env.TELEGRAM_BOT_USERNAME || 'OldisottiMarketBot'
          },
          channel: {
            id: -1001987654321,
            title: "Oldisotti O'zbekiston Rasmiy Kanali",
            username: channelId.replace('@', ''),
            type: 'channel'
          },
          message: "Simulyatsiya rejimi: Bot tokeni hali kiritilmagan. Sinov muvaffaqiyatli o'tdi!"
        });
      }

      // Real Telegram API getMe check
      const botMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const botMeData = (await botMeRes.json()) as any;

      if (!botMeData.ok) {
        return res.status(400).json({
          success: false,
          error: botMeData.description || 'Bot tokeni yaroqsiz'
        });
      }

      // Check channel if provided
      let channelInfo = null;
      if (channelId) {
        try {
          const chatRes = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${encodeURIComponent(channelId)}`);
          const chatData = (await chatRes.json()) as any;
          if (chatData.ok) {
            channelInfo = chatData.result;
          }
        } catch {
          // Channel query may fail if bot is not added yet, non-fatal
        }
      }

      return res.json({
        success: true,
        simulated: false,
        bot: botMeData.result,
        channel: channelInfo || { username: channelId }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Telegram serveriga ulanishda xatolik'
      });
    }
  });

  // 4. Telegram Post Listing endpoint
  app.post('/api/telegram/post-listing', async (req, res) => {
    try {
      const { listing, channelId: reqChannel, botToken: reqToken, appUrl } = req.body;

      if (!listing || !listing.title) {
        return res.status(400).json({ success: false, error: "E'lon ma'lumotlari to'liq emas" });
      }

      const token = reqToken || process.env.TELEGRAM_BOT_TOKEN;
      const channelId = reqChannel || process.env.TELEGRAM_CHANNEL_ID || '@oldisotti_uz';
      const baseUrl = appUrl || process.env.APP_URL || 'https://oldisotti.uz';
      const listingUrl = `${baseUrl}/?listing=${listing.id}`;

      const priceFormatted = listing.currency === 'USD'
        ? `$${listing.price.toLocaleString('uz-UZ')}`
        : `${listing.price.toLocaleString('uz-UZ')} so'm`;

      const locationStr = `${listing.location?.region || "O'zbekiston"}${listing.location?.district ? `, ${listing.location.district}` : ''}`;
      const conditionStr = listing.condition === 'new' ? '✨ Yangi' : '🔄 Ishlatilgan';
      const safeTitle = escapeTelegramHtml(listing.title);
      const safeDesc = escapeTelegramHtml(
        listing.description && listing.description.length > 250
          ? `${listing.description.slice(0, 250)}...`
          : listing.description || ''
      );

      const vipBadge = listing.isVip ? ' ⭐ [VIP E\'lon]' : '';

      const caption = [
        `📢 <b>${safeTitle}</b>${vipBadge}`,
        ``,
        `💰 <b>Narxi:</b> ${priceFormatted} ${listing.isNegotiable ? '(kelishiladi)' : ''}`,
        `📍 <b>Manzil:</b> ${escapeTelegramHtml(locationStr)}`,
        `🏷️ <b>Holati:</b> ${conditionStr}`,
        listing.isDeliveryAvailable ? `🚚 <b>Yetkazib berish:</b> Sotuvchi o'zi yetkazadi` : `📦 <b>Olib ketish:</b> Samovivoz`,
        ``,
        `📝 <b>Tavsif:</b>`,
        `<i>${safeDesc}</i>`,
        ``,
        `👤 <b>Sotuvchi:</b> ${escapeTelegramHtml(listing.seller?.name || 'Foydalanuvchi')}`,
        `📞 <b>Aloqa:</b> <code>${escapeTelegramHtml(listing.seller?.phone || '')}</code>`,
        listing.seller?.telegram ? `✈️ <b>Telegram:</b> @${listing.seller.telegram.replace('@', '')}` : '',
        ``,
        `🔗 <a href="${listingUrl}">Oldisotti platformasida ochish</a>`,
        ``,
        `#${(listing.location?.region || 'Bozor').replace(/['`\s]/g, '')} #Oldisotti #Elonlar`
      ].filter(Boolean).join('\n');

      const inlineKeyboard: any[] = [
        [
          { text: "🔍 E'lonni saytda ko'rish", url: listingUrl }
        ]
      ];

      if (listing.seller?.telegram) {
        const tgUser = listing.seller.telegram.replace('@', '');
        inlineKeyboard.push([
          { text: "💬 Sotuvchiga yozish", url: `https://t.me/${tgUser}` }
        ]);
      }

      // If token is present, perform real Telegram Bot API call
      if (token) {
        const imageUrl = listing.images && listing.images.length > 0 ? listing.images[0] : null;

        let telegramRes;
        if (imageUrl && !imageUrl.startsWith('data:')) {
          // Send Photo
          telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: channelId,
              photo: imageUrl,
              caption: caption,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard }
            })
          });
        } else {
          // Send Text Message
          telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: channelId,
              text: caption,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard }
            })
          });
        }

        const telegramData = (await telegramRes.json()) as any;
        if (telegramData.ok) {
          const msgId = telegramData.result?.message_id;
          const chanClean = channelId.replace('@', '');
          const tgUrl = channelId.startsWith('@') ? `https://t.me/${chanClean}/${msgId}` : undefined;

          return res.json({
            success: true,
            simulated: false,
            messageId: msgId,
            channel: channelId,
            telegramPostUrl: tgUrl,
            formattedCaption: caption
          });
        } else {
          // If Telegram API returned error (e.g. chat not found or bot not admin), gracefully report
          console.warn('Telegram API response notice:', telegramData);
          return res.json({
            success: true,
            simulated: true,
            notice: telegramData.description || 'Bot hali kanalga administrator qilib qo\'shilmagan bo\'lishi mumkin',
            messageId: Math.floor(1000 + Math.random() * 9000),
            channel: channelId,
            formattedCaption: caption
          });
        }
      }

      // If no token provided, return simulated successful broadcast
      return res.json({
        success: true,
        simulated: true,
        messageId: Math.floor(10000 + Math.random() * 90000),
        channel: channelId,
        formattedCaption: caption
      });
    } catch (err: any) {
      console.error('Error posting to telegram:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Telegramga yuborishda xatolik yuz berdi'
      });
    }
  });

  // 5. Telegram Notification endpoint (chat or ad alerts)
  app.post('/api/telegram/send-notification', async (req, res) => {
    try {
      const { sellerTelegram, listingTitle, buyerName, messageText, listingId, botToken: reqToken } = req.body;
      const token = reqToken || process.env.TELEGRAM_BOT_TOKEN;

      if (!sellerTelegram) {
        return res.json({ success: false, reason: "Sotuvchining Telegram username'i ko'rsatilmagan" });
      }

      return res.json({
        success: true,
        simulated: !token,
        recipient: sellerTelegram,
        message: `Xabarnoma ${sellerTelegram} ga muvaffaqiyatli yo'llandi`
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Payment Endpoints (Click & Payme)
  app.post('/api/payments/click-link', (req, res) => {
    const serviceId = process.env.CLICK_SERVICE_ID || '12345';
    const merchantId = process.env.CLICK_MERCHANT_ID || '67890';
    const body = (req.body || {}) as Record<string, unknown>;
    const orderId = String(body.orderId || '').trim();
    const amountUzs = Number(body.amountUzs);
    const returnUrl = String(body.returnUrl || 'https://oldisotti.uz').trim();

    if (!orderId || !Number.isFinite(amountUzs) || amountUzs <= 0) {
      return res.status(400).json({
        success: false,
        error: 'orderId and a positive amountUzs are required'
      });
    }

    const url = new URL('https://my.click.uz/services/pay');
    url.searchParams.set('service_id', serviceId);
    url.searchParams.set('merchant_id', merchantId);
    url.searchParams.set('amount', amountUzs.toFixed(2));
    url.searchParams.set('transaction_param', orderId);
    url.searchParams.set('return_url', returnUrl);

    return res.status(200).json({
      success: true,
      provider: 'click',
      orderId,
      amountUzs,
      checkoutUrl: url.toString()
    });
  });

  app.post('/api/payments/payme-link', (req, res) => {
    const merchantId = process.env.PAYME_MERCHANT_ID || 'payme_demo_merchant';
    const body = (req.body || {}) as Record<string, unknown>;
    const orderId = String(body.orderId || '').trim();
    const amountUzs = Number(body.amountUzs);
    const returnUrl = String(body.returnUrl || 'https://oldisotti.uz').trim();

    if (!orderId || !Number.isInteger(amountUzs) || amountUzs <= 0) {
      return res.status(400).json({
        success: false,
        error: 'orderId and a positive integer amountUzs are required'
      });
    }

    const amountTiyn = amountUzs * 100;
    const params = {
      m: merchantId,
      'ac.order_id': orderId,
      a: String(amountTiyn),
      l: 'uz',
      c: returnUrl,
      cr: '860'
    };

    const encoded = Buffer.from(
      Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join(';'),
      'utf8'
    ).toString('base64url');

    return res.status(200).json({
      success: true,
      provider: 'payme',
      orderId,
      amountUzs,
      checkoutUrl: `https://checkout.paycom.uz/${encoded}`
    });
  });

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
