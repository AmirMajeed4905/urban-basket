import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateFeeStructureInput, CollectFeeInput } from "../validators/fee.validator";
import { FeeStatus } from "@prisma/client";

// ─── Create Fee Structure ─────────────────────────────────────────────────────

export const createFeeStructureService = async (
  data: CreateFeeStructureInput,
  createdById: string
) => {
  // Validate class and academic year exist
  const [classExists, yearExists] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.academicYear.findUnique({ where: { id: data.academicYearId } }),
  ]);

  if (!classExists) throw new ApiError(404, "Class not found");
  if (!yearExists) throw new ApiError(404, "Academic year not found");

  // Check duplicate fee structure for same class + year + name
  const duplicate = await prisma.feeStructure.findFirst({
    where: {
      name: data.name,
      classId: data.classId,
      academicYearId: data.academicYearId,
    },
  });
  if (duplicate) {
    throw new ApiError(409, "A fee structure with this name already exists for this class and year");
  }

  return prisma.feeStructure.create({
    data: {
      name: data.name,
      classId: data.classId,
      academicYearId: data.academicYearId,
      amount: data.amount,
      dueDay: data.dueDay,
      lateFine: data.lateFine,
      createdById,
    },
    include: {
      class: { select: { id: true, name: true, section: true } },
      academicYear: { select: { id: true, name: true } },
    },
  });
};

// ─── Get Fee Structures ───────────────────────────────────────────────────────

export const getFeeStructuresService = async (classId?: string, academicYearId?: string) => {
  return prisma.feeStructure.findMany({
    where: {
      ...(classId && { classId }),
      ...(academicYearId && { academicYearId }),
    },
    include: {
      class: { select: { id: true, name: true, section: true } },
      academicYear: { select: { id: true, name: true } },
    },
    orderBy: [{ class: { name: "asc" } }, { createdAt: "desc" }],
  });
};

// ─── Collect Fee ──────────────────────────────────────────────────────────────

export const collectFeeService = async (data: CollectFeeInput, recordedById: string) => {
  // Fetch student and fee structure together
  const [student, feeStructure] = await Promise.all([
    prisma.student.findUnique({
      where: { id: data.studentId },
      include: { class: { select: { id: true, name: true, section: true } } },
    }),
    prisma.feeStructure.findUnique({
      where: { id: data.feeStructureId },
      include: { class: { select: { id: true, name: true, section: true } } },
    }),
  ]);

  if (!student) throw new ApiError(404, "Student not found");
  if (!feeStructure) throw new ApiError(404, "Fee structure not found");

  // ✅ FIX: Class mismatch check — student class must match fee structure class
  if (student.classId !== feeStructure.classId) {
    throw new ApiError(
      400,
      `Class mismatch: Student is in ${student.class.name}-${student.class.section} but fee structure is for ${feeStructure.class.name}-${feeStructure.class.section}`
    );
  }

  // ✅ FIX: Correct amount calculation
  // amountDue = base amount + late fine - discount
  const baseAmount = Number(feeStructure.amount);
  const lateFine = Number(feeStructure.lateFine);
  const discount = Number(data.discount);
  const amountDue = Math.max(0, baseAmount + lateFine - discount);

  // Determine status
  const amountPaid = Number(data.amountPaid);
  let status: FeeStatus;
  if (amountPaid <= 0) {
    status = FeeStatus.UNPAID;
  } else if (amountPaid >= amountDue) {
    status = FeeStatus.PAID;
  } else {
    status = FeeStatus.PARTIAL;
  }

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
    // ✅ FIX: update also recalculates amountDue
    update: {
      amountDue,
      amountPaid,
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
      amountPaid,
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
          class: { select: { name: true, section: true } },
        },
      },
      feeStructure: { select: { id: true, name: true, amount: true } },
    },
  });
};

// ─── Student Fee History ──────────────────────────────────────────────────────

export const getStudentFeeHistoryService = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      rollNo: true,
      class: { select: { name: true, section: true } },
    },
  });
  if (!student) throw new ApiError(404, "Student not found");

  const payments = await prisma.feePayment.findMany({
    where: { studentId },
    include: {
      feeStructure: {
        select: { id: true, name: true, amount: true },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Calculate totals for this student
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const totalDue = payments.reduce((sum, p) => sum + Number(p.amountDue), 0);
  const totalDiscount = payments.reduce((sum, p) => sum + Number(p.discount), 0);
  const balance = totalDue - totalPaid;

  return {
    student,
    payments,
    summary: { totalPaid, totalDue, totalDiscount, balance },
  };
};

// ─── Defaulters ───────────────────────────────────────────────────────────────

export const getDefaultersService = async (
  month: number,
  year: number,
  classId?: string
) => {
  return prisma.feePayment.findMany({
    where: {
      month,
      year,
      status: { in: [FeeStatus.UNPAID, FeeStatus.PARTIAL] },
      ...(classId && { student: { classId } }),
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          rollNo: true,
          fatherPhone: true,
          class: { select: { id: true, name: true, section: true } },
        },
      },
      feeStructure: {
        select: { id: true, name: true, amount: true },
      },
    },
    orderBy: { student: { name: "asc" } },
  });
};

// ─── Fee Stats ────────────────────────────────────────────────────────────────

export const getFeeStatsService = async (month: number, year: number) => {
  // Run all queries in parallel
  const [countResults, collectedResult, expectedResult] = await Promise.all([
    // Count by status
    prisma.$transaction([
      prisma.feePayment.count({ where: { month, year } }),
      prisma.feePayment.count({ where: { month, year, status: FeeStatus.PAID } }),
      prisma.feePayment.count({ where: { month, year, status: FeeStatus.UNPAID } }),
      prisma.feePayment.count({ where: { month, year, status: FeeStatus.PARTIAL } }),
    ]),
    // Total collected (paid + partial)
    prisma.feePayment.aggregate({
      where: { month, year, status: { in: [FeeStatus.PAID, FeeStatus.PARTIAL] } },
      _sum: { amountPaid: true },
    }),
    // Total expected (amountDue of all records)
    prisma.feePayment.aggregate({
      where: { month, year },
      _sum: { amountDue: true },
    }),
  ]);

  const [total, paid, unpaid, partial] = countResults;
  const totalCollected = Number(collectedResult._sum.amountPaid ?? 0);
  const totalExpected = Number(expectedResult._sum.amountDue ?? 0);
  const totalPending = totalExpected - totalCollected;

  return {
    total,
    paid,
    unpaid,
    partial,
    totalCollected,
    totalExpected,
    totalPending,
  };
};