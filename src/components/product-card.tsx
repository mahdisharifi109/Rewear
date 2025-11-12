
"use client";
import { cn } from '@/lib/utils';

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
      className={cn(
        "flex flex-col overflow-hidden transition-smooth hover:shadow-floating hover:-translate-y-1 h-full cursor-pointer group border-border/50",
        product.status === 'vendido' && "opacity-60 grayscale"
      )}
    >
      <div className="flex-grow">
        <CardHeader className="p-0">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30 rounded-t-[0.75rem]">
            <Image
              src={product.imageUrls[0]}
              alt={product.name}
              fill
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-organic group-hover:scale-110"
            />
             {product.status === 'vendido' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Badge variant="destructive" className="text-lg font-bold shadow-lg">VENDIDO</Badge>
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base md:text-lg font-semibold leading-snug group-hover:text-primary transition-gentle line-clamp-2">
              {product.name}
            </CardTitle>
            <div className="text-xl font-bold text-primary whitespace-nowrap">{product.price.toFixed(2)}€</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {product.isVerified && (
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 shadow-sm">
                    <ShieldCheck className="mr-1 h-3 w-3" /> Verificado
                </Badge>
            )}
            <Badge variant="outline" className="font-medium">{product.condition}</Badge>
            <Badge variant="secondary" className="font-medium">{product.category}</Badge>
          </div>
        </CardContent>
      </div>
      
      <CardFooter className="p-5 pt-0 mt-auto card-actions-footer">
        {isOwner ? (
          <div className="w-full flex flex-col gap-2.5">
            {product.status !== 'vendido' && (
              <Button variant="outline" size="sm" className="w-full" onClick={handleMarkAsSold}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como Vendido
              </Button>
            )}
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Editar
              </Button>
              <AlertDialog onOpenChange={(open) => open && handleActionClick}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={handleActionClick}>
                    <Trash2 className="mr-1.5 h-4 w-4" />
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
          <Button 
            className="w-full font-medium" 
            onClick={handleAddToCart} 
            disabled={!user || product.status === 'vendido'}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.status === 'vendido' ? "Artigo Indisponível" : (!user ? "Faça login para comprar" : "Adicionar ao Carrinho")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;