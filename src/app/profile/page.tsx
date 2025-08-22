"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/context/product-context';
import { Settings, Loader2, Package, Heart } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para aceder ao seu perfil.",
      });
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router, toast]);

  const userProducts = useMemo(() => {
    if (!user) return [];
    // Mostra apenas os produtos que não foram vendidos
    return products.filter(p => p.userId === user.uid && p.status !== 'vendido');
  }, [products, user]);

  const favoriteProducts = useMemo(() => {
      if (!user || !user.favorites) return [];
      return products.filter(p => user.favorites.includes(p.id));
  }, [products, user]);

  if (loading || productsLoading || !user) {
    return (
        <div className="container mx-auto flex min-h-[80vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="bg-muted/40">
      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Coluna Esquerda: Informações do Perfil */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name ?? 'V'}`} alt={user.name ?? 'Avatar do utilizador'} />
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Separator className="my-4" />
                <div className="w-full space-y-2">
                    <Button asChild className="w-full">
                        <Link href="/sell">Vender um Artigo</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            Definições
                        </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Artigos e Favoritos */}
          <div className="md:col-span-3 space-y-10">
            {/* Secção de Artigos à Venda */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Package className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">À Venda ({userProducts.length})</h2>
                </div>
                {userProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {userProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        Ainda não tem artigos à venda.
                    </p>
                )}
            </div>
            
            <Separator />
            
            {/* Secção de Favoritos */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <Heart className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Favoritos ({favoriteProducts.length})</h2>
                </div>
                 {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {favoriteProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        Ainda não guardou nenhum artigo nos favoritos.
                    </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}