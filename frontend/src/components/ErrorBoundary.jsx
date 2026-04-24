import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // TODO: Log to error tracking service (Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  render() {
    const isDev = import.meta.env.DEV;

    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900">
          <div className="max-w-md w-full mx-4">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-white text-center mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-300 text-center mb-6">
                We're sorry for the inconvenience. The application encountered
                an unexpected error.
              </p>

              {isDev && this.state.error && (
                <details className="mb-6 bg-gray-900/50 rounded p-4 text-sm">
                  <summary className="cursor-pointer text-red-400 font-semibold mb-2">
                    Error Details (Dev Mode)
                  </summary>
                  <pre className="text-gray-400 overflow-auto text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo &&
                      this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="flex-1 bg-[#ffa116] hover:bg-[#ff8f00] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Go Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
