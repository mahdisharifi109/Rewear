'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * FilterChips - Mostra chips visuais dos filtros ativos
 * Melhora UX ao dar feedback visual claro dos filtros aplicados
 */
export function FilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters: Array<{ key: string; value: string; label: string }> = [];

  // Recolher todos os filtros ativos
  const conditions = searchParams.get('conditions')?.split(',').filter(Boolean) || [];
  const brands = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const colors = searchParams.get('colors')?.split(',').filter(Boolean) || [];
  const locations = searchParams.get('locations')?.split(',').filter(Boolean) || [];
  const categories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  conditions.forEach(c => activeFilters.push({ key: 'conditions', value: c, label: `Estado: ${c}` }));
  brands.forEach(b => activeFilters.push({ key: 'brands', value: b, label: `Marca: ${b}` }));
  sizes.forEach(s => activeFilters.push({ key: 'sizes', value: s, label: `Tamanho: ${s}` }));
  colors.forEach(c => activeFilters.push({ key: 'colors', value: c, label: `Cor: ${c}` }));
  locations.forEach(l => activeFilters.push({ key: 'locations', value: l, label: `Localização: ${l}` }));
  categories.forEach(c => activeFilters.push({ key: 'categories', value: c, label: `Categoria: ${c}` }));

  if (minPrice || maxPrice) {
    const priceLabel = `Preço: ${minPrice || '0'}€ - ${maxPrice === 'Infinity' ? '1000+' : maxPrice}€`;
    activeFilters.push({ key: 'price', value: 'range', label: priceLabel });
  }

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === 'price') {
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      const currentValues = params.get(key)?.split(',').filter(Boolean) || [];
      const newValues = currentValues.filter(v => v !== value);
      
      if (newValues.length > 0) {
        params.set(key, newValues.join(','));
      } else {
        params.delete(key);
      }
    }

    router.push(pathname + '?' + params.toString());
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Filtros ativos:</span>
      {activeFilters.map((filter, index) => (
        <Badge 
          key={`${filter.key}-${filter.value}-${index}`} 
          variant="secondary" 
          className="gap-1 pr-1 text-sm"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => removeFilter(filter.key, filter.value)}
            aria-label={`Remover filtro ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-7 text-xs"
        >
          Limpar tudo
        </Button>
      )}
    </div>
  );
}
