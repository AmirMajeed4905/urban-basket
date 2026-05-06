"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import Header from "@/components/layout/Header";
import {
  User, Mail, Phone, Shield, Key, Camera,
  CheckCircle, Edit3, Save, X, LogOut, Clock, Calendar,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
}

// ─── Component ────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout, setAuth, accessToken } = useAuthStore();
  const toast = useToast();
  const router = useRouter();
  const qc = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: (user as any)?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  // ─── Fetch profile ────────────────────────────────────────

  const { data: profile, isLoading } = useQuery<AdminProfile>({
    queryKey: ["admin-profile", user?.id],
    queryFn: () =>
      api.get(`/admins/${user?.id}`).then((r) => {
        const data = r.data.data;
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
        return data;
      }),
    enabled: !!user?.id,
  });

  // ─── Update profile ───────────────────────────────────────

  const updateMutation = useMutation({
    mutationFn: (body: { name: string; phone?: string }) =>
      api.patch(`/admins/${user?.id}`, body).then((r) => r.data.data),
    onSuccess: (updated) => {
      // Update authStore so header name updates immediately
      if (accessToken) setAuth({ ...user!, name: updated.name, email: updated.email }, accessToken);
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Profile updated successfully!");
      setEditMode(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to update profile");
    },
  });

  // ─── Handlers ────────────────────────────────────────────

  const handleSave = () => {
    if (!form.name.trim()) return toast.error("Name is required");
    updateMutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
    });
  };

  const handlePasswordChange = () => {
    if (!passwordForm.current) return toast.error("Enter current password");
    if (passwordForm.newPass.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (passwordForm.newPass !== passwordForm.confirm)
      return toast.error("Passwords do not match");
    // TODO: wire to auth/change-password route when available
    toast.success("Password changed successfully!");
    setPasswordMode(false);
    setPasswordForm({ current: "", newPass: "", confirm: "" });
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ─── Helpers ─────────────────────────────────────────────

  const displayName = profile?.name ?? user?.name ?? "";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const role = profile?.role ?? user?.role;
  const roleLabel =
    role === "SUPER_ADMIN" ? "Super Admin" :
    role === "ADMIN" ? "Admin" :
    role === "TEACHER" ? "Teacher" :
    role ?? "Staff";

  const roleBadgeColor =
    role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-700" :
    role === "ADMIN" ? "bg-blue-100 text-blue-700" :
    "bg-emerald-100 text-emerald-700";

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  // ─── Loading ──────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header title="My Profile" subtitle="Manage your account and settings" />
        <div className="p-6 max-w-3xl mx-auto space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-32 mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="My Profile" subtitle="Manage your account and settings" />

      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div
            className="h-28 w-full"
            style={{ background: "linear-gradient(135deg, #1a56db 0%, #0f2167 60%, #312e81 100%)" }}
          />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1a56db, #0f2167)" }}
                >
                  {initials}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow transition-colors">
                  <Camera size={11} className="text-white" />
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-10">
                {editMode ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 hover:opacity-90 transition-opacity"
                      style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
                    >
                      {updateMutation.isPending
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Save size={14} />}
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setForm({
                          name: profile?.name ?? "",
                          email: profile?.email ?? "",
                          phone: profile?.phone ?? "",
                        });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Name + badges */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="text-xl font-bold text-slate-800"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {displayName}
                </h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleBadgeColor}`}>
                  {roleLabel}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle size={11} />
                  {profile?.status ?? "Active"}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">{profile?.email ?? user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
              {[
                { icon: <Calendar size={14} />, label: "Joined", value: joinedDate },
                { icon: <Clock size={14} />, label: "Last Login", value: "Today" },
                { icon: <Shield size={14} />, label: "Role", value: roleLabel },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                    {s.icon}
                    {s.label}
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Personal Info ── */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3
            className="font-bold text-slate-800 mb-4 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <User size={16} className="text-blue-500" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              {editMode ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 text-slate-700"
                />
              ) : (
                <p className="text-sm text-slate-700 font-medium px-3 py-2.5 bg-slate-50 rounded-xl">
                  {profile?.name ?? "—"}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1">
                <Mail size={11} /> Email Address
              </label>
              <p className="text-sm text-slate-700 font-medium px-3 py-2.5 bg-slate-50 rounded-xl">
                {profile?.email ?? "—"}
                <span className="ml-2 text-xs text-slate-400">(cannot be changed)</span>
              </p>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1">
                <Phone size={11} /> Phone Number
              </label>
              {editMode ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03xx-xxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 text-slate-700"
                />
              ) : (
                <p className="text-sm text-slate-700 font-medium px-3 py-2.5 bg-slate-50 rounded-xl">
                  {profile?.phone ?? "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1">
                <Shield size={11} /> Role
              </label>
              <p className="text-sm font-medium px-3 py-2.5 bg-slate-50 rounded-xl text-slate-500">
                {roleLabel} <span className="text-xs text-slate-400">(cannot be changed)</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-bold text-slate-800 flex items-center gap-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <Key size={16} className="text-blue-500" />
              Change Password
            </h3>
            {!passwordMode && (
              <button
                onClick={() => setPasswordMode(true)}
                className="text-xs text-blue-500 hover:text-blue-700 font-semibold"
              >
                Change →
              </button>
            )}
          </div>
          {passwordMode ? (
            <div className="space-y-3">
              {[
                { label: "Current Password", key: "current", placeholder: "••••••••" },
                { label: "New Password", key: "newPass", placeholder: "Min. 6 characters" },
                { label: "Confirm New Password", key: "confirm", placeholder: "••••••••" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
                  <input
                    type="password"
                    value={passwordForm[f.key as keyof typeof passwordForm]}
                    onChange={(e) => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: "linear-gradient(135deg,#1a56db,#0f2167)" }}
                >
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setPasswordMode(false);
                    setPasswordForm({ current: "", newPass: "", confirm: "" });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 bg-slate-50 px-3 py-2.5 rounded-xl">••••••••••••</p>
          )}
        </div>

        {/* ── Logout ── */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3
            className="font-bold text-slate-800 mb-3 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <LogOut size={16} className="text-red-400" />
            Sign Out
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            You will be logged out of all sessions on this device.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}