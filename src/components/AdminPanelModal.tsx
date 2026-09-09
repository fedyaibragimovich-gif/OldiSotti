import React, { useState, useMemo, useEffect } from 'react';
import {
  X, ShieldCheck, LayoutDashboard, Package, Users, AlertTriangle, Settings,
  Search, CheckCircle2, XCircle, Trash2, Crown, Flame, Eye, EyeOff,
  RefreshCw, Ban, UserCheck, Megaphone, Save, Check, TrendingUp, Tag,
  ExternalLink, ChevronRight, Filter, Database, Send, SendHorizontal, Bot,
  Radio, Share2, Copy, Sparkles, Info, CheckSquare
} from 'lucide-react';
import { Listing, Language, Currency, PlatformSettings, ModerationReport } from '../types';
import { getTranslation } from '../data/translations';
import { categories } from '../data/categories';
import { formatPrice, USD_TO_UZS_RATE } from '../utils/formatters';
import { extractSellersFromListings, AdminSellerSummary } from '../data/adminData';
import { postListingToTelegram, testTelegramConnection, createTelegramShareUrl, TelegramConnectionResponse, TelegramPostResponse } from '../services/telegram';
import { subscribeToAuth, isAdminUser } from '../lib/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AdminPanelModalProps {
  isOpen: boolean; onClose: () => void; lang: Language; currency: Currency;
  listings: Listing[]; onUpdateListing: (updated: Listing) => void; onDeleteListing: (id: string) => void;
  onSelectListing: (listing: Listing) => void; onResetCatalogDefaults: () => void;
  platformSettings: PlatformSettings; onUpdatePlatformSettings: (settings: PlatformSettings) => void;
  blockedSellerIds: string[]; onToggleBlockSeller: (sellerId: string) => void;
  verifiedSellerIds: string[]; onToggleVerifySeller: (sellerId: string) => void;
  reports: ModerationReport[]; onUpdateReportStatus: (reportId: string, status: 'resolved' | 'dismissed') => void;
  isDbConnected?: boolean; onResyncDb?: () => Promise<void> | void;
}

type AdminTab = 'dashboard' | 'listings' | 'users' | 'reports' | 'settings' | 'telegram';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = (props) => {
  const { isOpen, onClose, lang, currency, listings, onUpdateListing, onDeleteListing, onSelectListing, onResetCatalogDefaults, platformSettings, onUpdatePlatformSettings, blockedSellerIds, onToggleBlockSeller, verifiedSellerIds, onToggleVerifySeller, reports, onUpdateReportStatus, isDbConnected = false, onResyncDb } = props;
  const t = getTranslation(lang);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [listingSearchQuery, setListingSearchQuery] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'rejected'>('all');
  const [listingCategoryFilter, setListingCategoryFilter] = useState<string>('all');
  const [listingPromoFilter, setListingPromoFilter] = useState<'all' | 'vip' | 'top'>('all');
  const [rejectingListingId, setRejectingListingId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterType, setUserFilterType] = useState<'all' | 'verified' | 'blocked'>('all');
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(platformSettings);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<TelegramConnectionResponse | null>(null);
  const [isTokenVisible, setIsTokenVisible] = useState(false);
  const [selectedListingToPostId, setSelectedListingToPostId] = useState(listings[0]?.id || '');
  const [isPostingToChannel, setIsPostingToChannel] = useState(false);
  const [telegramPostResult, setTelegramPostResult] = useState<TelegramPostResponse | null>(null);

  useEffect(() => subscribeToAuth(setCurrentUser), []);
  useEffect(() => setSettingsForm(platformSettings), [platformSettings]);
  useEffect(() => { if (listings.length && !listings.some(l => l.id === selectedListingToPostId)) setSelectedListingToPostId(listings[0].id); }, [listings, selectedListingToPostId]);

  const authorized = isAdminUser(currentUser);
  const sellers: AdminSellerSummary[] = useMemo(() => extractSellersFromListings(listings, blockedSellerIds, verifiedSellerIds), [listings, blockedSellerIds, verifiedSellerIds]);
  const metrics = useMemo(() => ({
    total: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
    sold: listings.filter(l => l.status === 'sold').length,
    vip: listings.filter(l => l.isVip).length,
    top: listings.filter(l => l.isTop).length,
    totalViews: listings.reduce((a, l) => a + (l.viewsCount || 0), 0),
    totalValueUzs: listings.reduce((a, l) => a + (l.currency === 'USD' ? l.price * USD_TO_UZS_RATE : l.price), 0)
  }), [listings]);
  const categoryStats = useMemo(() => categories.map(cat => { const count = listings.filter(l => l.categoryId === cat.id).length; return { id: cat.id, name: cat.name[lang] || cat.name.uz, count, percentage: metrics.total ? Math.round(count / metrics.total * 100) : 0 }; }).sort((a,b) => b.count-a.count), [listings, metrics.total, lang]);
  const filteredListings = useMemo(() => listings.filter(item => {
    if (listingStatusFilter !== 'all' && item.status !== listingStatusFilter) return false;
    if (listingCategoryFilter !== 'all' && item.categoryId !== listingCategoryFilter) return false;
    if (listingPromoFilter === 'vip' && !item.isVip) return false;
    if (listingPromoFilter === 'top' && !item.isTop) return false;
    if (listingSearchQuery.trim()) { const q=listingSearchQuery.toLowerCase(); if (!item.title.toLowerCase().includes(q) && !item.seller.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q) && !item.seller.phone.toLowerCase().includes(q)) return false; }
    return true;
  }), [listings, listingStatusFilter, listingCategoryFilter, listingPromoFilter, listingSearchQuery]);
  const filteredSellers = useMemo(() => sellers.filter(s => { if (userFilterType==='verified' && !s.isVerified) return false; if (userFilterType==='blocked' && !s.isBlocked) return false; if (userSearchQuery.trim()) { const q=userSearchQuery.toLowerCase(); if (!s.name.toLowerCase().includes(q) && !s.phone.toLowerCase().includes(q)) return false; } return true; }), [sellers, userFilterType, userSearchQuery]);
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  if (!isOpen || !authorized) return null;

  const handleApproveListing = (listing: Listing) => onUpdateListing({...listing, status:'active', rejectionReason:undefined});
  const handleConfirmRejectListing = (listing: Listing) => { onUpdateListing({...listing, status:'rejected', rejectionReason:rejectReasonText.trim() || 'Moderatsiya qoidalariga mos kelmadi'}); setRejectingListingId(null); setRejectReasonText(''); };
  const handleToggleVip = (listing: Listing) => onUpdateListing({...listing, isVip:!listing.isVip});
  const handleToggleTop = (listing: Listing) => onUpdateListing({...listing, isTop:!listing.isTop});
  const handleTestTelegramConnection = async () => { setTelegramTesting(true); setTelegramTestResult(null); try { const res=await testTelegramConnection(settingsForm.telegramBotToken, settingsForm.telegramChannelId); setTelegramTestResult(res); setSaveToast(res.success ? "Telegram bot va kanal bilan muvaffaqiyatli bog'lanildi!" : 'Telegram ulanishida ogohlantirish'); setTimeout(()=>setSaveToast(null),3500); } catch(err:any){setTelegramTestResult({success:false,error:err.message||'Ulanishda kutilmagan xatolik yuz berdi'});} finally{setTelegramTesting(false);} };
  const handlePostSelectedListingToTelegram = async () => { const target=listings.find(l=>l.id===selectedListingToPostId); if(!target)return; setIsPostingToChannel(true); setTelegramPostResult(null); try { const res=await postListingToTelegram(target,{channelId:settingsForm.telegramChannelId,botToken:settingsForm.telegramBotToken}); setTelegramPostResult(res); if(res.success){onUpdateListing({...target,isPostedToTelegram:true,telegramMessageId:res.messageId,telegramPostedAt:new Date().toISOString()});setSaveToast(`"${target.title.slice(0,22)}..." Telegram kanalga joylandi!`);setTimeout(()=>setSaveToast(null),3500);}}catch(err:any){setTelegramPostResult({success:false,error:err.message||'Kanalga yuborishda xatolik yuz berdi'});}finally{setIsPostingToChannel(false);} };
  const handleQuickBroadcastToTelegram = async (listing: Listing) => { try { const res=await postListingToTelegram(listing,{channelId:settingsForm.telegramChannelId,botToken:settingsForm.telegramBotToken}); if(res.success){onUpdateListing({...listing,isPostedToTelegram:true,telegramMessageId:res.messageId,telegramPostedAt:new Date().toISOString()});setSaveToast(`"${listing.title.slice(0,18)}..." kanalga yuborildi!`);setTimeout(()=>setSaveToast(null),3000);}}catch(err){console.warn('Quick broadcast error:',err);} };
  const handleSaveSettings = (e:React.FormEvent) => {e.preventDefault();onUpdatePlatformSettings(settingsForm);setSaveToast(t.adminSettingsSaved || 'Sozlamalar muvaffaqiyatli saqlandi!');setTimeout(()=>setSaveToast(null),3000);};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-slate-950/70 backdrop-blur-xs flex justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white"><ShieldCheck size={22}/></div><div><div className="flex items-center gap-2"><h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Oldisotti <span className="text-indigo-600 dark:text-indigo-400">Admin</span></h2><span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] px-2 py-0.5">Super Admin</span></div><p className="text-xs text-slate-500 dark:text-slate-400">{t.adminStatsTitle} & e'lonlar markaziy boshqaruvi</p></div></div>
          <div className="flex items-center gap-2">{saveToast&&<div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl"><Check size={14}/><span>{saveToast}</span></div>}<button id="admin-close-btn" type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/70 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"><X size={18}/></button></div>
        </div>
        <div className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {([['dashboard',LayoutDashboard,'Dashboard'],['listings',Package,"E'lonlar"],['users',Users,'Foydalanuvchilar'],['reports',AlertTriangle,'Shikoyatlar'],['settings',Settings,'Sozlamalar'],['telegram',Send,'Telegram']] as const).map(([id,Icon,label])=><button key={id} type="button" onClick={()=>setActiveTab(id)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap ${activeTab===id?'bg-indigo-600 text-white':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Icon size={16}/>{label}{id==='reports'&&pendingReportsCount>0&&<span className="rounded-full bg-rose-500 text-white px-1.5 text-[10px]">{pendingReportsCount}</span>}</button>)}
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab==='dashboard'&&<div className="space-y-6"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[['Jami',metrics.total],['Faol',metrics.active],['Kutilmoqda',metrics.pending],['Sotilgan',metrics.sold],['VIP',metrics.vip],['TOP',metrics.top],['Ko‘rishlar',metrics.totalViews],['Qiymat',formatPrice(metrics.totalValueUzs,currency)]].map(([label,value])=><div key={String(label)} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4"><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-black mt-1 text-slate-900 dark:text-white">{value}</div></div>)}</div><div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5"><h3 className="font-black mb-4">Kategoriyalar</h3><div className="space-y-2">{categoryStats.slice(0,10).map(c=><div key={c.id} className="flex items-center gap-3"><span className="w-32 truncate text-sm">{c.name}</span><div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"><div className="h-full bg-indigo-600" style={{width:`${c.percentage}%`}}/></div><span className="text-xs font-bold w-8 text-right">{c.count}</span></div>)}</div></div></div>}
          {activeTab==='listings'&&<div className="space-y-4"><div className="flex flex-wrap gap-2"><div className="relative flex-1 min-w-[220px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={listingSearchQuery} onChange={e=>setListingSearchQuery(e.target.value)} placeholder="E'lon, sotuvchi yoki ID..." className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2.5 text-sm"/></div><select value={listingStatusFilter} onChange={e=>setListingStatusFilter(e.target.value as any)} className="rounded-xl border p-2.5 text-sm bg-white dark:bg-slate-800"><option value="all">Barcha status</option><option value="active">Faol</option><option value="pending">Kutilmoqda</option><option value="sold">Sotilgan</option><option value="rejected">Rad etilgan</option></select><select value={listingPromoFilter} onChange={e=>setListingPromoFilter(e.target.value as any)} className="rounded-xl border p-2.5 text-sm bg-white dark:bg-slate-800"><option value="all">Barcha promo</option><option value="vip">VIP</option><option value="top">TOP</option></select></div><div className="space-y-2">{filteredListings.map(l=><div key={l.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-wrap items-center gap-3"><div className="flex-1 min-w-[220px]"><div className="font-bold text-sm">{l.title}</div><div className="text-xs text-slate-500">{l.seller.name} · {l.seller.phone} · {l.status}</div></div><div className="flex gap-1.5"><button onClick={()=>onSelectListing(l)} className="p-2 rounded-lg hover:bg-slate-100" title="Ko‘rish"><Eye size={16}/></button>{l.status==='pending'&&<><button onClick={()=>handleApproveListing(l)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Tasdiqlash"><CheckCircle2 size={16}/></button><button onClick={()=>setRejectingListingId(l.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50" title="Rad etish"><XCircle size={16}/></button></>}<button onClick={()=>handleToggleVip(l)} className={`p-2 rounded-lg ${l.isVip?'bg-amber-100 text-amber-700':'hover:bg-slate-100'}`} title="VIP"><Crown size={16}/></button><button onClick={()=>handleToggleTop(l)} className={`p-2 rounded-lg ${l.isTop?'bg-orange-100 text-orange-700':'hover:bg-slate-100'}`} title="TOP"><Flame size={16}/></button><button onClick={()=>onDeleteListing(l.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50" title="O‘chirish"><Trash2 size={16}/></button></div></div>)}{!filteredListings.length&&<div className="text-center py-12 text-slate-500">E'lonlar topilmadi.</div>}</div>{rejectingListingId&&<div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md"><h3 className="font-black mb-3">E'lonni rad etish</h3><textarea value={rejectReasonText} onChange={e=>setRejectReasonText(e.target.value)} placeholder="Sabab..." className="w-full min-h-24 rounded-xl border p-3"/><div className="flex justify-end gap-2 mt-3"><button onClick={()=>setRejectingListingId(null)} className="px-4 py-2 rounded-xl border">Bekor qilish</button><button onClick={()=>{const l=listings.find(x=>x.id===rejectingListingId);if(l)handleConfirmRejectListing(l)}} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">Rad etish</button></div></div></div>}</div>}
          {activeTab==='users'&&<div className="space-y-4"><div className="flex gap-2"><input value={userSearchQuery} onChange={e=>setUserSearchQuery(e.target.value)} placeholder="Ism yoki telefon..." className="flex-1 rounded-xl border p-3 text-sm"/><select value={userFilterType} onChange={e=>setUserFilterType(e.target.value as any)} className="rounded-xl border p-3 text-sm"><option value="all">Barchasi</option><option value="verified">Tasdiqlangan</option><option value="blocked">Bloklangan</option></select></div>{filteredSellers.map(s=><div key={s.id} className="rounded-2xl border p-4 flex items-center gap-3"><div className="flex-1"><div className="font-bold">{s.name}</div><div className="text-xs text-slate-500">{s.phone} · {s.listingsCount} e'lon</div></div><button onClick={()=>onToggleVerifySeller(s.id)} className="p-2 rounded-xl border">{s.isVerified?<UserCheck size={17}/>:<CheckSquare size={17}/>}</button><button onClick={()=>onToggleBlockSeller(s.id)} className="p-2 rounded-xl border text-rose-600"><Ban size={17}/></button></div>)}</div>}
          {activeTab==='reports'&&<div className="space-y-3">{reports.map(r=><div key={r.id} className="rounded-2xl border p-4"><div className="font-bold">{r.listingTitle}</div><div className="text-xs text-slate-500 mt-1">{r.reason} · {r.status}</div>{r.status==='pending'&&<div className="flex gap-2 mt-3"><button onClick={()=>onUpdateReportStatus(r.id,'resolved')} className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Hal qilish</button><button onClick={()=>onUpdateReportStatus(r.id,'dismissed')} className="px-3 py-2 rounded-xl border text-xs font-bold">Rad etish</button></div>}</div>)}{!reports.length&&<div className="text-center py-12 text-slate-500">Shikoyatlar yo‘q.</div>}</div>}
          {activeTab==='settings'&&<form onSubmit={handleSaveSettings} className="space-y-4"><div className="rounded-2xl border p-5"><h3 className="font-black mb-4">Platforma sozlamalari</h3><div className="space-y-4"><label className="flex items-center justify-between"><span className="font-bold text-sm">Avtomatik tasdiqlash</span><input type="checkbox" checked={settingsForm.autoApproveListings} onChange={e=>setSettingsForm({...settingsForm,autoApproveListings:e.target.checked})}/></label><label className="flex items-center justify-between"><span className="font-bold text-sm">Texnik xizmat rejimi</span><input type="checkbox" checked={settingsForm.maintenanceMode} onChange={e=>setSettingsForm({...settingsForm,maintenanceMode:e.target.checked})}/></label><label className="block"><span className="font-bold text-sm">VIP kunlik narxi</span><input type="number" value={settingsForm.vipPricePerDay} onChange={e=>setSettingsForm({...settingsForm,vipPricePerDay:Number(e.target.value)||0})} className="mt-1 w-full rounded-xl border p-2"/></label></div><button type="submit" className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"><Save size={15} className="inline mr-1"/>Saqlash</button></div></form>}
          {activeTab==='telegram'&&<div className="space-y-4"><div className="rounded-2xl border p-5"><h3 className="font-black mb-4">Telegram Bot & Kanal</h3><input value={settingsForm.telegramBotToken||''} onChange={e=>setSettingsForm({...settingsForm,telegramBotToken:e.target.value})} type={isTokenVisible?'text':'password'} placeholder="Bot token" className="w-full rounded-xl border p-3 mb-2"/><button type="button" onClick={()=>setIsTokenVisible(!isTokenVisible)} className="text-xs mb-3">{isTokenVisible?'Yashirish':'Ko‘rsatish'}</button><input value={settingsForm.telegramChannelId||''} onChange={e=>setSettingsForm({...settingsForm,telegramChannelId:e.target.value})} placeholder="@oldisotti_uz" className="w-full rounded-xl border p-3 mb-3"/><div className="flex gap-2"><button type="button" disabled={telegramTesting} onClick={handleTestTelegramConnection} className="px-4 py-2 rounded-xl border font-bold">{telegramTesting?'Tekshirilmoqda…':'Ulanishni tekshirish'}</button><button type="button" disabled={isPostingToChannel} onClick={handlePostSelectedListingToTelegram} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">{isPostingToChannel?'Yuborilmoqda…':'E’lonni yuborish'}</button></div>{telegramTestResult&&<div className="mt-3 text-sm">{telegramTestResult.success?'✅ Ulandi':'❌ '+telegramTestResult.error}</div>}{telegramPostResult&&<div className="mt-3 text-sm">{telegramPostResult.success?'✅ Yuborildi':'❌ '+telegramPostResult.error}</div>}</div></div>}
        </div>
      </div>
    </div>
  );
};
