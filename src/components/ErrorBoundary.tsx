import React, { Component, ReactNode } from 'react';
import { AlertCircle, Phone, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-8 text-center space-y-8 font-sans">
          <div className="space-y-4">
            <div className="bg-rose-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">System Interrupted</h2>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              VIYEKO encountered a technical error, but your safety remains our priority.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            {/* Critical Path: 112 Button remains clickable even on error */}
            <a 
              href="tel:112" 
              className="flex items-center justify-center gap-3 w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-900/20 transition-all active:scale-95"
            >
              <Phone size={20} />
              Call 112 Emergency
            </a>

            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 w-full bg-subtle border border-subtle text-slate-300 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:opacity-80 transition-all"
            >
              <RefreshCw size={20} />
              Restart Application
            </button>
          </div>

          <div className="pt-8 opacity-20">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              Viyeko Emergency Recovery Mode
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
