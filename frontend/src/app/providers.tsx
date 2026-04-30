"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useAuthInit } from "@/hooks/useAuthInit";
import LoadingScreen from "./LoadingScreen";
export default function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);

  useAuthInit();

  if (!hydrated) {
     return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}