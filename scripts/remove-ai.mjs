import fs from 'fs';

const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

s = s.replace("import React, { useState, useEffect } from 'react';", "import React, { useState } from 'react';");
s = s.replace(/\n  Image as ImageIcon,\n  Wand2,\n  RefreshCw,\n  Loader2,\n  Sliders,\n  AlertCircle,/, '\n  AlertCircle,');
s = s.replace(/\nconst SAMPLE_PHOTO_PRESETS = \[[\s\S]*?\n\];\n\ninterface SmartSuggestion[\s\S]*?\n\];\n\nexport const PostAdModal/, '\nexport const PostAdModal');
s = s.replace(/\n  \/\/ AI image generation state[\s\S]*?\n  const selectedCategory =/, '\n  const selectedCategory =');
s = s.replace(/\n  \/\/ Sync default style when category changes[\s\S]*?\n  \}, \[categoryId\]\);\n/, '\n');
s = s.replace(/\n  const handleGenerateAiPhoto = async \([\s\S]*?\n  \};\n\n  const handleFileUpload =/, '\n  const handleFileUpload =');
s = s.replace(/\n  const handleAddPresetPhoto = \(url: string\) => \{[\s\S]*?\n  \};\n/, '\n');
s = s.replace(/\n              \/\* Smart Auto-Detected Model Suggestion Banners for ALL suggestions \*\/[\s\S]*?\n              \}\)\(\)\}\n            <\/div>/, '\n            </div>');
s = s.replace(/\n                \/\* AI Quick Generate Trigger Card \*\/[\s\S]*?\n                <\/button>/, '');
s = s.replace(/\n              \/\* AI Image Generator Showcase Card \*\/[\s\S]*?(?=\n            \{\/\* 4\. Price)/, '');
fs.writeFileSync(post, s);

const server = 'server.ts';
let t = fs.readFileSync(server, 'utf8');
t = t.replace("import { GoogleGenAI } from '@google/genai';\n", '');
t = t.replace(/\n\/\/ High-quality contextual placeholder fallback library[\s\S]*?\nlet geminiQuotaCooldownUntil = 0;\n/, '\n');
t = t.replace(/\n  \/\/ 1\. Health check endpoint[\s\S]*?\n  \/\/ Helper to escape HTML characters for Telegram HTML parse_mode/, `\n  // 1. Health check endpoint\n  app.get('/api/health', (req, res) => {\n    res.json({\n      status: 'ok',\n      timestamp: new Date().toISOString()\n    });\n  });\n\n  // Helper to escape HTML characters for Telegram HTML parse_mode`);
fs.writeFileSync(server, t);

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (pkg.dependencies?.['@google/genai']) delete pkg.dependencies['@google/genai'];
if (!pkg.scripts.prebuild) pkg.scripts.prebuild = 'node scripts/remove-ai.mjs';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
