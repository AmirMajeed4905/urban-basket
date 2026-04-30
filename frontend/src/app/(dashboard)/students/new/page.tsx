"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all" />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-white">
    {children}
  </select>
);

export default function NewStudentPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "", gender: "MALE", dateOfBirth: "", religion: "", address: "",
    rollNo: "", admissionNo: "", admissionDate: "", classId: "",
    fatherName: "", fatherPhone: "", fatherCnic: "",
    motherName: "", motherPhone: "",
    guardianName: "", guardianPhone: "",
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => api.get("/classes").then((r) => r.data.data),
  });

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/students", data),
    onSuccess: () => router.push("/students"),
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Something went wrong";
      setErrors({ general: msg });
    },
  });

  const handleSubmit = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.rollNo.trim()) e.rollNo = "Roll number is required";
    if (!form.admissionNo.trim()) e.admissionNo = "Admission number is required";
    if (!form.admissionDate) e.admissionDate = "Admission date is required";
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!form.classId) e.classId = "Class is required";
    if (!form.fatherName.trim()) e.fatherName = "Father name is required";
    if (!form.fatherPhone.trim()) e.fatherPhone = "Father phone is required";
    setErrors(e);
    if (Object.keys(e).length === 0) createMutation.mutate(form);
  };

  const section = (title: string, children: React.ReactNode) => (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h3 className="font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );

  return (
    <div>
      <Header title="Enroll New Student" subtitle="Fill in student details to enroll" />
      <div className="p-6 space-y-5">

        <Link href="/students" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={15} /> Back to Students
        </Link>

        {errors.general && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{errors.general}</div>
        )}

        {section("Basic Information", <>
          <Field label="Full Name *" error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ahmed Ali" />
          </Field>
          <Field label="Gender *">
            <Select value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </Select>
          </Field>
          <Field label="Date of Birth *" error={errors.dateOfBirth}>
            <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
          </Field>
          <Field label="Religion">
            <Input value={form.religion} onChange={(e) => set("religion", e.target.value)} placeholder="Islam" />
          </Field>
          <Field label="Address" error={errors.address}>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House no, Street, City" />
          </Field>
        </>)}

        {section("Admission Details", <>
          <Field label="Roll Number *" error={errors.rollNo}>
            <Input value={form.rollNo} onChange={(e) => set("rollNo", e.target.value)} placeholder="2025-001" />
          </Field>
          <Field label="Admission Number *" error={errors.admissionNo}>
            <Input value={form.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} placeholder="ADM-2025-001" />
          </Field>
          <Field label="Admission Date *" error={errors.admissionDate}>
            <Input type="date" value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} />
          </Field>
          <Field label="Class *" error={errors.classId}>
            <Select value={form.classId} onChange={(e) => set("classId", e.target.value)}>
              <option value="">Select class</option>
              {classes?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}-{c.section} ({c.academicYear?.name})</option>
              ))}
            </Select>
          </Field>
        </>)}

        {section("Parent / Guardian Information", <>
          <Field label="Father Name *" error={errors.fatherName}>
            <Input value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} placeholder="Ali Ahmed" />
          </Field>
          <Field label="Father Phone *" error={errors.fatherPhone}>
            <Input value={form.fatherPhone} onChange={(e) => set("fatherPhone", e.target.value)} placeholder="03001234567" />
          </Field>
          <Field label="Father CNIC">
            <Input value={form.fatherCnic} onChange={(e) => set("fatherCnic", e.target.value)} placeholder="31301-1234567-1" />
          </Field>
          <Field label="Mother Name">
            <Input value={form.motherName} onChange={(e) => set("motherName", e.target.value)} placeholder="Fatima Ali" />
          </Field>
          <Field label="Mother Phone">
            <Input value={form.motherPhone} onChange={(e) => set("motherPhone", e.target.value)} placeholder="03001234568" />
          </Field>
          <Field label="Guardian Name">
            <Input value={form.guardianName} onChange={(e) => set("guardianName", e.target.value)} placeholder="If different from father" />
          </Field>
          <Field label="Guardian Phone">
            <Input value={form.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} placeholder="03001234569" />
          </Field>
        </>)}

        <div className="flex items-center gap-3 pb-4">
          <button onClick={handleSubmit} disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)" }}>
            {createMutation.isPending ? <><Loader2 size={16} className="animate-spin" /> Enrolling...</> : <><Save size={16} /> Enroll Student</>}
          </button>
          <Link href="/students" className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>

      </div>
    </div>
  );
}