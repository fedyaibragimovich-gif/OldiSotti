import fs from 'fs';

// Keep the AI product-image UI in the production build, but replace the old
// demo/preset generator with the secure server endpoint.
const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

if (!s.includes("import { auth } from '../lib/firebase';")) {
  s = s.replace(
    "import { InfoTabKey } from '../data/infoPagesData';",
    "import { InfoTabKey } from '../data/infoPagesData';\nimport { auth } from '../lib/firebase';"
  );
}

const start = s.indexOf('  const handleGenerateAiPhoto = async');
const end = s.indexOf('  const handleAddPresetPhoto =', start);

if (start !== -1 && end !== -1) {
  const realGenerator = `  const handleGenerateAiPhoto = async (customPrompt?: string) => {
    setIsGeneratingAi(true);
    setErrorMsg('');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('AI generatoridan foydalanish uchun avval akkauntga kiring.');
      }

      const idToken = await currentUser.getIdToken();
      const prompt = (customPrompt || aiPrompt || title || 'Mahsulot').trim();
      const styleLabel = {
        studio: 'clean professional e-commerce studio photography, soft neutral background',
        lifestyle: 'premium lifestyle product photography, natural realistic environment',
        minimalist: 'minimalist premium product photography, clean composition and soft lighting',
        automotive: 'professional automotive/product photography, realistic showroom or outdoor lighting'
      }[aiStyle];

      const response = await fetch('/api/ai-product-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + idToken
        },
        body: JSON.stringify({
          title,
          prompt,
          style: styleLabel,
          imageDataUrl: images[0] || null
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.imageDataUrl) {
        throw new Error(data.error || 'AI rasm yaratishda xatolik yuz berdi.');
      }

      setImages(prev => [data.imageDataUrl, ...prev.filter(img => img !== data.imageDataUrl)]);
      setLastGenerated({ url: data.imageDataUrl, source: 'ai' });
    } catch (error: any) {
      console.error('AI image generation error:', error);
      setErrorMsg(error?.message || 'AI rasm yaratishda xatolik yuz berdi.');
    } finally {
      setIsGeneratingAi(false);
    }
  };


`;
  s = s.slice(0, start) + realGenerator + s.slice(end);
}

fs.writeFileSync(post, s);

// Remove the admin-controlled announcement banner from the app shell, as before.
const app = 'src/App.tsx';
let a = fs.readFileSync(app, 'utf8');
a = a.replace(
  "import { Megaphone, AlertTriangle } from 'lucide-react';",
  "import { AlertTriangle } from 'lucide-react';"
);
a = a.replace(
  /\n\s*\{\/\* Platform Announcement Banner \(Admin Controlled\) \*\/\}\s*\{platformSettings\.isAnnouncementActive && platformSettings\.announcementText && \(\s*<div[\s\S]*?<\/div>\s*\)\}\n/,
  '\n'
);
fs.writeFileSync(app, a);
