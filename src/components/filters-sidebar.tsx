"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback, useState, useEffect } from 'react';

const conditions = ["Novo", "Muito bom", "Bom"];

export function FiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados para controlar os valores dos filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Efeito para carregar os filtros a partir da URL quando a página carrega
  useEffect(() => {
    const conditionsFromUrl = searchParams.get('conditions')?.split(',') || [];
    setSelectedConditions(conditionsFromUrl);

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    }
  }, [searchParams]);

  // Função para criar a URL com os novos filtros
  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(paramsToUpdate)) {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...selectedConditions, condition]
      : selectedConditions.filter(c => c !== condition);
    setSelectedConditions(newConditions);
    router.push(pathname + '?' + createQueryString({ conditions: newConditions.length > 0 ? newConditions.join(',') : null }));
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };
  
  const applyPriceFilter = () => {
      router.push(pathname + '?' + createQueryString({ minPrice: String(priceRange[0]), maxPrice: String(priceRange[1]) }));
  };

  const clearFilters = () => {
    setSelectedConditions([]);
    setPriceRange([0, 500]);
    router.push(pathname);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtro de Preço */}
        <div className="space-y-4">
          <Label>Preço</Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={1000}
            step={10}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]}€</span>
            <span>{priceRange[1]}€</span>
          </div>
          <Button onClick={applyPriceFilter} size="sm" className="w-full">Aplicar Preço</Button>
        </div>

        {/* Filtro de Condição */}
        <div className="space-y-2">
          <Label>Condição</Label>
          <div className="space-y-2">
            {conditions.map(condition => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => handleConditionChange(condition, !!checked)}
                />
                <Label htmlFor={`condition-${condition}`} className="font-normal">{condition}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={clearFilters} variant="ghost" size="sm" className="w-full">Limpar Filtros</Button>
      </CardContent>
    </Card>
  );
}