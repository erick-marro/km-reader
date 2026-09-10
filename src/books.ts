import empowerTimeUrl from './assets/EmpowerTime_El_empresario_del_Reino.pdf';
import losTresPortalesUrl from './assets/Los_Tres_Portales.pdf';

export interface BookMeta {
  /** URL slug used to build the shareable link: ?libro=<slug> */
  slug: string;
  /** Full title shown in the reader header */
  title: string;
  /** Short label shown as the brand in the header */
  shortTitle: string;
  /** Bundled PDF asset URL */
  url: string;
}

/**
 * Catálogo de libros. Cada libro se abre únicamente a través de su propio
 * enlace (?libro=<slug>). No existe navegación ni cambio entre libros dentro
 * de la app: un enlace = un libro.
 */
export const BOOKS: Record<string, BookMeta> = {
  empowertime: {
    slug: 'empowertime',
    title: 'EmpowerTime: El empresario del Reino',
    shortTitle: 'EmpowerTime',
    url: empowerTimeUrl,
  },
  'los-tres-portales': {
    slug: 'los-tres-portales',
    title: 'Los Tres Portales',
    shortTitle: 'Los Tres Portales',
    url: losTresPortalesUrl,
  },
};

/** Libro que se muestra cuando el enlace no trae parámetro (compatibilidad
 *  con los enlaces antiguos que abrían directamente en la raíz). */
export const DEFAULT_BOOK_SLUG = 'empowertime';

/**
 * Resuelve el libro a partir del parámetro de enlace (?libro= o ?book=).
 * - Sin parámetro  -> libro por defecto.
 * - Parámetro desconocido -> null (enlace no válido).
 */
export function resolveBookFromUrl(): BookMeta | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('libro') ?? params.get('book');
  if (raw === null) {
    return BOOKS[DEFAULT_BOOK_SLUG] ?? null;
  }
  return BOOKS[raw.trim().toLowerCase()] ?? null;
}
