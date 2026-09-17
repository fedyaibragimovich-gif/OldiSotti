// Check for a newer shell cache as early as possible. updateViaCache=none keeps
// sw.js itself from being hidden behind an HTTP cache when we ship a performance fix.
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch((error) => {
    console.warn('OldiSotdi early service worker registration failed:', error);
  });
}

const startApp = () => {
  void import('./main.tsx').catch((error) => {
    console.error('OldiSotdi startup failed:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = '<div style="padding:24px;font-family:system-ui,sans-serif">Sayt yuklanmadi. Internetni tekshirib, sahifani yangilang.</div>';
    }
  });
};

const scheduleStart = () => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => setTimeout(startApp, 0));
  } else {
    setTimeout(startApp, 0);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleStart, { once: true });
} else {
  scheduleStart();
}
