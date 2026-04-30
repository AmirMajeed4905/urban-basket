"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import { Save, UserCheck, UserX, Clock, Calendar } from "lucide-react";
import api from "@/lib/axios";

/* ================= TYPES ================= */

type Status = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

type Student = {
  id: string;
  name: string;
  rollNo: string;
  gender: "MALE" | "FEMALE";
};

type Class = {
  id: string;
  name: string;
  section: string;
};

type ClassData = {
  id: string;
  name: string;
  section: string;
  students: Student[];
};

const STATUS_COLORS: Record<Status, string> = {
  PRESENT: "bg-emerald-500",
  ABSENT: "bg-red-500",
  LATE: "bg-amber-500",
  LEAVE: "bg-slate-400",
};

/* ================= COMPONENT ================= */

export default function AttendancePage() {
  const [classId, setClassId] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [records, setRecords] = useState<Record<string, Status>>({});

  /* ================= QUERIES ================= */

  const { data: classes } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const res = await api.get("/classes");
      return res.data.data;
    },
  });

  const { data: classData, isLoading } = useQuery<ClassData>({
    queryKey: ["class-detail", classId],
    queryFn: async () => {
      const res = await api.get(`/classes/${classId}`);
      return res.data.data;
    },
    enabled: !!classId,
  });

  /* ================= FIXED SIDE EFFECT ================= */

  useEffect(() => {
    if (classData?.students) {
      const initial: Record<string, Status> = {};
      classData.students.forEach((s) => {
        initial[s.id] = "PRESENT";
      });
      setRecords(initial);
    }
  }, [classData]);

  /* ================= MUTATION ================= */

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.post("/attendance", {
        classId,
        date,
        records: Object.entries(records).map(([studentId, status]) => ({
          studentId,
          status,
        })),
      });
    },
    onSuccess: () => alert("Attendance saved successfully!"),
  });

  /* ================= HELPERS ================= */

  const setAll = (status: Status) => {
    if (!classData?.students) return;

    const updated: Record<string, Status> = {};
    classData.students.forEach((s) => {
      updated[s.id] = status;
    });

    setRecords(updated);
  };

  const counts = Object.values(records).reduce(
    (acc, s) => {
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  /* ================= UI ================= */

  return (
    <div>
      <Header title="Attendance" subtitle="Mark daily student attendance" />

      <div className="p-6 space-y-5">

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex flex-wrap gap-4 items-end">

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Select Class
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 min-w-[180px]"
              >
                <option value="">Choose class</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}-{c.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {classId && (
              <div className="flex gap-2 flex-wrap">
                {(["PRESENT", "ABSENT", "LATE", "LEAVE"] as Status[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setAll(s)}
                      className="px-3 py-2 rounded-xl text-white text-xs font-semibold"
                      style={{
                        background:
                          s === "PRESENT"
                            ? "#10b981"
                            : s === "ABSENT"
                            ? "#ef4444"
                            : s === "LATE"
                            ? "#f59e0b"
                            : "#94a3b8",
                      }}
                    >
                      All {s}
                    </button>
                  )
                )}
              </div>
            )}

          </div>
        </div>

        {/* Summary */}
        {classId && Object.keys(records).length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "Present", count: counts.PRESENT || 0, icon: UserCheck, color: "#10b981" },
              { label: "Absent", count: counts.ABSENT || 0, icon: UserX, color: "#ef4444" },
              { label: "Late", count: counts.LATE || 0, icon: Clock, color: "#f59e0b" },
              { label: "Leave", count: counts.LEAVE || 0, icon: Calendar, color: "#94a3b8" },
            ].map(({ label, count, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl shadow-card px-4 py-3 flex items-center gap-2.5"
              >
                <Icon size={16} style={{ color }} />
                <span className="text-sm font-semibold text-slate-700">
                  {count} {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Students */}
        {classId && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {classData?.name}-{classData?.section}
              </h3>

              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "#10b981" }}
              >
                <Save size={15} />
                {saveMutation.isPending ? "Saving..." : "Save Attendance"}
              </button>
            </div>

            {isLoading ? (
              <div className="p-5">Loading...</div>
            ) : (
              <div>
                {classData?.students.map((student, i) => (
                  <div key={student.id} className="p-4 flex justify-between items-center border-b">
                    <span>{i + 1}. {student.name}</span>

                    <div className="flex gap-2">
                      {(["PRESENT", "ABSENT", "LATE", "LEAVE"] as Status[]).map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setRecords({
                                ...records,
                                [student.id]: s,
                              })
                            }
                            className={`px-2 py-1 rounded text-xs text-white ${STATUS_COLORS[s]}`}
                          >
                            {s[0]}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}