import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, { getBaseUrl } from './client';

describe('API Client Configuration', () => {
  let storage = {};

  beforeEach(() => {
    storage = {};
    const mockStorage = {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    };
    global.localStorage = mockStorage;
    if (typeof window !== 'undefined') {
      window.localStorage = mockStorage;
    }
  });

  it('should initialize with /api baseURL by default', () => {
    expect(getBaseUrl()).toBe('/api');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should dynamically adopt runtime localStorage override', () => {
    storage['kasumio_api_url'] = 'https://kasumio-backend.onrender.com';

    expect(getBaseUrl()).toBe('https://kasumio-backend.onrender.com/api');
  });

  it('should attach Authorization Bearer token when present in localStorage', async () => {
    storage['kasumio_token'] = 'test-jwt-token-12345';

    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const resolvedConfig = await interceptor.fulfilled(config);

    expect(resolvedConfig.headers.Authorization).toBe('Bearer test-jwt-token-12345');
  });

  it('should not attach Authorization header when no token is in localStorage', async () => {
    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const resolvedConfig = await interceptor.fulfilled(config);

    expect(resolvedConfig.headers.Authorization).toBeUndefined();
  });

  it('should enrich Network Error with actionable diagnostics in response interceptor', async () => {
    const networkError = new Error('Network Error');
    networkError.config = { url: '/auth/login', method: 'post', __retryCount: 2 };

    const responseInterceptor = api.interceptors.response.handlers[0];
    
    await expect(responseInterceptor.rejected(networkError)).rejects.toMatchObject({
      response: {
        data: {
          isNetworkError: true,
          status: 0,
        },
      },
    });
  });
});
