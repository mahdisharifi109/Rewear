import { Timestamp } from "firebase/firestore";

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
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
}

// A CORREÇÃO ESTAVA AQUI
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