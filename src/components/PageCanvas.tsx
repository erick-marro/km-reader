import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

interface PageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  containerWidth?: number;
  containerHeight?: number;
  isSpread?: boolean;
}

export function PageCanvas({
  pdfDoc,
  pageNumber,
  scale,
  containerWidth,
  containerHeight,
  isSpread = false,
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const renderPage = async () => {
      try {
        // Cancel previous render task if active
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        const unscaledViewport = page.getViewport({ scale: 1.0 });

        // Calculate available display dimensions in pixels
        let fitScale = 1.0;
        if (containerWidth && containerHeight) {
          const availWidth = isSpread ? (containerWidth - 64) / 2 : containerWidth - 32;
          const availHeight = containerHeight - 130; // space for header/toolbar

          const scaleX = availWidth / unscaledViewport.width;
          const scaleY = availHeight / unscaledViewport.height;
          fitScale = Math.min(scaleX, scaleY);
        } else if (containerWidth) {
          const availWidth = isSpread ? (containerWidth - 64) / 2 : containerWidth - 32;
          fitScale = availWidth / unscaledViewport.width;
        }

        // Clamp fitScale to reasonable bounds
        fitScale = Math.max(0.3, Math.min(fitScale, 2.5));

        // Display size on screen
        const displayScale = fitScale * scale;
        const displayWidth = Math.round(unscaledViewport.width * displayScale);
        const displayHeight = Math.round(unscaledViewport.height * displayScale);

        // High resolution rendering multiplier for razor-sharp vector text (min 2x DPR)
        const dpr = Math.max(window.devicePixelRatio || 1, 2.0);
        const renderViewport = page.getViewport({ scale: displayScale * dpr });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Set actual canvas drawing buffer size (High DPI)
        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);

        // Set CSS display size
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        const renderContext = {
          canvasContext: ctx,
          viewport: renderViewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (!isCancelled) {
          setLoading(false);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'RenderingCancelledException') {
          return;
        }
        if (!isCancelled) {
          console.error(`Error rendering page ${pageNumber}`, err);
          setError(`No se pudo renderizar la página ${pageNumber}`);
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, scale, containerWidth, containerHeight, isSpread]);

  return (
    <div
      className={`page-card ${isSpread ? 'spread-page' : 'single-page'}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="page-number-badge">Pág. {pageNumber}</div>
      {loading && (
        <div className="canvas-skeleton">
          <div className="skeleton-spinner"></div>
          <span>Cargando página {pageNumber}...</span>
        </div>
      )}
      {error && <div className="canvas-error">{error}</div>}
      <canvas
        ref={canvasRef}
        className={`pdf-canvas ${loading ? 'hidden' : 'visible'}`}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Security Protection Overlay to prevent right click / dragging / direct image copy */}
      <div className="canvas-security-overlay" onContextMenu={(e) => e.preventDefault()} />
    </div>
  );
}
