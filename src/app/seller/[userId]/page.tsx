"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProductCard from '@/components/product-card';
import { Loader2 } from 'lucide-react';

interface Seller {
    username: string;
    email: string;
}

export default function SellerProfilePage() {
    const params = useParams();
    const userId = params.userId as string;

    const [seller, setSeller] = useState<Seller | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchSellerData = async () => {
            setLoading(true);
            try {
                const userDocRef = doc(db, 'users', userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    setSeller(userDocSnap.data() as Seller);
                }

                const productsQuery = query(collection(db, 'products'), where("userId", "==", userId));
                const productsSnapshot = await getDocs(productsQuery);
                const sellerProducts = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(sellerProducts);

            } catch (error) {
                console.error("Erro ao carregar dados do vendedor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSellerData();
    }, [userId]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">A carregar perfil do vendedor...</p>
            </div>
        );
    }
    
    if (!seller) {
        return (
             <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold">Vendedor não encontrado</h1>
             </div>
        )
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${seller.username}`} alt={seller.username ?? 'Avatar do Vendedor'} />
                    <AvatarFallback>{seller.username ? seller.username.charAt(0).toUpperCase() : 'V'}</AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-bold">{seller.username}</h1>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-6">
                    Artigos de {seller.username} ({products.length})
                </h2>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        Este utilizador ainda não tem artigos à venda.
                    </p>
                )}
            </div>
        </div>
    );
}