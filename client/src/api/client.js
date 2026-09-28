import axios from "axios";

/**
 * A request must never stay pending forever: without a timeout a hung endpoint
 * leaves the caller stuck in its loading state with no way to recover.
 */
export const API_TIMEOUT = 15000;

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: API_TIMEOUT,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/")) {
      window.dispatchEvent(new CustomEvent("nutrix:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;
