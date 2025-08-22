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
  sizes?: string[];
  brand?: string;
  material?: string;
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

// TIPO QUE ESTAVA EM FALTA
export interface AppUser {
  uid: string;
  email: string | null;
  name: string;
  favorites: string[];
  preferredBrands?: string[];
  preferredSizes?: string[];
  walletBalance?: number;
}