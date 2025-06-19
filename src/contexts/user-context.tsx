'use client';

import * as React from 'react';
import axios from 'axios';

import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  userInfo: any;
  error: string | null;
  isLoading: boolean;
  isIndustryFilled: boolean;
  checkSession: () => Promise<void>;
  fetchApiData: (uuid: string) => Promise<void>;
  updateUser: (firstName: string, lastName: string, uuid: string, language?: string) => Promise<void>;
  addIndustry: (name: string, dateOfBirth: any, uuid: string) => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);
export const UserConsumer = UserContext.Consumer;

export const userData = (): UserContextValue => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useTour must be used within a UserProvider');
  }
  return context;
};

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{
    user: User | null;
    userInfo: any;
    error: string | null;
    isLoading: boolean;
    isIndustryFilled: boolean;
  }>({
    user: null,
    userInfo: null,
    error: null,
    isLoading: true,
    isIndustryFilled: false,
  });

  // Callback: fetch additional API data
  const fetchApiData = React.useCallback(async (uuid: string) => {
    try {
      const response = await axios.get(`/api/userInfo?uuid=${uuid}`);
      console.log('API response data:', response.data);
      setState((prev) => ({ ...prev, userInfo: response.data.userData }));
    } catch (err: any) {
      logger.error('Error fetching API data:', err);
      // handle error state if needed
    }
  }, []);

  // Callback: add industry
  const addIndustry = React.useCallback(async (name: string, dateOfBirth: any, uuid: string) => {
    try {
      const response = await axios.post(`/api/Industry`, { industryName: name, dateOfBirth, uuid });
      console.log('API response data:', response.data);
    } catch (err: any) {
      logger.error('Error adding industry:', err);
    }
  }, []);

  // Callback: update user
  const updateUser = React.useCallback(async (firstName: string, lastName: string, uuid: string, language?: string) => {
    try {
      const response = await axios.post(`/api/userInfo`, { firstName, lastName, uuid, language });
      console.log('API response data:', response.data);
    } catch (err: any) {
      logger.error('Error updating user:', err);
    }
  }, []);

  // Callback: check session / get user
  const checkSession = React.useCallback(async () => {
    try {
      const { data, error } = await authClient.getUser();
      console.log('Fetched user data:', data);
      if (error) {
        logger.error(error);
        setState((prev) => ({ ...prev, user: null, error, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, user: data ?? null, error: null, isLoading: false }));
      }
    } catch (err: any) {
      logger.error('Error in checkSession:', err);
      setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
    }
  }, []);

  // Effect: hydrate on mount & subscribe to token changes
  React.useEffect(() => {
    // 1) initial hydration
    checkSession();

    // 2) listen for localStorage 'custom-auth-token' changes across tabs
    const storageKey = 'custom-auth-token';
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return;
      if (e.newValue) {
        // token added or changed
        checkSession();
      } else {
        // token removed
        setState((prev) => ({ ...prev, user: null }));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        user: state.user,
        userInfo: state.userInfo,
        error: state.error,
        isLoading: state.isLoading,
        isIndustryFilled: state.isIndustryFilled,
        checkSession,
        fetchApiData,
        updateUser,
        addIndustry,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}