import React, { useState, useRef } from 'react';
import { getRecentBooks, type BookProgress } from '../hooks/useReadingProgress';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
}

export function DropZone({ onFileSelected }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recentBooks = getRecentBooks();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        onFileSelected(file);
      } else {
        alert('Por favor, selecciona un archivo PDF válido.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="dropzone-container">
      <div className="dropzone-background-decor">
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />
      </div>

      <header className="hero-header">
        <div className="brand-badge">
          <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>Ebook Experience</span>
        </div>
        <h1 className="hero-title">Empower Time</h1>
        <p className="hero-subtitle">
          Tu lector de libros PDF optimizado. Disfruta de lectura fluida página a página, 
          adaptada para móviles, tablets y computadoras.
        </p>
      </header>

      <div
        className={`dropzone-card ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          className="hidden-file-input"
        />

        <div className="dropzone-icon-wrapper">
          <svg className="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <polyline points="9 15 12 12 15 15"></polyline>
          </svg>
        </div>

        <div className="dropzone-text">
          <h3>Arrastra tu libro en PDF aquí</h3>
          <p>o haz clic para explorar tu dispositivo</p>
        </div>

        <button type="button" className="browse-btn">
          Seleccionar Archivo PDF
        </button>

        <div className="format-note">Formatos soportados: .pdf</div>
      </div>

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h4>Adaptativo</h4>
          <p>1 página en smartphones, 2 páginas doble spread estilo libro en tablets y desktop.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔖</div>
          <h4>Progreso Guardado</h4>
          <p>Tu lectura se guarda en el dispositivo. Reanuda siempre en tu última página.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📑</div>
          <h4>Índice Interactivo</h4>
          <p>Accede directamente a los capítulos con la tabla de contenidos integrada.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h4>Zoom Libre</h4>
          <p>Zoom fluido con botones, teclado y gestos pinch-to-zoom en pantalla táctil.</p>
        </div>
      </div>

      {/* Recent Books Section if any */}
      {recentBooks.length > 0 && (
        <div className="recent-books-section">
          <h3>Continuar Lectura Reciente</h3>
          <div className="recent-books-list">
            {recentBooks.map((book: BookProgress, idx: number) => {
              const progressPct = Math.round((book.lastPage / book.totalPages) * 100) || 0;
              return (
                <div key={`${book.fileName}-${idx}`} className="recent-book-card">
                  <div className="recent-book-info">
                    <span className="recent-book-title">{book.title || book.fileName}</span>
                    <span className="recent-book-progress">
                      Página {book.lastPage} de {book.totalPages} ({progressPct}%)
                    </span>
                  </div>
                  <div className="recent-progress-bar">
                    <div className="recent-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
