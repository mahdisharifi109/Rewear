"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product-card"; // Importação corrigida
import { useProducts } from "@/context/product-context";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

export function ProductGrid() {
  const searchParams = useSearchParams();
  const { products } = useProducts();

  const filteredProducts = useMemo(() => {
    const searchQuery = searchParams.get("q")?.toLowerCase() || "";
    const categoryQuery = searchParams.get("category")?.toLowerCase() || "";

    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery)
      );
    }
    if (categoryQuery) {
        filtered = filtered.filter(p =>
          p.category.toLowerCase() === categoryQuery
        );
    }

    return filtered;
  }, [searchParams, products]);

  return (
    <section id="products" className="container py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          {searchParams.get("q") ? `Resultados para "${searchParams.get("q")}"` : "Descubra os Nossos Produtos"}
        </h2>
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
        <div className="flex flex-wrap justify-center gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">Nenhum produto encontrado. Tente uma pesquisa diferente.</p>
        </div>
      )}
    </section>
  );
}
