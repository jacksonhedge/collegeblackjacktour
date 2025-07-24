import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          throw new Error('Invalid unsubscribe link');
        }

        const functions = getFunctions();
        const handleUnsubscribe = httpsCallable(functions, 'handleUnsubscribe');
        
        await handleUnsubscribe({ token });
        setStatus('success');
      } catch (err: any) {
        console.error('Error unsubscribing:', err);
        setError(err.message || 'Failed to unsubscribe');
        setStatus('error');
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="flex flex-col items-center">
          <img 
            src="/images/BankrollLogoTransparent.png" 
            alt="Bankroll Logo" 
            className="h-12 w-auto mb-6"
          />
          
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Request</h2>
              <p className="text-gray-600 text-center">
                Please wait while we update your email preferences...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <svg 
                  className="h-6 w-6 text-green-600" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Unsubscribed</h2>
              <p className="text-gray-600 text-center">
                Your email preferences have been updated. You can always manage your notification settings in your profile.
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="rounded-full bg-red-100 p-3 mb-4">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Updating Preferences</h2>
              <p className="text-gray-600 text-center">
                {error}. Please try again or contact support if the problem persists.
              </p>
            </>
          )}

          <a 
            href="/"
            className="mt-6 text-sm text-blue-600 hover:text-blue-800"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
