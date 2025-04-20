import React, { createContext, useContext, ReactNode } from 'react';
import { ClerkProvider, useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

// Creating a context for authentication
interface AuthContextType {
  user: any;
  userId: string | null;
  isSignedIn: boolean | null;
  isLoaded: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Using the useUser hook from Clerk to get the signed in status and user data
  const { isSignedIn, user, isLoaded } = useUser();
  const { userId, signOut } = useClerkAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userId, 
      isSignedIn, 
      isLoaded, 
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Defining a custom hook that provides the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provide a default fallback if environment variable is missing
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 
  'pk_test_dGlkeS1jaGVldGFoLTg0LmNsZXJrLmFjY291bnRzLmRldiQ';

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  // Check if the key is properly set
  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    console.warn('Clerk publishable key is missing in env variables');
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
};

// Export Clerk's UserButton directly to avoid import issues
export { UserButton } from '@clerk/clerk-react';

// Add Clerk types to window
declare global {
  interface Window {
    Clerk?: {
      signOut: () => Promise<void>;
    };
  }
} 