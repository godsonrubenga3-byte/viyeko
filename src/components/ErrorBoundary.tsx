import React, { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const errInfo = JSON.parse(this.state.error?.message || "{}");
        if (errInfo.error) {
          message = `Firestore Error: ${errInfo.error} (${errInfo.operationType} on ${errInfo.path})`;
        }
      } catch (e) {
        message = this.state.error?.message || message;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500" />
          <h2 className="text-xl font-bold">Application Error</h2>
          <p className="text-text-muted max-w-md">{message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-precision px-8"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
