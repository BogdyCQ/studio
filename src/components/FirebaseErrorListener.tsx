'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * A client-side component that listens for Firestore permission errors
 * and displays them to the user using a toast notification. In a production
 * environment, you might want to log these errors to a monitoring service.
 *
 * This component is intended to be used within a layout or provider
 * that is rendered on all pages where Firestore is used.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error("Caught Firestore Permission Error:", error.message);
      
      // In a real application, you might want to log this to a service
      // like Sentry, LogRocket, etc.
      
      // For development, we'll show a descriptive toast.
      // In production, you might want to show a more generic error.
      if (process.env.NODE_ENV === 'development') {
        toast({
          variant: "destructive",
          title: "Firestore Permission Error",
          description: error.message,
          duration: 10000,
        });
        // This will show the Next.js error overlay in development
        throw error;
      }
    };

    errorEmitter.on('permission-error', handleError);

    // Clean up the listener when the component unmounts
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // This component does not render anything itself
  return null;
}
