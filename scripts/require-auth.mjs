import fs from 'fs';

const post = 'src/components/PostAdModal.tsx';
let s = fs.readFileSync(post, 'utf8');

if (!s.includes("import { auth } from '../lib/firebase';")) {
  s = s.replace(
    "import { InfoTabKey } from '../data/infoPagesData';",
    "import { InfoTabKey } from '../data/infoPagesData';\nimport { auth } from '../lib/firebase';"
  );
}

const marker = "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n";
const replacement = "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!auth.currentUser) {\n      setErrorMsg('E\\'lon joylash uchun avval akkauntga kiring.');\n      return;\n    }\n";

if (s.includes(marker) && !s.includes("E\\'lon joylash uchun avval akkauntga kiring.")) {
  s = s.replace(marker, replacement);
}

fs.writeFileSync(post, s);
