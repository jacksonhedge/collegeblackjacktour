import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

const LoadingSpinner = ({ size = "md", color = "white" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex justify-center">
      <div className={`animate-spin ${sizeClasses[size]}`}>
        <svg className={`text-${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
  );
};

const SignupLoadingScreen = ({ onComplete, onError }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading');

  const steps = [
    {
      id: 1,
      text: 'Loading platform images...',
      action: async () => {
        try {
          // Simulate image loading - replace with actual logic
          await new Promise(resolve => setTimeout(resolve, 1500));
          return true;
        } catch (error) {
          console.warn('Non-critical error loading images:', error);
          return true; // Continue anyway as this is non-critical
        }
      }
    },
    {
      id: 2,
      text: 'Creating your Sportsbook and Casino Bonuses Wallets...',
      action: async () => {
        // Simulate wallet creation - replace with actual logic
        await new Promise(resolve => setTimeout(resolve, 1500));
        return true;
      }
    }
  ];

  useEffect(() => {
    const processSteps = async () => {
      for (const step of steps) {
        setCurrentStep(step.id);
        try {
          const success = await step.action();
          if (!success) {
            throw new Error(`Failed at step ${step.id}`);
          }
        } catch (err) {
          setError(err.message);
          setStatus('error');
          onError?.(err);
          return;
        }
      }
      setStatus('complete');
      onComplete?.();
    };

    processSteps();
  }, [onComplete, onError]);

  const getCurrentStepText = () => {
    const step = steps.find(s => s.id === currentStep);
    return step ? step.text : '';
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900/90 z-50">
      <div className="max-w-md w-full mx-auto p-6">
        {status === 'error' ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'An error occurred during setup. Please try again.'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" color="white" />
            <div className="space-y-2">
              <p className="text-lg text-white font-medium animate-fade-in">
                {getCurrentStepText()}
              </p>
              <p className="text-sm text-gray-300">
                We're setting up your personalized experience
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full bg-gray-700 rounded-full h-1 mt-6">
              <div 
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentStep / steps.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupLoadingScreen;
