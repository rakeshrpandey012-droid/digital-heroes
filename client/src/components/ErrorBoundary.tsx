import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f7f4] p-8 dark:bg-[#0b110d] text-[#101b17] dark:text-[#e5eee4]">
          <div className="flex w-full max-w-md flex-col items-center p-8 rounded-2xl bg-white dark:bg-[#131d18] shadow-xl text-center border border-black/5 dark:border-white/10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 mb-6">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="font-display text-2xl font-semibold tracking-[-.04em] mb-3">
              We encountered a snag.
            </h2>
            <p className="text-sm leading-6 text-[#728078] dark:text-[#9ba6a0] mb-8">
              An unexpected error occurred in the Digital Heroes application. Please reload the page to continue.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="button-dark dark:bg-[#c0f18d] dark:text-black w-full justify-center flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
            
            {this.state.error?.stack && (
              <details className="mt-8 text-left w-full">
                <summary className="text-[11px] text-gray-500 cursor-pointer mb-2">View Error Details</summary>
                <div className="p-4 w-full rounded bg-gray-100 dark:bg-black/50 overflow-auto border border-gray-200 dark:border-white/5">
                  <pre className="text-[10px] text-gray-500 whitespace-pre-wrap font-mono">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
