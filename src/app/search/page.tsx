// src/app/search/page.tsx

import { ProductGrid } from "@/components/product-grid";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { SortBar } from "@/components/sort-bar";

function ProductGridFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  )
}

// O Suspense é crucial aqui para que a página possa usar os searchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  return (
    <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <aside className="md:col-span-1">
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <FiltersSidebar />
        </Suspense>
      </aside>
      <main className="md:col-span-3">
        <SortBar />
        <Suspense fallback={<ProductGridFallback/>}>
          <ProductGrid />
        </Suspense>
      </main>
    </div>
  );
}