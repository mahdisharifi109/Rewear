import * as React from 'react';

import {cn} from '@/lib/utils';

/*
  Textarea Humanizada - Rewear
  Altura mínima confortável (120px), padding generoso, bordas suaves.
  Foco com sombra elevada, não só anel - sensação de profundidade.
  Resize vertical suave - usuário no controle.
*/

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[120px] w-full rounded-[0.625rem] border border-border bg-card px-4 py-3 text-base leading-relaxed shadow-soft ring-offset-background placeholder:text-muted-foreground/60 transition-gentle focus-visible:outline-none focus-visible:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-1 focus-visible:shadow-elevated disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30 resize-y',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
