'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: (token?: string) => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const pathname = usePathname();
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (token?: string): Promise<void> => {
    try {
      if (pathname == '/auth/sign-in' && token === null) {
        setState({ user: null, error: null, isLoading: false });
        return;
      }
      const { data, error } = await authClient.getUser(token);

      if (error) {
        logger.error(error);
        setState({ user: null, error: 'Something went wrong', isLoading: false });
        return;
      }

      setState({ user: data ?? null, error: null, isLoading: false });
    } catch (err) {
      logger.error(err);
      setState({ user: null, error: 'Something went wrong', isLoading: false });
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
    });
  }, [checkSession]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({ ...state, checkSession }), [state, checkSession]);

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;
