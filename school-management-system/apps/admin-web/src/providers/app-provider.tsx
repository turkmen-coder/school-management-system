'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { AuthProvider } from './auth-provider';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}