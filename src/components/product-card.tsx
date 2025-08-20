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
} from "@/components/ui/alert-dialog"

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { deleteProduct } = useProducts();
  const router = useRouter();

  const isOwner = user && user.email === product.userEmail;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(product);
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);
      toast({
        title: "Produto Removido",
        description: "O seu produto foi removido com sucesso.",
      });
    } catch (error: any) {
      console.error("Falha ao apagar o produto:", error);
      toast({
        variant: "destructive",
        title: "Erro ao apagar",
        description: `Não foi possível remover o produto. Detalhe: ${error.message}`,
      });
    }
  };

  return (
    <Link href={`/product/${product.id}`} className="group block h-full">
      <Card className="flex flex-col overflow-hidden transition-shadow duration-300 group-hover:shadow-lg h-full">
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
        <CardContent className="flex-1 p-4 flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold leading-tight group-hover:text-primary">{product.name}</CardTitle>
                <div className="text-lg font-bold text-primary whitespace-nowrap">{product.price.toFixed(2)}€</div>
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{product.condition}</Badge>
                <Badge variant="secondary">{product.category}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 mt-auto">
          {isOwner ? (
            <div className="w-full flex gap-2">
              <Button variant="outline" className="w-full" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Apagar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. O seu produto será apagado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <Button className="w-full" onClick={handleAddToCart} disabled={Boolean(!user || isOwner)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              { !user ? "Faça login para comprar" : "Adicionar ao Carrinho" }
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export default ProductCard;
