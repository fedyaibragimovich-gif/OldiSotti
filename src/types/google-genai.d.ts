declare module '@google/genai' {
  export class GoogleGenAI {
    constructor(options: { apiKey: string });
    models: {
      generateContent(options: Record<string, unknown>): Promise<any>;
    };
  }
}
