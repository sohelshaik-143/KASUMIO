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
  let runtimeOverride = getStorageItem('kasumio_api_url');
  if (runtimeOverride && typeof runtimeOverride === 'string' && runtimeOverride.trim()) {
    let trimmed = runtimeOverride.trim().replace(/\/+$/, '');
    if (trimmed.includes('kasumio-backend.onrender.com')) {
      trimmed = trimmed.replace('kasumio-backend.onrender.com', 'kasumio.onrender.com');
      try { localStorage.setItem('kasumio_api_url', trimmed); } catch {}
    }
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  // 2. Check build-time environment variable
  let envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
    ? String(import.meta.env.VITE_API_BASE_URL).trim()
    : '';

  if (envUrl.includes('kasumio-backend.onrender.com')) {
    envUrl = envUrl.replace('kasumio-backend.onrender.com', 'kasumio.onrender.com');
  }

  if (!envUrl) return '/api';
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

// Cold-start wakeup status event emitter
const wakeupListeners = new Set();

/**
 * Subscribes to backend server wake-up state transitions
 * @param {Function} callback - ({ isWaking, attempt, maxRetries, resolved, error }) => void
 * @returns {Function} unsubscribe function
 */
export const onServerWakeupChange = (callback) => {
  wakeupListeners.add(callback);
  return () => {
    wakeupListeners.delete(callback);
  };
};

/**
 * Notifies all subscribers of cold start wake-up status
 */
export const notifyWakeupStatus = (isWaking, details = {}) => {
  wakeupListeners.forEach((cb) => {
    try {
      cb({ isWaking, ...details });
    } catch {
      // Ignore listener error
    }
  });
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000, // 60-second timeout to accommodate free-tier Render cold starts (30-50s)
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

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options', 'put', 'delete']);

// Response interceptor with bounded retries, wakeup broadcasting, and enhanced diagnostics
api.interceptors.response.use(
  (response) => {
    notifyWakeupStatus(false, { resolved: true });
    return response;
  },
  async (error) => {
    const config = error.config;
    const isColdStart = !error.response || [502, 503, 504].includes(error.response?.status);
    const method = (config?.method || 'get').toLowerCase();
    const isIdempotent = IDEMPOTENT_METHODS.has(method);

    // Auto-retry with backoff strictly for idempotent methods on server cold-start / network drop
    if (config && isColdStart && isIdempotent) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = config.__maxRetries || 3;

      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        notifyWakeupStatus(true, {
          attempt: config.__retryCount,
          maxRetries,
          url: config.url,
        });

        console.warn(`[KASUMIO API] Backend server waking up (Render free tier cold start). Retrying attempt ${config.__retryCount}/${maxRetries}...`);
        
        // Progressive backoff: 4s for first retry, 8s for second, 10s for third
        const retryDelays = [4000, 8000, 10000];
        const delay = retryDelays[config.__retryCount - 1] || 8000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    notifyWakeupStatus(false, { error: true });

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

      const helpfulMsg = 'Unable to connect to the server. Please check your connection and try again.';

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
 * @param {number} [timeoutMs=35000] - timeout duration in milliseconds
 * @returns {Promise<boolean>} true if backend is reachable and healthy
 */
export const checkBackendHealth = async (timeoutMs = 35000) => {
  try {
    const res = await api.get('/health', { timeout: timeoutMs });
    return res.data?.status === 'UP';
  } catch {
    return false;
  }
};

export default api;

