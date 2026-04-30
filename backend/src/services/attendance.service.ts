import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { MarkAttendanceInput } from "../validators/attendance.validator";
import { AttendanceStatus } from "@prisma/client";

export const markAttendanceService = async (data: MarkAttendanceInput) => {
  // Parse date properly to avoid timezone issues
  const dateStr = data.date;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  type AttendanceRecord = {
    studentId: string;
    status: AttendanceStatus;
    remarks?: string | null;
  };

  const operations = data.records.map((record) => {
    const attendanceRecord = record as AttendanceRecord;

    return prisma.attendance.upsert({
      where: {
        studentId_date: {
          studentId: attendanceRecord.studentId,
          date,
        },
      },
      update: {
        status: attendanceRecord.status,
        remarks: attendanceRecord.remarks ?? null,
      },
      create: {
        studentId: attendanceRecord.studentId,
        date,
        status: attendanceRecord.status,
        remarks: attendanceRecord.remarks ?? null,
      },
    });
  });

  await prisma.$transaction(operations);

  return {
    success: true,
    marked: data.records.length,
    date: data.date,
  };
};

export const getAttendanceService = async (query: {
  classId?: string;
  studentId?: string;
  subjectId?: string;
  fromDate?: string;
  toDate?: string;
  month?: number;
  year?: number;
}) => {
  const { classId, studentId, subjectId, fromDate, toDate, month, year } = query;

  let dateFilter: any = {};
  if (fromDate && toDate) {
    // Parse dates properly
    const [fromYear, fromMonth, fromDay] = fromDate.split('-').map(Number);
    const [toYear, toMonth, toDay] = toDate.split('-').map(Number);
    const from = new Date(fromYear, fromMonth - 1, fromDay);
    const to = new Date(toYear, toMonth - 1, toDay);
    dateFilter = { gte: from, lte: to };
  } else if (month && year) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0);
    dateFilter = { gte: from, lte: to };
  }

  return prisma.attendance.findMany({
    where: {
      ...(studentId && { studentId }),
      ...(subjectId && { subjectId }),
      ...(Object.keys(dateFilter).length && { date: dateFilter }),
      ...(classId && {
        student: { classId },
      }),
    },
    include: {
      student: { select: { id: true, name: true, rollNo: true } },
      subject: { select: { id: true, name: true } },
    },
    orderBy: { date: "desc" },
  });
};

export const getAttendanceSummaryService = async (studentId: string, month: number, year: number) => {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);

  const records = await prisma.attendance.findMany({
    where: {
      studentId,
      date: { gte: from, lte: to },
    },
    select: { status: true },
  });

  const summary: Record<string, number> = {
    PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0,
  };

  records.forEach((r) => {
    summary[r.status] = (summary[r.status] || 0) + 1;
  });

  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const attendancePercent = total > 0
    ? Math.round(((summary.PRESENT + summary.LATE) / total) * 100)
    : 0;

  return { ...summary, total, attendancePercent };
};