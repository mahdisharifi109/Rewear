"use client";
import { useEffect, useState, useRef } from 'react';
import { getProductsWithPagination } from '@/lib/productService';
import ProductCard from './product-card';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<any>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const { products: initial, lastDoc } = await getProductsWithPagination(12);
        setProducts(initial);
        lastDocRef.current = lastDoc;
        setHasMore(!!lastDoc);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar produtos');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  const loadMore = async () => {
    if (!hasMore || isLoadingMore || !lastDocRef.current) return;
    setIsLoadingMore(true);
    try {
      const { products: next, lastDoc } = await getProductsWithPagination(12, undefined, lastDocRef.current);
      setProducts(prev => [...prev, ...next]);
      lastDocRef.current = lastDoc;
      setHasMore(!!lastDoc);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (loading) return <div className="py-8 text-center">Carregando produtos...</div>;
  if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!products.length) return <div className="py-8 text-center">Nenhum produto encontrado.</div>;

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            disabled={isLoadingMore}
            onClick={loadMore}
            className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50"
          >
            {isLoadingMore ? 'A carregar...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </section>
  );
}
