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

// Fresh users should never inherit demo favorites, recent views, or fake conversations.
s = s.replace("    return ['olx-001', 'olx-002'];", '    return [];');
s = s.replace("    return ['olx-001', 'olx-002', 'olx-004'];", '    return [];');
s = s.replace('    return mockConversations;', '    return [];');

const conversationSeedOld = `        if (dbConversations.length === 0) {\n          await seedConversationsIfEmpty(mockConversations);\n        } else {\n          setConversations(dbConversations);\n          localStorage.setItem('olx_conversations', JSON.stringify(dbConversations));\n        }`;
if (s.includes(conversationSeedOld)) {
  s = s.replace(
    conversationSeedOld,
    `        setConversations(dbConversations);\n        localStorage.setItem('olx_conversations', JSON.stringify(dbConversations));`
  );
}

const reportSubscriptionOld = `    // 4. Moderation Reports real-time listener\n    const unsubscribeReports = subscribeToModerationReports((dbReports) => {\n      if (!isMounted) return;\n      setReports(dbReports);\n      localStorage.setItem('olx_moderation_reports', JSON.stringify(dbReports));\n    });`;
if (s.includes(reportSubscriptionOld)) {
  s = s.replace(
    reportSubscriptionOld,
    `    // Moderation reports are admin-only and are subscribed in a separate auth-aware effect.\n    const unsubscribeReports = () => {};`
  );
}

const adminReportsEffectMarker = `  const handleOpenInfoModal = (tab: InfoTabKey = 'help') => {`;
if (s.includes(adminReportsEffectMarker) && !s.includes('Admin-only moderation reports listener')) {
  const adminReportsEffect = `  // Admin-only moderation reports listener. Regular users never issue a forbidden Firestore read.\n  useEffect(() => {\n    if (!isAdminUser(currentUser)) {\n      setReports([]);\n      return;\n    }\n    return subscribeToModerationReports((dbReports) => {\n      setReports(dbReports);\n      localStorage.setItem('olx_moderation_reports', JSON.stringify(dbReports));\n    });\n  }, [currentUser]);\n\n`;
  s = s.replace(adminReportsEffectMarker, adminReportsEffect + adminReportsEffectMarker);
}

const myListingsOld = `  // User's own listings (posted by user-self or default)\n  const myListings = useMemo(() => {\n    return listings.filter((l) => l.seller.id === 'user-self' || l.seller.name === 'Fedya Ibragimovich');\n  }, [listings]);`;
const myListingsNew = `  // User's own listings are strictly bound to the authenticated Firebase UID.\n  const myListings = useMemo(() => {\n    if (!currentUser) return [];\n    return listings.filter((l) => l.userId === currentUser.uid);\n  }, [listings, currentUser]);`;
if (s.includes(myListingsOld)) s = s.replace(myListingsOld, myListingsNew);

// Persist a new listing before showing it locally. Also propagate the moderation status
// back to the submitted object so the success screen can tell the user the truth.
const addListingStart = s.indexOf('  // Add new listing handler\n  const handleAddListing = async (newListing: Listing) => {');
const addListingEnd = s.indexOf('\n\n  // Admin and Moderation handlers', addListingStart);
if (addListingStart !== -1 && addListingEnd !== -1) {
  const secureAddListing = `  // Add new listing handler\n  const handleAddListing = async (newListing: Listing) => {\n    const status = platformSettings.autoApproveListings ? 'active' : 'pending';\n    newListing.status = status;\n    const finalizedListing: Listing = {\n      ...newListing,\n      status\n    };\n\n    try {\n      await saveListingToDb(finalizedListing);\n    } catch (e) {\n      console.warn('Failed to save listing to Firestore:', e);\n      throw e;\n    }\n\n    setListings((prev) => [finalizedListing, ...prev]);\n\n    // Pending listings must never be published to Telegram before moderation.\n    const shouldPostTelegram =\n      finalizedListing.status === 'active' &&\n      platformSettings.autoPostListingsToTelegram &&\n      (!platformSettings.postOnlyVipToTelegram || finalizedListing.isVip || finalizedListing.isTop);\n\n    if (shouldPostTelegram) {\n      postListingToTelegram(finalizedListing, {\n        channelId: platformSettings.telegramChannelId,\n        botToken: platformSettings.telegramBotToken\n      })\n        .then(async (tgRes) => {\n          if (tgRes.success) {\n            const withTg: Listing = {\n              ...finalizedListing,\n              isPostedToTelegram: true,\n              telegramMessageId: tgRes.messageId,\n              telegramPostedAt: new Date().toISOString()\n            };\n            setListings((prev) =>\n              prev.map((item) => (item.id === withTg.id ? withTg : item))\n            );\n            try {\n              await saveListingToDb(withTg);\n            } catch (err) {\n              console.warn('Failed to update Telegram status in DB:', err);\n            }\n          }\n        })\n        .catch((tgErr) => {\n          console.warn('Telegram auto-post error:', tgErr);\n        });\n    }\n  };`;
  s = s.slice(0, addListingStart) + secureAddListing + s.slice(addListingEnd);
}

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
