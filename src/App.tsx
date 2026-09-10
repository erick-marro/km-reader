import { useEffect, useMemo } from 'react';
import { PdfReader } from './components/PdfReader';
import { resolveBookFromUrl } from './books';
import './App.css';

export function App() {
  const book = useMemo(() => resolveBookFromUrl(), []);

  useEffect(() => {
    document.title = book ? `${book.title} — Lector` : 'Lector PDF';
  }, [book]);

  if (!book) {
    return (
      <div className="app-container">
        <div className="reader-error-screen">
          <div className="error-card">
            <div className="error-icon">🔗</div>
            <h2>Enlace no válido</h2>
            <p>Este enlace no corresponde a ningún libro disponible.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <PdfReader
        key={book.slug}
        source={book.url}
        bookSlug={book.slug}
        bookTitle={book.title}
        brandLabel={book.shortTitle}
      />
    </div>
  );
}

export default App;
