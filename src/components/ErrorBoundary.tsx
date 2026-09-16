import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, RefreshCw } from 'lucide-react';
import { reportClientError } from '../lib/monitoring';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((props: { error: Error | null; resetError: () => void }) => ReactNode);
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled application error:', error, errorInfo);
    reportClientError(
      new Error(`${error.message}\nReact component stack: ${errorInfo.componentStack || 'unavailable'}`),
      'react-boundary'
    );
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    if (window.location.search || window.location.hash) {
      window.location.href = window.location.pathname;
    } else {
      this.handleReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset,
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Nomaʼlum xatolik yuz berdi';

      return (
        <div
          id="error-boundary-container"
          className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans"
        >
          <div
            id="error-boundary-card"
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
          >
            <div
              id="error-boundary-icon-wrapper"
              className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5"
            >
              <AlertOctagon size={32} />
            </div>

            <h1
              id="error-boundary-title"
              className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Kutilmagan xatolik yuz berdi
            </h1>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
              Something went wrong • Произошла ошибка
            </p>

            <p
              id="error-boundary-description"
              className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md"
            >
              Ilova ishida vaqtinchalik nosozlik yuz berdi. Xavotir olmang, sizning ma’lumotlaringiz xavfsiz.
              Quyidagi tugma orqali ilovani qayta ishga tushirishingiz mumkin.
            </p>

            {this.state.error && (
              <div
                id="error-boundary-details-box"
                className="w-full mt-5 text-left bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/70 dark:border-slate-700/60 overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>Xatolik ma’lumoti:</span>
                  <span className="font-mono text-[10px] text-rose-500">React Boundary</span>
                </div>
                <p className="font-mono text-xs text-rose-600 dark:text-rose-400 break-words leading-tight select-all">
                  {errorMessage}
                </p>
              </div>
            )}

            <div
              id="error-boundary-actions"
              className="w-full mt-6 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                type="button"
                id="error-boundary-retry-button"
                onClick={this.handleReset}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Qayta urinish / Try Again</span>
              </button>

              <button
                type="button"
                id="error-boundary-reload-button"
                onClick={this.handleReload}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all cursor-pointer"
                title="Sahifani to‘liq yangilash"
              >
                <RefreshCw size={16} />
                <span>Yangilash</span>
              </button>

              <button
                type="button"
                id="error-boundary-home-button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                title="Bosh sahifaga qaytish"
              >
                <Home size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}