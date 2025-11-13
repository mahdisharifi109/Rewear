// src/lib/types.ts

import { Timestamp } from "firebase/firestore";

export type Notification = {
  id: string;
  userId: string; 
  message: string;
  link: string; 
  read: boolean;
  createdAt: Timestamp;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: 'Novo' | 'Muito bom' | 'Bom';
  category: 'Roupa' | 'Calçado' | 'Livros' | 'Eletrónica' | 'Outro';
  imageUrls: string[];
  imageHint: string;
  userEmail: string;
  userName: string;
  userId: string;
  quantity: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  sizes?: string[];
  brand?: string;
  material?: string;
  color?: string;
  location?: string; // Localização do artigo (cidade/região)
  status?: 'disponível' | 'vendido';
  isVerified?: boolean;
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
}

export type CartItem = AddToCartPayload & {
  id: string; 
};

export type Review = {
  id: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
};

export type Conversation = {
    id: string;
    participantIds: string[];
    participants: { [key: string]: { name: string; avatar: string } };
    lastMessage?: {
        text: string;
        createdAt: Timestamp;
    };
    product?: {
        id: string;
        name: string;
        image: string;
    };
    createdAt: Timestamp;
};

// TIPO AppUser (CORRIGIDO: Extendido com novos campos e createdAt)
export interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  favorites: string[];
  preferredBrands?: string[];
  preferredSizes?: string[];
  // Saldos da carteira
  walletBalance?: number; // legacy: manter para retrocompatibilidade
  wallet?: {
    available: number; // saldo disponível
    pending: number;   // saldo pendente (aguarda confirmação do comprador)
  };
  bio?: string;
  location?: string;
  phone?: string;
  photoURL?: string;
  iban?: string; // IBAN para levantamentos
  createdAt?: Timestamp; // Adicionado para a data de registo
}

// NOVOS TIPOS PARA HISTÓRICO (para a aba de Transações)
export type Sale = {
    id: string;
    productName: string;
    price: number;
    sellerId: string;
    buyerId: string;
    buyerName: string;
    date: Timestamp;
};

export type Purchase = {
    id: string;
    productName: string;
    price: number;
    sellerId: string;
    sellerName: string;
    buyerId: string;
    date: Timestamp;
};

// Transações da carteira
export type WalletTransaction = {
  id: string;
  type: 'venda' | 'compra' | 'levantamento' | 'ajuste' | 'taxa' | 'bonus';
  amount: number; // positivo crédito, negativo débito
  description: string;
  createdAt: Timestamp;
  status?: 'pendente' | 'confirmado' | 'cancelado';
  relatedProductId?: string;
  userId?: string;
};