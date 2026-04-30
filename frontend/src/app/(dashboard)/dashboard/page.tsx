"use client";

import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import StatCard from "@/components/shared/StatCard";
import {
  GraduationCap,
  Users,
  DollarSign,
  Bell,
  TrendingUp,
  UserCheck,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/axios";
import { formatCurrency, getMonthName } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ================= TYPES ================= */

type StudentStats = {
  active: number;
  boys: number;
  girls: number;
};

type StaffStats = {
  total: number;
  teachers: number;
};

type FeeStats = {
  totalCollected: number;
  paid: number;
  unpaid: number;
};

/* ================= STATIC DATA ================= */

const feeMonths = [
  { month: "Jan", collected: 420000, pending: 80000 },
  { month: "Feb", collected: 480000, pending: 60000 },
  { month: "Mar", collected: 510000, pending: 40000 },
  { month: "Apr", collected: 495000, pending: 55000 },
  { month: "May", collected: 530000, pending: 30000 },
];

const attendancePie = [
  { name: "Present", value: 87, color: "#10b981" },
  { name: "Absent", value: 8, color: "#ef4444" },
  { name: "Late", value: 5, color: "#f59e0b" },
];

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const curMonth = new Date().getMonth() + 1;
  const curYear = new Date().getFullYear();

  /* ================= QUERIES ================= */

  const { data: studentStats } = useQuery<StudentStats>({
    queryKey: ["student-stats"],
    queryFn: async () => {
      const res = await api.get("/students/stats");
      return res.data.data;
    },
  });

  const { data: staffStats } = useQuery<StaffStats>({
    queryKey: ["staff-stats"],
    queryFn: async () => {
      const res = await api.get("/staff/stats");
      return res.data.data;
    },
  });

  const { data: feeStats } = useQuery<FeeStats>({
    queryKey: ["fee-stats", curMonth, curYear],
    queryFn: async () => {
      const res = await api.get(
        `/fees/stats?month=${curMonth}&year=${curYear}`
      );
      return res.data.data;
    },
  });

  /* ================= UI ================= */

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome to BEST ERP — ${getMonthName(curMonth)} ${curYear}`}
      />

      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={studentStats?.active ?? "—"}
            subtitle={`${studentStats?.boys ?? 0} boys · ${studentStats?.girls ?? 0} girls`}
            icon={<GraduationCap size={22} />}
            color="linear-gradient(135deg,#1a56db,#1e3a8a)"
            delay={1}
          />

          <StatCard
            title="Total Staff"
            value={staffStats?.total ?? "—"}
            subtitle={`${staffStats?.teachers ?? 0} teachers`}
            icon={<Users size={22} />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
            delay={2}
          />

          <StatCard
            title="Fee Collected"
            value={
              feeStats
                ? formatCurrency(Number(feeStats.totalCollected))
                : "—"
            }
            subtitle={`${feeStats?.paid ?? 0} paid · ${feeStats?.unpaid ?? 0} pending`}
            icon={<DollarSign size={22} />}
            color="linear-gradient(135deg,#10b981,#059669)"
            delay={3}
          />

          <StatCard
            title="Defaulters"
            value={feeStats?.unpaid ?? "—"}
            subtitle="This month"
            icon={<AlertCircle size={22} />}
            color="linear-gradient(135deg,#f97316,#ea580c)"
            delay={4}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Fee Chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-slate-800">
                  Fee Collection
                </h3>
                <p className="text-slate-400 text-sm">
                  Monthly overview
                </p>
              </div>
              <TrendingUp size={18} className="text-blue-500" />
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={feeMonths}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />

                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke="#1a56db"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#f97316"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-bold mb-3">Attendance</h3>

            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={attendancePie} dataKey="value">
                  {attendancePie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,
              label: "Active Classes",
              value: "—",
              color: "#1a56db",
            },
            {
              icon: Bell,
              label: "Active Notices",
              value: "—",
              color: "#f97316",
            },
            {
              icon: UserCheck,
              label: "Present Today",
              value: `${studentStats?.active ?? 0}`,
              color: "#10b981",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} style={{ color }} />
              </div>

              <div>
                <p className="text-slate-500 text-sm">{label}</p>
                <p className="text-xl font-bold text-slate-800">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}