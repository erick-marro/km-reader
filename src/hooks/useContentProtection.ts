import { useEffect, useState } from 'react';

export function useContentProtection() {
  const [isProtectedView, setIsProtectedView] = useState(false);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent key shortcuts (PrintScreen, Ctrl+P, Ctrl+S, DevTools shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setIsProtectedView(true);
        // Clear clipboard if possible
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
        setTimeout(() => setIsProtectedView(false), 2000);
      }

      // Ctrl/Cmd + P (Print) or S (Save) or U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'u')) {
        e.preventDefault();
      }

      // F12 or DevTools shortcuts
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
        e.preventDefault();
      }
    };

    // Prevent dragstart
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Hide content temporarily when window loses focus (e.g. Snipping Tool or screenshot app)
    const handleBlur = () => {
      setIsProtectedView(true);
    };

    const handleFocus = () => {
      setIsProtectedView(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return { isProtectedView };
}
