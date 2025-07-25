import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { XPayConfig, ErrorResponse } from './types';

/**
 * API Client for making authenticated requests to X-Pay API
 */
export class ApiClient {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  /**
   * Create a new API client instance
   * @param config - Configuration options
   */
  constructor(config: XPayConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl || 'https://api.x-pay.fun';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-TOKEN': this.apiKey,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      this.handleError.bind(this)
    );
  }

  /**
   * Handle API error responses
   * @param error - Axios error
   * @throws Enhanced error with API details
   */
  private handleError(error: any): never {
    if (error.response) {
      const { status, data } = error.response;
      const errorResponse = data as ErrorResponse;
      
      const enhancedError = new Error(
        `API Error ${status}: ${errorResponse.message || 'Unknown error'}`
      );
      
      Object.assign(enhancedError, {
        status,
        code: errorResponse.code,
        data: errorResponse.data,
      });
      
      throw enhancedError;
    }
    
    if (error.request) {
      throw new Error(`Network Error: No response received from API`);
    }
    
    throw error;
  }

  /**
   * Make a GET request to the API
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns API response
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(endpoint, { params });
    return response.data;
  }

  /**
   * Make a POST request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API response
   */
  async post<T>(endpoint: string, data: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(endpoint, data);
    return response.data;
  }

  /**
   * Make a PUT request to the API
   * @param endpoint - API endpoint
   * @param data - Request body
   * @returns API response
   */
  async put<T>(endpoint: string, data: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(endpoint, data);
    return response.data;
  }

  /**
   * Make a DELETE request to the API
   * @param endpoint - API endpoint
   * @param params - Query parameters
   * @returns API response
   */
  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(endpoint, { params });
    return response.data;
  }
}