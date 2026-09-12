import fs from 'fs';

const appPath = 'src/App.tsx';
let s = fs.readFileSync(appPath, 'utf8');

if (!s.includes("import { subscribeToAuth, isAdminUser } from './lib/auth';")) {
  s = s.replace(
    "import { postListingToTelegram, sendTelegramNotification } from './services/telegram';",
    "import { postListingToTelegram, sendTelegramNotification } from './services/telegram';\nimport { subscribeToAuth, isAdminUser } from './lib/auth';\nimport type { User as FirebaseUser } from 'firebase/auth';"
  );
}

const userStateMarker = "  const t = getTranslation(lang);\n\n  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);";
if (s.includes(userStateMarker)) {
  s = s.replace(
    userStateMarker,
    "  const t = getTranslation(lang);\n  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);\n\n  useEffect(() => subscribeToAuth(setCurrentUser), []);\n\n  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);"
  );
}

const myListingsOld = `  // User's own listings (posted by user-self or default)\n  const myListings = useMemo(() => {\n    return listings.filter((l) => l.seller.id === 'user-self' || l.seller.name === 'Fedya Ibragimovich');\n  }, [listings]);`;
const myListingsNew = `  // User's own listings are strictly bound to the authenticated Firebase UID.\n  const myListings = useMemo(() => {\n    if (!currentUser) return [];\n    return listings.filter((l) => l.userId === currentUser.uid);\n  }, [listings, currentUser]);`;
if (s.includes(myListingsOld)) s = s.replace(myListingsOld, myListingsNew);

const startChatMarker = `  const handleStartChat = async (listing: Listing) => {\n    setSelectedListing(null);`;
const startChatReplacement = `  const handleStartChat = async (listing: Listing) => {\n    if (!currentUser || currentUser.isAnonymous) {\n      window.alert('Chatdan foydalanish uchun avval akkauntingizga kiring.');\n      return;\n    }\n    if (listing.userId === currentUser.uid) {\n      window.alert("O'zingizning e'loningiz bilan chat ochib bo'lmaydi.");\n      return;\n    }\n    setSelectedListing(null);`;
if (s.includes(startChatMarker) && !s.includes("O'zingizning e'loningiz bilan chat")) {
  s = s.replace(startChatMarker, startChatReplacement);
}

const sendMessageMarker = `  const handleSendMessage = async (chatId: string, text: string) => {\n    const newMessage: ChatMessage = {\n      id: \`msg-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,\n      sender: 'buyer',`;
const sendMessageReplacement = `  const handleSendMessage = async (chatId: string, text: string) => {\n    const sendingConversation = conversations.find((c) => c.id === chatId);\n    const senderRole: ChatMessage['sender'] = sendingConversation?.sellerUserId === currentUser?.uid ? 'seller' : 'buyer';\n    const newMessage: ChatMessage = {\n      id: \`msg-\${Date.now()}-\${Math.random().toString(36).substr(2, 4)}\`,\n      sender: senderRole,`;
if (s.includes(sendMessageMarker)) s = s.replace(sendMessageMarker, sendMessageReplacement);

const verifyStart = s.indexOf('  const handleToggleVerifySeller = (sellerId: string) => {');
const verifyEnd = s.indexOf('\n\n  const handleUpdateReportStatus', verifyStart);
if (verifyStart !== -1 && verifyEnd !== -1) {
  const secureVerifyHandler = `  const handleToggleVerifySeller = async (sellerId: string) => {\n    if (!isAdminUser(currentUser)) return;\n    const affected = listings.filter((l) => l.seller.id === sellerId || l.userId === sellerId);\n    const currentlyVerified = affected.some((l) => l.seller.isVerified) || verifiedSellerIds.includes(sellerId);\n    const newVerified = !currentlyVerified;\n\n    try {\n      for (const listing of affected) {\n        await updateListingInDb(listing.id, {\n          seller: { ...listing.seller, isVerified: newVerified }\n        });\n      }\n      setVerifiedSellerIds((prev) =>\n        newVerified ? Array.from(new Set([...prev, sellerId])) : prev.filter((id) => id !== sellerId)\n      );\n      setListings((prev) =>\n        prev.map((l) =>\n          l.seller.id === sellerId || l.userId === sellerId\n            ? { ...l, seller: { ...l.seller, isVerified: newVerified } }\n            : l\n        )\n      );\n    } catch (e) {\n      console.warn('Failed to persist seller verification:', e);\n    }\n  };`;
  s = s.slice(0, verifyStart) + secureVerifyHandler + s.slice(verifyEnd);
}

const vipStart = s.indexOf('  // Upgrade to VIP\n  const handleUpgradeToVip = async');
const vipEnd = s.indexOf('\n\n  // Start chat for listing', vipStart);
if (vipStart !== -1 && vipEnd !== -1) {
  const safeVipHandler = `  // VIP is never granted directly from the browser.\n  const handleUpgradeToVip = async (_id: string) => {\n    window.alert("VIP faqat tasdiqlangan to'lovdan keyin faollashtiriladi.");\n  };`;
  s = s.slice(0, vipStart) + safeVipHandler + s.slice(vipEnd);
}

// Maintenance banner must not expose an admin entry point to regular users.
s = s.replace(
  `          <button\n            type="button"\n            onClick={() => setIsAdminOpen(true)}\n            className="underline hover:text-rose-100 text-xs font-black cursor-pointer mr-2"\n          >\n            Admin\n          </button>`,
  `          {isAdminUser(currentUser) && (\n            <button\n              type="button"\n              onClick={() => setIsAdminOpen(true)}\n              className="underline hover:text-rose-100 text-xs font-black cursor-pointer mr-2"\n            >\n              Admin\n            </button>\n          )}`
);

fs.writeFileSync(appPath, s);
