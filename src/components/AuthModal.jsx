import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AuthModal({ isOpen, onClose }) {
  const { signInWithGoogle, error, setError } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Clear error when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen, setError]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-base bg-opacity-80 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-slate-mist rounded-2xl shadow-dark-lg w-full max-w-md p-8 md:p-12 relative animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-carbon-base hover:text-mint-pulse transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse rounded"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <svg
            className="w-12 h-12 md:w-16 md:h-16 text-mint-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-1.13-6-5.16-6-8.5V8.3l6-3.11 6 3.11v3.2c0 3.34-2.14 7.37-6 8.5z"/>
            <path d="M12 11.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V8.3L12 5.19 19 8.3V12h-7v-.01z" opacity="0.3"/>
          </svg>
        </div>

        {/* Headline */}
        <h2
          id="auth-modal-title"
          className="text-2xl md:text-3xl font-bold text-carbon-base text-center mb-3"
        >
          Welcome to AnoniReview
        </h2>

        {/* Subtext */}
        <p className="text-carbon-base text-opacity-70 text-center mb-8">
          Sign in to post projects and leave reviews
        </p>

        {/* Error message */}
        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
            role="alert"
            aria-live="polite"
          >
            <p className="font-semibold">Authentication failed</p>
            <p>{error}</p>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white text-carbon-base border border-carbon-base border-opacity-20 rounded-lg h-12 hover:shadow-dark transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-pulse"
          aria-label="Continue with Google"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-mint-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Signing in...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Privacy note */}
        <p className="mt-6 text-xs text-carbon-base text-opacity-60 text-center">
          By signing in, you agree to our anonymous review policy. Your identity will never be revealed when leaving reviews.
        </p>
      </div>
    </div>
  );
}
