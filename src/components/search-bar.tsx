"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Sincroniza o estado da barra com o parâmetro 'q' da URL
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return; // Não faz nada se a pesquisa estiver vazia

    // Redireciona para a nova página de pesquisa
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <form onSubmit={handleSearch} className="hidden sm:block w-full max-w-xs md:max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Pesquisar artigos..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </form>
  );
}