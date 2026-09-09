import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useVirtualKeyboard } from '../hooks/useVirtualKeyboard';

interface ScrollToTopProps {
  threshold?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ threshold = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isKeyboardOpen = useVirtualKeyboard();

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsVisible(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible || isKeyboardOpen) return null;

  return (
    <button
      id="scroll-to-top-btn"
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-indigo-600/95 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-bold animate-in fade-in zoom-in-90"
      aria-label="Sahifa yuqorisiga qaytish (Scroll to top)"
      title="Yuqoriga qaytish"
    >
      <ArrowUp size={16} className="animate-bounce" />
      <span className="hidden xs:inline">Yuqoriga</span>
    </button>
  );
};
