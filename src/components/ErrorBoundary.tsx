import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="w-full max-w-md rounded-2xl bg-red-50 p-6 text-center shadow-lg border border-red-100">
            <h2 className="mb-2 text-2xl font-bold text-red-600">Algo salió mal</h2>
            <p className="mb-4 text-sm text-red-800">
              Ocurrió un error inesperado al renderizar esta pantalla.
            </p>
            <pre className="text-left text-xs text-red-900 bg-red-100/50 p-3 rounded-xl overflow-x-auto">
              {this.state.error?.message || 'Error desconocido'}
            </pre>
            <button 
              className="mt-6 rounded-full bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
