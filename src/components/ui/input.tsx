import * as React from "react"

import { cn } from "@/lib/utils"

/*
  Input Humanizado - Rewear
  Altura confortável (h-12), padding generoso, bordas suaves.
  Foco com anel suave, não neon - acessível mas delicado.
  Placeholder com tom acolhedor, não cinza-máquina.
*/

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[0.625rem] border border-border bg-card px-4 py-3 text-base shadow-soft ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 transition-gentle focus-visible:outline-none focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 focus-visible:shadow-elevated disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
