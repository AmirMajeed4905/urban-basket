import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateFeeStructureInput, CollectFeeInput } from "../validators/fee.validator";
import { FeeStatus } from "@prisma/client";

export const createFeeStructureService = async (data: CreateFeeStructureInput, createdById: string) => {
  const [classExists, yearExists] = await Promise.all([
    prisma.class.findUnique({ where: { id: data.classId } }),
    prisma.academicYear.findUnique({ where: { id: data.academicYearId } }),
  ]);
  if (!classExists) throw new ApiError(404, "Class not found");
  if (!yearExists) throw new ApiError(404, "Academic year not found");

  return prisma.feeStructure.create({
    data: { ...data, createdById },
    include: {
      class: { select: { id: true, name: true, section: true } },
      academicYear: { select: { id: true, name: true } },
    },
  });
};

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
    orderBy: { createdAt: "desc" },
  });
};

export const collectFeeService = async (data: CollectFeeInput, recordedById: string) => {
  const [student, feeStructure] = await Promise.all([
    prisma.student.findUnique({ where: { id: data.studentId } }),
    prisma.feeStructure.findUnique({ where: { id: data.feeStructureId } }),
  ]);
  if (!student) throw new ApiError(404, "Student not found");
  if (!feeStructure) throw new ApiError(404, "Fee structure not found");

  const amountDue = Number(feeStructure.amount) + Number(feeStructure.lateFine);
  const net = amountDue - data.discount;
  const status: FeeStatus = data.amountPaid >= net ? FeeStatus.PAID : data.amountPaid > 0 ? FeeStatus.PARTIAL : FeeStatus.UNPAID;

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
      amountPaid: data.amountPaid,
      discount: data.discount,
      status,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
      paidAt: status === FeeStatus.PAID ? new Date() : null,
      recordedById,
    },
    create: {
      studentId: data.studentId,
      feeStructureId: data.feeStructureId,
      month: data.month,
      year: data.year,
      amountDue,
      amountPaid: data.amountPaid,
      discount: data.discount,
      lateFine: feeStructure.lateFine,
      status,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
      paidAt: status === FeeStatus.PAID ? new Date() : null,
      recordedById,
    },
    include: {
      student: { select: { id: true, name: true, rollNo: true } },
      feeStructure: { select: { id: true, name: true } },
    },
  });
};

export const getStudentFeeHistoryService = async (studentId: string) => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new ApiError(404, "Student not found");

  return prisma.feePayment.findMany({
    where: { studentId },
    include: { feeStructure: { select: { id: true, name: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
};

export const getDefaultersService = async (month: number, year: number, classId?: string) => {
  return prisma.feePayment.findMany({
    where: {
      month,
      year,
      status: { in: ["UNPAID", "PARTIAL"] },
      ...(classId && { student: { classId } }),
    },
    include: {
      student: {
        select: {
          id: true, name: true, rollNo: true, fatherPhone: true,
          class: { select: { name: true, section: true } },
        },
      },
      feeStructure: { select: { name: true, amount: true } },
    },
    orderBy: { student: { name: "asc" } },
  });
};

export const getFeeStatsService = async (month: number, year: number) => {
  const [total, paid, unpaid, partial] = await prisma.$transaction([
    prisma.feePayment.count({ where: { month, year } }),
    prisma.feePayment.count({ where: { month, year, status: "PAID" } }),
    prisma.feePayment.count({ where: { month, year, status: "UNPAID" } }),
    prisma.feePayment.count({ where: { month, year, status: "PARTIAL" } }),
  ]);

  const collected = await prisma.feePayment.aggregate({
    where: { month, year, status: { in: ["PAID", "PARTIAL"] } },
    _sum: { amountPaid: true },
  });

  return {
    total, paid, unpaid, partial,
    totalCollected: collected._sum.amountPaid ?? 0,
  };
};