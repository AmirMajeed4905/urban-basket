import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateFeeStructureInput, CollectFeeInput } from "../validators/fee.validator";
import { FeeStatus } from "@prisma/client";

/* =========================================================
   CREATE FEE STRUCTURE
========================================================= */

export const createFeeStructureService = async (
  data: CreateFeeStructureInput,
  createdById: string
) => {
  const [classExists, yearExists] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.academicYear.findUnique({ where: { id: data.academicYearId } }),
  ]);

  if (!classExists) throw new ApiError(404, "Class not found");
  if (!yearExists) throw new ApiError(404, "Academic year not found");

  const duplicate = await prisma.feeStructure.findFirst({
    where: {
      name: data.name,
      classId: data.classId,
      academicYearId: data.academicYearId,
    },
  });

  if (duplicate) {
    throw new ApiError(409, "Fee structure already exists");
  }

  return prisma.feeStructure.create({
    data: {
      ...data,
      createdById,
    },
    include: {
      class: true,
      academicYear: true,
    },
  });
};

/* =========================================================
   GET FEE STRUCTURES
========================================================= */

export const getFeeStructuresService = async (
  classId?: string,
  academicYearId?: string
) => {
  return prisma.feeStructure.findMany({
    where: {
      ...(classId && { classId }),
      ...(academicYearId && { academicYearId }),
    },
    include: {
      class: true,
      academicYear: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/* =========================================================
   COLLECT FEE
========================================================= */

export const collectFeeService = async (
  data: CollectFeeInput,
  recordedById: string
) => {
  const [student, feeStructure] = await Promise.all([
    prisma.student.findUnique({
      where: { id: data.studentId },
      include: { class: true },
    }),
    prisma.feeStructure.findUnique({
      where: { id: data.feeStructureId },
    }),
  ]);

  if (!student) throw new ApiError(404, "Student not found");
  if (!feeStructure) throw new ApiError(404, "Fee structure not found");

  if (student.classId !== feeStructure.classId) {
    throw new ApiError(400, "Class mismatch");
  }

  const base = Number(feeStructure.amount || 0);
  const lateFine = Number(feeStructure.lateFine || 0);
  const discount = Number(data.discount || 0);

  const amountDue = Math.max(0, base + lateFine - discount);
  const paid = Number(data.amountPaid || 0);

  let status: FeeStatus;
  if (paid <= 0) status = FeeStatus.UNPAID;
  else if (paid >= amountDue) status = FeeStatus.PAID;
  else status = FeeStatus.PARTIAL;

  const paidAt = status === FeeStatus.PAID ? new Date() : null;

  return prisma.feePayment.upsert({
    where: {
      studentId_feeStructureId_month_year: {
        studentId: data.studentId,
        feeStructureId: data.feeStructureId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      amountDue,
      amountPaid: paid,
      discount,
      lateFine,
      status,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks ?? null,
      paidAt,
      recordedById,
    },
    create: {
      studentId: data.studentId,
      feeStructureId: data.feeStructureId,
      month: data.month,
      year: data.year,
      amountDue,
      amountPaid: paid,
      discount,
      lateFine,
      status,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks ?? null,
      paidAt,
      recordedById,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          rollNo: true,
          class: true,
        },
      },
      feeStructure: true,
    },
  });
};

/* =========================================================
   STUDENT FEE HISTORY
   FIX: Ab { payments, summary } object return hoga
        jo frontend expect karta hai
========================================================= */

export const getStudentFeeHistoryService = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new ApiError(404, "Student not found");

  const payments = await prisma.feePayment.findMany({
    where: { studentId },
    include: {
      feeStructure: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Summary calculate karo
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amountDue || 0), 0);
  const totalDiscount = payments.reduce((sum, p) => sum + Number(p.discount || 0), 0);
  const balance = totalDue - totalPaid;

  return {
    payments,
    summary: {
      totalPaid,
      totalDue,
      totalDiscount,
      balance,
    },
  };
};

/* =========================================================
   DEFAULTERS
========================================================= */

export const getDefaultersService = async (
  month: number,
  year: number,
  classId?: string
) => {
  return prisma.feePayment.findMany({
    where: {
      month,
      year,
      status: {
        in: [FeeStatus.UNPAID, FeeStatus.PARTIAL],
      },
      ...(classId && { student: { classId } }),
    },
    include: {
      student: {
        include: {
          class: true,
        },
      },
      feeStructure: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/* =========================================================
   FEE STATS (DASHBOARD)
========================================================= */

export const getFeeStatsService = async (month: number, year: number) => {
  const [students, payments] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.feePayment.findMany({
      where: { month, year },
    }),
  ]);

  const totalStudents = students;

  const totalCollected = payments.reduce(
    (sum, p) => sum + Number(p.amountPaid || 0),
    0
  );

  const totalExpected = payments.reduce(
    (sum, p) => sum + Number(p.amountDue || 0),
    0
  );

  const paid = payments.filter((p) => p.status === "PAID").length;
  const unpaid = payments.filter((p) => p.status === "UNPAID").length;
  const partial = payments.filter((p) => p.status === "PARTIAL").length;

  return {
    total: totalStudents,
    paid,
    unpaid,
    partial,
    totalCollected,
    totalExpected,
    totalPending: totalExpected - totalCollected,
  };
};

/* =========================================================
   MONTHLY STATS (DASHBOARD GRAPH)
========================================================= */

export const getMonthlyFeeStatsService = async (year: number) => {
  const data = await prisma.feePayment.groupBy({
    by: ["month"],
    where: { year },
    _sum: {
      amountPaid: true,
      amountDue: true,
    },
  });

  return data.map((item) => ({
    month: item.month,
    collected: Number(item._sum.amountPaid || 0),
    pending:
      Number(item._sum.amountDue || 0) - Number(item._sum.amountPaid || 0),
  }));
};