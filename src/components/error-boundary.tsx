'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary para capturar erros em componentes React
 * Previne que um erro num componente faça crash da aplicação inteira
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Pode enviar para serviço de logging como Sentry
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            Algo correu mal
          </h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            Pedimos desculpa, mas ocorreu um erro inesperado. 
            Por favor, tenta recarregar a página ou contacta o suporte se o problema persistir.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mb-6 max-w-2xl rounded-lg bg-muted p-4 text-left text-sm">
              <summary className="cursor-pointer font-medium">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 overflow-auto text-xs">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <div className="flex gap-4">
            <Button
              onClick={this.handleReset}
              variant="outline"
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="default"
            >
              Voltar à página inicial
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
