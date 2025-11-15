/**
 * Sistema de Cache Local para otimização de performance
 * Armazena dados no localStorage com expiração automática
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

/**
 * Configurações padrão de cache
 */
export const CACHE_CONFIG = {
  PRODUCTS: {
    KEY: 'rewear_products_cache',
    EXPIRY: 5 * 60 * 1000, // 5 minutos
  },
  USER_PREFERENCES: {
    KEY: 'rewear_user_prefs_cache',
    EXPIRY: 30 * 60 * 1000, // 30 minutos
  },
  SELLER_DATA: {
    KEY: 'rewear_seller_cache',
    EXPIRY: 10 * 60 * 1000, // 10 minutos
  },
} as const;

export class CacheManager {
  /**
   * Salva dados no cache com timestamp
   */
  static set<T>(key: string, data: T, expiresIn: number): void {
    if (typeof window === 'undefined') return;
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Erro ao salvar no cache:', error);
    }
  }

  /**
   * Recupera dados do cache se ainda forem válidos
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - cacheItem.timestamp;

      // Verifica se o cache expirou
      if (age > cacheItem.expiresIn) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Erro ao ler do cache:', error);
      return null;
    }
  }

  /**
   * Remove um item específico do cache
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Erro ao remover do cache:', error);
    }
  }

  /**
   * Limpa todo o cache da aplicação
   */
  static clear(): void {
    try {
      Object.values(CACHE_CONFIG).forEach(config => {
        localStorage.removeItem(config.KEY);
      });
    } catch (error) {
      console.warn('Erro ao limpar cache:', error);
    }
  }

  /**
   * Verifica se um cache específico existe e é válido
   */
  static isValid(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Retorna a idade do cache em milissegundos
   */
  static getAge(key: string): number | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<unknown> = JSON.parse(item);
      return Date.now() - cacheItem.timestamp;
    } catch {
      return null;
    }
  }
}
 
