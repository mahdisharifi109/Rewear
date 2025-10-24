"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback, useState, useEffect } from 'react';

const conditions = ["Novo", "Muito bom", "Bom"];
const brands = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac", "Outro"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function FiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  useEffect(() => {
    const conditionsFromUrl = searchParams.get('conditions')?.split(',') || [];
    const brandsFromUrl = searchParams.get('brands')?.split(',') || [];
    const sizesFromUrl = searchParams.get('sizes')?.split(',') || [];
    
    setSelectedConditions(conditionsFromUrl.filter(Boolean));
    setSelectedBrands(brandsFromUrl.filter(Boolean));
    setSelectedSizes(sizesFromUrl.filter(Boolean));

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    } else {
      setPriceRange([0, 1000]);
    }
  }, [searchParams]);

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(paramsToUpdate)) {
        if (value && value.length > 0) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCheckboxChange = (
    value: string, 
    checked: boolean, 
    currentValues: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    paramName: string
  ) => {
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    setter(newValues);
    router.push(pathname + '?' + createQueryString({ [paramName]: newValues.join(',') }));
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };
  
  const applyPriceFilter = () => {
      router.push(pathname + '?' + createQueryString({ 
          minPrice: String(priceRange[0]), 
          maxPrice: String(priceRange[1])
      }));
  };

  const clearFilters = () => {
    router.push(pathname);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <Label>Marca</Label>
          <div className="space-y-2">
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) => handleCheckboxChange(brand, !!checked, selectedBrands, setSelectedBrands, 'brands')}
                />
                <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tamanho</Label>
          <div className="space-y-2">
            {sizes.map(size => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox
                  id={`size-${size}`}
                  checked={selectedSizes.includes(size)}
                  onCheckedChange={(checked) => handleCheckboxChange(size, !!checked, selectedSizes, setSelectedSizes, 'sizes')}
                />
                <Label htmlFor={`size-${size}`} className="font-normal">{size}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Condição</Label>
          <div className="space-y-2">
            {conditions.map(condition => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => handleCheckboxChange(condition, !!checked, selectedConditions, setSelectedConditions, 'conditions')}
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