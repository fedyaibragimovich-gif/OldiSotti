type ErrorContext = 'window-error' | 'unhandled-rejection' | 'react-boundary' | string;

interface ClientErrorPayload {
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  path: string;
  userAgent: string;
  occurredAt: string;
}

const ENDPOINT = '/api/client-error';
const MAX_REPORTS_PER_MINUTE = 5;
const DEDUPE_WINDOW_MS = 30_000;
let installed = false;
let reportTimes: number[] = [];
const recentSignatures = new Map<string, number>();

function normalizeError(input: unknown): Error {
  if (input instanceof Error) return input;
  if (typeof input === 'string') return new Error(input);
  try {
    return new Error(JSON.stringify(input));
  } catch {
    return new Error('Unknown client error');
  }
}

function shouldReport(error: Error, context: ErrorContext): boolean {
  const now = Date.now();
  reportTimes = reportTimes.filter((time) => now - time < 60_000);
  if (reportTimes.length >= MAX_REPORTS_PER_MINUTE) return false;

  const signature = `${context}:${error.name}:${error.message}`.slice(0, 500);
  const lastSeen = recentSignatures.get(signature) || 0;
  if (now - lastSeen < DEDUPE_WINDOW_MS) return false;

  recentSignatures.set(signature, now);
  reportTimes.push(now);
  return true;
}

export function reportClientError(input: unknown, context: ErrorContext = 'client'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

  const error = normalizeError(input);
  if (!shouldReport(error, context)) return;

  const payload: ClientErrorPayload = {
    name: String(error.name || 'Error').slice(0, 120),
    message: String(error.message || 'Unknown client error').slice(0, 1200),
    stack: error.stack ? String(error.stack).slice(0, 6000) : undefined,
    context: String(context).slice(0, 120),
    path: `${window.location.pathname}${window.location.search}`.slice(0, 1000),
    userAgent: navigator.userAgent.slice(0, 500),
    occurredAt: new Date().toISOString()
  };

  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (sent) return;
    }
  } catch {
    // Fall back to fetch below.
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    credentials: 'same-origin'
  }).catch(() => {
    // Monitoring must never cause another visible application failure.
  });
}

export function initializeProductionMonitoring(): void {
  if (typeof window === 'undefined' || installed) return;
  installed = true;

  window.addEventListener('error', (event) => {
    reportClientError(event.error || event.message, 'window-error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportClientError(event.reason, 'unhandled-rejection');
  });
}
