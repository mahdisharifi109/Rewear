/**
 * Hook para otimizar o carregamento de imagens de produtos
 * Usa priority loading para os primeiros produtos visíveis
 */

'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

const PRIORITY_IMAGES_COUNT = 6; // Carregar as primeiras 6 imagens com prioridade

export function useImageOptimization(products: Product[], index: number) {
  const [shouldLoadPriority, setShouldLoadPriority] = useState(false);

  useEffect(() => {
    // Carregar com prioridade apenas os primeiros produtos
    if (index < PRIORITY_IMAGES_COUNT) {
      setShouldLoadPriority(true);
    }
  }, [index]);

  return {
    priority: shouldLoadPriority,
    loading: shouldLoadPriority ? 'eager' as const : 'lazy' as const,
  };
}

/**
 * Gera um placeholder SVG blur para imagens
 */
export function getImagePlaceholder(width = 700, height = 475): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Otimiza URLs de imagens do Firebase Storage
 */
export function optimizeImageUrl(url: string, width?: number): string {
  // Se for Firebase Storage, adicionar parâmetros de otimização
  if (url.includes('firebasestorage.googleapis.com')) {
    const urlObj = new URL(url);
    if (width) {
      urlObj.searchParams.set('w', width.toString());
    }
    return urlObj.toString();
  }
  return url;
}
