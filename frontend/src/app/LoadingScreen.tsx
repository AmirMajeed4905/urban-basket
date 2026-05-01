"use client";

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#0f2167] via-[#1a3a8f] to-[#0f2167]">

      {/* Center Card */}
      <div className="flex flex-col items-center gap-6">

        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl animate-pulse">
            <span className="text-white font-bold text-xl">Education Management System ERP</span>
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-orange-400 blur-2xl opacity-30 animate-ping"></div>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-2 items-center">
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"></span>
        </div>

        {/* Text */}
        <p className="text-white/70 text-sm tracking-wider">
          Loading Education Management System ERP...
        </p>

      </div>
    </div>
  );
}