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
        <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col items-center mb-8">
                <Heart className="h-14 w-14 text-primary mb-2" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-2">Os Seus Favoritos</h1>
                <p className="max-w-2xl text-lg text-muted-foreground text-center">Os artigos que guardou para ver mais tarde.</p>
            </div>

            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {favoriteProducts.map(product => (
                                                <div
                          key={product.id}
                                                    className="shadow-soft rounded-xl bg-background p-2 transition-smooth hover:shadow-elevated hover:-translate-y-1 focus-within:ring-2 focus-within:ring-primary/40 motion-reduce:transition-none motion-reduce:transform-none"
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/40">
                    <Heart className="h-14 w-14 text-muted-foreground mb-2" />
                    <h3 className="text-xl font-semibold mb-2">A sua lista de favoritos está vazia</h3>
                    <p className="text-muted-foreground mb-4 text-center">
                        Clique no coração nos artigos que gostar para os guardar aqui.
                    </p>
                    <Button asChild className="mt-2">
                        <Link href="/">Procurar Artigos</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}