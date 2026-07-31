import { useState, useEffect } from 'react';

interface ReaderToolbarProps {
  currentPage: number;
  numPages: number;
  isTwoPageSpread: boolean;
  scale: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ReaderToolbar({
  currentPage,
  numPages,
  isTwoPageSpread,
  scale,
  onPrev,
  onNext,
  onPageSelect,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: ReaderToolbarProps) {
  const [inputVal, setInputVal] = useState<string>(currentPage.toString());

  useEffect(() => {
    setInputVal(currentPage.toString());
  }, [currentPage]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(inputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      onPageSelect(p);
    } else {
      setInputVal(currentPage.toString());
    }
  };

  const isPrevDisabled = currentPage <= 1;
  const step = isTwoPageSpread ? 2 : 1;
  const isNextDisabled = currentPage + step > numPages && currentPage >= numPages;

  return (
    <div className="reader-toolbar-container">
      <div className="reader-toolbar glass-panel">
        {/* Navigation Section */}
        <div className="toolbar-group nav-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={onPrev}
            disabled={isPrevDisabled}
            title="Página anterior (Flecha Izquierda)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <form onSubmit={handleInputSubmit} className="page-input-form">
            <input
              type="text"
              className="page-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={handleInputSubmit}
              aria-label="Ir a la página"
            />
            <span className="page-total">/ {numPages}</span>
          </form>

          <button
            type="button"
            className="toolbar-btn"
            onClick={onNext}
            disabled={isNextDisabled}
            title="Página siguiente (Flecha Derecha)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Spread Mode Badge */}
        <div className="toolbar-group spread-badge-group">
          <span className="layout-badge">
            {isTwoPageSpread ? '📖 2 Páginas' : '📄 1 Página'}
          </span>
        </div>

        <div className="toolbar-divider" />

        {/* Zoom Section */}
        <div className="toolbar-group zoom-group">
          <button
            type="button"
            className="toolbar-btn"
            onClick={onZoomOut}
            disabled={scale <= 0.5}
            title="Reducir zoom"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <button
            type="button"
            className="scale-btn"
            onClick={onResetZoom}
            title="Restablecer zoom al 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            className="toolbar-btn"
            onClick={onZoomIn}
            disabled={scale >= 3.0}
            title="Aumentar zoom"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
