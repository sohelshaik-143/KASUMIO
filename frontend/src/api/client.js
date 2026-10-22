import axios from 'axios';

/**
 * Safely reads a key from localStorage across browser and test environments
 */
const getStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Resolves the API base URL with multi-tiered resolution:
 * 1. Runtime override in localStorage ('kasumio_api_url') - enables instant debugging/switching in browser
 * 2. Vite build-time environment variable (import.meta.env.VITE_API_BASE_URL)
 * 3. Default relative fallback ('/api') for local Vite dev proxy
 */
export const getBaseUrl = () => {
  // 1. Check runtime localStorage override first
  const runtimeOverride = getStorageItem('kasumio_api_url');
  if (runtimeOverride && typeof runtimeOverride === 'string' && runtimeOverride.trim()) {
    const trimmed = runtimeOverride.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // 2. Check build-time environment variable
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? String(import.meta.env.VITE_API_BASE_URL).trim()
    : '';

  if (!envUrl) return '/api';
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // 30-second timeout to accommodate free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present and sync dynamic baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();

  const token = getStorageItem('kasumio_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor with bounded retries and enhanced error messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Auto-retry once for idempotent requests or server cold-start responses (502, 503, 504, or network drops)
    if (config && (!error.response || [502, 503, 504].includes(error.response.status))) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = config.method === 'get' ? 2 : 1;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        console.warn(`[KASUMIO API] Connection dropped or server waking up. Retrying (${config.__retryCount}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return api(config);
      }
    }

    // 401 Unauthorized handling: clean up stored session and redirect if appropriate
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        try {
          localStorage.removeItem('kasumio_token');
          localStorage.removeItem('kasumio_user');
          window.location.href = '/login';
        } catch {
          // Ignore
        }
      }
    }

    // Network / Unreachable Server handling: enrich with actionable diagnostics
    if (!error.response) {
      const requestedUrl = config?.url ? `${config.baseURL || ''}${config.url}` : 'backend server';
      const isVercel = typeof window !== 'undefined' && window.location.hostname?.endsWith('vercel.app');
      const hasConfiguredBaseUrl = Boolean(
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
        getStorageItem('kasumio_api_url')
      );

      console.error(`[KASUMIO API Network Error] Failed to reach: ${requestedUrl}`);

      let helpfulMsg;
      if (isVercel && !hasConfiguredBaseUrl) {
        helpfulMsg = 'Backend URL is not configured on Vercel. Set VITE_API_BASE_URL in Vercel settings, or run localStorage.setItem("kasumio_api_url", "https://<your-render-url>") in console.';
      } else {
        helpfulMsg = 'Unable to connect to the backend server. If using a free-tier hosting instance (e.g., Render), the server may take up to 50 seconds to wake up from sleep. Please wait a moment and try again.';
      }

      error.message = helpfulMsg;
      error.response = {
        data: {
          message: helpfulMsg,
          isNetworkError: true,
          status: 0,
        },
        status: 0,
        statusText: 'Network Error',
      };
    }

    return Promise.reject(error);
  }
);

/**
 * Checks backend health probe
 * @returns {Promise<boolean>} true if backend is reachable and healthy
 */
export const checkBackendHealth = async () => {
  try {
    const res = await api.get('/health', { timeout: 10000 });
    return res.data?.status === 'UP';
  } catch {
    return false;
  }
};

export default api;
