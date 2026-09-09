import React from 'react';
import { ShieldCheck, Smartphone, ArrowLeftRight, Truck, ArrowRight, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { InfoTabKey } from '../data/infoPagesData';

interface FooterProps {
  lang: Language;
  onSelectCategorySlug?: (slug: string) => void;
  onOpenInfoModal?: (tab: InfoTabKey) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onOpenInfoModal,
  onOpenAdmin
}) => {
  const t = getTranslation(lang);

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800 w-full max-w-full overflow-hidden">
      {/* Safety Reassurance Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {t.safetyRules}: Firibgarlardan ehtiyot bo'ling!
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Hech qachon bank kartangizning CVV/CVC kodini yoki SMS orqali kelgan tasdiqlash kodini begona shaxslarga bermang. Tovarni shaxsan ko'rib, tekshirib olgandan so'ng to'lang.
              </p>
            </div>
          </div>

          <button
            id="footer-safety-learn-more-btn"
            type="button"
            onClick={() => onOpenInfoModal?.('help')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <span>Xavfsizlik yo'riqnomasi</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Apps */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                <ArrowLeftRight size={18} strokeWidth={2.5} />
              </div>
              <div className="flex items-center">
                <span className="font-black text-2xl tracking-tight text-white">
                  oldi<span className="text-indigo-400">sotti</span>
                </span>
                <span className="ml-1.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                  uz
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              O'zbekistonning zamonaviy va qulay e'lonlar maydoni. Avtomobillar, ko'chmas mulk, elektronika va ishonchli xizmatlar.
            </p>

            {/* Mobile app badges */}
            <div className="mt-4 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                {t.mobileApp}
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer w-max">
                  <Smartphone size={16} className="text-indigo-400" />
                  <span>Google Play dan yuklab oling</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer w-max">
                  <Smartphone size={16} className="text-indigo-400" />
                  <span>App Store dan yuklab oling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              {t.popularCategories}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Avtomobillar (Cobalt, Gentra, Tracker)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Kvartiralar ijarasi (Arenda Toshkent)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Smartfonlar (iPhone, Samsung)</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Novostroykalar va hovlilar</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">IT va dasturlash bo'sh ish o'rinlari</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Mebel va maishiy texnika</span></li>
            </ul>
          </div>

          {/* Col 3: Regions of Uzbekistan */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Hududlar
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><span className="hover:text-white transition-colors cursor-pointer">Toshkent shahri va viloyati</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Samarqand viloyati</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Buxoro viloyati</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Andijon, Farg'ona, Namangan</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Xorazm va Navoiy viloyatlari</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Qoraqalpog'iston Respublikasi</span></li>
            </ul>
          </div>

          {/* Col 4: Help & Info */}
          <div>
            <button
              id="footer-title-help-center-btn"
              type="button"
              onClick={() => onOpenInfoModal?.('help')}
              className="text-xs font-bold text-white uppercase tracking-wider mb-4 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.helpCenter}</span>
              <ArrowRight size={12} />
            </button>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  id="footer-link-rules-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('rules')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  E'lon joylashtirish qoidalari
                </button>
              </li>
              <li>
                <button
                  id="footer-link-vip-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('vip')}
                  className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <span>Pullik xizmatlar va VIP tariflar</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">VIP</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-delivery-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('delivery')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sotuvchidan yetkazish shartlari
                </button>
              </li>
              <li>
                <button
                  id="footer-link-terms-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Foydalanish shartlari
                </button>
              </li>
              <li>
                <button
                  id="footer-link-privacy-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('privacy')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Maxfiylik siyosati
                </button>
              </li>
              <li>
                <button
                  id="footer-link-support-btn"
                  type="button"
                  onClick={() => onOpenInfoModal?.('help')}
                  className="hover:text-indigo-400 transition-colors cursor-pointer text-left text-slate-400"
                >
                  Texnik qo'llab-quvvatlash: @oldisotti_support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <span>{t.copyright}</span>
          <div className="flex items-center space-x-4">
            <button
              id="footer-bottom-privacy-btn"
              type="button"
              onClick={() => onOpenInfoModal?.('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Maxfiylik
            </button>
            <button
              id="footer-bottom-safety-btn"
              type="button"
              onClick={() => onOpenInfoModal?.('rules')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Xavfsizlik
            </button>
            <button
              id="footer-bottom-vip-btn"
              type="button"
              onClick={() => onOpenInfoModal?.('vip')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              VIP Tariflar
            </button>
            {onOpenAdmin && (
              <button
                id="footer-bottom-admin-btn"
                type="button"
                onClick={onOpenAdmin}
                className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              >
                <ShieldCheck size={14} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
