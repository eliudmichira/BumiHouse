import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    
    // Add global error handlers
    this.setupGlobalErrorHandlers();
  }
  
  setupGlobalErrorHandlers = () => {
    // Store references to event handlers for cleanup
    this.handleGlobalError = (event) => {
      console.error('🚨 Global Error:', event.error);
      this.logError(event.error, 'Global Error');
    };
    
    this.handleUnhandledRejection = (event) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
      this.logError(event.reason, 'Unhandled Promise Rejection');
    };
    
    // Add event listeners
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }
  
  logError = (error, source) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      source: source,
      error: {
        message: error?.message || String(error),
        stack: error?.stack,
        name: error?.name || 'Unknown'
      }
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging
    console.error('🚨 Error caught by boundary:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Error Stack:', error.stack);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
    console.error('🚨 Current URL:', window.location.href);
    console.error('🚨 User Agent:', navigator.userAgent);
    console.error('🚨 Timestamp:', new Date().toISOString());
    
    // Log to localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      }
    };
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  viewErrorLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      console.log('📋 Error Logs:', logs);
      alert(`Found ${logs.length} error logs. Check console for details.`);
    } catch (e) {
      console.error('Failed to read error logs:', e);
      alert('No error logs found or failed to read logs.');
    }
  }
  
  componentWillUnmount() {
    // Clean up event listeners
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0c19] text-white p-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              {this.state.error && (
                <div className="text-sm text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-[#51faaa] text-[#0a0c19] font-semibold rounded-xl hover:bg-[#dbd5a4] transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => this.viewErrorLogs()}
                className="w-full px-6 py-3 border border-blue-600 text-blue-300 font-semibold rounded-xl hover:bg-blue-800 transition-colors"
              >
                View Error Logs
              </button>
            </div>

            {this.state.error && (
              <details className="text-left bg-gray-800 rounded-lg p-4 mt-6">
                <summary className="cursor-pointer text-sm font-medium text-gray-300 mb-2">
                  Error Details {process.env.NODE_ENV === 'development' ? '(Development)' : '(Debug Info)'}
                </summary>
                <div className="space-y-3">
                  <div>
                    <strong className="text-red-400">Error Message:</strong>
                    <pre className="text-xs text-red-400 overflow-auto mt-1">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-yellow-400">Stack Trace:</strong>
                      <pre className="text-xs text-yellow-400 overflow-auto mt-1 max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <div>
                      <strong className="text-blue-400">Component Stack:</strong>
                      <pre className="text-xs text-blue-400 overflow-auto mt-1 max-h-32">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400">
                    <strong>URL:</strong> {window.location.href}<br />
                    <strong>Time:</strong> {new Date().toLocaleString()}
                  </div>
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
