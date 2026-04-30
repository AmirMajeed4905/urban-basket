"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Plus, ClipboardList, Trophy } from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

export default function ExamsPage() {
  const [tab, setTab] = useState<"list" | "create" | "marks">("list");
  const [form, setForm] = useState({ name: "", examType: "MIDTERM", academicYearId: "", startDate: "", endDate: "" });
  const [marksForm, setMarksForm] = useState({ examId: "", subjectId: "", classId: "" });
  const qc = useQueryClient();

  const { data: years } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => api.get("/classes/academic-years").then((r) => r.data.data),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: () => api.get("/exams").then((r) => r.data.data),
  });

  const { data: results } = useQuery({
    queryKey: ["results", marksForm.examId, marksForm.classId],
    queryFn: () => api.get(`/exams/${marksForm.examId}/results?classId=${marksForm.classId}`).then((r) => r.data.data),
    enabled: !!(marksForm.examId && marksForm.classId),
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.get("/classes").then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/exams", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exams"] }); setTab("list"); },
  });

  const gradeColor = (g: string) => {
    if (g === "A+" || g === "A") return "badge-success";
    if (g === "B") return "badge-info";
    if (g === "C") return "badge-warning";
    return "badge-danger";
  };

  return (
    <div>
      <Header title="Exams & Results" subtitle="Manage exams, enter marks and view results" />
      <div className="p-6 space-y-5">

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {[["list", "Exams List"], ["create", "Create Exam"], ["marks", "View Results"]].map(([t, l]) => (
            <button key={t} onClick={() => setTab(t as any)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === "list" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-32 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
            )) : exams?.map((exam: any, i: number) => (
              <div key={exam.id} className={`stat-card bg-white rounded-2xl shadow-card p-5 animate-in delay-${(i % 4) + 1}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#6366f118,#7c3aed18)" }}>
                    <ClipboardList size={18} className="text-purple-600" />
                  </div>
                  <span className="badge badge-info text-xs">{exam.examType}</span>
                </div>
                <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{exam.name}</h3>
                <p className="text-slate-400 text-xs mt-1">{exam.academicYear?.name}</p>
                <p className="text-slate-500 text-xs mt-2">{formatDate(exam.startDate)} — {formatDate(exam.endDate)}</p>
                <p className="text-slate-400 text-xs mt-1">{exam._count?.marks ?? 0} marks entered</p>
              </div>
            ))}
            {exams?.length === 0 && (
              <div className="col-span-full bg-white rounded-2xl shadow-card p-12 text-center text-slate-400">
                No exams created yet.
              </div>
            )}
          </div>
        )}

        {tab === "create" && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in max-w-xl">
            <h3 className="font-bold text-slate-800 mb-5" style={{ fontFamily: "var(--font-display)" }}>Create Exam</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Annual Exam 2025" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exam Type</label>
                  <select value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                    {["MIDTERM","FINAL","UNIT_TEST","ASSIGNMENT","PRACTICAL"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Academic Year</label>
                  <select value={form.academicYearId} onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                    <option value="">Select year</option>
                    {years?.map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
                {createMutation.isPending ? "Creating..." : "Create Exam"}
              </button>
            </div>
          </div>
        )}

        {tab === "marks" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Exam</label>
                  <select value={marksForm.examId} onChange={(e) => setMarksForm({ ...marksForm, examId: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 min-w-[200px]">
                    <option value="">Choose exam</option>
                    {exams?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Class</label>
                  <select value={marksForm.classId} onChange={(e) => setMarksForm({ ...marksForm, classId: e.target.value })}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 min-w-[180px]">
                    <option value="">Choose class</option>
                    {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {results && (
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <Trophy size={18} className="text-amber-500" />
                  <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>
                    {results.exam?.name} — Results
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Marks</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">%</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {results.results?.map((r: any) => (
                        <tr key={r.student.id} className="table-row-hover">
                          <td className="px-5 py-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${r.rank <= 3 ? "text-white" : "bg-slate-100 text-slate-500"}`}
                              style={r.rank <= 3 ? { background: r.rank === 1 ? "#f59e0b" : r.rank === 2 ? "#94a3b8" : "#b87333" } : {}}>
                              {r.rank}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <p className="font-semibold text-slate-800 text-sm">{r.student.name}</p>
                            <p className="text-slate-400 text-xs">Roll: {r.student.rollNo}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-700 font-mono">{r.totalObtained}/{r.totalPossible}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${r.percentage}%`, background: "linear-gradient(90deg,#1a56db,#6366f1)" }} />
                              </div>
                              <span className="text-sm text-slate-600 font-medium">{r.percentage}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`badge ${gradeColor(r.overallGrade)}`}>{r.overallGrade}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
