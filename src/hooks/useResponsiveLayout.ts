import { useState, useEffect } from 'react';

export interface LayoutInfo {
  isTwoPageSpread: boolean;
  windowWidth: number;
  windowHeight: number;
  isMobile: boolean;
}

export function useResponsiveLayout(): LayoutInfo {
  const [layout, setLayout] = useState<LayoutInfo>(() => ({
    isTwoPageSpread: window.innerWidth >= 768,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    isMobile: window.innerWidth < 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setLayout({
        isTwoPageSpread: width >= 768,
        windowWidth: width,
        windowHeight: height,
        isMobile: width < 768,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return layout;
}
