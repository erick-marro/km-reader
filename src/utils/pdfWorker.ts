import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker using jsDelivr CDN matching current pdfjs-dist version
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export { pdfjsLib };
