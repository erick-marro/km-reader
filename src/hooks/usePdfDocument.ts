import { useState, useEffect } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { pdfjsLib } from '../utils/pdfWorker';

export interface TocItem {
  title: string;
  pageNumber: number | null;
  dest: string | unknown[] | null;
  items?: TocItem[];
}

export interface PdfDocumentState {
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  outline: TocItem[];
  title: string;
  loading: boolean;
  error: string | null;
}

export function usePdfDocument(source: File | string | null): PdfDocumentState {
  const [state, setState] = useState<PdfDocumentState>({
    pdfDoc: null,
    numPages: 0,
    outline: [],
    title: '',
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!source) {
      setState({
        pdfDoc: null,
        numPages: 0,
        outline: [],
        title: '',
        loading: false,
        error: null,
      });
      return;
    }

    let isMounted = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const loadDocument = async () => {
      try {
        let loadingTask;
        let docTitle = 'Empower Time';

        if (typeof source === 'string') {
          loadingTask = pdfjsLib.getDocument({ url: source });
          docTitle = 'Empower Time: El empresario del Reino';
        } else {
          const arrayBuffer = await source.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          docTitle = source.name.replace(/\.pdf$/i, '');
        }

        const pdf = await loadingTask.promise;

        if (!isMounted) return;
        try {
          const metadata = await pdf.getMetadata();
          if (metadata?.info && (metadata.info as { Title?: string }).Title) {
            const metaTitle = (metadata.info as { Title?: string }).Title?.trim();
            if (metaTitle) docTitle = metaTitle;
          }
        } catch (e) {
          console.warn('Could not read PDF metadata', e);
        }

        // Get outline (Table of contents)
        let processedOutline: TocItem[] = [];
        try {
          const rawOutline = await pdf.getOutline();
          if (rawOutline && rawOutline.length > 0) {
            processedOutline = await parseOutline(pdf, rawOutline);
          }
        } catch (e) {
          console.warn('Could not read PDF outline', e);
        }

        if (isMounted) {
          setState({
            pdfDoc: pdf,
            numPages: pdf.numPages,
            outline: processedOutline,
            title: docTitle,
            loading: false,
            error: null,
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage =
          err instanceof Error ? err.message : 'Error al cargar el archivo PDF.';
        setState({
          pdfDoc: null,
          numPages: 0,
          outline: [],
          title: '',
          loading: false,
          error: errorMessage,
        });
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [source]);

  return state;
}

// Recursive helper to resolve page numbers for PDF destinations
async function parseOutline(
  pdf: PDFDocumentProxy,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
): Promise<TocItem[]> {
  const result: TocItem[] = [];

  for (const item of items) {
    let pageNum: number | null = null;

    try {
      if (typeof item.dest === 'string') {
        const destArray = await pdf.getDestination(item.dest);
        if (destArray && destArray[0]) {
          const pageIndex = await pdf.getPageIndex(destArray[0]);
          pageNum = pageIndex + 1;
        }
      } else if (Array.isArray(item.dest) && item.dest[0]) {
        const pageIndex = await pdf.getPageIndex(item.dest[0]);
        pageNum = pageIndex + 1;
      }
    } catch {
      // If destination fails to resolve, leave pageNum null
    }

    let childItems: TocItem[] = [];
    if (item.items && item.items.length > 0) {
      childItems = await parseOutline(pdf, item.items);
    }

    result.push({
      title: item.title || 'Sin título',
      pageNumber: pageNum,
      dest: item.dest || null,
      items: childItems.length > 0 ? childItems : undefined,
    });
  }

  return result;
}
