// ================================================================
// FIRESTORE SERVICE - Camada de Acesso à Base de Dados
// ================================================================
// Centraliza todas as operações do Firestore com:
// - Validações de dados
// - Tratamento de erros
// - Tipos TypeScript
// - Cache inteligente
// - Logging de operações
// ================================================================

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  WriteBatch,
  writeBatch,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, AppUser, Review, Sale, Purchase, WalletTransaction, Conversation, Message, Notification } from './types';

// ================================================================
// TIPOS AUXILIARES
// ================================================================

export interface PaginationOptions {
  limitCount?: number;
  lastDocId?: string | null; // Changed from DocumentSnapshot to string ID
}

export interface QueryOptions extends PaginationOptions {
  filters?: QueryConstraint[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export type FirestoreError = {
  code: string;
  message: string;
  details?: unknown;
};

// ================================================================
// HELPER FUNCTIONS - Validações
// ================================================================

/**
 * Valida campos obrigatórios de um produto
 */
export function validateProduct(product: Partial<Product>): boolean {
  if (!product.name || product.name.length < 3 || product.name.length > 100) {
    throw new Error('Nome do produto inválido (3-100 caracteres)');
  }
  if (!product.description || product.description.length < 10 || product.description.length > 2000) {
    throw new Error('Descrição inválida (10-2000 caracteres)');
  }
  if (!product.price || product.price <= 0 || product.price > 10000) {
    throw new Error('Preço inválido (0.01 - 10000 EUR)');
  }
  if (!product.imageUrls || product.imageUrls.length === 0 || product.imageUrls.length > 10) {
    throw new Error('Imagens inválidas (1-10 imagens)');
  }
  if (!product.quantity || product.quantity < 1 || product.quantity > 100) {
    throw new Error('Quantidade inválida (1-100)');
  }
  return true;
}

/**
 * Valida campos de utilizador
 */
export function validateUser(user: Partial<AppUser>): boolean {
  if (!user.name || user.name.length < 3 || user.name.length > 50) {
    throw new Error('Nome de utilizador inválido (3-50 caracteres)');
  }
  if (!user.email || !user.email.includes('@')) {
    throw new Error('Email inválido');
  }
  if (user.favorites && user.favorites.length > 100) {
    throw new Error('Limite de favoritos excedido (max: 100)');
  }
  return true;
}

/**
 * Valida review
 */
export function validateReview(review: Partial<Review>): boolean {
  if (!review.rating || review.rating < 1 || review.rating > 5) {
    throw new Error('Rating inválido (1-5 estrelas)');
  }
  if (!review.comment || review.comment.length < 10 || review.comment.length > 500) {
    throw new Error('Comentário inválido (10-500 caracteres)');
  }
  if (review.sellerId === review.buyerId) {
    throw new Error('Não pode avaliar a si próprio');
  }
  return true;
}

// ================================================================
// PRODUCTS SERVICE
// ================================================================

export const ProductsService = {
  /**
   * Buscar produto por ID
   */
  async getById(productId: string): Promise<Product | null> {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        return null;
      }
      
      return { id: productSnap.id, ...productSnap.data() } as Product;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      throw error;
    }
  },

  /**
   * Listar produtos com filtros e paginação
   */
  async list(options: QueryOptions = {}): Promise<{ products: Product[]; lastDocId: string | null }> {
    try {
      const {
        limitCount = 12,
        lastDocId = null,
        filters = [],
        orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options;

      const productsRef = collection(db, 'products');
      let q = query(
        productsRef,
        ...filters,
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      // Se temos lastDocId, precisamos buscar o documento para usar startAfter
      if (lastDocId) {
        const lastDocRef = doc(db, 'products', lastDocId);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(
            productsRef,
            ...filters,
            orderBy(orderByField, orderDirection),
            startAfter(lastDocSnap),
            limit(limitCount)
          );
        }
      }

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      const lastVisibleId = lastVisible ? lastVisible.id : null;

      return { products, lastDocId: lastVisibleId };
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      throw error;
    }
  },

  /**
   * Criar novo produto
   */
  async create(productData: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    try {
      validateProduct(productData);
      
      const newProductRef = doc(collection(db, 'products'));
      await setDoc(newProductRef, {
        ...productData,
        status: productData.status || 'disponível',
        createdAt: serverTimestamp()
      });
      
      return newProductRef.id;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  /**
   * Atualizar produto existente
   */
  async update(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      if (Object.keys(updates).length > 0) {
        validateProduct(updates);
      }
      
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  /**
   * Marcar produto como vendido
   */
  async markAsSold(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        status: 'vendido',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao marcar como vendido:', error);
      throw error;
    }
  },

  /**
   * Apagar produto
   */
  async delete(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Erro ao apagar produto:', error);
      throw error;
    }
  },

  /**
   * Buscar produtos de um vendedor
   */
  async getByUser(userId: string, limitCount: number = 20): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
    } catch (error) {
      console.error('Erro ao buscar produtos do utilizador:', error);
      throw error;
    }
  }
};

// ================================================================
// USERS SERVICE
// ================================================================

export const UsersService = {
  /**
   * Buscar utilizador por ID
   */
  async getById(userId: string): Promise<AppUser | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      return { uid: userSnap.id, ...userSnap.data() } as AppUser;
    } catch (error) {
      console.error('Erro ao buscar utilizador:', error);
      throw error;
    }
  },

  /**
   * Criar perfil de utilizador
   */
  async create(userId: string, userData: Omit<AppUser, 'uid'>): Promise<void> {
    try {
      validateUser(userData);
      
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        favorites: userData.favorites || [],
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      throw error;
    }
  },

  /**
   * Atualizar perfil
   */
  async update(userId: string, updates: Partial<AppUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      throw error;
    }
  },

  /**
   * Toggle favorito
   */
  async toggleFavorite(userId: string, productId: string, isFavorited: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: isFavorited ? arrayRemove(productId) : arrayUnion(productId)
      });
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      throw error;
    }
  },

  /**
   * Adicionar saldo à carteira
   */
  async addToWallet(userId: string, amount: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'wallet.available': increment(amount)
      });
    } catch (error) {
      console.error('Erro ao adicionar saldo:', error);
      throw error;
    }
  }
};

// ================================================================
// REVIEWS SERVICE
// ================================================================

export const ReviewsService = {
  /**
   * Criar review
   */
  async create(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    try {
      validateReview(reviewData);
      
      const newReviewRef = doc(collection(db, 'reviews'));
      await setDoc(newReviewRef, {
        ...reviewData,
        createdAt: serverTimestamp()
      });
      
      return newReviewRef.id;
    } catch (error) {
      console.error('Erro ao criar review:', error);
      throw error;
    }
  },

  /**
   * Buscar reviews de um vendedor
   */
  async getBySellerIdPaginated(sellerId: string, limitCount: number = 10, lastDoc: DocumentSnapshot | null = null): Promise<{ reviews: Review[]; lastDoc: DocumentSnapshot | null }> {
    try {
      const reviewsRef = collection(db, 'reviews');
      let q = query(
        reviewsRef,
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(
          reviewsRef,
          where('sellerId', '==', sellerId),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      const reviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

      return { reviews, lastDoc: lastVisible };
    } catch (error) {
      console.error('Erro ao buscar reviews:', error);
      throw error;
    }
  }
};

// ================================================================
// TRANSACTIONS SERVICE (Sales, Purchases, Wallet)
// ================================================================

export const TransactionsService = {
  /**
   * Criar venda e compra atomicamente
   */
  async createSaleAndPurchase(
    saleData: Omit<Sale, 'id' | 'date'>,
    purchaseData: Omit<Purchase, 'id' | 'date'>,
    walletTransaction: Omit<WalletTransaction, 'id' | 'createdAt'>
  ): Promise<{ saleId: string; purchaseId: string; transactionId: string }> {
    try {
      const batch: WriteBatch = writeBatch(db);

      // Criar venda
      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, {
        ...saleData,
        status: 'pendente',
        date: serverTimestamp()
      });

      // Criar compra
      const purchaseRef = doc(collection(db, 'purchases'));
      batch.set(purchaseRef, {
        ...purchaseData,
        status: 'pendente',
        date: serverTimestamp()
      });

      // Criar transação da carteira
      const transactionRef = doc(collection(db, 'wallet_transactions'));
      batch.set(transactionRef, {
        ...walletTransaction,
        status: 'pendente',
        createdAt: serverTimestamp()
      });

      // Atualizar carteira do vendedor (saldo pendente)
      const sellerRef = doc(db, 'users', saleData.sellerId);
      batch.update(sellerRef, {
        'wallet.pending': increment(saleData.price)
      });

      await batch.commit();

      return {
        saleId: saleRef.id,
        purchaseId: purchaseRef.id,
        transactionId: transactionRef.id
      };
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw error;
    }
  },

  /**
   * Buscar vendas de um vendedor
   */
  async getSalesByUser(userId: string, limitCount: number = 20): Promise<Sale[]> {
    try {
      const salesRef = collection(db, 'sales');
      const q = query(
        salesRef,
        where('sellerId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  },

  /**
   * Buscar compras de um utilizador
   */
  async getPurchasesByUser(userId: string, limitCount: number = 20): Promise<Purchase[]> {
    try {
      const purchasesRef = collection(db, 'purchases');
      const q = query(
        purchasesRef,
        where('buyerId', '==', userId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Purchase[];
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      throw error;
    }
  },

  /**
   * Buscar transações da carteira
   */
  async getWalletTransactions(userId: string, limitCount: number = 50): Promise<WalletTransaction[]> {
    try {
      const transactionsRef = collection(db, 'wallet_transactions');
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WalletTransaction[];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }
};

// ================================================================
// NOTIFICATIONS SERVICE
// ================================================================

export const NotificationsService = {
  /**
   * Criar notificação
   */
  async create(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    try {
      const newNotificationRef = doc(collection(db, 'notifications'));
      await setDoc(newNotificationRef, {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp()
      });
      
      return newNotificationRef.id;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  },

  /**
   * Buscar notificações de um utilizador
   */
  async getByUser(userId: string, limitCount: number = 20): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      throw error;
    }
  },

  /**
   * Marcar como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }
};

// ================================================================
// EXPORT DEFAULT
// ================================================================

export default {
  Products: ProductsService,
  Users: UsersService,
  Reviews: ReviewsService,
  Transactions: TransactionsService,
  Notifications: NotificationsService
};
