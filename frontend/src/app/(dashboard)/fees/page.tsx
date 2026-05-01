"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import DataTable from "@/components/shared/DataTable";
import StatCard from "@/components/shared/StatCard";
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
} from "lucide-react";
import api from "@/lib/axios";
import { formatCurrency, MONTHS } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";

type Tab = "defaulters" | "collect" | "structures" | "add-structure" | "student-history";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentBasic {
  id: string;
  name: string;
  rollNo: string;
  classId: string;
  class?: { id: string; name: string; section: string };
  fatherPhone?: string;
}

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  lateFine: number;
  classId: string;
  class?: { id: string; name: string; section: string };
  academicYear?: { id: string; name: string };
}

interface CollectForm {
  studentId: string;
  feeStructureId: string;
  month: number;
  year: number;
  amountPaid: string;
  discount: string;
  paymentMethod: "cash" | "bank_transfer" | "cheque";
  remarks: string;
}

interface StructureForm {
  name: string;
  classId: string;
  academicYearId: string;
  amount: string;
  dueDay: string;
  lateFine: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

const defaultCollectForm: CollectForm = {
  studentId: "",
  feeStructureId: "",
  month: currentMonth,
  year: currentYear,
  amountPaid: "",
  discount: "0",
  paymentMethod: "cash",
  remarks: "",
};

const defaultStructureForm: StructureForm = {
  name: "",
  classId: "",
  academicYearId: "",
  amount: "",
  dueDay: "10",
  lateFine: "0",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>("defaulters");
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);

  // Student search state
  const [rollNoInput, setRollNoInput] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentBasic | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Student history search state
  const [historySearchInput, setHistorySearchInput] = useState("");
  const [historyStudent, setHistoryStudent] = useState<StudentBasic | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const [collectForm, setCollectForm] = useState<CollectForm>(defaultCollectForm);
  const [structureForm, setStructureForm] = useState<StructureForm>(defaultStructureForm);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const toast = useToast();
  const qc = useQueryClient();



  // ─── Queries ───────────────────────────────────────────────────────────────

  // Search students (for fee collection)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(rollNoInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [rollNoInput]);

const { data: searchResults = [] } = useQuery<StudentBasic[]>({
  queryKey: ["students-search", debouncedSearch || ""],
  queryFn: () =>
    api
      .get(`/students?search=${debouncedSearch}&limit=30`)
      .then((r) => r.data.data.students ?? []),
  enabled: !!debouncedSearch?.trim(),
});

  // Search students (for history tab)
  const { data: historySearchResults } = useQuery<StudentBasic[]>({
    queryKey: ["students-search-history", historySearchInput],
    queryFn: () =>
      api
        .get(`/students?search=${historySearchInput}&limit=30`)
        .then((r) => r.data.data.students ?? []),
    enabled: historySearchInput.length > 0,
  });

  // Fee stats
  const { data: stats } = useQuery({
    queryKey: ["fee-stats", month, year],
    queryFn: () =>
      api.get(`/fees/stats?month=${month}&year=${year}`).then((r) => r.data.data),
  });

  // Defaulters
  const { data: defaulters, isLoading: loadingDefaulters } = useQuery({
    queryKey: ["defaulters", month, year],
    queryFn: () =>
      api
        .get(`/fees/defaulters?month=${month}&year=${year}`)
        .then((r) => r.data.data),
    enabled: tab === "defaulters",
  });

  // All fee structures
  const { data: allStructures, isLoading: loadingStructures } = useQuery<FeeStructure[]>({
    queryKey: ["fee-structures"],
    queryFn: () => api.get("/fees/structures").then((r) => r.data.data ?? []),
    enabled: tab === "structures" || tab === "collect" || tab === "add-structure",
  });

  // ✅ FIX: Filter fee structures by selected student's class
  const filteredStructures =
    selectedStudent && allStructures
      ? allStructures.filter((s) => s.classId === selectedStudent.classId)
      : allStructures ?? [];

  // Classes (for add structure form)
  const { data: classes } = useQuery<{ id: string; name: string; section: string }[]>({
    queryKey: ["classes"],
    queryFn: () => api.get("/classes").then((r) => r.data.data?.data ?? []),
    enabled: tab === "add-structure",
  });

  // Academic years
  const { data: academicYears } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["academic-years"],
    queryFn: () => api.get("/academic-years").then((r) => r.data.data ?? []),
    enabled: tab === "add-structure",
  });

  // Student fee history
  const { data: studentHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ["student-fee-history", historyStudent?.id],
    queryFn: () =>
      api
        .get(`/fees/student/${historyStudent!.id}`)
        .then((r) => r.data.data),
    enabled: !!historyStudent?.id && tab === "student-history",
  });

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const collectMutation = useMutation({
    mutationFn: (d: CollectForm) =>
      api.post("/fees/collect", {
        ...d,
        amountPaid: Number(d.amountPaid),
        discount: Number(d.discount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["defaulters"] });
      qc.invalidateQueries({ queryKey: ["fee-stats"] });
      qc.invalidateQueries({ queryKey: ["student-fee-history"] });
      toast.success(`Fee collected from ${selectedStudent?.name}! ✓`);
      setCollectForm(defaultCollectForm);
      setSelectedStudent(null);
      setRollNoInput("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to collect fee");
    },
  });

  const structureMutation = useMutation({
    mutationFn: (d: StructureForm) =>
      api.post("/fees/structures", {
        ...d,
        amount: Number(d.amount),
        dueDay: Number(d.dueDay),
        lateFine: Number(d.lateFine),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-structures"] });
      toast.success("Fee structure created! ✓");
      setStructureForm(defaultStructureForm);
      setTab("structures");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Failed to create fee structure");
    },
  });

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const selectStudent = (student: StudentBasic) => {
    setSelectedStudent(student);
    setCollectForm((prev) => ({
      ...prev,
      studentId: student.id,
      feeStructureId: "", // Reset — filter karo pehle
    }));
    setRollNoInput("");
    setShowSearchDropdown(false);
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setCollectForm(defaultCollectForm);
    setRollNoInput("");
  };

  const handleCollectSubmit = () => {
    if (!collectForm.studentId) return toast.error("Please select a student");
    if (!collectForm.feeStructureId) return toast.error("Please select a fee structure");
    if (collectForm.amountPaid === "" || Number(collectForm.amountPaid) < 0)
      return toast.error("Please enter a valid amount");
    collectMutation.mutate(collectForm);
  };

  const handleStructureSubmit = () => {
    if (!structureForm.name.trim()) return toast.error("Fee name is required");
    if (!structureForm.classId) return toast.error("Please select a class");
    if (!structureForm.academicYearId) return toast.error("Please select academic year");
    if (!structureForm.amount || Number(structureForm.amount) < 1)
      return toast.error("Amount must be at least 1");
    structureMutation.mutate(structureForm);
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────

  const defaulterCols = [
    {
      key: "student",
      label: "Student",
      render: (row: any) => (
        <div>
          <p className="font-semibold text-slate-800 text-sm">{row.student?.name}</p>
          <p className="text-slate-400 text-xs">Roll: {row.student?.rollNo}</p>
        </div>
      ),
    },
    {
      key: "class",
      label: "Class",
      render: (row: any) =>
        row.student?.class ? (
          <span className="badge badge-info">
            {row.student.class.name}-{row.student.class.section}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "feeStructure",
      label: "Fee Type",
      render: (row: any) => (
        <span className="text-slate-600 text-sm">{row.feeStructure?.name}</span>
      ),
    },
    {
      key: "amountDue",
      label: "Due",
      render: (row: any) => (
        <span className="font-semibold text-red-500">{formatCurrency(row.amountDue)}</span>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (row: any) => (
        <span className="font-semibold text-emerald-600">{formatCurrency(row.amountPaid)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: any) => (
        <span
          className={`badge ${row.status === "PARTIAL" ? "badge-warning" : "badge-danger"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Father Phone",
      render: (row: any) => (
        <span className="font-mono text-xs text-slate-600">{row.student?.fatherPhone ?? "—"}</span>
      ),
    },
  ];

  const historyCols = [
    {
      key: "month",
      label: "Month/Year",
      render: (row: any) => (
        <span className="text-sm font-semibold text-slate-700">
          {MONTHS.find((m) => m.value === row.month)?.label} {row.year}
        </span>
      ),
    },
    {
      key: "feeStructure",
      label: "Fee Type",
      render: (row: any) => (
        <span className="text-slate-600 text-sm">{row.feeStructure?.name}</span>
      ),
    },
    {
      key: "amountDue",
      label: "Due",
      render: (row: any) => (
        <span className="text-slate-700">{formatCurrency(row.amountDue)}</span>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (row: any) => (
        <span className="text-blue-600">{formatCurrency(row.discount)}</span>
      ),
    },
    {
      key: "amountPaid",
      label: "Paid",
      render: (row: any) => (
        <span className="font-semibold text-emerald-600">{formatCurrency(row.amountPaid)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: any) => (
        <span
          className={`badge ${row.status === "PAID"
            ? "badge-success"
            : row.status === "PARTIAL"
              ? "badge-warning"
              : "badge-danger"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (row: any) => (
        <span className="text-xs text-slate-500 capitalize">
          {row.paymentMethod?.replace("_", " ") ?? "—"}
        </span>
      ),
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <Header title="Fee Management" subtitle="Track, collect and manage student fees" />

      <div className="p-6 space-y-5">
        {/* Date Filter */}
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            title="Collected"
            value={stats ? formatCurrency(Number(stats.totalCollected)) : "—"}
            icon={<DollarSign size={20} />}
            color="linear-gradient(135deg,#10b981,#059669)"
            delay={1}
          />
          <StatCard
            title="Expected"
            value={stats ? formatCurrency(Number(stats.totalExpected)) : "—"}
            icon={<TrendingUp size={20} />}
            color="linear-gradient(135deg,#8b5cf6,#7c3aed)"
            delay={2}
          />
          <StatCard
            title="Paid Students"
            value={stats?.paid ?? 0}
            icon={<CheckCircle size={20} />}
            color="linear-gradient(135deg,#1a56db,#1e3a8a)"
            delay={3}
          />
          <StatCard
            title="Defaulters"
            value={(stats?.unpaid ?? 0) + (stats?.partial ?? 0)}
            icon={<AlertCircle size={20} />}
            color="linear-gradient(135deg,#ef4444,#dc2626)"
            delay={4}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          {(
            [
              ["defaulters", "Defaulters"],
              ["collect", "Collect Fee"],
              ["student-history", "Student History"],
              ["structures", "Fee Structures"],
              ["add-structure", "Add Structure"],
            ] as [Tab, string][]
          ).map(([t, l]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* ── Defaulters Tab ── */}
        {tab === "defaulters" && (
          <DataTable
            columns={defaulterCols}
            data={defaulters ?? []}
            isLoading={loadingDefaulters}
          />
        )}

        {/* ── Collect Fee Tab ── */}
        {tab === "collect" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-2xl space-y-4">
            <h3 className="font-bold text-slate-800 mb-5" style={{ fontFamily: "var(--font-display)" }}>
              Collect Fee
            </h3>

            {/* Student Search */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-semibold text-slate-600">
                Search Student (Roll No or Name)
              </label>
              {selectedStudent ? (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {selectedStudent.rollNo} — {selectedStudent.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {selectedStudent.class?.name}-{selectedStudent.class?.section}
                    </p>
                  </div>
                  <button
                    onClick={clearStudent}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold px-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={rollNoInput}
                    onChange={(e) => {
                      setRollNoInput(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    placeholder="Type roll no or name..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                  {showSearchDropdown &&
                    rollNoInput.length > 0 &&
                    searchResults &&
                    searchResults.length > 0 && (
                      <div className="absolute z-10 left-0 right-0 border border-slate-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                        {searchResults?.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => selectStudent(student)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                          >
                            <p className="font-semibold text-slate-700">
                              {student.rollNo} — {student.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.class?.name}-{student.class?.section}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  {showSearchDropdown &&
                    rollNoInput.length > 0 &&
                    searchResults?.length === 0 && (
                      <p className="text-xs text-slate-400 px-1">No students found</p>
                    )}
                </>
              )}
            </div>

            {/* Fee Structure — filtered by student class */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Fee Structure
                {selectedStudent && (
                  <span className="ml-2 text-blue-500 font-normal">
                    (showing {filteredStructures.length} structure(s) for{" "}
                    {selectedStudent.class?.name}-{selectedStudent.class?.section})
                  </span>
                )}
              </label>
              <select
                value={collectForm.feeStructureId}
                onChange={(e) =>
                  setCollectForm({ ...collectForm, feeStructureId: e.target.value })
                }
                disabled={!selectedStudent}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {selectedStudent ? "Select fee type" : "Select student first"}
                </option>
                {filteredStructures.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Rs. {s.amount}
                    {Number(s.lateFine) > 0 ? ` (+Rs. ${s.lateFine} fine)` : ""}
                  </option>
                ))}
              </select>
              {selectedStudent && filteredStructures.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  ⚠ No fee structures found for this class. Please add one first.
                </p>
              )}
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                <select
                  value={collectForm.month}
                  onChange={(e) =>
                    setCollectForm({ ...collectForm, month: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                <input
                  type="number"
                  value={collectForm.year}
                  onChange={(e) =>
                    setCollectForm({ ...collectForm, year: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Amount & Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Amount Paid (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={collectForm.amountPaid}
                  onChange={(e) =>
                    setCollectForm({ ...collectForm, amountPaid: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Discount (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={collectForm.discount}
                  onChange={(e) =>
                    setCollectForm({ ...collectForm, discount: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={collectForm.paymentMethod}
                onChange={(e) =>
                  setCollectForm({
                    ...collectForm,
                    paymentMethod: e.target.value as CollectForm["paymentMethod"],
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Remarks (optional)
              </label>
              <input
                value={collectForm.remarks}
                onChange={(e) =>
                  setCollectForm({ ...collectForm, remarks: e.target.value })
                }
                placeholder="Any note..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleCollectSubmit}
              disabled={collectMutation.isPending || !selectedStudent || !collectForm.feeStructureId}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
              style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}
            >
              {collectMutation.isPending ? "Processing..." : "Collect Fee"}
            </button>
          </div>
        )}

        {/* ── Student History Tab ── */}
        {tab === "student-history" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="bg-white rounded-2xl shadow-card p-5 max-w-md relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                <User size={12} className="inline mr-1" />
                Search Student
              </label>
              {historyStudent ? (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {historyStudent.rollNo} — {historyStudent.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {historyStudent.class?.name}-{historyStudent.class?.section}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setHistoryStudent(null);
                      setHistorySearchInput("");
                    }}
                    className="text-xs text-red-500 font-semibold px-2"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <input
                    value={historySearchInput}
                    onChange={(e) => {
                      setHistorySearchInput(e.target.value);
                      setShowHistoryDropdown(true);
                    }}
                    placeholder="Type name or roll no..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                  {showHistoryDropdown &&
                    historySearchInput.length > 0 &&
                    historySearchResults &&
                    historySearchResults.length > 0 && (
                      <div className="absolute z-10 left-5 right-5 border border-slate-200 rounded-xl max-h-48 overflow-y-auto bg-white shadow-lg">
                        {historySearchResults.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setHistoryStudent(s);
                              setHistorySearchInput("");
                              setShowHistoryDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                          >
                            <p className="font-semibold text-slate-700">
                              {s.rollNo} — {s.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {s.class?.name}-{s.class?.section}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                </>
              )}
            </div>

            {/* Summary Cards */}
            {historyStudent && studentHistory && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    title="Total Paid"
                    value={formatCurrency(studentHistory.summary.totalPaid)}
                    icon={<CheckCircle size={20} />}
                    color="linear-gradient(135deg,#10b981,#059669)"
                    delay={1}
                  />
                  <StatCard
                    title="Total Due"
                    value={formatCurrency(studentHistory.summary.totalDue)}
                    icon={<DollarSign size={20} />}
                    color="linear-gradient(135deg,#1a56db,#1e3a8a)"
                    delay={2}
                  />
                  <StatCard
                    title="Balance"
                    value={formatCurrency(studentHistory.summary.balance)}
                    icon={<AlertCircle size={20} />}
                    color={
                      studentHistory.summary.balance > 0
                        ? "linear-gradient(135deg,#ef4444,#dc2626)"
                        : "linear-gradient(135deg,#10b981,#059669)"
                    }
                    delay={3}
                  />
                  <StatCard
                    title="Discount"
                    value={formatCurrency(studentHistory.summary.totalDiscount)}
                    icon={<Clock size={20} />}
                    color="linear-gradient(135deg,#f97316,#ea580c)"
                    delay={4}
                  />
                </div>

                <DataTable
                  columns={historyCols}
                  data={studentHistory.payments ?? []}
                  isLoading={loadingHistory}
                />
              </>
            )}

            {historyStudent && !loadingHistory && !studentHistory && (
              <p className="text-slate-400 text-sm">No fee records found for this student.</p>
            )}
          </div>
        )}

        {/* ── Fee Structures Tab ── */}
        {tab === "structures" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingStructures
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
                  <div className="h-5 bg-slate-100 rounded w-32 mb-3" />
                  <div className="h-8 bg-slate-100 rounded w-20" />
                </div>
              ))
              : allStructures?.map((s) => (
                <div key={s.id} className="stat-card bg-white rounded-2xl shadow-card p-5">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                    {s.class?.name}-{s.class?.section}
                  </p>
                  <p
                    className="font-bold text-slate-800 text-lg"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.name}
                  </p>
                  <p
                    className="text-2xl font-bold text-emerald-600 mt-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {formatCurrency(s.amount)}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    Due: {s.dueDay}th · Fine: {formatCurrency(s.lateFine)}
                  </p>
                  <p className="text-slate-300 text-xs mt-1">
                    {s.academicYear?.name}
                  </p>
                </div>
              ))}
          </div>
        )}

        {/* ── Add Fee Structure Tab ── */}
        {tab === "add-structure" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-xl">
            <h3
              className="font-bold text-slate-800 mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Create Fee Structure
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fee Name
                </label>
                <input
                  value={structureForm.name}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, name: e.target.value })
                  }
                  placeholder="e.g., Monthly Tuition Fee"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Class</label>
                <select
                  value={structureForm.classId}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, classId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select class</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}-{c.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Academic Year
                </label>
                <select
                  value={structureForm.academicYearId}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, academicYearId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select year</option>
                  {academicYears?.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount (Rs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={structureForm.amount}
                    onChange={(e) =>
                      setStructureForm({ ...structureForm, amount: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Due Day (1-28)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={structureForm.dueDay}
                    onChange={(e) =>
                      setStructureForm({ ...structureForm, dueDay: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Late Fine (Rs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={structureForm.lateFine}
                  onChange={(e) =>
                    setStructureForm({ ...structureForm, lateFine: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleStructureSubmit}
                disabled={structureMutation.isPending}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-opacity"
                style={{ background: "linear-gradient(135deg,#8b5cf6,#7c3aed)" }}
              >
                {structureMutation.isPending ? "Creating..." : "Create Structure"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}