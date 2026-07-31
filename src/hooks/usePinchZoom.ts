import { useState, useRef, useCallback } from 'react';

interface PinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function usePinchZoom({
  minScale = 0.5,
  maxScale = 3.0,
  onSwipeLeft,
  onSwipeRight,
}: PinchZoomOptions = {}) {
  const [scale, setScale] = useState<number>(1.0);
  const touchStartRef = useRef<{
    dist: number;
    scale: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch zoom start
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchStartRef.current = {
          dist,
          scale,
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
          time: Date.now(),
        };
      } else if (e.touches.length === 1) {
        // Swipe start
        const t = e.touches[0];
        touchStartRef.current = {
          dist: 0,
          scale,
          x: t.clientX,
          y: t.clientY,
          time: Date.now(),
        };
      }
    },
    [scale]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      if (e.touches.length === 2) {
        // Pinching
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const initial = touchStartRef.current;

        if (initial.dist > 0) {
          const factor = currentDist / initial.dist;
          const newScale = Math.min(maxScale, Math.max(minScale, initial.scale * factor));
          setScale(newScale);
        }
      }
    },
    [maxScale, minScale]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;

      const initial = touchStartRef.current;
      const duration = Date.now() - initial.time;

      // Handle single finger swipe if not zoomed in and swipe gesture was quick/distinct
      if (initial.dist === 0 && e.changedTouches.length === 1 && scale === 1.0) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - initial.x;
        const deltaY = touch.clientY - initial.y;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaY) < 60 && duration < 500) {
          if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          } else if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          }
        }
      }

      touchStartRef.current = null;
    },
    [scale, onSwipeLeft, onSwipeRight]
  );

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(maxScale, +(prev + 0.25).toFixed(2)));
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(minScale, +(prev - 0.25).toFixed(2)));
  }, [minScale]);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  return {
    scale,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
