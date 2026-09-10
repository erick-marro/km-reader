import { useState, useEffect, useCallback, useRef } from 'react';
import { usePdfDocument } from '../hooks/usePdfDocument';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { usePinchZoom } from '../hooks/usePinchZoom';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { useContentProtection } from '../hooks/useContentProtection';
import { PageCanvas } from './PageCanvas';
import { ReaderHeader } from './ReaderHeader';
import { ReaderToolbar } from './ReaderToolbar';
import { TableOfContents } from './TableOfContents';

interface PdfReaderProps {
  source: File | string;
  /** Slug del libro: aísla el progreso de lectura por libro */
  bookSlug?: string;
  /** Título completo del libro */
  bookTitle?: string;
  /** Etiqueta corta mostrada como marca en la cabecera */
  brandLabel?: string;
}

export function PdfReader({ source, bookSlug, bookTitle, brandLabel }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { pdfDoc, numPages, outline, title, loading, error } = usePdfDocument(source, bookTitle);
  const { isTwoPageSpread } = useResponsiveLayout();
  const { savedPage, saveProgress } = useReadingProgress(source, numPages, bookSlug);
  const { isProtectedView } = useContentProtection();

  const displayTitle = title || bookTitle || 'este libro';

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isTocOpen, setIsTocOpen] = useState<boolean>(false);
  const [containerDim, setContainerDim] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Track page restoration on load
  const hasRestoredPageRef = useRef<boolean>(false);

  // Restore saved page when doc & savedPage are ready
  useEffect(() => {
    if (pdfDoc && savedPage && !hasRestoredPageRef.current) {
      if (savedPage >= 1 && savedPage <= pdfDoc.numPages) {
        setCurrentPage(savedPage);
      }
      hasRestoredPageRef.current = true;
    }
  }, [pdfDoc, savedPage]);

  // Save progress whenever currentPage changes
  useEffect(() => {
    if (pdfDoc && currentPage > 0) {
      saveProgress(currentPage, numPages, title);
    }
  }, [pdfDoc, currentPage, numPages, title, saveProgress]);

  // Update container dimensions
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerDim({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const step = isTwoPageSpread ? 2 : 1;
    setCurrentPage((prev) => {
      const next = prev - step;
      return next < 1 ? 1 : next;
    });
  }, [isTwoPageSpread]);

  const handleNext = useCallback(() => {
    if (!numPages) return;
    const step = isTwoPageSpread ? 2 : 1;
    setCurrentPage((prev) => {
      const next = prev + step;
      return next > numPages ? prev : next;
    });
  }, [isTwoPageSpread, numPages]);

  const handlePageSelect = useCallback((page: number) => {
    if (page >= 1 && page <= numPages) {
      // In 2-page spread mode, align to odd page if possible for natural book feel
      const targetPage = isTwoPageSpread && page > 1 && page % 2 === 0 ? page - 1 : page;
      setCurrentPage(targetPage);
    }
  }, [numPages, isTwoPageSpread]);

  // Pinch zoom & touch gestures
  const { scale, zoomIn, zoomOut, resetZoom, touchHandlers } = usePinchZoom({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        zoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        resetZoom();
      } else if (e.key === 'Escape') {
        setIsTocOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, zoomIn, zoomOut, resetZoom]);

  if (loading) {
    return (
      <div className="reader-loading-screen">
        <div className="loading-content">
          <div className="book-loader">
            <div className="page page-left"></div>
            <div className="page page-right"></div>
          </div>
          <h2>Abriendo {displayTitle}...</h2>
          <p>Preparando tu libro PDF con la mejor calidad visual</p>
        </div>
      </div>
    );
  }

  if (error || !pdfDoc) {
    return (
      <div className="reader-error-screen">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2>Error al cargar el libro</h2>
          <p>{error || 'No se pudo procesar el documento PDF.'}</p>
          <button type="button" className="browse-btn" onClick={() => window.location.reload()}>
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  // Calculate pages to display in spread vs single mode
  const secondPageNumber = isTwoPageSpread ? currentPage + 1 : null;
  const showSecondPage = secondPageNumber !== null && secondPageNumber <= numPages;

  return (
    <div className={`pdf-reader-root ${isProtectedView ? 'protected-blurred' : ''}`}>
      {isProtectedView && (
        <div className="security-protection-overlay">
          <div className="security-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Contenido Protegido — {displayTitle}</span>
          </div>
        </div>
      )}
      <ReaderHeader
        title={displayTitle}
        brandLabel={brandLabel || displayTitle}
        currentPage={currentPage}
        numPages={numPages}
        isTwoPageSpread={isTwoPageSpread}
        onOpenToc={() => setIsTocOpen(true)}
        hasToc={outline.length > 0}
      />

      <main
        ref={containerRef}
        className="reader-stage"
        {...touchHandlers}
      >
        <div className={`book-spread ${isTwoPageSpread ? 'two-pages' : 'one-page'}`}>
          {/* Page 1 */}
          <PageCanvas
            pdfDoc={pdfDoc}
            pageNumber={currentPage}
            scale={scale}
            containerWidth={containerDim.width}
            containerHeight={containerDim.height}
            isSpread={isTwoPageSpread}
          />

          {/* Page 2 (if 2-page spread active) */}
          {showSecondPage && (
            <PageCanvas
              pdfDoc={pdfDoc}
              pageNumber={secondPageNumber}
              scale={scale}
              containerWidth={containerDim.width}
              containerHeight={containerDim.height}
              isSpread={isTwoPageSpread}
            />
          )}
        </div>
      </main>

      <ReaderToolbar
        currentPage={currentPage}
        numPages={numPages}
        isTwoPageSpread={isTwoPageSpread}
        scale={scale}
        onPrev={handlePrev}
        onNext={handleNext}
        onPageSelect={handlePageSelect}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />

      <TableOfContents
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        outline={outline}
        currentPage={currentPage}
        onSelectPage={handlePageSelect}
      />
    </div>
  );
}
