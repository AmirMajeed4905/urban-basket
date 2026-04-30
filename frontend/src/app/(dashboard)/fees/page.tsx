"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import DataTable from "@/components/shared/DataTable";
import StatCard from "@/components/shared/StatCard";
import { DollarSign, AlertCircle, CheckCircle, Clock, Plus } from "lucide-react";
import api from "@/lib/axios";
import { FeePayment } from "@/types";
import { formatCurrency, getMonthName, MONTHS } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

export default function FeesPage() {
  const [tab, setTab] = useState<"defaulters" | "collect" | "structures" | "add-structure">("defaulters");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const toast = useToast();
  
  // Student search
  const [rollNoInput, setRollNoInput] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [collectForm, setCollectForm] = useState({
    studentId: "", feeStructureId: "", month: new Date().getMonth() + 1,
    year: new Date().getFullYear(), amountPaid: "", discount: "0", paymentMethod: "cash",
  });

  const [structureForm, setStructureForm] = useState({
    name: "", classId: "", academicYearId: "", amount: "", dueDay: "10", lateFine: "0",
  });

  const qc = useQueryClient();

  // Search student by roll no
  const { data: searchResults } = useQuery({
    queryKey: ["students-search", rollNoInput],
    queryFn: () => api.get(`/students?search=${rollNoInput}&limit=50`).then((r) => r.data.data?.data || []),
    enabled: rollNoInput.length > 0,
  });

  const { data: stats } = useQuery({
    queryKey: ["fee-stats", month, year],
    queryFn: () => api.get(`/fees/stats?month=${month}&year=${year}`).then((r) => r.data.data),
  });

  const { data: defaulters, isLoading: loadingDefaulters } = useQuery({
    queryKey: ["defaulters", month, year],
    queryFn: () => api.get(`/fees/defaulters?month=${month}&year=${year}`).then((r) => r.data.data),
    enabled: tab === "defaulters",
  });

  const { data: structures, isLoading: loadingStructures } = useQuery({
    queryKey: ["fee-structures"],
    queryFn: () => api.get("/fees/structures").then((r) => r.data.data),
    enabled: tab === "structures" || tab === "collect",
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.get("/classes").then((r) => r.data.data?.data || []),
    enabled: tab === "add-structure",
  });

  const { data: academicYears } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => api.get("/academic-years").then((r) => r.data.data || []),
    enabled: tab === "add-structure",
  });

  const collectMutation = useMutation({
    mutationFn: (d: any) => api.post("/fees/collect", d),
    onSuccess: (res) => { 
      qc.invalidateQueries({ queryKey: ["defaulters"] }); 
      qc.invalidateQueries({ queryKey: ["fee-stats"] }); 
      qc.invalidateQueries({ queryKey: ["student-fees"] }); 
      toast.success(`Fee collected successfully from ${selectedStudent?.name}! ✓`);
      setCollectForm({ ...collectForm, studentId: "", feeStructureId: "" });
      setSelectedStudent(null);
      setRollNoInput("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to collect fee");
    },
  });

  const structureMutation = useMutation({
    mutationFn: (d: any) => api.post("/fees/structures", d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Fee structure created successfully! ✓");
      setStructureForm({ name: "", classId: "", academicYearId: "", amount: "", dueDay: "10", lateFine: "0" });
      setTab("structures");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create fee structure");
    },
  });

  const defaulterCols = [
    {
      key: "student", label: "Student",
      render: (row: any) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{row.student?.name}</p>
          <p className="text-slate-400 text-xs">Roll: {row.student?.rollNo}</p>
        </div>
      ),
    },
    {
      key: "class", label: "Class",
      render: (row: any) => row.student?.class
        ? <span className="badge badge-info">{row.student.class.name}-{row.student.class.section}</span>
        : "—",
    },
    { key: "feeStructure", label: "Fee Type", render: (row: any) => <span className="text-slate-600 text-sm">{row.feeStructure?.name}</span> },
    { key: "amountDue", label: "Amount Due", render: (row: any) => <span className="font-semibold text-red-500">{formatCurrency(row.amountDue)}</span> },
    {
      key: "status", label: "Status",
      render: (row: any) => <span className={`badge ${row.status === "PARTIAL" ? "badge-warning" : "badge-danger"}`}>{row.status}</span>,
    },
    { key: "phone", label: "Father Phone", render: (row: any) => <span className="font-mono text-xs text-slate-600">{row.student?.fatherPhone}</span> },
  ];

  return (
    <div>
      <Header title="Fee Management" subtitle="Track, collect and manage student fees" />
      <div className="p-6 space-y-5">

        {/* Date Filter */}
        <div className="flex gap-3 items-center flex-wrap">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500">
            {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500">
            {[2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard title="Collected" value={stats ? formatCurrency(Number(stats.totalCollected)) : "—"} icon={<DollarSign size={20} />} color="linear-gradient(135deg,#10b981,#059669)" delay={1} />
          <StatCard title="Paid" value={stats?.paid ?? 0} icon={<CheckCircle size={20} />} color="linear-gradient(135deg,#1a56db,#1e3a8a)" delay={2} />
          <StatCard title="Pending" value={stats?.unpaid ?? 0} icon={<AlertCircle size={20} />} color="linear-gradient(135deg,#ef4444,#dc2626)" delay={3} />
          <StatCard title="Partial" value={stats?.partial ?? 0} icon={<Clock size={20} />} color="linear-gradient(135deg,#f97316,#ea580c)" delay={4} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          {[["defaulters", "Defaulters"], ["collect", "Collect Fee"], ["structures", "Fee Structures"], ["add-structure", "Add Structure"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Defaulters Tab */}
        {tab === "defaulters" && (
          <DataTable columns={defaulterCols} data={defaulters ?? []} isLoading={loadingDefaulters} />
        )}

        {/* Collect Fee Tab */}
        {tab === "collect" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-2xl space-y-4">
            <h3 className="font-bold text-slate-800 mb-5" style={{ fontFamily: "var(--font-display)" }}>Collect Fee</h3>
            
            {/* Student Search by Roll No */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">Search Student (Roll No or Name)</label>
              <input 
                value={rollNoInput} 
                onChange={(e) => {
                  setRollNoInput(e.target.value);
                  setSelectedStudent(null);
                }}
                placeholder="e.g., 01 or Ali Ahmed" 
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" 
              />
              {rollNoInput && searchResults && searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  {searchResults.map((student: any) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setCollectForm({ ...collectForm, studentId: student.id });
                        setRollNoInput("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                    >
                      <p className="font-semibold text-slate-700">{student.rollNo} - {student.name}</p>
                      <p className="text-xs text-slate-500">{student.class?.name}-{student.class?.section}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student Info */}
            {selectedStudent && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-slate-700">
                  ✓ {selectedStudent.rollNo} - {selectedStudent.name}
                  <span className="ml-2 badge badge-info text-xs">{selectedStudent.class?.name}-{selectedStudent.class?.section}</span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Structure</label>
                <select value={collectForm.feeStructureId} onChange={(e) => setCollectForm({ ...collectForm, feeStructureId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                  <option value="">Select fee type</option>
                  {structures?.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {s.class?.name}-{s.class?.section} (Rs. {s.amount})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                  <select value={collectForm.month} onChange={(e) => setCollectForm({ ...collectForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                    {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <input type="number" value={collectForm.year} onChange={(e) => setCollectForm({ ...collectForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Paid</label>
                  <input type="number" value={collectForm.amountPaid} onChange={(e) => setCollectForm({ ...collectForm, amountPaid: e.target.value })}
                    placeholder="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Discount</label>
                  <input type="number" value={collectForm.discount} onChange={(e) => setCollectForm({ ...collectForm, discount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                <select value={collectForm.paymentMethod} onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                  {["cash", "bank_transfer", "cheque"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <button onClick={() => collectMutation.mutate(collectForm)} disabled={collectMutation.isPending || !selectedStudent}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                {collectMutation.isPending ? "Processing..." : "Collect Fee"}
              </button>
            </div>
          </div>
        )}

        {/* Fee Structures Tab */}
        {tab === "structures" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStructures ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-32 mb-2" />
                <div className="h-8 bg-slate-100 rounded w-24" />
              </div>
            )) : structures?.map((s: any) => (
              <div key={s.id} className="stat-card bg-white rounded-2xl shadow-card p-5">
                <p className="text-slate-500 text-sm mb-1">{s.class?.name}-{s.class?.section}</p>
                <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "var(--font-display)" }}>{s.name}</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2" style={{ fontFamily: "var(--font-display)" }}>
                  {formatCurrency(s.amount)}
                </p>
                <p className="text-slate-400 text-xs mt-1">Due: {s.dueDay}th · Fine: {formatCurrency(s.lateFine)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add Fee Structure Tab */}
        {tab === "add-structure" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-xl">
            <h3 className="font-bold text-slate-800 mb-5" style={{ fontFamily: "var(--font-display)" }}>Create Fee Structure</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Fee Name</label>
                <input value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })}
                  placeholder="e.g., Monthly Tuition Fee" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                <select value={structureForm.classId} onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                  <option value="">Select class</option>
                  {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Year</label>
                <select value={structureForm.academicYearId} onChange={(e) => setStructureForm({ ...structureForm, academicYearId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                  <option value="">Select year</option>
                  {academicYears?.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (Rs)</label>
                  <input type="number" value={structureForm.amount} onChange={(e) => setStructureForm({ ...structureForm, amount: e.target.value })}
                    placeholder="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Due Day</label>
                  <input type="number" min="1" max="28" value={structureForm.dueDay} onChange={(e) => setStructureForm({ ...structureForm, dueDay: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Late Fine (Rs)</label>
                <input type="number" value={structureForm.lateFine} onChange={(e) => setStructureForm({ ...structureForm, lateFine: e.target.value })}
                  placeholder="0" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>
              <button onClick={() => structureMutation.mutate(structureForm)} disabled={structureMutation.isPending}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}>
                {structureMutation.isPending ? "Creating..." : "Create Structure"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
