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
const replacement = "  const handleSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    const currentUser = auth.currentUser;\n    if (!currentUser || currentUser.isAnonymous) {\n      setErrorMsg('E\\'lon joylash uchun avval akkauntingizga kiring.');\n      return;\n    }\n";

if (s.includes(marker) && !s.includes("currentUser.isAnonymous")) {
  s = s.replace(marker, replacement);
}

fs.writeFileSync(post, s);
