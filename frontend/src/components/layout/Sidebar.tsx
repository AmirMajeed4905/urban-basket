"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, UserCheck,
  BookOpen, Bell, DollarSign, Settings, LogOut, School, X
} from "lucide-react";
import api from "@/lib/axios";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/students", icon: GraduationCap, label: "Students" },
  { href: "/classes", icon: BookOpen, label: "Classes" },
  { href: "/staff", icon: Users, label: "Staff" },
  { href: "/attendance", icon: UserCheck, label: "Attendance" },
  { href: "/fees", icon: DollarSign, label: "Fee Management" },
  { href: "/notices", icon: Bell, label: "Notices" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 flex flex-col z-50 transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          background:
            "linear-gradient(180deg, #0f2167 0%, #1a3a8f 60%, #0f2167 100%)",
        }}
      >
        {/* Top */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500">
              <School size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                BEST ERP
              </p>
              <p className="text-white/50 text-xs">School System</p>
            </div>
          </div>

          {/* close button (mobile) */}
          <button
            className="lg:hidden text-white"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href || pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}