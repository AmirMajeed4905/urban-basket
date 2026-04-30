"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Plus, Bell, Pin, Trash2, Calendar } from "lucide-react";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";

const TARGET_COLORS: Record<string, string> = {
  ALL: "badge-info", TEACHERS: "badge-warning", STUDENTS: "badge-success",
  PARENTS: "badge-gray", STAFF: "badge-warning",
};

export default function NoticesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", target: "ALL", isPinned: false, expiresAt: "" });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notices"],
    queryFn: () => api.get("/notices?limit=50").then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/notices", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notices"] }); setShowForm(false); setForm({ title: "", content: "", target: "ALL", isPinned: false, expiresAt: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notices"] }),
  });

  return (
    <div>
      <Header title="Notice Board" subtitle="Manage school announcements and notices" />
      <div className="p-6 space-y-5">

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 animate-in">
            <h3 className="font-bold text-slate-800 mb-4" style={{ fontFamily: "var(--font-display)" }}>New Notice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Notice title" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Content</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Notice content..." rows={4}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target</label>
                  <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500">
                    {["ALL", "TEACHERS", "STUDENTS", "PARENTS", "STAFF"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expires At (optional)</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-sm text-slate-600 font-medium">Pin this notice</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
                  {createMutation.isPending ? "Publishing..." : "Publish Notice"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
            <Plus size={16} /> New Notice
          </button>
        </div>

        {/* Notices Grid */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-5 animate-pulse">
                <div className="h-5 bg-slate-100 rounded w-48 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-full mb-1" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.notices?.map((notice: any, i: number) => (
              <div key={notice.id} className={`bg-white rounded-2xl shadow-card p-5 animate-in delay-${(i % 4) + 1} ${notice.isPinned ? "border-l-4 border-orange-400" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: notice.isPinned ? "linear-gradient(135deg,#f97316,#ea580c)" : "linear-gradient(135deg,#1a56db18,#1e3a8a18)" }}>
                      {notice.isPinned ? <Pin size={16} className="text-white" /> : <Bell size={16} className="text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-slate-800" style={{ fontFamily: "var(--font-display)" }}>{notice.title}</h3>
                        {notice.isPinned && <span className="badge badge-warning text-xs">Pinned</span>}
                        <span className={`badge ${TARGET_COLORS[notice.target] || "badge-gray"} text-xs`}>{notice.target}</span>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{notice.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(notice.publishedAt)}</span>
                        {notice.expiresAt && <span>Expires: {formatDate(notice.expiresAt)}</span>}
                        <span>By {notice.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { if (confirm("Delete notice?")) deleteMutation.mutate(notice.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {data?.notices?.length === 0 && (
              <div className="bg-white rounded-2xl shadow-card p-16 text-center">
                <Bell size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400">No notices yet. Create one above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
