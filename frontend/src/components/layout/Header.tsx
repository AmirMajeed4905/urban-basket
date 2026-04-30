"use client";
import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps { title: string; subtitle?: string; }

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input placeholder="Quick search..." className="bg-transparent text-sm outline-none w-40 text-slate-600 placeholder:text-slate-400" />
          </div>
          <button className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Bell size={18} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #1a56db, #0f2167)" }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-700">{greeting}!</p>
              <p className="text-xs text-slate-400">{user?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
