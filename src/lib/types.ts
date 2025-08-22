import { Timestamp } from "firebase/firestore";

// Adicionar este novo tipo ao ficheiro
export type Notification = {
  id: string;
  userId: string; // ID do utilizador que recebe a notificação
  message: string;
  link: string; // Link para onde o utilizador será levado ao clicar
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
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
}

// A CORREÇÃO ESTÁ AQUI
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