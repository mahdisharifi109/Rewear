// src/lib/cache.ts
// Sistema de cache simples para produtos e queries do Firestore

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutos
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const age = Date.now() - entry.timestamp;
    
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  // Invalida todas as chaves que começam com um prefixo
  invalidatePrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Instância singleton do cache
export const productCache = new SimpleCache();

// Funções helper para cache de produtos
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: (id: string) => `product:${id}`,
  PRODUCTS_PAGE: (page: number, filters: string) => `products:page:${page}:${filters}`,
  USER_PRODUCTS: (userId: string) => `user:products:${userId}`,
};

// TTL configs (em ms)
export const CACHE_TTL = {
  PRODUCTS_LIST: 180000, // 3 minutos para lista
  PRODUCT_DETAIL: 300000, // 5 minutos para detalhes
  USER_DATA: 600000, // 10 minutos para dados de utilizador
};
