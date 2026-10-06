import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from './client';

describe('API Client Configuration', () => {
  beforeEach(() => {
    // Clear mock storage
    const storage = {};
    global.localStorage = {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => { storage[key] = value; }),
      removeItem: vi.fn((key) => { delete storage[key]; }),
    };
  });

  it('should initialize with /api baseURL', () => {
    expect(api.defaults.baseURL).toBe('/api');
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach Authorization Bearer token when present in localStorage', async () => {
    global.localStorage.getItem.mockReturnValue('test-jwt-token-12345');

    const config = { headers: {} };
    // Trigger request interceptor
    const interceptor = api.interceptors.request.handlers[0];
    const resolvedConfig = await interceptor.fulfilled(config);

    expect(resolvedConfig.headers.Authorization).toBe('Bearer test-jwt-token-12345');
  });

  it('should not attach Authorization header when no token is in localStorage', async () => {
    global.localStorage.getItem.mockReturnValue(null);

    const config = { headers: {} };
    const interceptor = api.interceptors.request.handlers[0];
    const resolvedConfig = await interceptor.fulfilled(config);

    expect(resolvedConfig.headers.Authorization).toBeUndefined();
  });
});
