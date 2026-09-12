import fs from 'fs';

// Keep the AI product-image UI in the production build, but replace the old
// demo/preset generator with the secure server endpoint.
const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

if (!s.includes("import { auth } from '../lib/firebase';")) {
  s = s.replace("import { InfoTabKey } from '../data/infoPagesData';", "import { InfoTabKey } from '../data/infoPagesData';\nimport { auth } from '../lib/firebase';");
}

const start = s.indexOf('  const handleGenerateAiPhoto = async');
const end = s.indexOf('  const handleAddPresetPhoto =', start);

if (start !== -1 && end !== -1) {
  const realGenerator = `  const handleGenerateAiPhoto = async (customPrompt?: string) => {\n    setIsGeneratingAi(true);\n    setErrorMsg('');\n\n    try {\n      const currentUser = auth.currentUser;\n      if (!currentUser) {\n        throw new Error('AI generatoridan foydalanish uchun avval akkauntga kiring.');\n      }\n\n      const idToken = await currentUser.getIdToken();\n      const prompt = (customPrompt || aiPrompt || title || 'Mahsulot').trim();\n      const styleLabel = {\n        studio: 'clean professional e-commerce studio photography, soft neutral background',\n        lifestyle: 'premium lifestyle product photography, natural realistic environment',\n        minimalist: 'minimalist premium product photography, clean composition and soft lighting',\n        automotive: 'professional automotive/product photography, realistic showroom or outdoor lighting'\n      }[aiStyle];\n\n      const response = await fetch('/api/ai-product-image', {\n        method: 'POST',\n        headers: {\n          'Content-Type': 'application/json',\n          Authorization: 'Bearer ' + idToken\n        },\n        body: JSON.stringify({\n          title,\n          prompt,\n          style: styleLabel,\n          imageDataUrl: images[0] || null\n        })\n      });\n\n      const data = await response.json().catch(() => ({}));\n      if (!response.ok || !data.imageDataUrl) {\n        throw new Error(data.error || 'AI rasm yaratishda xatolik yuz berdi.');\n      }\n\n      setImages(prev => [data.imageDataUrl, ...prev.filter(img => img !== data.imageDataUrl)]);\n      setLastGenerated({ url: data.imageDataUrl, source: 'ai' });\n    } catch (error: any) {\n      console.error('AI image generation error:', error);\n      setErrorMsg(error?.message || 'AI rasm yaratishda xatolik yuz berdi.');\n    } finally {\n      setIsGeneratingAi(false);\n    }\n  };\n\n\n`;
  s = s.slice(0, start) + realGenerator + s.slice(end);
}

fs.writeFileSync(post, s);

// Remove the admin-controlled announcement banner from the app shell, as before.
const app = 'src/App.tsx';
let a = fs.readFileSync(app, 'utf8');
a = a.replace("import { Megaphone, AlertTriangle } from 'lucide-react';", "import { AlertTriangle } from 'lucide-react';");
a = a.replace(/\n\s*\{\/\* Platform Announcement Banner \(Admin Controlled\) \*\/\}\s*\{platformSettings\.isAnnouncementActive && platformSettings\.announcementText && \(\s*<div[\s\S]*?<\/div>\s*\)\}\n/, '\n');
fs.writeFileSync(app, a);
