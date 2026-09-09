import { useState, useEffect } from 'react';

/**
 * Custom hook to detect when mobile virtual keyboard is open
 * using window.visualViewport and focus/blur listeners.
 * Prevents fixed elements (like bottom navigation) from being pushed up by the keyboard.
 */
export function useVirtualKeyboard(): boolean {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let initialHeight = window.innerHeight;

    const checkViewport = () => {
      if (window.visualViewport) {
        // If the visual viewport height is significantly less than window.innerHeight,
        // the virtual keyboard is open.
        const currentHeight = window.visualViewport.height;
        const diff = initialHeight - currentHeight;
        
        // Threshold of 120px handles most virtual keyboard appearances
        if (diff > 120) {
          setIsKeyboardOpen(true);
        } else if (diff <= 60) {
          setIsKeyboardOpen(false);
        }
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName.toUpperCase();
      const isInput = tagName === 'INPUT';
      const isTextarea = tagName === 'TEXTAREA';
      const isContentEditable = target.isContentEditable;

      if (isInput) {
        const type = (target as HTMLInputElement).type.toLowerCase();
        // Ignore non-textual input types that don't invoke on-screen keyboards
        if (['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)) {
          return;
        }
        setIsKeyboardOpen(true);
      } else if (isTextarea || isContentEditable) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      // Small timeout to check if focus moved to another input
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active) {
          setIsKeyboardOpen(false);
          return;
        }
        const tagName = active.tagName.toUpperCase();
        const isInput = tagName === 'INPUT';
        const isTextarea = tagName === 'TEXTAREA';
        const isContentEditable = active.isContentEditable;

        if (isInput) {
          const type = (active as HTMLInputElement).type.toLowerCase();
          if (['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file'].includes(type)) {
            setIsKeyboardOpen(false);
            return;
          }
        } else if (!isTextarea && !isContentEditable) {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    const handleOrientationOrResize = () => {
      // When screen orientation changes or window resizes, update baseline
      initialHeight = window.innerHeight;
      checkViewport();
    };

    // Attach visualViewport listeners if supported
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkViewport);
      window.visualViewport.addEventListener('scroll', checkViewport);
    }

    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkViewport);
        window.visualViewport.removeEventListener('scroll', checkViewport);
      }
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return isKeyboardOpen;
}
