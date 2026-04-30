"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const useAuthInit = () => {
  const hydrated = useAuthStore((s) => s.hydrated);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!hydrated) return;

    const init = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const token = res?.data?.data?.accessToken;

        if (token) {
          setAccessToken(token);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    };

    init();
  }, [hydrated]);
};