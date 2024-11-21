'use client';

import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatarsss.png',
  firstName: 'Woortec',
  lastName: '',
  email: 'dev@woortec.com',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Generate a random token and store it in localStorage
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;

    // Check credentials (mocked for now)
    if (email !== 'sofia@devias.io' || password !== 'Secret1') {
      return { error: 'Invalid credentials' };
    }

    // Generate a token and store it in localStorage
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update password not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    try {
      // First, check the custom token in localStorage
      const tokenKey = 'sb-uvhvgcrczfdfvoujarga-auth-token';
      const storedToken = localStorage.getItem(tokenKey);

      if (!storedToken) {
        console.error('No auth token found in localStorage.');
        return { data: null };
      }

      // Parse the token and extract the user information
      const parsedToken = JSON.parse(storedToken);
      const user = parsedToken?.user;

      if (!user) {
        console.error('No user information found in the token.');
        return { data: null };
      }

      console.log('Fetched user data:', user);
      return { data: user }; // Return the user data
    } catch (error) {
      console.error('Error parsing the stored token:', error);
      return { data: null };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    // Remove both the custom and Supabase tokens from localStorage
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('sb-uvhvgcrczfdfvoujarga-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
