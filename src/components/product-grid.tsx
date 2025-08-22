"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/context/product-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function ProductGrid() {
  const searchParams = useSearchParams();
  const { products } = useProducts();

  const filteredProducts = useMemo(() => {
    // Obter todos os parâmetros da URL
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";
    const categoryQuery = searchParams.get("category")?.toLowerCase() || "";
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || Infinity;
    const conditions = searchParams.get("conditions")?.split(',') || [];

    let filtered = products;

    // Filtrar por texto de pesquisa
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery)
      );
    }
    
    // Filtrar por categoria
    if (categoryQuery) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase() === categoryQuery
        );
    }
    
    // Filtrar por preço
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Filtrar por condição
    if (conditions.length > 0) {
        filtered = filtered.filter(p => conditions.includes(p.condition));
    }

    return filtered;
  }, [searchParams, products]);

  return (
    <section id="products">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {searchParams.get("q") ? `Resultados para "${searchParams.get("q")}"` : "Descubra os Nossos Produtos"}
        </h2>
        <p className="text-muted-foreground mt-2">{filteredProducts.length} resultado(s) encontrado(s)</p>
      </div>

      {products.length === 0 && !searchParams.get("q") && !searchParams.get("category") ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-semibold">Nenhum produto por aqui... ainda!</h3>
          <p className="mt-2 text-muted-foreground">
            Seja o primeiro a vender algo na SecondWave.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sell">Vender o meu primeiro artigo</Link>
          </Button>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Nenhum produto encontrado. Tente ajustar os filtros.</p>
        </div>
      )}
    </section>
  );
}