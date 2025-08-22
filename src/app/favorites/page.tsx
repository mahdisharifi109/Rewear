"use client";

import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import ProductCard from '@/components/product-card';
import { Loader2, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const { products, loading: productsLoading } = useProducts();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!authLoading && !user) {
            toast({
                variant: "destructive",
                title: "Acesso Negado",
                description: "Precisa de fazer login para ver os seus favoritos.",
            });
            router.push('/login?redirect=/favorites');
        }
    }, [user, authLoading, router, toast]);

    const favoriteProducts = useMemo(() => {
        if (!user || !user.favorites) return [];
        return products.filter(p => user.favorites.includes(p.id));
    }, [products, user]);

    if (authLoading || productsLoading || !user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2">A carregar os seus favoritos...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Os Seus Favoritos</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Os artigos que guardou para ver mais tarde.
                </p>
            </div>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {favoriteProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">A sua lista de favoritos está vazia</h3>
                    <p className="mt-2 text-muted-foreground">
                        Clique no coração nos artigos que gostar para os guardar aqui.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/">Procurar Artigos</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}