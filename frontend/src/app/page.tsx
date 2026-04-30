"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const { hydrated, accessToken } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    if (accessToken) router.replace("/dashboard");
    else router.replace("/login");
  }, [hydrated, accessToken]);

  return null;
}