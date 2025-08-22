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
import { ShoppingCart, Pencil, Trash2, CheckCircle, ShieldCheck } from "lucide-react"; // Adicionado ShieldCheck
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
import React from "react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, addToWallet } = useAuth();
  const { deleteProduct, markAsSold } = useProducts();
  const router = useRouter();

  const isOwner = user && user.uid === product.userId;

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
      toast({ title: "Produto Removido", description: "O seu produto foi removido com sucesso." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao apagar", description: `Não foi possível remover o produto.` });
    }
  };

  const handleMarkAsSold = async (e: React.MouseEvent<HTMLButtonElement>) => {
    handleActionClick(e);
    try {
      await markAsSold(product.id);
      await addToWallet(product.price);
      toast({ title: "Produto Vendido!", description: `${product.price.toFixed(2)}€ foram adicionados à sua carteira.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível concluir a ação." });
    }
  }

  return (
    <Card
      onClick={handleCardClick}
      className="flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-lg h-full cursor-pointer group"
    >
      <div className="flex-grow">
        <CardHeader className="p-0 border-b">
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
             {product.status === 'vendido' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">VENDIDO</Badge>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary">{product.name}</CardTitle>
            <div className="text-lg font-bold text-primary whitespace-nowrap">{product.price.toFixed(2)}€</div>
          </div>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {product.isVerified && (
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Verificado
                </Badge>
            )}
            <Badge variant="outline">{product.condition}</Badge>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
        </CardContent>
      </div>
      
      <CardFooter className="p-4 pt-0 mt-auto card-actions-footer">
        {isOwner ? (
          <div className="w-full flex flex-col gap-2">
            {product.status !== 'vendido' && (
              <Button variant="outline" size="sm" className="w-full" onClick={handleMarkAsSold}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Vendido
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-full" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <AlertDialog onOpenChange={(open) => open && handleActionClick}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full" onClick={handleActionClick}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Apagar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={handleActionClick}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita. O seu produto será apagado permanentemente.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ) : (
          <Button className="w-full" onClick={handleAddToCart} disabled={!user || product.status === 'vendido'}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.status === 'vendido' ? "Artigo Indisponível" : (!user ? "Faça login para comprar" : "Adicionar ao Carrinho")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;