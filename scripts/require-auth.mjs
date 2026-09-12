import fs from 'fs';

const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

if (!s.includes("import { auth } from '../lib/firebase';")) {
  s = s.replace(
    "import { InfoTabKey } from '../data/infoPagesData';",
    "import { InfoTabKey } from '../data/infoPagesData';\nimport { auth } from '../lib/firebase';"
  );
}

if (!s.includes("import { uploadListingImagesToStorage } from '../lib/storage';")) {
  s = s.replace(
    "import { auth } from '../lib/firebase';",
    "import { auth } from '../lib/firebase';\nimport { uploadListingImagesToStorage } from '../lib/storage';"
  );
}

// Submission must wait for the database write. Otherwise the UI can show a false success state.
s = s.replace(
  '  onAddListing: (newListing: Listing) => void;',
  '  onAddListing: (newListing: Listing) => Promise<void> | void;'
);

const marker = "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n";
const replacement = "  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    const currentUser = auth.currentUser;\n    if (!currentUser || currentUser.isAnonymous) {\n      setErrorMsg('E\\'lon joylash uchun avval akkauntingizga kiring.');\n      return;\n    }\n";

if (s.includes(marker)) {
  s = s.replace(marker, replacement);
}

// Accept source images up to 10 MB each, compress them in-browser for faster uploads,
// then upload local images to Firebase Storage during submission.
const oldUploadHandler = `  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };`;

const newUploadHandler = `  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    e.target.value = '';
    if (selectedFiles.length === 0) return;

    const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
    const MAX_IMAGES = 4;
    const MAX_SIDE = 1600;
    const JPEG_QUALITY = 0.82;

    const oversized = selectedFiles.find((file) => file.size > MAX_SOURCE_BYTES);
    if (oversized) {
      setErrorMsg(\`Har bir rasm maksimal 10 MB bo'lishi mumkin. "\${oversized.name}" juda katta.\`);
      return;
    }

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      setErrorMsg(\`Ko'pi bilan \${MAX_IMAGES} ta rasm yuklash mumkin.\`);
      return;
    }

    const compressImage = (file: File): Promise<string> => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Rasmni o\\'qib bo\\'lmadi'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Rasm formati qo\\'llab-quvvatlanmadi'));
        img.onload = () => {
          const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Rasmni qayta ishlash imkoni bo\\'lmadi'));
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
        };
        img.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });

    try {
      const compressed = await Promise.all(selectedFiles.map(compressImage));
      setImages(prev => [...prev, ...compressed].slice(0, MAX_IMAGES));
      setErrorMsg('');
    } catch (error) {
      console.error('Image compression failed:', error);
      setErrorMsg('Rasmni qayta ishlashda xatolik yuz berdi. Boshqa rasm bilan urinib ko\\'ring.');
    }
  };`;

if (s.includes(oldUploadHandler)) {
  s = s.replace(oldUploadHandler, newUploadHandler);
}

const imageValidationMarker = "    if (images.length === 0) {\n      setErrorMsg('Kamida bitta fotosurat yuklang');\n      return;\n    }\n";
const imageValidationReplacement = `${imageValidationMarker}\n    if (images.length > 4) {\n      setErrorMsg('Ko\\'pi bilan 4 ta rasm yuklash mumkin.');\n      return;\n    }\n`;
if (s.includes(imageValidationMarker) && !s.includes("Ko\\'pi bilan 4 ta rasm yuklash mumkin.")) {
  s = s.replace(imageValidationMarker, imageValidationReplacement);
}

// Upload embedded local images to Firebase Storage before creating the listing.
// Until Storage rules are actually deployed, the helper safely falls back to embedded
// images; the old Firestore payload guard below prevents oversized documents.
const listingMarker = "    const newListing: Listing = {\n      id: `olx-${Date.now()}`,";
const listingReplacement = `    const listingId = \`olx-\${Date.now()}\`;\n    const uploadResult = await uploadListingImagesToStorage(listingId, images);\n    const storedImages = uploadResult.images;\n    const embeddedPayload = storedImages\n      .filter((image) => image.startsWith('data:image/'))\n      .reduce((sum, image) => sum + image.length, 0);\n    if (embeddedPayload > 700000) {\n      setErrorMsg('Firebase Storage hali tayyor emas va rasmlar Firestore uchun juda katta. Storage qoidalarini yoqib, qayta urinib ko\\'ring.');\n      return;\n    }\n\n    const newListing: Listing = {\n      id: listingId,`;
if (s.includes(listingMarker)) {
  s = s.replace(listingMarker, listingReplacement);
}
s = s.replace('      images,\n      createdAt:', '      images: storedImages,\n      createdAt:');

// Mobile devices do not have hover, so the image delete control must always be visible there.
// Keep the cleaner hover-only behavior on larger screens.
s = s.replace(
  'className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"',
  'className="absolute top-1 right-1 z-10 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-sm" aria-label="Rasmni o‘chirish"'
);

// Wait for the actual save before displaying the success screen.
s = s.replace(
  '    onAddListing(newListing);\n    setSuccessCreated(newListing);',
  `    try {\n      await onAddListing(newListing);\n      setSuccessCreated(newListing);\n      setErrorMsg('');\n    } catch (error) {\n      console.error('Listing submission failed:', error);\n      setErrorMsg("E'lonni saqlashda xatolik yuz berdi. Internet aloqasini tekshirib, qayta urinib ko'ring.");\n    }`
);

// Success wording must reflect moderation status instead of promising immediate publication.
s = s.replace(
  `            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">\n              "{successCreated.title}" nomli e'loningiz muvaffaqiyatli saqlandi va xaridorlarga ko'rinadi!\n            </p>`,
  `            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">\n              {successCreated.status === 'pending'\n                ? \`"\${successCreated.title}" e'loningiz saqlandi va moderatsiyaga yuborildi. Tasdiqlangach xaridorlarga ko'rinadi.\`\n                : \`"\${successCreated.title}" e'loningiz muvaffaqiyatli saqlandi va xaridorlarga ko'rinadi!\`}\n            </p>`
);

// Do not falsely claim that Telegram posting already happened. It may depend on moderation/settings.
s = s.replace('Telegram Kanalga yuborildi', 'Telegram tarqatish');
s = s.replace('@oldisotti_uz', '@OSot_uz');
s = s.replace(
  "E'lon rasmi, narxi, manzili va to'g'ridan-to'g'ri aloqa ma'lumotlari bilan rasmiy kanalga avtomatik uzatildi.",
  "E'lon platforma sozlamalari va moderatsiya holatiga ko'ra rasmiy Telegram kanalga avtomatik yuborilishi mumkin."
);
s = s.replace('Kanalda ko\'rish', 'Telegram kanal');
s = s.replace('https://t.me/oldisotti_uz', 'https://t.me/OSot_uz');

// Do not trust promotion or verification flags from the browser. Paid promotion
// is enabled only after a verified server-side payment flow.
s = s.replace('      isTop: isVip,\n      isVip,', '      isTop: false,\n      isVip: false,\n      isPostedToTelegram: false,');
s = s.replace('        isVerified: true,', '        isVerified: false,');

// Remove demo personal contact defaults from production.
s = s.replace("  const [contactName, setContactName] = useState('Fedya Ibragimovich');", "  const [contactName, setContactName] = useState('');");
s = s.replace("  const [contactPhone, setContactPhone] = useState('+998 90 123 45 67');", "  const [contactPhone, setContactPhone] = useState('');");
s = s.replace("  const [contactTelegram, setContactTelegram] = useState('@fedya_uz');", "  const [contactTelegram, setContactTelegram] = useState('');");

// Disable the legacy checkbox that previously attempted to grant VIP directly.
s = s.replace(
  "checked={isVip}\n                  onChange={(e) => setIsVip(e.target.checked)}",
  "checked={false}\n                  disabled\n                  onChange={() => {}}"
);
s = s.replace('<span>VIP qilish</span>', '<span>VIP — to‘lovdan keyin</span>');

fs.writeFileSync(post, s);
