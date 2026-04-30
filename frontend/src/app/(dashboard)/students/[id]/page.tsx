
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { ArrowLeft, GraduationCap, Phone, User, Calendar, MapPin, BookOpen, DollarSign, UserCheck, ArrowRightLeft, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { formatDate, formatCurrency, getMonthName, MONTHS } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "fees" | "attendance" | "results">("overview");
  const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1);
  const [feeYear, setFeeYear] = useState(new Date().getFullYear());

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: () => api.get(`/students/${id}`).then((r) => r.data.data),
  });

  const { data: feeHistory } = useQuery({
    queryKey: ["student-fees", id],
    queryFn: () => api.get(`/fees/student/${id}`).then((r) => r.data.data),
    enabled: activeTab === "fees",
  });

  const { data: attendanceSummary } = useQuery({
    queryKey: ["student-attendance", id, feeMonth, feeYear],
    queryFn: () => api.get(`/attendance/summary/${id}?month=${feeMonth}&year=${feeYear}`).then((r) => r.data.data),
    enabled: activeTab === "attendance",
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 size={32} className="animate-spin text-blue-500" />
    </div>
  );

  if (!student) return (
    <div className="p-6 text-center text-slate-400">Student not found</div>
  );

  const statusColor = student.status === "ACTIVE" ? "badge-success" : student.status === "TRANSFERRED" ? "badge-warning" : "badge-gray";

  return (
    <div>
      <Header title="Student Profile" subtitle={student.name} />
      <div className="p-6 space-y-5">

        <Link href="/students" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} /> Back to Students
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="h-20" style={{ background: "linear-gradient(135deg,#0f2167,#1a56db)" }} />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-8 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white flex items-center justify-center text-white text-3xl font-bold shadow-lg"
                style={{ background: student.gender === "FEMALE" ? "linear-gradient(135deg,#ec4899,#be185d)" : "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                {student.name[0]}
              </div>
              <div className="pb-4">
                <h2 className="text-2xl font-bold pb-3 text-white" style={{ fontFamily: "var(--font-display)" }}>{student.name}</h2>
                <p className="text-slate-500 text-sm">Roll: {student.rollNo} · Adm: {student.admissionNo}</p>
              </div>
              <div className="ml-auto pb-2">
                <span className={`badge ${statusColor}`}>{student.status}</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: "Class", value: student.class ? `${student.class.name}-${student.class.section}` : "—" },
                { icon: User, label: "Gender", value: student.gender },
                { icon: Calendar, label: "Date of Birth", value: formatDate(student.dateOfBirth) },
                { icon: GraduationCap, label: "Admitted", value: formatDate(student.admissionDate) },
                { icon: Phone, label: "Father's Phone", value: student.fatherPhone },
                { icon: User, label: "Father's Name", value: student.fatherName },
                ...(student.address ? [{ icon: MapPin, label: "Address", value: student.address }] : []),
                ...(student.religion ? [{ icon: User, label: "Religion", value: student.religion }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={13} className="text-slate-400" />
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
          {[["overview","Overview"],["fees","Fee History"],["attendance","Attendance"],["results","Results"]].map(([t,l]) => (
            <button key={t} onClick={() => setActiveTab(t as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-card p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                <User size={16} className="text-blue-500" /> Parent Info
              </h3>
              <div className="space-y-3">
                {[
                  ["Father", student.fatherName, student.fatherPhone],
                  ...(student.motherName ? [["Mother", student.motherName, student.motherPhone]] : []),
                  ...(student.guardianName ? [["Guardian", student.guardianName, student.guardianPhone]] : []),
                ].map(([rel, name, phone]) => (
                  <div key={rel} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs text-slate-400">{rel}</p>
                      <p className="text-sm font-semibold text-slate-700">{name}</p>
                    </div>
                    {phone && <span className="text-sm font-mono text-blue-600">{phone}</span>}
                  </div>
                ))}
              </div>
            </div>

            {student.transferRecord && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <ArrowRightLeft size={16} /> Transfer Record
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-amber-600 font-medium">Transferred to:</span> <span className="text-amber-900">{student.transferRecord.transferredTo}</span></p>
                  <p><span className="text-amber-600 font-medium">Date:</span> <span className="text-amber-900">{formatDate(student.transferRecord.transferDate)}</span></p>
                  {student.transferRecord.reason && <p><span className="text-amber-600 font-medium">Reason:</span> <span className="text-amber-900">{student.transferRecord.reason}</span></p>}
                  {student.transferRecord.certificateNo && <p><span className="text-amber-600 font-medium">TC No:</span> <span className="text-amber-900">{student.transferRecord.certificateNo}</span></p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fee History Tab */}
        {activeTab === "fees" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>Fee History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Month/Year","Fee Type","Due","Paid","Status","Date"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {feeHistory?.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No fee records found</td></tr>
                  ) : feeHistory?.map((f: any) => (
                    <tr key={f.id} className="table-row-hover">
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{getMonthName(f.month)} {f.year}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{f.feeStructure?.name}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-700">{formatCurrency(f.amountDue)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-emerald-600">{formatCurrency(f.amountPaid)}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${f.status === "PAID" ? "badge-success" : f.status === "PARTIAL" ? "badge-warning" : "badge-danger"}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{f.paidAt ? formatDate(f.paidAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <select value={feeMonth} onChange={(e) => setFeeMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500">
                {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={feeYear} onChange={(e) => setFeeYear(Number(e.target.value))}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500">
                {[2024,2025,2026].map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>

            {attendanceSummary && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Present", value: attendanceSummary.PRESENT, color: "#10b981" },
                  { label: "Absent", value: attendanceSummary.ABSENT, color: "#ef4444" },
                  { label: "Late", value: attendanceSummary.LATE, color: "#f59e0b" },
                  { label: "Leave", value: attendanceSummary.LEAVE, color: "#94a3b8" },
                  { label: "Attendance %", value: `${attendanceSummary.attendancePercent}%`, color: "#1a56db" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white rounded-xl shadow-card p-4 text-center">
                    <p className="text-slate-400 text-xs mb-1">{label}</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color }}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center text-slate-400">
            <GraduationCap size={40} className="text-slate-200 mx-auto mb-3" />
            <p>Select an exam from the Exams page to view results</p>
          </div>
        )}

      </div>
    </div>
  );
}