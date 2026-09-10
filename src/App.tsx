import React, { useState, useEffect, useMemo } from 'react';
import {
  Listing,
  Language,
  Currency,
  FilterState,
  Conversation,
  ChatMessage,
  PlatformSettings,
  ModerationReport
} from './types';
import { mockListings, mockConversations } from './data/mockListings';
import { USD_TO_UZS_RATE } from './utils/formatters';
import { getTranslation } from './data/translations';
import { initialPlatformSettings, initialModerationReports } from './data/adminData';
import { AlertTriangle } from 'lucide-react';
import {
  subscribeToListings,
  seedInitialListingsIfEmpty,
  saveListingToDb,
  updateListingInDb,
  deleteListingFromDb,
  incrementListingViewsInDb,
  subscribeToConversations,
  seedConversationsIfEmpty,
  saveConversationToDb,
  appendMessageInDb,
  subscribeToPlatformSettings,
  savePlatformSettingsToDb,
  subscribeToModerationReports,
  updateReportStatusInDb
} from './lib/firebase';
import { Header } from './components/Header';
import { SearchBanner } from './components/SearchBanner';
import { CategoriesBar } from './components/CategoriesBar';
import { VipListings } from './components/VipListings';
import { ListingFilters } from './components/ListingFilters';
import { ListingCard } from './components/ListingCard';
import { ListingSkeletonGrid } from './components/ListingSkeleton';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { ChatDrawer } from './components/ChatDrawer';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { MyAdsModal } from './components/MyAdsModal';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { PopularBrandsBar } from './components/PopularBrandsBar';
import { BottomNav } from './components/BottomNav';
import { ScrollToTop } from './components/ScrollToTop';
import { SafePurchasesSection } from './components/SafePurchasesSection';
import { InfoPagesModal } from './components/InfoPagesModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { InfoTabKey } from './data/infoPagesData';
import { postListingToTelegram, sendTelegramNotification } from './services/telegram';

export default function App() {
  const [lang, setLang] = useState<Language>(() => { const saved = localStorage.getItem('olx_lang') as Language; return saved === 'uz' || saved === 'ru' || saved === 'oz' ? saved : 'uz'; });
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem('olx_currency') as Currency) || 'UZS');
  const [darkMode, setDarkMode] = useState<boolean>(() => { const saved = localStorage.getItem('olx_dark_mode'); return saved !== null ? saved === 'true' : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; });
  useEffect(() => { localStorage.setItem('olx_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('olx_currency', currency); }, [currency]);
  useEffect(() => { localStorage.setItem('olx_dark_mode', String(darkMode)); document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);
  const t = getTranslation(lang);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [listings, setListings] = useState<Listing[]>(() => { const saved = localStorage.getItem('olx_listings'); if (saved) { try { return JSON.parse(saved); } catch {} } return mockListings; });
  useEffect(() => { localStorage.setItem('olx_listings', JSON.stringify(listings)); }, [listings]);
  const [favorites, setFavorites] = useState<string[]>(() => { const saved = localStorage.getItem('olx_favorites'); if (saved) { try { return JSON.parse(saved); } catch {} } return ['olx-001', 'olx-002']; });
  useEffect(() => { localStorage.setItem('olx_favorites', JSON.stringify(favorites)); }, [favorites]);
  const handleToggleFavorite = (id: string) => setFavorites(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => { const saved = localStorage.getItem('olx_recently_viewed'); if (saved) { try { const parsed = JSON.parse(saved); if (Array.isArray(parsed)) return parsed.slice(0, 5); } catch {} } return ['olx-001', 'olx-002', 'olx-004']; });
  useEffect(() => { localStorage.setItem('olx_recently_viewed', JSON.stringify(recentlyViewedIds)); }, [recentlyViewedIds]);
  const [conversations, setConversations] = useState<Conversation[]>(() => { const saved = localStorage.getItem('olx_conversations'); if (saved) { try { return JSON.parse(saved); } catch {} } return mockConversations; });
  useEffect(() => { localStorage.setItem('olx_conversations', JSON.stringify(conversations)); }, [conversations]);
  const unreadMessagesCount = useMemo(() => conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0), [conversations]);
  const [filters, setFilters] = useState<FilterState>({ query:'', categoryId:'', subcategoryId:'', region:'', district:'', minPrice:'', maxPrice:'', condition:'all', onlyWithPhoto:false, onlyDelivery:false, onlyNegotiable:false, sortBy:'newest' });
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  useEffect(() => { setIsLoadingListings(true); const timer = setTimeout(() => setIsLoadingListings(false), 280); return () => clearTimeout(timer); }, [filters, currency]);
  const [selectedListing, setSelectedListing] = useState<Listing|null>(null);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string|null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMyAdsOpen, setIsMyAdsOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoTabKey>('help');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => { const saved=localStorage.getItem('olx_platform_settings'); if(saved){try{return JSON.parse(saved)}catch{}} return initialPlatformSettings; });
  const [blockedSellerIds, setBlockedSellerIds] = useState<string[]>([]);
  const [verifiedSellerIds, setVerifiedSellerIds] = useState<string[]>(['seller-001','seller-003']);
  const [reports, setReports] = useState<ModerationReport[]>(initialModerationReports);
  useEffect(() => { localStorage.setItem('olx_platform_settings', JSON.stringify(platformSettings)); }, [platformSettings]);
  useEffect(() => { localStorage.setItem('olx_blocked_sellers', JSON.stringify(blockedSellerIds)); }, [blockedSellerIds]);
  useEffect(() => { localStorage.setItem('olx_verified_sellers', JSON.stringify(verifiedSellerIds)); }, [verifiedSellerIds]);
  useEffect(() => { localStorage.setItem('olx_moderation_reports', JSON.stringify(reports)); }, [reports]);

  useEffect(() => {
    let mounted=true;
    const u1=subscribeToListings(async dbListings=>{ if(!mounted)return; setIsDbConnected(true); if(dbListings.length===0) await seedInitialListingsIfEmpty(mockListings); else setListings(dbListings); }, ()=>setIsDbConnected(false));
    const u2=subscribeToConversations(async dbConvs=>{ if(!mounted)return; if(dbConvs.length===0) await seedConversationsIfEmpty(mockConversations); else setConversations(dbConvs); });
    const u3=subscribeToPlatformSettings(s=>{if(mounted)setPlatformSettings(s)});
    const u4=subscribeToModerationReports(r=>{if(mounted)setReports(r)});
    return()=>{mounted=false;u1();u2();u3();u4();};
  },[]);
  const handleOpenInfoModal=(tab:InfoTabKey='help')=>{setInfoModalTab(tab);setIsInfoModalOpen(true)};
  const handleFilterChange=(updates:Partial<FilterState>)=>setFilters(prev=>({...prev,...updates}));
  const handleResetFilters=()=>setFilters({query:'',categoryId:'',subcategoryId:'',region:'',district:'',brand:undefined,minPrice:'',maxPrice:'',condition:'all',onlyWithPhoto:false,onlyDelivery:false,onlyNegotiable:false,sortBy:'newest'});
  const filteredListings=useMemo(()=>listings.filter(item=>{if(item.status==='pending'||item.status==='rejected')return false;const q=filters.query.toLowerCase().trim();if(q){const attrs=item.attributes&&Object.values(item.attributes).some(v=>typeof v==='string'&&v.toLowerCase().includes(q));if(!item.title.toLowerCase().includes(q)&&!item.description.toLowerCase().includes(q)&&!item.seller.name.toLowerCase().includes(q)&&!item.location.region.toLowerCase().includes(q)&&!item.location.district.toLowerCase().includes(q)&&!(item.location.address&&item.location.address.toLowerCase().includes(q))&&!attrs)return false;}if(filters.categoryId&&item.categoryId!==filters.categoryId)return false;if(filters.subcategoryId&&item.subcategoryId!==filters.subcategoryId)return false;if(filters.brand){const b=filters.brand.toLowerCase().trim();if(!(item.brand&&item.brand.toLowerCase().includes(b))&&!item.title.toLowerCase().includes(b)&&!(item.attributes&&Object.entries(item.attributes).some(([k,v])=>(k.toLowerCase().includes('brand')||k.toLowerCase().includes('model')||k.toLowerCase().includes('marka'))&&typeof v==='string'&&v.toLowerCase().includes(b))))return false;}if(filters.region&&item.location.region!==filters.region)return false;if(filters.district&&item.location.district!==filters.district)return false;if(filters.condition!=='all'&&item.condition!==filters.condition)return false;if(filters.onlyWithPhoto&&item.images.length===0)return false;if(filters.onlyDelivery&&!item.isDeliveryAvailable)return false;if(filters.onlyNegotiable&&!item.isNegotiable)return false;const price=item.currency===currency?item.price:currency==='USD'?Math.round(item.price/USD_TO_UZS_RATE):item.price*USD_TO_UZS_RATE;if(filters.minPrice&&price<Number(filters.minPrice))return false;if(filters.maxPrice&&price>Number(filters.maxPrice))return false;return true;}).sort((a,b)=>filters.sortBy==='popular'?b.viewsCount-a.viewsCount:filters.sortBy==='price_asc'?(a.currency==='USD'?a.price*USD_TO_UZS_RATE:a.price)-(b.currency==='USD'?b.price*USD_TO_UZS_RATE:b.price):filters.sortBy==='price_desc'?(b.currency==='USD'?b.price*USD_TO_UZS_RATE:b.price)-(a.currency==='USD'?a.price*USD_TO_UZS_RATE:a.price):(a.isVip===b.isVip?0:a.isVip?-1:1)),[listings,filters,currency]);
  const handleAddListing=async(newListing:Listing)=>{const finalized={...newListing,status:(platformSettings.autoApproveListings?'active':'pending') as Listing['status']};setListings(p=>[finalized,...p]);const shouldPost=platformSettings.autoPostListingsToTelegram&&(!platformSettings.postOnlyVipToTelegram||finalized.isVip||finalized.isTop);if(shouldPost)postListingToTelegram(finalized,{channelId:platformSettings.telegramChannelId,botToken:platformSettings.telegramBotToken}).then(async r=>{if(r.success){const x={...finalized,isPostedToTelegram:true,telegramMessageId:r.messageId,telegramPostedAt:new Date().toISOString()};setListings(p=>p.map(i=>i.id===x.id?x:i));try{await saveListingToDb(x)}catch{}}}).catch(()=>{});try{await saveListingToDb(finalized)}catch{}};
  const handleUpdateListing=async(updated:Listing)=>{setListings(p=>p.map(i=>i.id===updated.id?updated:i));if(selectedListing?.id===updated.id)setSelectedListing(updated);try{await saveListingToDb(updated)}catch{}};
  const handleResetCatalogDefaults=async()=>{setListings(mockListings);try{for(const i of mockListings)await saveListingToDb(i)}catch{}};
  const handleToggleBlockSeller=(id:string)=>setBlockedSellerIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const handleToggleVerifySeller=(id:string)=>setVerifiedSellerIds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const handleUpdateReportStatus=async(id:string,status:'resolved'|'dismissed')=>{setReports(p=>p.map(r=>r.id===id?{...r,status}:r));try{await updateReportStatusInDb(id,status)}catch{}};
  const handleMarkAsSold=async(id:string)=>{setListings(p=>p.map(i=>i.id===id?{...i,status:'sold'}:i));try{await updateListingInDb(id,{status:'sold'})}catch{}};
  const handleDeleteListing=async(id:string)=>{setListings(p=>p.filter(i=>i.id!==id));try{await deleteListingFromDb(id)}catch{}};
  const handleUpgradeToVip=async(id:string)=>{setListings(p=>p.map(i=>i.id===id?{...i,isVip:true,isTop:true}:i));try{await updateListingInDb(id,{isVip:true,isTop:true})}catch{}};
  const handleStartChat=async(listing:Listing)=>{setSelectedListing(null);const existing=conversations.find(c=>c.listingId===listing.id);if(existing){setActiveChatId(existing.id);setIsChatOpen(true);return;}const now=Date.now();const newConv:Conversation={id:`chat-${now}`,listingId:listing.id,listingTitle:listing.title,listingPrice:listing.price,listingCurrency:listing.currency,listingImage:listing.images[0]||'',sellerId:listing.seller.id,sellerName:listing.seller.name,sellerAvatar:listing.seller.avatar||'',sellerPhone:listing.seller.phone,messages:[{id:`msg-${now}`,sender:'buyer',text:`Assalomu alaykum, "${listing.title}" bo'yicha yozmoqdaman.`,timestamp:'Hozir'}],lastUpdated:'Hozir',unreadCount:0};setConversations(p=>[newConv,...p]);setActiveChatId(newConv.id);setIsChatOpen(true);try{await saveConversationToDb(newConv)}catch{}};
  const handleSendMessage=async(chatId:string,text:string)=>{const m:ChatMessage={id:`msg-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,sender:'buyer',text,timestamp:'Hozir'};let msgs:ChatMessage[]=[];setConversations(p=>p.map(c=>{if(c.id===chatId){msgs=[...c.messages,m];return {...c,messages:msgs,lastUpdated:'Hozir'}}return c;}));try{if(msgs.length)await appendMessageInDb(chatId,m,msgs);const conv=conversations.find(c=>c.id===chatId);const listing=conv&&listings.find(l=>l.id===conv.listingId);if(platformSettings.notifySellerOnChat&&listing?.seller.telegram)sendTelegramNotification({type:'chat_message',title:`💬 Yangi xabar: "${listing.title.slice(0,24)}..."`,message:`Xaridor: "${text.slice(0,120)}"\n\nJavob berish uchun platformaga kiring.`,listingId:listing.id,chatId:listing.seller.telegram}).catch(()=>{});}catch{}};
  const handleResyncWithFirestore=async()=>{try{for(const i of mockListings)await saveListingToDb(i);for(const c of mockConversations)await saveConversationToDb(c);await savePlatformSettingsToDb(initialPlatformSettings);setIsDbConnected(true)}catch{}};
  const favoriteListings=useMemo(()=>listings.filter(l=>favorites.includes(l.id)),[listings,favorites]);
  const myListings=useMemo(()=>listings.filter(l=>l.seller.id==='user-self'||l.seller.name==='Fedya Ibragimovich'),[listings]);
  const recentlyViewedListings=useMemo(()=>recentlyViewedIds.map(id=>listings.find(l=>l.id===id)).filter((l):l is Listing=>!!l),[recentlyViewedIds,listings]);
  const handleSelectListing=(listing:Listing)=>{setSelectedListing(listing);setRecentlyViewedIds(p=>[listing.id,...p.filter(id=>id!==listing.id)].slice(0,5));incrementListingViewsInDb(listing.id)};
  const handleClearRecentlyViewed=()=>{setRecentlyViewedIds([]);localStorage.removeItem('olx_recently_viewed');};
  return <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 w-full max-w-full overflow-x-hidden pb-20 sm:pb-24 transition-colors duration-200 smooth-scroll">
    {platformSettings.maintenanceMode&&<div className="bg-rose-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs z-40"><div className="flex items-center gap-2 mx-auto"><AlertTriangle size={15}/><span>DIQQAT: Tizimda texnik profilaktika rejimi yoqilgan.</span></div><button type="button" onClick={()=>setIsAdminOpen(true)} className="underline hover:text-rose-100 text-xs font-black cursor-pointer mr-2">Admin</button></div>}
    <Header lang={lang} onLanguageChange={setLang} currency={currency} onCurrencyChange={setCurrency} unreadCount={unreadMessagesCount} favoritesCount={favorites.length} onOpenChat={()=>{setActiveChatId(conversations[0]?.id||null);setIsChatOpen(true)}} onOpenFavorites={()=>setIsFavoritesOpen(true)} onOpenPostAd={()=>setIsPostAdOpen(true)} onOpenMyAds={()=>setIsMyAdsOpen(true)} onOpenAdmin={()=>setIsAdminOpen(true)} onResetToHome={()=>{handleResetFilters();window.scrollTo({top:0,behavior:'smooth'})}} darkMode={darkMode} onToggleDarkMode={()=>setDarkMode(p=>!p)} selectedCategoryId={filters.categoryId} onSelectCategory={catId=>handleFilterChange({categoryId:catId,subcategoryId:''})} isDbConnected={isDbConnected}/>
    <SearchBanner lang={lang} searchQuery={filters.query} onSearchChange={q=>handleFilterChange({query:q})} selectedRegion={filters.region} selectedDistrict={filters.district} onLocationChange={(r,d)=>handleFilterChange({region:r,district:d})} onSearchSubmit={()=>document.getElementById('listings-feed-anchor')?.scrollIntoView({behavior:'smooth'})}/>
    <CategoriesBar lang={lang} selectedCategoryId={filters.categoryId} selectedSubcategoryId={filters.subcategoryId} onSelectCategory={catId=>handleFilterChange({categoryId:catId})} onSelectSubcategory={subId=>handleFilterChange({subcategoryId:subId})}/>
    <PopularBrandsBar selectedBrand={filters.brand} onSelectBrand={b=>handleFilterChange({brand:b})} lang={lang}/>
    <main className="flex-1 mx-auto max-w-7xl w-full max-w-full px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden"><div id="listings-feed-anchor"/>{!filters.query&&!filters.categoryId&&<VipListings listings={listings} currency={currency} lang={lang} favorites={favorites} onToggleFavorite={handleToggleFavorite} onSelectListing={handleSelectListing}/>}<ListingFilters lang={lang} filters={filters} onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} totalCount={filteredListings.length} viewMode={viewMode} onViewModeChange={setViewMode}/>{isLoadingListings?<ListingSkeletonGrid count={viewMode==='grid'?10:5} viewMode={viewMode}/>:filteredListings.length===0?<div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-8 space-y-4"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"><span className="text-3xl">🔍</span></div><h3 className="text-lg font-bold text-slate-800 dark:text-white">{t.nothingFound}</h3><p className="text-xs text-slate-500 dark:text-slate-400">{t.tryChangeFilters}</p><button onClick={handleResetFilters} className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2.5 text-xs font-bold text-white">{t.clearFilters}</button></div>:viewMode==='grid'?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">{filteredListings.map(item=><ListingCard key={item.id} listing={item} currency={currency} lang={lang} isFavorite={favorites.includes(item.id)} onToggleFavorite={handleToggleFavorite} onSelectListing={handleSelectListing} viewMode="grid"/>)}</div>:<div className="space-y-3">{filteredListings.map(item=><ListingCard key={item.id} listing={item} currency={currency} lang={lang} isFavorite={favorites.includes(item.id)} onToggleFavorite={handleToggleFavorite} onSelectListing={handleSelectListing} viewMode="list"/>)}</div>}<RecentlyViewed listings={recentlyViewedListings} currency={currency} lang={lang} favorites={favorites} onToggleFavorite={handleToggleFavorite} onSelectListing={handleSelectListing} onClearHistory={handleClearRecentlyViewed}/></main>
    {selectedListing&&<ListingDetailModal listing={selectedListing} onClose={()=>setSelectedListing(null)} currency={currency} lang={lang} isFavorite={favorites.includes(selectedListing.id)} onToggleFavorite={handleToggleFavorite} onStartChat={handleStartChat} onSelectListing={handleSelectListing} allListings={listings} favorites={favorites} onOpenInfoModal={handleOpenInfoModal}/>}<PostAdModal isOpen={isPostAdOpen} onClose={()=>setIsPostAdOpen(false)} lang={lang} onAddListing={handleAddListing} onOpenInfoModal={handleOpenInfoModal}/><ChatDrawer isOpen={isChatOpen} onClose={()=>setIsChatOpen(false)} lang={lang} currency={currency} conversations={conversations} activeChatId={activeChatId} onSelectChat={setActiveChatId} onSendMessage={handleSendMessage}/><FavoritesDrawer isOpen={isFavoritesOpen} onClose={()=>setIsFavoritesOpen(false)} lang={lang} currency={currency} favoriteListings={favoriteListings} onRemoveFavorite={handleToggleFavorite} onSelectListing={handleSelectListing}/><MyAdsModal isOpen={isMyAdsOpen} onClose={()=>setIsMyAdsOpen(false)} lang={lang} currency={currency} myListings={myListings} onMarkAsSold={handleMarkAsSold} onDeleteListing={handleDeleteListing} onUpgradeToVip={handleUpgradeToVip} onSelectListing={handleSelectListing} onOpenPostAd={()=>{setIsMyAdsOpen(false);setIsPostAdOpen(true)}}/><SafePurchasesSection lang={lang} onOpenPostAd={()=>setIsPostAdOpen(true)} onExplore={()=>window.scrollTo({top:0,behavior:'smooth'})} onOpenInfoModal={handleOpenInfoModal}/><FaqSection lang={lang}/><InfoPagesModal isOpen={isInfoModalOpen} onClose={()=>setIsInfoModalOpen(false)} initialTab={infoModalTab} lang={lang} onOpenPostAd={()=>{setIsInfoModalOpen(false);setIsPostAdOpen(true)}}/><AdminPanelModal isOpen={isAdminOpen} onClose={()=>setIsAdminOpen(false)} lang={lang} currency={currency} listings={listings} onUpdateListing={handleUpdateListing} onDeleteListing={handleDeleteListing} onSelectListing={handleSelectListing} onResetCatalogDefaults={handleResetCatalogDefaults} platformSettings={platformSettings} onUpdatePlatformSettings={async s=>{setPlatformSettings(s);try{await savePlatformSettingsToDb(s)}catch{}}} blockedSellerIds={blockedSellerIds} onToggleBlockSeller={handleToggleBlockSeller} verifiedSellerIds={verifiedSellerIds} onToggleVerifySeller={handleToggleVerifySeller} reports={reports} onUpdateReportStatus={handleUpdateReportStatus} isDbConnected={isDbConnected} onResyncDb={handleResyncWithFirestore}/><Footer lang={lang} onOpenInfoModal={handleOpenInfoModal} onOpenAdmin={()=>setIsAdminOpen(true)}/><ScrollToTop/><BottomNav lang={lang} unreadCount={unreadMessagesCount} favoritesCount={favorites.length} onHomeClick={()=>{handleResetFilters();window.scrollTo({top:0,behavior:'smooth'})}} onMessagesClick={()=>{setActiveChatId(conversations[0]?.id||null);setIsChatOpen(true)}} onPostAdClick={()=>setIsPostAdOpen(true)} onFavoritesClick={()=>setIsFavoritesOpen(true)} onMyAdsClick={()=>setIsMyAdsOpen(true)} onOpenAdmin={()=>setIsAdminOpen(true)}/>
  </div>;
}
