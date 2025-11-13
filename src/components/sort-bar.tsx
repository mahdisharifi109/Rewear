"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function SortBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") || "newest";

  const updateSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end mb-4 gap-2">
      <Label htmlFor="sort" className="text-sm text-muted-foreground">Ordenar por</Label>
      <Select value={sort} onValueChange={updateSort}>
        <SelectTrigger className="w-48" id="sort">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Mais recente</SelectItem>
          <SelectItem value="price_asc">Preço: mais baixo</SelectItem>
          <SelectItem value="price_desc">Preço: mais alto</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
