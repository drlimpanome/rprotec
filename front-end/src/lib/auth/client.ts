'use client';

import { json } from 'stream/consumers';

import { ApiService } from '@/services/ApiServices';

import type { User } from '@/types/user';

const apiService = new ApiService();

interface AuthReturn {
  token: string;
  message?: string;
}

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

export interface SignUpParams {
  username: string;
  email: string;
  password: string;
  document: string;
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
  async signUp(data: SignUpParams): Promise<{ error?: string }> {
    // Make API request
    const response = await apiService.postApi<AuthReturn>('/auth/create', data);
    if (response.token) {
      const token = response.token;
      localStorage.setItem('custom-auth-token', token);
      return {};
    } else {
      return { error: response.message || 'Sign up failed' };
    }
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; token?: string }> {
    const { email, password } = params;
    const formData = new FormData();
    const apiService = new ApiService();

    formData.append('email', email);
    formData.append('password', password);

    try {
      // Replace this with your actual API endpoint
      const response = await apiService.postApi<AuthReturn>('/auth/login', {
        email,
        password,
      });

      // Handle response
      if (!response.token) {
        return { error: response.message || 'Login failed' };
      }

      // Assuming your API returns a token
      const token = response.token;

      // Store the token in localStorage
      localStorage.setItem('custom-auth-token', token);

      return { token };
    } catch (error: any) {
      return { error: error.response.data.message || 'An error occurred during login' };
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(tokenDefault?: string): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token') || tokenDefault;

    if (!token) {
      return { data: null };
    }

    try {
      const response = await apiService.getApi<User>('/client/profile');
      return { data: response };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { error: 'Failed to fetch user data' };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();
