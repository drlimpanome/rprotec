import axios, { AxiosResponse } from 'axios';

export class ApiService {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom-auth-token');
    }
    return null;
  }

  public async getApi<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: params,
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async postApi<T>(endpoint: string, data?: Record<string, any> | FormData): Promise<T> {
    try {
      let response: AxiosResponse<T>;
      if (data instanceof FormData) {
        response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
      } else {
        response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
      }
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async putApi<T>(endpoint: string, data?: Record<string, any> | FormData): Promise<T> {
    try {
      let response: AxiosResponse<T>;
      if (data instanceof FormData) {
        response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
      } else {
        response = await axios.put(`${this.baseUrl}${endpoint}`, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
      }
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleResponse<T>(response: AxiosResponse<T>): T {
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 403 && error.response.data.message === 'Token inválido ou expirado.') {
          localStorage.removeItem('custom-auth-token');
          window.location.href = '/auth/sign-in';
        }
      } else if (error.request) {
        console.error('No response received from the server:', error.request);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}
