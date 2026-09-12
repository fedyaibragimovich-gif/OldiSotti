export interface TelegramPostResponse {
  success: boolean;
  messageId?: number;
  simulated?: boolean;
  isConfigured?: boolean;
  channel?: string;
  error?: string;
  formattedCaption?: string;
  telegramPostUrl?: string;
}

export interface TelegramConnectionResponse {
  success: boolean;
  simulated?: boolean;
  isConfigured?: boolean;
  bot?: {
    id: number;
    first_name: string;
    username?: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
  };
  channel?: {
    id: number | string;
    title?: string;
    username?: string;
    type?: string;
  };
  error?: string;
  message?: string;
}

export function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let data = '';
    if (typeof req.on !== 'function') {
      return resolve({});
    }
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
