import fs from 'fs';

const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

if (!s.includes("import { auth } from '../lib/firebase';")) {
  s = s.replace(
    "import { InfoTabKey } from '../data/infoPagesData';",
    "import { InfoTabKey } from '../data/infoPagesData';\nimport { auth } from '../lib/firebase';"
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

// Firestore documents have a strict size limit. Prevent large base64 image payloads
// from creating listings that only appear successful locally but fail in the cloud.
const imageValidationMarker = "    if (images.length === 0) {\n      setErrorMsg('Kamida bitta fotosurat yuklang');\n      return;\n    }\n";
const imageValidationReplacement = `${imageValidationMarker}\n    const totalImagePayload = images.reduce((sum, image) => sum + image.length, 0);\n    if (images.length > 4) {\n      setErrorMsg('Ko\\'pi bilan 4 ta rasm yuklash mumkin.');\n      return;\n    }\n    if (totalImagePayload > 700000) {\n      setErrorMsg('Rasmlar hajmi juda katta. Rasmlarni kichraytirib, qayta yuklang.');\n      return;\n    }\n`;
if (s.includes(imageValidationMarker) && !s.includes('totalImagePayload')) {
  s = s.replace(imageValidationMarker, imageValidationReplacement);
}

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
