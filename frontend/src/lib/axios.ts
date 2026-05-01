import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL:https://ems-xfaa.onrender.com/,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const state = useAuthStore.getState();

  // wait for zustand hydration
  if (!state.hydrated) return config;

  const token = state.accessToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let queue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${https://ems-xfaa.onrender.com/}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken;

        if (!newToken) throw new Error("No token");

        useAuthStore.getState().setAccessToken(newToken);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);

        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
