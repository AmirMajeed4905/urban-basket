"use client";
import { Bell, Search, X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const mockNotices = [
  {
    id: 1,
    type: "info",
    title: "Fee collection deadline",
    desc: "Monthly fee deadline is 10th of this month.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Attendance marked",
    desc: "Today's attendance has been successfully recorded.",
    time: "4 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "warning",
    title: "3 students absent",
    desc: "Ali, Sara, and Hamza were absent today.",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "Parent meeting scheduled",
    desc: "Meeting with parents on Friday at 10 AM.",
    time: "Yesterday",
    read: true,
  },
];

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const [showNotices, setShowNotices] = useState(false);
  const [notices, setNotices] = useState(mockNotices);
  const noticeRef = useRef<HTMLDivElement>(null);

  const unreadCount = notices.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (noticeRef.current && !noticeRef.current.contains(e.target as Node)) {
        setShowNotices(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotices((prev) => prev.map((n) => ({ ...n, read: true })));

  const iconMap = {
    info: <Info size={14} className="text-blue-500" />,
    success: <CheckCircle size={14} className="text-emerald-500" />,
    warning: <AlertCircle size={14} className="text-orange-500" />,
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold text-slate-800"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <Search size={15} className="text-slate-400" />
            <input
              placeholder="Quick search..."
              className="bg-transparent text-sm outline-none w-40 text-slate-600 placeholder:text-slate-400"
            />
          </div>

          {/* Bell / Notices */}
          <div className="relative" ref={noticeRef}>
            <button
              onClick={() => setShowNotices((p) => !p)}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Bell size={18} className="text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notices Dropdown */}
            {showNotices && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-slate-800 text-sm">Notices</p>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotices(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Notice List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 flex gap-3 transition-colors hover:bg-slate-50 cursor-pointer ${
                        !n.read ? "bg-blue-50/40" : ""
                      }`}
                      onClick={() =>
                        setNotices((prev) =>
                          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                        )
                      }
                    >
                      <div className="mt-0.5 shrink-0">
                        {iconMap[n.type as keyof typeof iconMap]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-semibold ${
                            !n.read ? "text-slate-800" : "text-slate-600"
                          }`}
                        >
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{n.desc}</p>
                        <p className="text-[10px] text-slate-300 mt-1">{n.time}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setShowNotices(false);
                      router.push("/notices");
                    }}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    View all notices →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar — clicks to /profile */}
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #1a56db, #0f2167)" }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-700">{greeting}!</p>
              <p className="text-xs text-slate-400">{user?.name}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}