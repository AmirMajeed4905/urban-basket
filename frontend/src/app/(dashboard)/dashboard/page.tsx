"use client";

import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import StatCard from "@/components/shared/StatCard";
import {
  GraduationCap,
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Bell,
  UserCheck,
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

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const curMonth = new Date().getMonth() + 1;
  const curYear = new Date().getFullYear();

  /* ================= SAFE API WRAPPER ================= */

  const fetcher = async (url: string) => {
    const res = await api.get(url);
    return res.data?.data ?? res.data;
  };

  /* ================= QUERIES ================= */

  const { data: studentStats } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => fetcher("/students/stats"),
  });

  const { data: staffStats } = useQuery({
    queryKey: ["staff-stats"],
    queryFn: () => fetcher("/staff/stats"),
  });

  const { data: feeStats } = useQuery({
    queryKey: ["fee-stats", curMonth, curYear],
    queryFn: () =>
      fetcher(`/fees/stats?month=${curMonth}&year=${curYear}`),
  });

  const { data: defaulters } = useQuery({
    queryKey: ["defaulters", curMonth, curYear],
    queryFn: () =>
      fetcher(`/fees/defaulters?month=${curMonth}&year=${curYear}`),
  });

  const { data: feeMonths } = useQuery({
    queryKey: ["fee-monthly"],
    queryFn: () => fetcher("/fees/monthly-stats"),
  });

  /* ================= SAFE FALLBACKS ================= */

  const students = studentStats || {};
  const staff = staffStats || {};
  const fees = feeStats || {};

  const attendancePie = [
    { name: "Present", value: 87, color: "#10b981" },
    { name: "Absent", value: 8, color: "#ef4444" },
    { name: "Late", value: 5, color: "#f59e0b" },
  ];

  /* ================= UI ================= */

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle={`Welcome — ${getMonthName(curMonth)} ${curYear}`}
      />

      <div className="p-6 space-y-6">

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Total Students"
            value={students.active ?? 0}
            subtitle={`${students.boys ?? 0} boys · ${students.girls ?? 0} girls`}
            icon={<GraduationCap size={22} />}
            color="linear-gradient(135deg,#1a56db,#1e3a8a)"
          />

          <StatCard
            title="Total Staff"
            value={staff.total ?? 0}
            subtitle={`${staff.teachers ?? 0} teachers`}
            icon={<Users size={22} />}
            color="linear-gradient(135deg,#7c3aed,#5b21b6)"
          />

          <StatCard
            title="Fee Collected"
            value={formatCurrency(fees.totalCollected ?? 0)}
            subtitle={`Expected: ${formatCurrency(fees.totalExpected ?? 0)}`}
            icon={<DollarSign size={22} />}
            color="linear-gradient(135deg,#10b981,#059669)"
          />

          <StatCard
            title="Defaulters"
            value={defaulters?.length ?? fees.unpaid ?? 0}
            subtitle={`Pending: ${formatCurrency(fees.totalPending ?? 0)}`}
            icon={<AlertCircle size={22} />}
            color="linear-gradient(135deg,#f97316,#ea580c)"
          />
        </div>

        {/* ================= CHARTS ================= */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        

  {/* Fee Chart */}
  <div className="xl:col-span-2 bg-white rounded-2xl shadow-card p-5">
    <div className="flex items-center gap-2 mb-4">
      <TrendingUp size={18} />
      <h3 className="font-bold">Fee Collection</h3>
    </div>

    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={feeMonths ?? []}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
        />

        <YAxis
          tick={{ fontSize: 12 }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 10,
            fontSize: 13,
          }}
        />

        {/* COLLECTED */}
        <Area
          type="monotone"
          dataKey="collected"
          stroke="#1a56db"
          fill="#1a56db"
          fillOpacity={0.15}
          strokeWidth={2}
        />

        {/* PENDING */}
        <Area
          type="monotone"
          dataKey="pending"
          stroke="#f97316"
          fill="#f97316"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>

  {/* Attendance */}
  <div className="bg-white rounded-2xl shadow-card p-5">
    <h3 className="font-bold mb-3">Attendance</h3>

    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={attendancePie ?? []}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          label
        >
          {attendancePie?.map((e, i) => (
            <Cell key={i} fill={e.color} />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  </div>

</div>

        {/* ================= QUICK ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-amber-200 p-4 rounded-xl shadow">
            <BookOpen />
            <p>Active Classes</p>
            <h2>10</h2>
          </div>

          <div className="bg-blue-100 p-4 rounded-xl shadow">
            <Bell />
            <p>Notices</p>
            <h2>20</h2>
          </div>

          <div className="bg-green-100 p-4 rounded-xl shadow">
            <UserCheck />
            <p>Present Today</p>
            <h2>{students.active ?? 0}</h2>
          </div>

        </div>
      </div>
    </div>
  );
}