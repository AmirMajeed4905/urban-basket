"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import DataTable from "@/components/shared/DataTable";
import StatCard from "@/components/shared/StatCard";
import {
  Plus,
  Users,
  UserCheck,
  GraduationCap,
  ToggleLeft,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { Staff } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const STAFF_TYPES = ["", "TEACHER", "CLERK", "PEON", "ACCOUNTANT", "OTHER"];

const EMPTY_FORM = {
  employeeNo: "",
  name: "",
  gender: "MALE",
  phone: "",
  email: "",
  staffType: "TEACHER",
  designation: "",
  joinDate: "",
  salary: "",
};

interface StaffListResponse {
  staff: Staff[];
  pagination: {
    totalPages: number;
    [key: string]: unknown;
  };
}

function useDebounce(value: string, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useMemo(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);

  return debounced;
}

const gradBg = { background: "linear-gradient(135deg,#7c3aed,#5b21b6)" };

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [staffType, setStaffType] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const debouncedSearch = useDebounce(search, 500);
  const qc = useQueryClient();
  const LIMIT = 10;

  /* =======================
     QUERIES
  ======================= */

  const { data, isLoading } = useQuery({
    queryKey: ["staff", page, debouncedSearch, staffType],
    queryFn: async () => {
      const res = await api.get(
        `/staff?page=${page}&limit=${LIMIT}&search=${debouncedSearch}&staffType=${staffType}`
      );
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });

  const { data: stats } = useQuery({
    queryKey: ["staff-stats"],
    queryFn: async () => {
      const res = await api.get("/staff/stats");
      return res.data.data;
    },
  });

  /* =======================
     MUTATIONS
  ======================= */

  const createMutation = useMutation({
    mutationFn: (d: typeof EMPTY_FORM) => api.post("/staff", d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      qc.invalidateQueries({ queryKey: ["staff-stats"] });
      closeModal();
      setPage(1);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof EMPTY_FORM }) =>
      api.patch(`/staff/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      qc.invalidateQueries({ queryKey: ["staff-stats"] });
      closeModal();
    },
    onError: (error) => console.log("Update Error:", error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/staff/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      qc.invalidateQueries({ queryKey: ["staff-stats"] });
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/staff/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["staff"] });
      qc.invalidateQueries({ queryKey: ["staff-stats"] });
    },
  });

  /* =======================
     FORM HANDLERS
  ======================= */

  function openAdd() {
    setEditStaff(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(staff: Staff) {
    setEditStaff(staff);
    setForm({
      employeeNo: staff.employeeNo ?? "",
      name: staff.name ?? "",
      gender: staff.gender ?? "MALE",
      phone: staff.phone ?? "",
      email: staff.email ?? "",
      staffType: staff.staffType ?? "TEACHER",
      designation: staff.designation ?? "",
      joinDate: staff.joinDate?.slice(0, 10) ?? "",
      salary: String(staff.salary ?? ""),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditStaff(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleSave() {
    const payload = {
      ...form,
      joinDate: form.joinDate
        ? new Date(form.joinDate).toISOString()
        : "",
    };

    if (editStaff) {
      updateMutation.mutate({ id: editStaff.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = [
    {
      key: "name",
      label: "Staff Member",
      render: (row: Staff) => (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={gradBg}
          >
            {row.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{row.name}</p>
            <p className="text-xs text-slate-400 truncate">{row.employeeNo}</p>
          </div>
        </div>
      ),
    },
    {
      key: "staffType",
      label: "Type",
      render: (row: Staff) => (
        <span className="badge badge-info">{row.staffType}</span>
      ),
    },
    {
      key: "designation",
      label: "Designation",
      render: (row: Staff) => (
        <span className="text-sm text-slate-600">
          {row.designation || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: Staff) => (
        <span className="font-mono text-xs">{row.phone}</span>
      ),
    },
    {
      key: "salary",
      label: "Salary",
      render: (row: Staff) => (
        <span className="font-semibold text-emerald-600 text-sm">
          {formatCurrency(row.salary)}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row: Staff) => (
        <button
          onClick={() => toggleMutation.mutate(row.id)}
          className={`badge ${
            row.isActive ? "badge-success" : "badge-danger"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "joinDate",
      label: "Joined",
      render: (row: Staff) => (
        <span className="text-xs text-slate-400">
          {formatDate(row.joinDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Staff) => (
        <div className="flex gap-1">
          <button onClick={() => openEdit(row)}>
            <Pencil size={15} />
          </button>
          <button onClick={() => setDeleteTarget(row)}>
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div>
      <Header title="Staff" subtitle="Manage teachers and staff" />

      <div className="p-4 sm:p-6 space-y-5">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Staff" value={stats?.total ?? 0} icon={<Users />} color="#7c3aed" />
          <StatCard title="Teachers" value={stats?.teachers ?? 0} icon={<GraduationCap />} color="#0ea5e9" />
          <StatCard title="Active" value={stats?.active ?? 0} icon={<UserCheck />} color="#10b981" />
          <StatCard title="Inactive" value={stats?.inactive ?? 0} icon={<ToggleLeft />} color="#f43f5e" />
        </div>

        {/* FILTERS */}
        <div className="flex gap-2 flex-wrap overflow-x-auto">
          {STAFF_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                setStaffType(t);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-full text-sm whitespace-nowrap"
              style={staffType === t ? gradBg : {}}
            >
              {t || "All"}
            </button>
          ))}
        </div>

        {/* TABLE WRAP */}
        <div className="w-full overflow-x-auto">
          <DataTable
            columns={columns}
            data={data?.staff ?? []}
            isLoading={isLoading}
            search={search}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            actions={
              <button onClick={openAdd} style={gradBg} className="px-4 py-2 text-white rounded-xl flex items-center gap-2">
                <Plus size={16} /> Add Staff
              </button>
            }
          />
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">

            <div className="flex justify-between mb-4">
              <h2 className="font-bold">{editStaff ? "Edit" : "Add"} Staff</h2>
              <button onClick={closeModal}>
                <X />
              </button>
            </div>

              <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Employee No", id: "employeeNo", placeholder: "EMP-001" },
                { label: "Full Name",   id: "name",       placeholder: "Staff name" },
                { label: "Phone",       id: "phone",      placeholder: "03xx-xxxxxxx" },
                { label: "Email",       id: "email",      placeholder: "email@school.com", type: "email" },
                { label: "Designation", id: "designation",placeholder: "e.g. Senior Teacher" },
                { label: "Salary (PKR)",id: "salary",     placeholder: "25000", type: "number" },
              ].map(({ label, id, placeholder, type = "text" }) => (
                <div key={id} className={id === "designation" ? "col-span-2" : ""}>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[id]}
                    onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition"
                  />
                </div>
              ))}

              {/* Gender */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              {/* Staff Type */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Staff Type</label>
                <select
                  value={form.staffType}
                  onChange={(e) => setForm((f) => ({ ...f, staffType: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  {STAFF_TYPES.filter(Boolean).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Join Date */}
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Join Date</label>
                <input
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={closeModal} className="w-full sm:w-auto border px-4 py-2 rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={gradBg}
                className="w-full sm:w-auto text-white px-5 py-2 rounded-xl"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 text-center">

            <p className="mb-4 font-semibold">Delete {deleteTarget.name}?</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setDeleteTarget(null)} className="w-full border px-4 py-2 rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-xl"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}