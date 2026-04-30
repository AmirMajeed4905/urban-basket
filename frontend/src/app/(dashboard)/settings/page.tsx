"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/authStore";
import { Plus, Shield, Trash2, ToggleRight, ToggleLeft, KeyRound } from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [tab, setTab] = useState<"admins" | "password">("admins");
  const [showForm, setShowForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: () => api.get("/admins").then((r) => r.data.data),
    enabled: isSuperAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/admins", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admins"] }); setShowForm(false); setAdminForm({ name: "", email: "", password: "", phone: "" }); },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admins/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admins/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admins"] }),
  });

  const changePwMutation = useMutation({
    mutationFn: (d: any) => api.patch("/auth/change-password", d),
    onSuccess: () => { alert("Password changed! Please login again."); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); },
  });

  return (
    <div>
      <Header title="Settings" subtitle="Manage admins and account settings" />
      <div className="p-6 space-y-5">

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {isSuperAdmin && (
            <button onClick={() => setTab("admins")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "admins" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              Manage Admins
            </button>
          )}
          <button onClick={() => setTab("password")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "password" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
            Change Password
          </button>
        </div>

        {tab === "admins" && isSuperAdmin && (
          <div className="space-y-4">
            {showForm && (
              <div className="bg-white rounded-2xl shadow-card p-6 animate-in">
                <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>Create Admin</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["name","Full Name","Ali Hassan"],["email","Email","ali@school.com"],["password","Password","Min 8 chars"],["phone","Phone","03001234567"]].map(([k,l,p]) => (
                    <div key={k}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                      <input type={k === "password" ? "password" : "text"} value={(adminForm as any)[k]}
                        placeholder={p} onChange={(e) => setAdminForm({ ...adminForm, [k]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => createMutation.mutate(adminForm)} disabled={createMutation.isPending}
                    className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                    {createMutation.isPending ? "Creating..." : "Create Admin"}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
                </div>
                {createMutation.isError && <p className="text-red-500 text-xs mt-2">{(createMutation.error as any)?.response?.data?.message}</p>}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Admin Users</h3>
                </div>
                <button onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                  <Plus size={15} /> Add Admin
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 animate-pulse flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full" />
                    <div className="flex-1"><div className="h-4 bg-slate-100 rounded w-32 mb-1" /><div className="h-3 bg-slate-100 rounded w-48" /></div>
                  </div>
                )) : data?.admins?.map((admin: any) => (
                  <div key={admin.id} className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                        {admin.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{admin.name}</p>
                        <p className="text-slate-400 text-xs">{admin.email} · Joined {formatDate(admin.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${admin.isActive ? "badge-success" : "badge-danger"}`}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </span>
                      <button onClick={() => toggleMutation.mutate(admin.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                        {admin.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => { if (confirm("Delete admin?")) deleteMutation.mutate(admin.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "password" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#1a56db18,#1e3a8a18)" }}>
                <KeyRound size={18} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Change Password</h3>
            </div>
            <div className="space-y-4">
              {[["currentPassword","Current Password"],["newPassword","New Password"],["confirmPassword","Confirm Password"]].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input type="password" value={(pwForm as any)[k]} onChange={(e) => setPwForm({ ...pwForm, [k]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
              ))}
              <button onClick={() => changePwMutation.mutate(pwForm)} disabled={changePwMutation.isPending}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                {changePwMutation.isPending ? "Changing..." : "Change Password"}
              </button>
              {changePwMutation.isError && <p className="text-red-500 text-xs">{(changePwMutation.error as any)?.response?.data?.message}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
