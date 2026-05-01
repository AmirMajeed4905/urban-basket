"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import DataTable from "@/components/shared/DataTable";
import { Plus, Eye, Pencil, UserX, GraduationCap } from "lucide-react";
import api from "@/lib/axios";
import { Student } from "@/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["students", page, search, status],
    queryFn: () => api.get(`/students?page=${page}&limit=10&search=${search}&status=${status || ""}`).then((r) => r.data.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => api.get("/students/stats").then((r) => r.data.data),
  });

  

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/students/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });

  const columns = [
    {
      key: "name", label: "Student",
      render: (row: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
            {row.name[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.name}</p>
            <p className="text-slate-400 text-xs">Roll: {row.rollNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "class", label: "Class",
      render: (row: Student) => row.class ? (
        <span className="badge badge-info">{row.class.name}-{row.class.section}</span>
      ) : "—",
    },
    {
      key: "gender", label: "Gender",
      render: (row: Student) => (
        <span className={`badge ${row.gender === "MALE" ? "badge-info" : "badge-warning"}`}>
          {row.gender}
        </span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (row: Student) => (
        <span className={`badge ${row.status === "ACTIVE" ? "badge-success" : row.status === "TRANSFERRED" ? "badge-warning" : "badge-gray"}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "fatherPhone", label: "Father's Phone",
      render: (row: Student) => <span className="text-slate-600 font-mono text-xs">{row.fatherPhone}</span>,
    },
    {
      key: "admissionDate", label: "Admitted",
      render: (row: Student) => <span className="text-slate-500 text-xs">{formatDate(row.admissionDate)}</span>,
    },
    {
      key: "actions", label: "",
      render: (row: Student) => (
        <div className="flex items-center gap-1">
          <Link href={`/students/${row.id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
            <Eye size={14} />
          </Link>
          <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={() => { if (confirm("Mark as left?")) deleteMutation.mutate(row.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
            <UserX size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Students" subtitle="Manage student enrollment and records" />
      <div className="p-6 space-y-5">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats?.total ?? 0, color: "#1a56db" },
            { label: "Active", value: stats?.active ?? 0, color: "#10b981" },
            { label: "Boys", value: stats?.boys ?? 0, color: "#6366f1" },
            { label: "Girls", value: stats?.girls ?? 0, color: "#ec4899" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <GraduationCap size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-slate-400 text-xs">{label}</p>
                <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 flex-wrap">
          {["", "ACTIVE", "TRANSFERRED", "LEFT"].map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${status === s ? "text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}
              style={status === s ? { background: "linear-gradient(135deg,#1a56db,#1e3a8a)" } : {}}>
              {s || "All Students"}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={data?.students ?? []}
          isLoading={isLoading}
          search={search}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          page={page}
          totalPages={data?.pagination?.totalPages}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
          actions={
            <Link href="/students/new"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
              <Plus size={16} /> Enroll Student
            </Link>
          }
        />
      </div>
    </div>
  );
}
