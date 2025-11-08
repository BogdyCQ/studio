"use client";

import React, { createContext, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { Icons } from '@/components/icons';
import { FirebaseClientProvider, useUser } from '@/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Icons.logo className="h-16 w-16 animate-pulse text-primary/50" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading: isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <FirebaseClientProvider>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </FirebaseClientProvider>
  )
};
