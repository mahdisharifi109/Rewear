"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useProducts } from "@/context/product-context";
import { ShoppingCart, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react"; // Importar React

// Definir as propriedades que o componente espera receber
interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { deleteProduct } = useProducts();
  const router = useRouter();

  const isOwner = user && user.uid === product.userId;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Evitar navegação se o clique for num botão dentro do CardFooter
    if ((e.target as HTMLElement).closest('.card-actions-footer')) {
      return;
    }
    router.push(`/product/${product.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleActionClick(e);
    addToCart({ product, quantity: 1 });
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleActionClick(e);
    router.push(`/product/${product.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    handleActionClick(e);
    try {
      await deleteProduct(product.id);
      toast({
        title: "Produto Removido",
        description: "O seu produto foi removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao apagar",
        description: `Não foi possível remover o produto. Verifique as permissões.`,
      });
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg h-full cursor-pointer group"
    >
      {/* O conteúdo clicável leva para a página do produto */}
      <div className="flex-grow">
        <CardHeader className="p-0 border-b">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              data-ai-hint={product.imageHint}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary">{product.name}</CardTitle>
            <div className="text-lg font-bold text-primary whitespace-nowrap">{product.price.toFixed(2)}€</div>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{product.condition}</Badge>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
        </CardContent>
      </div>
      
      {/* O rodapé com os botões não é clicável para navegação */}
      <CardFooter className="p-4 pt-0 mt-auto card-actions-footer">
        {isOwner ? (
          <div className="w-full flex gap-2">
            <Button variant="outline" className="w-full" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AlertDialog onOpenChange={(open) => open && handleActionClick}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" onClick={handleActionClick}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Apagar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={handleActionClick}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O seu produto será apagado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button className="w-full" onClick={handleAddToCart} disabled={!user}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {!user ? "Faça login para comprar" : "Adicionar ao Carrinho"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;