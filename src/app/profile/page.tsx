"use client";

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductCard from '@/components/product-card';
import { Separator } from '@/components/ui/separator';
import { useProducts } from '@/context/product-context';
import { Settings, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
      router.push('/login');
    }
  }, [user, loading, router, toast]);

  const userProducts = useMemo(() => {
    if (!user) return [];
    return products.filter(p => p.userId === user.uid);
  }, [products, user]);

  const favoriteProducts = useMemo(() => {
      if (!user || !user.favorites) return [];
      return products.filter(p => user.favorites.includes(p.id));
  }, [products, user]);

  if (loading || productsLoading || !user) {
    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2">A carregar perfil...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="mx-auto h-24 w-24 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name ?? 'V'}`} alt={user.name ?? 'Avatar do utilizador'} />
                    <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </CardHeader>
             <CardFooter className="flex-col gap-2 pt-4 items-center">
                <Button asChild className="w-full max-w-xs">
                    <Link href="/sell">Vender um Artigo</Link>
                </Button>
                <Button asChild variant="outline" className="w-full max-w-xs">
                    <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Editar Perfil e Definições
                    </Link>
                </Button>
            </CardFooter>
            <CardContent className="mt-6">
                <Separator />
                <Tabs defaultValue="selling" className="mt-8">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="selling">À Venda ({userProducts.length})</TabsTrigger>
                        <TabsTrigger value="favorites">Favoritos ({favoriteProducts.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="selling" className="mt-6">
                        {userProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {userProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Ainda não tem artigos à venda.
                            </p>
                        )}
                    </TabsContent>
                    <TabsContent value="favorites" className="mt-6">
                         {favoriteProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {favoriteProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                Ainda não guardou nenhum artigo nos favoritos.
                            </p>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
  );
}