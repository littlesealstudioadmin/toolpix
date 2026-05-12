import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ToolPix crashed", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              Please refresh the page and try again.
            </p>
            <button
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background active:scale-[0.98]"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
