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
  updateUser: (firstName:string,lastName:string,uuid: string) => Promise<void>;
  addIndustry: (name: string, dateOfBirth: any, uuid: string) => Promise<void>; // Ensure checkSession is part of the context
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export const userData = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
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
    error: null,
    isLoading: true,
    isIndustryFilled: false,
    userInfo: null,
  });

  const fetchApiData = React.useCallback(async (uuid: string): Promise<void> => {
    setState((prev) => ({ ...prev, apiLoading: true, apiError: null }));

    try {
      const response = await axios.get(`/api/userInfo?uuid=${uuid}`); // Replace with your API endpoint

      console.log('API response data:', response.data); // Debugging: Check the fetched data in console

      setState((prev) => ({
        ...prev,
        userInfo: response.data.userData,
      }));
    } catch (error: any) {
      logger.error('Error fetching API data:', error); // Log the error

      // Determine error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch API data';

      setState((prev) => ({
        ...prev,
        apiData: null,
        apiError: errorMessage,
        apiLoading: false,
      }));
    }
  }, []);

  const addIndustry = React.useCallback(async (name: any, dateOfBirth: any, uuid: string): Promise<void> => {
    setState((prev) => ({ ...prev, apiLoading: true, apiError: null }));

    try {
      const response = await axios.post(`/api/Industry`, {
        industryName: name,
        dateOfBirth: dateOfBirth,
        uuid: uuid,
      }); // Replace with your API endpoint

      console.log('API response data:', response.data); // Debugging: Check the fetched data in console

      setState((prev) => ({
        ...prev,
      }));
    } catch (error: any) {
      logger.error('Error fetching API data:', error); // Log the error

      // Determine error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch API data';

      setState((prev) => ({
        ...prev,
        apiData: null,
        apiError: errorMessage,
        apiLoading: false,
      }));
    }
  }, []);

  const updateUser = React.useCallback(async (firstName: any, lastName: any, uuid: string): Promise<void> => {
    setState((prev) => ({ ...prev, apiLoading: true, apiError: null }));

    try {
      const response = await axios.post(`/api/userInfo`, {
        firstName,
        lastName,
        uuid,
      });

      console.log('API response data:', response.data); // Debugging: Check the fetched data in console

      setState((prev) => ({
        ...prev,
      }));
    } catch (error: any) {
      logger.error('Error fetching API data:', error); // Log the error

      // Determine error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch API data';

      setState((prev) => ({
        ...prev,
        apiData: null,
        apiError: errorMessage,
        apiLoading: false,
      }));
    }
  }, []);

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await authClient.getUser(); // Fetch the user session from your authClient

      console.log('Fetched user data:', data); // Debugging: Check the fetched data in console

      if (error) {
        logger.error(error); // Log the error if any
        setState((prev) => ({ ...prev, user: null, error: 'Something went wrong', isLoading: false }));
        return;
      }

      setState((prev) => ({
        ...prev,
        user: data ?? null,
        error: null,
        isLoading: false,
      }));
    } catch (err) {
      logger.error(err); // Catch and log any unexpected errors
      setState((prev) => ({
        ...prev,
        user: null,
        error: 'Something went wrong',
        isLoading: false,
      }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err) => {
      logger.error('Error in checkSession:', err); // Catch any errors that occur during initial session check
    });
  }, [checkSession]);

  return (
    <UserContext.Provider value={{ ...state, checkSession, fetchApiData, addIndustry, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserConsumer = UserContext.Consumer;