"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="hidden sm:block w-full max-w-xs">
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
