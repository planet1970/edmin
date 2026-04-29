import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={40} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Bir Şeyler Ters Gitti</h1>
              <p className="text-gray-500 text-sm">
                Uygulama beklenmedik bir hata ile karşılaştı. Lütfen sayfayı yenilemeyi deneyin veya ana sayfaya dönün.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-200">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-semibold text-sm"
              >
                <Home size={18} />
                Ana Sayfa
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 transition-all font-semibold text-sm"
              >
                <RefreshCw size={18} />
                Yenile
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
