import { ProductGrid } from "@/components/product-grid";
import { FiltersSidebar } from "@/components/filters-sidebar"; // Importar o novo componente
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <section className="bg-primary/10">
        <div className="container py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Encontre Tesouros em Segunda Mão</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Compre e venda moda, livros, eletrónica e mais. Dê uma segunda vida aos seus artigos.</p>
        </div>
      </section>
      
      {/* Nova estrutura com barra de filtros */}
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <FiltersSidebar />
          </Suspense>
        </div>
        <div className="md:col-span-3">
          <Suspense fallback={<ProductGridFallback/>}>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </>
  );
}