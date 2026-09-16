import fs from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

const config = JSON.parse(fs.readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const app = initializeApp(config, `cursor-smoke-${Date.now()}`);
const db = getFirestore(app, config.firestoreDatabaseId);

try {
  const q = query(
    collection(db, 'listings'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(2)
  );
  const snapshot = await getDocs(q);
  console.log(`cursor-smoke-ok activeDocs=${snapshot.size}`);
} finally {
  await deleteApp(app);
}
