import { Timestamp } from "firebase/firestore";

export type Product = {
  id: string; // Corrigido de number para string
  name: string;
  description: string;
  price: number;
  condition: 'Novo' | 'Muito bom' | 'Bom';
  category: 'Roupa' | 'Calçado' | 'Livros' | 'Eletrónica' | 'Outro';
  imageUrls: string[];
  imageHint: string;
  userEmail: string;
  createdAt?: Timestamp; // Adicionado para ordenação
};

export type CartItem = {
  product: Product;
  quantity: number;
};
