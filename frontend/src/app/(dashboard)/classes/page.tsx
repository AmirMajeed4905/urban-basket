"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Plus, BookOpen, Users, Trash2, Pencil, X, GraduationCap, ChevronDown } from "lucide-react";
import api from "@/lib/axios";
import { Class } from "@/types";

/* ─── small helpers ─── */
const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white placeholder-gray-400 transition";

const labelCls = "block text-xs font-medium text-gray-500 mb-1";

export default function ClassesPage() {
  const qc = useQueryClient();

  const [academicYearId, setAcademicYearId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Class | null>(null);

  const [form, setForm] = useState({
    name: "",
    section: "",
    academicYearId: "",
    capacity: 40,
  });

  /* ── DATA ── */
  const { data: years } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () =>
      api.get("/classes/academic-years").then((r) => r.data.data),
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ["classes", academicYearId],
    queryFn: () =>
      api
        .get(`/classes${academicYearId ? `?academicYearId=${academicYearId}` : ""}`)
        .then((r) => r.data.data),
  });

  /* ── MUTATIONS ── */
  const createMutation = useMutation({
    mutationFn: (data: typeof form) => api.post("/classes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      setShowForm(false);
      setForm({ name: "", section: "", academicYearId: "", capacity: 40 });
    },
  });

const updateMutation = useMutation({
  mutationFn: (data: Class) =>
    api.patch(`/classes/${data.id}`, {
      name: data.name,
      section: data.section,
      capacity: data.capacity,
    }),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["classes"] });
    setEditClass(null);
  },
});

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["classes"] });
      setDeleteTarget(null);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setForm({ name: "", section: "", academicYearId: "", capacity: 40 });
  };

  /* ── capacity badge color ── */
  const capacityColor = (count: number, cap: number) => {
    const pct = count / cap;
    if (pct >= 0.9) return "text-red-600 bg-red-50";
    if (pct >= 0.7) return "text-amber-600 bg-amber-50";
    return "text-emerald-600 bg-emerald-50";
  };

  /* ── RENDER ── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Classes" subtitle="Manage classes and sections" />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">

        {/* ── TOP BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* filter */}
          <div className="relative">
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Academic Years</option>
              {years?.map((y: any) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:scale-95 transition shadow-sm"
          >
            <Plus size={16} />
            Add Class
          </button>
        </div>

        {/* ── STATS ── */}
        {!isLoading && classes && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Classes", value: classes.length },
              { label: "Total Capacity", value: classes.reduce((s: number, c: Class) => s + c.capacity, 0) },
              { label: "Total Students", value: classes.reduce((s: number, c: Class) => s + (c._count?.students ?? 0), 0) },
              {
                label: "Avg Fill Rate",
                value: classes.length
                  ? `${Math.round(
                      (classes.reduce((s: number, c: Class) => s + (c._count?.students ?? 0), 0) /
                        classes.reduce((s: number, c: Class) => s + c.capacity, 0)) * 100
                    )}%`
                  : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── CREATE FORM ── */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Create New Class</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className={labelCls}>Class Name *</label>
                <input
                  placeholder="e.g. Grade 10"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Section *</label>
                <input
                  placeholder="e.g. A"
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Academic Year *</label>
                <select
                  value={form.academicYearId}
                  onChange={(e) => setForm({ ...form, academicYearId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Select Year</option>
                  {years?.map((y: any) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || !form.section || !form.academicYearId || createMutation.isPending}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {createMutation.isPending ? "Creating…" : "Create Class"}
              </button>
              <button
                onClick={resetForm}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>

            {createMutation.isError && (
              <p className="mt-3 text-sm text-red-500">
                Something went wrong. Please try again.
              </p>
            )}
          </div>
        )}

        {/* ── GRID ── */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : classes?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <GraduationCap size={40} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No classes found</p>
            <p className="text-xs mt-1">Click "Add Class" to create one</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {classes?.map((cls: Class) => {
              const students = cls._count?.students ?? 0;
              const pct = Math.round((students / cls.capacity) * 100);
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group"
                >
                  {/* top row */}
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-xl bg-blue-50">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditClass(cls)}
                        className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cls)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* name */}
                  <h3 className="font-bold text-gray-800 mt-3 text-base">
                    {cls.name} — {cls.section}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{cls.academicYear?.name}</p>

                  {/* capacity bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={11} />
                        <span>{students} / {cls.capacity}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${capacityColor(students, cls.capacity)}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {editClass && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setEditClass(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Edit Class</h2>
              <button onClick={() => setEditClass(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className={labelCls}>Class Name</label>
                <input
                  value={editClass.name}
                  onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Section</label>
                <input
                  value={editClass.section}
                  onChange={(e) => setEditClass({ ...editClass, section: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={editClass.capacity}
                  onChange={(e) => setEditClass({ ...editClass, capacity: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateMutation.mutate(editClass)}
                disabled={updateMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditClass(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>

            {updateMutation.isError && (
              <p className="mt-3 text-sm text-red-500 text-center">
                Update failed. Please try again.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-50">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <h2 className="font-semibold text-gray-800">Delete Class?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {deleteTarget.name}-{deleteTarget.section}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleteMutation.isPending ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}