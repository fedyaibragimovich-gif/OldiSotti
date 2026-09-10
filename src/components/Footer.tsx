import React, { useState } from 'react';
import { ShieldCheck, ArrowLeftRight, HelpCircle, Megaphone, Send } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../data/translations';
import { InfoTabKey } from '../data/infoPagesData';
import { HelpFaqModal } from './HelpFaqModal';

interface FooterProps {
  lang: Language;
  onSelectCategorySlug?: (slug: string) => void;
  onOpenInfoModal?: (tab: InfoTabKey) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenInfoModal, onOpenAdmin }) => {
  const t = getTranslation(lang);
  const [isHelpFaqOpen, setIsHelpFaqOpen] = useState(false);

  return (
    <>
      <footer className="mt-6 sm:mt-8 bg-slate-900 text-slate-300 border-t border-slate-800 w-full max-w-full overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">Xavfsiz oldi-sotdi</p>
                <p className="text-[10px] text-slate-500 truncate">CVV/SMS kodlarini hech kimga bermang.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <button id="footer-help-btn" type="button" onClick={() => setIsHelpFaqOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
                <HelpCircle size={13} />
                <span>Yordam / FAQ</span>
              </button>
              <button id="footer-promote-listing-btn" type="button" onClick={() => onOpenInfoModal?.('vip')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 border border-indigo-400/20 px-2.5 py-1.5 text-[10px] font-semibold text-indigo-200 hover:bg-indigo-500/25 hover:text-white transition-colors cursor-pointer">
                <Megaphone size={13} />
                <span>E'lonni targ'ib qilish</span>
              </button>
              <a id="footer-telegram-btn" href="https://t.me/OSotBot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 hover:bg-white/10 hover:text-sky-300 transition-colors">
                <Send size={12} />
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                <ArrowLeftRight size={13} strokeWidth={2.5} />
              </div>
              <span className="font-black text-sm tracking-tight text-white">oldi<span className="text-indigo-400">sotti</span><span className="ml-1 text-[8px] text-indigo-300">UZ</span></span>
            </div>

            <div className="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
              <button id="footer-rules-btn" type="button" onClick={() => onOpenInfoModal?.('rules')} className="hover:text-slate-200 transition-colors cursor-pointer">Qoidalar</button>
              <button id="footer-safety-btn" type="button" onClick={() => onOpenInfoModal?.('rules')} className="hover:text-slate-200 transition-colors cursor-pointer">Xavfsizlik</button>
              <button id="footer-terms-btn" type="button" onClick={() => onOpenInfoModal?.('terms')} className="hover:text-slate-200 transition-colors cursor-pointer">Shartlar</button>
              <button id="footer-privacy-btn" type="button" onClick={() => onOpenInfoModal?.('privacy')} className="hover:text-slate-200 transition-colors cursor-pointer">Maxfiylik</button>
              <a id="footer-channel-btn" href="https://t.me/OSot_uz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-sky-300 transition-colors">Kanal</a>
              {onOpenAdmin && <button id="footer-admin-btn" type="button" onClick={onOpenAdmin} className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-bold"><ShieldCheck size={11} />Admin</button>}
            </div>

            <span className="text-[9px] text-slate-600 whitespace-nowrap">{t.copyright}</span>
          </div>
        </div>
      </footer>

      <HelpFaqModal
        isOpen={isHelpFaqOpen}
        lang={lang}
        onClose={() => setIsHelpFaqOpen(false)}
      />
    </>
  );
};