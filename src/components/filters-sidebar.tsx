"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useCallback, useState, useEffect } from 'react';

// Listas de opções para os novos filtros
const conditions = ["Novo", "Muito bom", "Bom"];
const brands = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac", "Outro"];
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const categories = ["Roupa", "Calçado", "Livros", "Eletrónica", "Outro"];
const colors = ["Preto", "Branco", "Cinzento", "Azul", "Vermelho", "Verde", "Amarelo", "Rosa", "Castanho"];
const locations = ["Lisboa", "Porto", "Braga", "Aveiro", "Coimbra", "Faro", "Setúbal", "Viseu", "Leiria", "Madeira", "Açores", "Portugal"];

export function FiltersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados para controlar os valores dos filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // <-- ALTERADO para 1000
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]); 
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // Efeito para carregar os filtros a partir da URL
  useEffect(() => {
    const conditionsFromUrl = searchParams.get('conditions')?.split(',') || [];
    const brandsFromUrl = searchParams.get('brands')?.split(',') || [];
    const sizesFromUrl = searchParams.get('sizes')?.split(',') || [];
    const colorsFromUrl = searchParams.get('colors')?.split(',') || [];
    const locationsFromUrl = searchParams.get('locations')?.split(',') || [];
    const categoriesFromUrl = searchParams.get('categories')?.split(',') || [];
    
    setSelectedConditions(conditionsFromUrl.filter(Boolean));
    setSelectedBrands(brandsFromUrl.filter(Boolean));
    setSelectedSizes(sizesFromUrl.filter(Boolean));
    setSelectedColors(colorsFromUrl.filter(Boolean));
    setSelectedLocations(locationsFromUrl.filter(Boolean));
    setSelectedCategories(categoriesFromUrl.filter(Boolean));

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    } else {
      setPriceRange([0, 1000]); // <-- ALTERADO para 1000
    }
  }, [searchParams]);

  // Função para criar a URL com os novos filtros
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

  // Função genérica para lidar com a mudança nos checkboxes
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
          // Se o máximo for 1000 (o valor do slider), enviamos 'Infinity' para o filtro
          maxPrice: String(priceRange[1] === 1000 ? Infinity : priceRange[1]) 
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
        {/* Filtro de Preço */}
        <div className="space-y-4">
          <Label>Preço</Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={1000} // <-- MÁXIMO DEFINIDO PARA 1000
            step={10}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]}€</span>
            {/* Display de '1000€+' quando está no limite */}
            <span>{priceRange[1] === 1000 ? '1000€+' : `${priceRange[1]}€`}</span>
          </div>
          <Button onClick={applyPriceFilter} size="sm" className="w-full">Aplicar Preço</Button>
        </div>

        {/* Filtro de Categoria */}
        <div className="space-y-2">
          <Label>Categoria</Label>
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${cat}`}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={(checked) => handleCheckboxChange(cat, !!checked, selectedCategories, setSelectedCategories, 'categories')}
                />
                <Label htmlFor={`category-${cat}`} className="font-normal">{cat}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro de Marca */}
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

        {/* Filtro de Tamanho */}
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

        {/* Filtro de Cor */}
        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="space-y-2">
            {colors.map(color => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={`color-${color}`}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) => handleCheckboxChange(color, !!checked, selectedColors, setSelectedColors, 'colors')}
                />
                <Label htmlFor={`color-${color}`} className="font-normal">{color}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Filtro de Localização */}
        <div className="space-y-2">
          <Label>Localização</Label>
          <div className="space-y-2 max-h-48 overflow-auto pr-2">
            {locations.map(loc => (
              <div key={loc} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${loc}`}
                  checked={selectedLocations.includes(loc)}
                  onCheckedChange={(checked) => handleCheckboxChange(loc, !!checked, selectedLocations, setSelectedLocations, 'locations')}
                />
                <Label htmlFor={`location-${loc}`} className="font-normal">{loc}</Label>
              </div>
            ))}
          </div>
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