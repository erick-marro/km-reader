
interface ReaderHeaderProps {
  title: string;
  brandLabel: string;
  currentPage: number;
  numPages: number;
  isTwoPageSpread: boolean;
  onOpenToc: () => void;
  hasToc: boolean;
}

export function ReaderHeader({
  title,
  brandLabel,
  currentPage,
  numPages,
  isTwoPageSpread,
  onOpenToc,
  hasToc,
}: ReaderHeaderProps) {
  const percentage = numPages > 0 ? Math.round((currentPage / numPages) * 100) : 0;

  const pageRangeText = isTwoPageSpread && currentPage < numPages
    ? `${currentPage}-${currentPage + 1} de ${numPages}`
    : `${currentPage} de ${numPages}`;

  return (
    <header className="reader-header">
      <div className="header-left">
        <div className="header-btn brand-btn" title={brandLabel}>
          <svg className="icon-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span className="app-name">{brandLabel}</span>
        </div>

        {hasToc && (
          <button
            type="button"
            className="header-btn toc-trigger-btn"
            onClick={onOpenToc}
            title="Abrir Tabla de Contenidos"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span className="btn-label">Índice</span>
          </button>
        )}
      </div>

      <div className="header-center">
        <span className="book-title" title={title}>
          {title}
        </span>
      </div>

      <div className="header-right">
        <div className="progress-badge">
          <span className="page-text">{pageRangeText}</span>
          <span className="percent-text">{percentage}%</span>
        </div>
        <div
          className="progress-bar-thin"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </header>
  );
}
