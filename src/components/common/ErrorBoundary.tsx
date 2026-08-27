import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MR. MAYOR Error Boundary Caught Error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto my-8 text-center space-y-5 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider font-mono">
              SYSTEM RECOVERY ACTIVE
            </span>
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              {this.props.fallbackTitle || 'AI Analysis Temporarily Unavailable'}
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {this.props.fallbackMessage ||
                'The analysis workspace encountered an unexpected data discrepancy while rendering. The system has safely isolated the view.'}
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-left font-mono text-[11px] max-h-36 overflow-auto space-y-1">
              <div className="text-red-400 font-bold">{this.state.error.name}: {this.state.error.message}</div>
              {this.state.error.stack && (
                <div className="text-slate-400 text-[10px] opacity-70 truncate">{this.state.error.stack.split('\n')[1]}</div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
