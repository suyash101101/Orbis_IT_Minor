import React, { useState, useEffect } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import SignInForm from './SignInForm';

const SignIn = () => {
  const [useCustomForm, setUseCustomForm] = useState(false);
  const [clerkError, setClerkError] = useState(false);

  // Check if Clerk key is available
  const hasClerkKey = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Add error handler for Clerk
  useEffect(() => {
    const handleClerkError = () => {
      setClerkError(true);
    };

    window.addEventListener('clerk-error', handleClerkError);

    // Set a timeout to check if Clerk has loaded
    const timeoutId = setTimeout(() => {
      if (!document.querySelector('[data-clerk-loaded="true"]')) {
        setClerkError(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('clerk-error', handleClerkError);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="max-w-md w-full p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In to LinkHub</h1>
        
        {!hasClerkKey || clerkError || useCustomForm ? (
          <>
            <SignInForm />
            
            {hasClerkKey && !clerkError && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setUseCustomForm(false)}
                  className="text-primary text-sm underline"
                >
                  Try using Clerk authentication instead
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-card shadow-md rounded-lg p-8">
              <ClerkSignIn />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Having trouble signing in?</p>
              <button 
                onClick={() => setUseCustomForm(true)}
                className="text-primary text-sm underline"
              >
                Use email/password instead
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Add custom event type for Clerk errors
declare global {
  interface WindowEventMap {
    'clerk-error': CustomEvent;
  }
}

export default SignIn; 