// src/lib/api/client.ts
import axios from 'axios';
import { browser, dev } from '$app/environment';
import { env } from '$env/dynamic/public';

/**
 * Build a clean API base:
 * - DEV: use '/api' so your Vite/SvelteKit proxy can handle it
 * - PROD: use PUBLIC_API_URL and ensure it ends with a single '/api'
 *
 * Examples:
 *  PUBLIC_API_URL = https://dsp-backend-three.vercel.app           -> https://dsp-backend-three.vercel.app/api
 *  PUBLIC_API_URL = https://dsp-backend-three.vercel.app/          -> https://dsp-backend-three.vercel.app/api
 *  PUBLIC_API_URL = https://dsp-backend-three.vercel.app/api       -> https://dsp-backend-three.vercel.app/api
 *  PUBLIC_API_URL = https://dsp-backend-three.vercel.app/api/      -> https://dsp-backend-three.vercel.app/api
 */
function buildBase() {
  if (dev) return '/api/proxy';
  const raw = (env.PUBLIC_API_URL || '').trim();
  const noTrail = raw.replace(/\/+$/, ''); // strip trailing slash(es)
  return /\/api$/i.test(noTrail) ? `${noTrail}/proxy` : `${noTrail}/api/proxy`;
}

/**
 * Normalize endpoint paths so callers can safely pass:
 *  '/auth/signup', 'auth/signup', or even '/api/auth/signup'
 * We remove any leading slashes and strip an accidental 'api/' prefix.
 */
function normalizeEndpoint(endpoint: string) {
  let e = (endpoint || '').trim();
  e = e.replace(/^\/+/, '');     // remove leading '/'
  e = e.replace(/^api\/+/, '');  // prevent double '/api'
  return `/${e}`;
}

export const API_BASE_URL = buildBase();

/** Detect Safari (for your cookie handling logic) */
const isSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && /Version\/[\d.]+.*Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua);
};

// For cross-origin checks in Safari
const isSafariCrossOrigin = isSafari() && !API_BASE_URL.includes('localhost');

/** Create a configured axios instance */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: !isSafari(), // your existing rule: send cookies unless Safari
  headers: { 'Content-Type': 'application/json' }
});

// ---- Request interceptor (token from localStorage) ----
apiClient.interceptors.request.use(
  (config) => {
    if (browser) {
      const token = localStorage.getItem('token');
      // Debug (optional): console.log('Request URL:', config.baseURL, config.url);
      if (token) {
        (config.headers ||= {})['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response interceptor (token refresh logic) ----
apiClient.interceptors.response.use(
  (response) => {
    // Handle Safari auth responses and fallback auth
    const authData =
      response.data?.data?.safariAuth ||
      response.data?.data?.fallbackAuth ||
      response.data?.safariAuth ||
      response.data?.fallbackAuth;

    if (browser && authData) {
      if (authData.clearTokens) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      } else {
        const { accessToken, refreshToken } = authData;
        if (accessToken) localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest: any = error.config;

    // Debug (optional):
    // console.log('API Error:', error.response?.status, error.message);
    // console.log('Error URL:', originalRequest?.url);

    // Attempt refresh on 401 (once)
    if (error.response?.status === 401 && !originalRequest?._retry && browser) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // For Safari cross-origin, avoid withCredentials; pass token via query
          const refreshUrl = `${API_BASE_URL}/auth/verify?refresh_token=${encodeURIComponent(refreshToken)}`;
          const refreshResponse = await axios.get(refreshUrl, {
            withCredentials: !isSafariCrossOrigin
          });

          const authData =
            refreshResponse.data?.safariAuth ||
            refreshResponse.data?.fallbackAuth ||
            refreshResponse.data?.session;

          const newAccessToken = authData?.accessToken;
          const newRefreshToken = authData?.refreshToken;

          if (!newAccessToken) {
            // No new token: force re-auth
            window.location.href = '/login';
            return Promise.reject(error);
          }

          // Persist tokens
          localStorage.setItem('token', newAccessToken);
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with fresh token
          originalRequest.headers ||= {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed: clear and let app route to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
      // No refresh token available — fall through
    }

    return Promise.reject(error);
  }
);

/**
 * apiFetch — tiny wrapper that:
 *  - Normalizes the endpoint (no accidental '/api/api')
 *  - Uses axios instance with baseURL (which already has a single '/api')
 *  - Mirrors the fetch() style options you were using
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = normalizeEndpoint(endpoint);

  try {
    if (method === 'GET') {
      const res = await apiClient.get(url);
      return res.data;
    }

    const body = options.body ? JSON.parse(options.body as string) : {};
    if (method === 'POST') {
      const res = await apiClient.post(url, body);
      return res.data;
    }
    if (method === 'PUT') {
      const res = await apiClient.put(url, body);
      return res.data;
    }
    if (method === 'PATCH') {
      const res = await apiClient.patch(url, body);
      return res.data;
    }
    if (method === 'DELETE') {
      const res = await apiClient.delete(url);
      return res.data;
    }

    throw new Error(`Unsupported method: ${method}`);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      throw new Error(err.response.data?.message || 'API request failed');
    }
    throw err;
  }
}
