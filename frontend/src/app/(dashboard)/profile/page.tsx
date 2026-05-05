"use client";

import { useAuthStore } from "@/store/authStore";
import Header from "@/components/layout/Header";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <>
      <Header title="Profile" subtitle="Manage your profile information" />

      <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
     

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
          
          {/* TOP SECTION */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            
            {/* AVATAR */}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #1a56db, #0f2167)",
              }}
            >
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            {/* INFO */}
            <div className="text-center md:text-left">
              <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                {user?.name || "User Name"}
              </h2>

              <p className="text-slate-500 text-sm break-all">
                {user?.email || "-"}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Role: {user?.role || "User"}
              </p>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="my-6 border-t border-slate-200" />

          {/* DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm font-medium text-slate-700 break-all">
                {user?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.phone || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Address</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.address || "Not set"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.role || "User"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Joined</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}