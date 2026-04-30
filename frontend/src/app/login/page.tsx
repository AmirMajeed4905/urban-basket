"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, School, Lock, Mail, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
  setError("");

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const loginPromise = axios.post(
      `${apiUrl}/auth/login`,
      data,
      { withCredentials: true }
    );

    toast.promise(loginPromise, {
      loading: "Signing in...",
      success: "Login successful",
      error: "Login failed",
    });

    const res = await loginPromise;

    const { user, accessToken } = res.data.data;

    setAuth(user, accessToken);

    setTimeout(() => {
      router.replace("/dashboard");
    }, 150);

  } catch (err: any) {
    setError(err.response?.data?.message || "Login failed");
  }
};

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, #0f2167 0%, #1a3a8f 50%, #0f2167 100%)",
      }}
    >

        

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        <div
          className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f97316, transparent)",
          }}
        />

        <div
          className="absolute bottom-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #60a5fa, transparent)",
          }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #f97316, #fb923c)",
            }}
          >
            <School size={28} className="text-white" />
          </div>

          <div>
            <h2 className="text-white text-2xl font-bold">
              BEST ERP
            </h2>
            <p className="text-white/50 text-sm">
              School Management System
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-white text-5xl font-bold leading-tight mb-6">
            BEST<br />International<br />School System
          </h1>

          <p className="text-white/60 text-lg max-w-sm">
            Complete school management system — students, staff, fees, results and more.
          </p>

          <div className="mt-8 flex gap-6">
            {[
              ["1000+", "Students"],
              ["100+", "Staff"],
              ["10+", "Modules"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-white text-2xl font-bold">{n}</p>
                <p className="text-white/50 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-sm relative z-10">
          © 2025 BEST International School System
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #f97316, #fb923c)",
                }}
              >
                <School size={20} className="text-white" />
              </div>
              <p className="font-bold text-slate-800">BEST ERP</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-1">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Sign in to your admin account
            </p>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    {...register("email")}
                    type="email"
                    placeholder="admin@school.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    {...register("password")}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #1a56db, #1e3a8a)",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}