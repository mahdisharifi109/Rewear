"use client";

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/context/product-context';
import { EditForm } from '@/components/edit-form';

export default function EditProductPage() {
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // O ID vindo da URL é uma string. Mantemo-lo como string.
  const productId = params.id as string;
  
  const product = useMemo(() => 
    // Comparamos string com string (p.id é string, productId é string)
    products.find(p => p.id === productId), 
    [products, productId]
  );
  
  useEffect(() => {
    if (authLoading || productsLoading) return;

    if (!user) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Precisa de iniciar sessão para editar um produto.",
      });
      router.push('/login');
      return;
    }

    // A verificação de !product só é fiável depois de os produtos terem carregado
    if (!productsLoading && !product) {
       toast({
        variant: "destructive",
        title: "Produto Não Encontrado",
        description: "O produto que está a tentar editar não existe.",
      });
      router.push('/');
      return;
    }

    if (product && product.userEmail !== user.email) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Não tem permissão para editar este produto.",
      });
      router.push('/');
    }
  }, [user, authLoading, productsLoading, router, toast, product]);

  if (authLoading || productsLoading || !product) {
    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <p>A carregar editor de produto...</p>
        </div>
    );
  }
  
  if (product.userEmail !== user?.email) {
    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <p>Não tem permissão para aceder a esta página.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <EditForm product={product} />
    </div>
  );
}
