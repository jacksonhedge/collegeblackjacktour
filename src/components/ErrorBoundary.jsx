import React from 'react';
// Removed Link import - using window.location instead to avoid Router context issues
import { AlertCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { errorContext } from '../utils/errorContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Record error for AI chat context
    errorContext.recordError(error, errorInfo, {
      component: errorInfo?.componentStack?.split('\n')[1]?.trim() || 'Unknown'
    });
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center space-y-6 border border-white/20">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-white/80">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-black/40 rounded-lg p-4 text-left">
                <p className="text-red-300 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <button
              onClick={() => {
                // Store error info and redirect to home with chat open
                sessionStorage.setItem('open_ai_chat_on_load', 'true');
                sessionStorage.setItem('ai_chat_initial_message', 'I just encountered an error and need help');
                window.location.href = '/';
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Get Help from AI Assistant
            </button>

            <p className="text-sm text-white/60">
              If this problem persists, please contact support at{' '}
              <a href="mailto:support@bankroll.live" className="text-purple-300 hover:text-purple-200 underline">
                support@bankroll.live
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;