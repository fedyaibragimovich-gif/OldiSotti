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
