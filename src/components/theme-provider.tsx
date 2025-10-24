"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Vamos deixar o TypeScript inferir os tipos, o que é mais seguro.
// Remova a linha "import type { ThemeProviderProps } from 'next-themes/dist/types';"

export function ThemeProvider({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}