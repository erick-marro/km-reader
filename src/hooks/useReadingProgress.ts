import { useState, useEffect, useCallback } from 'react';

export interface BookProgress {
  fileName: string;
  fileSize: number;
  lastPage: number;
  totalPages: number;
  lastReadTimestamp: number;
  title?: string;
}

const STORAGE_PREFIX = 'empower_time_progress_';

export function getProgressKey(source: File | string): string {
  if (typeof source === 'string') {
    return 'empower_time_assets_book';
  }
  return `${source.name}_${source.size}`;
}

export function useReadingProgress(source: File | string | null, totalPages: number = 0) {
  const [savedPage, setSavedPage] = useState<number | null>(null);

  const fileKey = source ? getProgressKey(source) : null;

  // Load progress when source changes
  useEffect(() => {
    if (!fileKey) {
      setSavedPage(null);
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + fileKey);
      if (raw) {
        const parsed: BookProgress = JSON.parse(raw);
        if (parsed.lastPage && parsed.lastPage > 0) {
          setSavedPage(parsed.lastPage);
        }
      } else {
        setSavedPage(1);
      }
    } catch {
      setSavedPage(1);
    }
  }, [fileKey]);

  // Function to save current page
  const saveProgress = useCallback(
    (page: number, numPages?: number, customTitle?: string) => {
      if (!source || !fileKey) return;

      const total = numPages || totalPages;
      const fileName = typeof source === 'string' ? 'Empower Time: El empresario del Reino' : source.name;
      const fileSize = typeof source === 'string' ? 591813 : source.size;

      const progressData: BookProgress = {
        fileName,
        fileSize,
        lastPage: page,
        totalPages: total,
        lastReadTimestamp: Date.now(),
        title: customTitle || 'Empower Time',
      };

      try {
        localStorage.setItem(STORAGE_PREFIX + fileKey, JSON.stringify(progressData));
      } catch (e) {
        console.warn('Failed to save reading progress to localStorage', e);
      }
    },
    [source, fileKey, totalPages]
  );

  return { savedPage, saveProgress };
}

export function getRecentBooks(): BookProgress[] {
  try {
    const raw = localStorage.getItem('empower_time_recent_books');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
