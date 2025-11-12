import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
  Botões Humanizados - Rewear
  Projetados para serem confortáveis ao toque e ao olhar.
  Transições suaves, sombras em camadas, cantos levemente mais arredondados.
  Cada variante foi ajustada manualmente para criar hierarquia visual natural.
*/

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] text-sm font-medium ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // Primary: sombra suave que cresce no hover - sensação de profundidade natural
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-elevated active:scale-[0.98]",
        // Destructive: terracota suave, não vermelho agressivo
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90 hover:shadow-elevated active:scale-[0.98]",
        // Outline: borda sutil, hover suave sem saltos bruscos
        outline:
          "border border-border bg-background hover:bg-accent/50 hover:border-accent-foreground/20 hover:text-accent-foreground transition-gentle",
        // Secondary: cinza lavanda discreto, elegante
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-soft transition-gentle",
        // Ghost: aparece suavemente ao hover
        ghost: "hover:bg-accent/40 hover:text-accent-foreground transition-gentle",
        // Link: sublinhado orgânico, não robótico
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-gentle",
      },
      size: {
        // Alturas ligeiramente maiores para conforto - não comprimimos os usuários!
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
