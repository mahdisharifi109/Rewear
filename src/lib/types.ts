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
  brand?: string;
  material?: string;
  quantity: number;
  userId: string; // CAMPO ADICIONADO PARA LIGAR O PRODUTO AO DONO
};

export interface AddToCartPayload {
  product: Product;
  quantity: number;
  size?: string;
}

export type CartItem = AddToCartPayload & {
  id: string; 
};