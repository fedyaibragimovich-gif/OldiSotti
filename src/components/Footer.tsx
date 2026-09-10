import React from 'react';
import { ShieldCheck, Smartphone, ArrowLeftRight, ArrowRight, Send } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { InfoTabKey } from '../data/infoPagesData';

interface FooterProps {
  lang: Language;
  onSelectCategorySlug?: (slug: string) => void;
  onOpenInfoModal?: (tab: InfoTabKey) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenInfoModal, onOpenAdmin }) => {
  const t = getTranslation(lang);

  return (
    <footer className="mt-10 sm:mt-12 bg-slate-900 text-slate-300 border-t border-slate-800 w-full max-w-full overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-950/60 py-4 sm:py-5">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20"><ShieldCheck size={22} /></div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.safetyRules}: Firibgarlardan ehtiyot bo'ling!</h4>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-2xl leading-relaxed">Hech qachon bank kartangizning CVV/CVC kodini yoki SMS orqali kelgan tasdiqlash kodini begona shaxslarga bermang. Tovarni shaxsan ko'rib, tekshirib olgandan so'ng to'lang.</p>
            </div>
          </div>
          <button id="footer-safety-learn-more-btn" type="button" onClick={() => onOpenInfoModal?.('help')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all shrink-0 cursor-pointer"><span>Xavfsizlik yo'riqnomasi</span><ArrowRight size={13} /></button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-7">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30"><ArrowLeftRight size={16} strokeWidth={2.5} /></div>
              <div className="flex items-center"><span className="font-black text-xl tracking-tight text-white">oldi<span className="text-indigo-400">sotti</span></span><span className="ml-1 rounded-md bg-indigo-500/20 border border-indigo-400/30 px-1 py-0.5 text-[9px] font-bold text-indigo-300 uppercase">uz</span></div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">O'zbekistonning zamonaviy va qulay e'lonlar maydoni. Avtomobillar, ko'chmas mulk, elektronika va ishonchli xizmatlar.</p>
            <div className="mt-3"><span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">{t.mobileApp}</span><div className="flex flex-wrap gap-1.5"><div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"><Smartphone size={14} className="text-indigo-400" /><span>Google Play</span></div><div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"><Smartphone size={14} className="text-indigo-400" /><span>App Store</span></div></div></div>
          </div>

          <div><h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2.5">{t.popularCategories}</h4><ul className="space-y-1.5 text-[11px] text-slate-400"><li><span className="hover:text-white transition-colors cursor-pointer">Avtomobillar (Cobalt, Gentra, Tracker)</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Kvartiralar ijarasi (Arenda Toshkent)</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Smartfonlar (iPhone, Samsung)</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Novostroykalar va hovlilar</span></li><li><span className="hover:text-white transition-colors cursor-pointer">IT va dasturlash bo'sh ish o'rinlari</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Mebel va maishiy texnika</span></li></ul></div>

          <div><h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2.5">Hududlar</h4><ul className="space-y-1.5 text-[11px] text-slate-400"><li><span className="hover:text-white transition-colors cursor-pointer">Toshkent shahri va viloyati</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Samarqand viloyati</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Buxoro viloyati</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Andijon, Farg'ona, Namangan</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Xorazm va Navoiy viloyatlari</span></li><li><span className="hover:text-white transition-colors cursor-pointer">Qoraqalpog'iston Respublikasi</span></li></ul></div>

          <div>
            <button id="footer-title-help-center-btn" type="button" onClick={() => onOpenInfoModal?.('help')} className="text-[11px] font-bold text-white uppercase tracking-wider mb-2.5 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"><span>{t.helpCenter}</span><ArrowRight size={11} /></button>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li><button id="footer-link-rules-btn" type="button" onClick={() => onOpenInfoModal?.('rules')} className="hover:text-white transition-colors cursor-pointer text-left">E'lon joylashtirish qoidalari</button></li>
              <li><button id="footer-link-vip-btn" type="button" onClick={() => onOpenInfoModal?.('vip')} className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"><span>Pullik xizmatlar va VIP tariflar</span><span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">VIP</span></button></li>
              <li><button id="footer-link-delivery-btn" type="button" onClick={() => onOpenInfoModal?.('delivery')} className="hover:text-white transition-colors cursor-pointer text-left">Sotuvchidan yetkazish shartlari</button></li>
              <li><button id="footer-link-terms-btn" type="button" onClick={() => onOpenInfoModal?.('terms')} className="hover:text-white transition-colors cursor-pointer text-left">Foydalanish shartlari</button></li>
              <li><button id="footer-link-privacy-btn" type="button" onClick={() => onOpenInfoModal?.('privacy')} className="hover:text-white transition-colors cursor-pointer text-left">Maxfiylik siyosati</button></li>
              <li><a id="footer-link-telegram-btn" href="https://t.me/OSotBot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-sky-300 transition-colors text-left text-slate-400"><Send size={12} /><span>Telegram yordam: @OSotBot</span></a></li>
              <li><a id="footer-link-channel-btn" href="https://t.me/OSot_uz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-sky-300 transition-colors text-left text-slate-400"><Send size={12} /><span>Telegram kanal: @OSot_uz</span></a></li>
            </ul>
          </div>
        </div>

        <div className="mt-7 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2"><span>{t.copyright}</span><div className="flex items-center flex-wrap justify-center gap-x-3 gap-y-1.5"><button id="footer-bottom-privacy-btn" type="button" onClick={() => onOpenInfoModal?.('privacy')} className="hover:text-slate-300 transition-colors cursor-pointer">Maxfiylik</button><button id="footer-bottom-safety-btn" type="button" onClick={() => onOpenInfoModal?.('rules')} className="hover:text-slate-300 transition-colors cursor-pointer">Xavfsizlik</button><button id="footer-bottom-vip-btn" type="button" onClick={() => onOpenInfoModal?.('vip')} className="hover:text-slate-300 transition-colors cursor-pointer">VIP Tariflar</button>{onOpenAdmin && <button id="footer-bottom-admin-btn" type="button" onClick={onOpenAdmin} className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"><ShieldCheck size={13} /><span>Admin</span></button>}</div></div>
      </div>
    </footer>
  );
};
