import type { TocItem } from '../hooks/usePdfDocument';

interface TableOfContentsProps {
  isOpen: boolean;
  onClose: () => void;
  outline: TocItem[];
  currentPage: number;
  onSelectPage: (page: number) => void;
}

export function TableOfContents({
  isOpen,
  onClose,
  outline,
  currentPage,
  onSelectPage,
}: TableOfContentsProps) {
  if (!isOpen) return null;

  const handleItemClick = (item: TocItem) => {
    if (item.pageNumber) {
      onSelectPage(item.pageNumber);
      onClose();
    }
  };

  const renderOutlineItems = (items: TocItem[], depth = 0) => {
    return (
      <ul className={`toc-list depth-${depth}`}>
        {items.map((item, index) => {
          const isActive = item.pageNumber === currentPage;
          const hasChildren = item.items && item.items.length > 0;

          return (
            <li key={`${item.title}-${index}`} className="toc-item">
              <button
                type="button"
                className={`toc-button ${isActive ? 'active' : ''} ${
                  !item.pageNumber ? 'no-page' : ''
                }`}
                onClick={() => handleItemClick(item)}
                style={{ paddingLeft: `${16 + depth * 14}px` }}
              >
                <span className="toc-title">{item.title}</span>
                {item.pageNumber && (
                  <span className="toc-page-badge">{item.pageNumber}</span>
                )}
              </button>
              {hasChildren && renderOutlineItems(item.items!, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <div className="toc-backdrop" onClick={onClose} />
      <aside className="toc-drawer">
        <div className="toc-header">
          <div className="toc-header-title">
            <svg
              className="toc-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <h3>Tabla de Contenidos</h3>
          </div>
          <button type="button" className="toc-close-btn" onClick={onClose} title="Cerrar índice">
            ✕
          </button>
        </div>

        <div className="toc-content">
          {outline.length === 0 ? (
            <div className="toc-empty">
              <p>Este PDF no contiene una tabla de contenidos formal en sus marcadores.</p>
              <small>Puedes usar la barra de navegación para saltar de página libremente.</small>
            </div>
          ) : (
            renderOutlineItems(outline)
          )}
        </div>
      </aside>
    </>
  );
}
