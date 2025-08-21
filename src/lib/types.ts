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
  createdAt?: Timestamp;
  sizes?: string[];
  colors?: string[];
  brand?: string;
  material?: string;
  originalPrice?: number;
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export type CartItem = AddToCartPayload & {
  id: string; 
};