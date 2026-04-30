"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Check, Info, AlertTriangle, X } from "lucide-react";
import { Toast, addToastListener, addRemoveToastListener } from "@/hooks/useToast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const addListener = addToastListener((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    const removeListener = addRemoveToastListener((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      addListener();
      removeListener();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check size={18} className="text-emerald-500" />;
      case "error":
        return <AlertCircle size={18} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={18} className="text-amber-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto animate-in fade-in slide-in-from-right-4 ${getStyles(
            toast.type
          )}`}
        >
          {getIcon(toast.type)}
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:bg-black/10 rounded p-1 transition-all"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
