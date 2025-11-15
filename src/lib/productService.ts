import { collection, query, where, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from './types';

export interface ProductFilters {
  category?: string;
  maxPrice?: number;
}

const CACHE_KEY = 'rewear_products_service_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

interface CachePayload {
  products: Product[];
  timestamp: number;
  lastDocId?: string;
}

export async function getProductsWithPagination(pageSize = 12, filters?: ProductFilters, lastDocSnapshot?: QueryDocumentSnapshot<DocumentData>) {
  // Se não há filtros, tentar cache
  if (!filters && !lastDocSnapshot) {
    const cached = typeof window !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (cached) {
      const data: CachePayload = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_EXPIRY) {
        console.log('📦 Usando cache do productService');
        return { products: data.products, lastDoc: undefined };
      }
    }
  }

  let constraints: QueryConstraint[] = [where('status', '==', 'disponível')];

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.maxPrice) {
    constraints.push(where('price', '<=', filters.maxPrice));
  }

  // Ordenação adaptativa
  if (filters?.maxPrice) {
    constraints.push(orderBy('price', 'asc'));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  constraints.push(limit(pageSize));

  let q = query(collection(db, 'products'), ...constraints);

  if (lastDocSnapshot) {
    // Remover limit anterior e aplicar novamente com startAfter
    constraints = constraints.filter(c => c.type !== 'limit');
    q = query(collection(db, 'products'), ...constraints, startAfter(lastDocSnapshot), limit(pageSize));
  }

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  if (!filters && !lastDocSnapshot && products.length) {
    const payload: CachePayload = { products, timestamp: Date.now(), lastDocId: lastDoc?.id };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {}
  }

  return { products, lastDoc };
}

export function clearProductServiceCache() {
  if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY);
}
