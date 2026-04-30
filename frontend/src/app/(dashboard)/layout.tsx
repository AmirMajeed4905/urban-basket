"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "@/components/layout/Sidebar";
import ToastContainer from "@/components/shared/ToastContainer";
import toast from "react-hot-toast";
import { Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, accessToken, hydrated } = useAuthStore();

  const [open, setOpen] = useState(false);

  const isAuthenticated = !!user && !!accessToken;

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      setTimeout(() => {
        toast.error("Session expired. Please login again.");
        router.replace("/login");
      }, 100);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-blue-50">
      <ToastContainer />

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">

        {/* Top bar (mobile menu button) */}
        <div className="lg:hidden p-3 bg-blue-800 border-b flex items-center">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}