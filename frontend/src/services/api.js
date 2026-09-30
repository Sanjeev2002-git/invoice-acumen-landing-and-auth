import axios from 'axios';
import { clearAuthState } from './authStorage';

const API_BASE_URL = 'http://localhost:8080/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  // Required so the browser attaches/receives the HttpOnly access_token and
  // refresh_token cookies on every request - without this, cookies are silently dropped.
  withCredentials: true,
});

let refreshPromise = null;

function redirectToLogin() {
  const { pathname, search, hash } = window.location;
  const returnTo = `${pathname}${search}${hash}`;
  const isAuthPage = ['/login', '/register'].includes(pathname);
  if (!isAuthPage) {
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }
}

async function refreshAccessToken() {
  // No body needed - the refresh_token cookie is sent automatically.
  await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        refreshPromise ||= refreshAccessToken();
        await refreshPromise;
        // The new access_token cookie is already set by the response above;
        // just replay the original request and the browser attaches it.
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthState();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    if (error.response?.status === 401) {
      clearAuthState();
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
// Add these functions to your existing frontend/src/services/api.js
// (assumes an `api` axios instance already configured with credentials: true
//  for the HttpOnly cookie auth)

export const getDashboardSummary = () => api.get("/dashboard/summary");

export const getExpiringProducts = () => api.get("/inventory/expiring");

export const getLowStockProducts = () => api.get("/inventory/low-stock");

export const runInventoryChecksNow = () => api.post("/inventory/run-checks");
