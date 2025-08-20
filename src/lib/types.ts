// src/lib/types.ts
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
  userName: string; // Adicionado nome do vendedor
  createdAt?: Timestamp;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
