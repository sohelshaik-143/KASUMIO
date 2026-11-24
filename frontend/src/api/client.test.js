import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, { getBaseUrl, onServerWakeupChange, notifyWakeupStatus } from './client';

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
    storage['kasumio_api_url'] = 'https://kasumio.onrender.com';

    expect(getBaseUrl()).toBe('https://kasumio.onrender.com/api');
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

  it('should notify subscribers when server wakeup status transitions', () => {
    const listener = vi.fn();
    const unsubscribe = onServerWakeupChange(listener);

    notifyWakeupStatus(true, { attempt: 1, maxRetries: 3 });
    expect(listener).toHaveBeenCalledWith({ isWaking: true, attempt: 1, maxRetries: 3 });

    notifyWakeupStatus(false, { resolved: true });
    expect(listener).toHaveBeenCalledWith({ isWaking: false, resolved: true });

    unsubscribe();
    notifyWakeupStatus(true, { attempt: 2 });
    expect(listener).toHaveBeenCalledTimes(2);
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

  it('should not retry non-idempotent POST requests on cold start / 503', async () => {
    const postError = new Error('Service Unavailable');
    postError.response = { status: 503 };
    postError.config = { url: '/evidence', method: 'post' };

    const responseInterceptor = api.interceptors.response.handlers[0];
    await expect(responseInterceptor.rejected(postError)).rejects.toBe(postError);
    expect(postError.config.__retryCount).toBeUndefined();
  });
});
