import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import {
  CreateStudentInput,
  UpdateStudentInput,
  TransferStudentInput,
} from "../validators/student.validator";
import { StudentStatus } from "@prisma/client";

// ════════════════════════════════════════════════════════════
// CREATE STUDENT
// ════════════════════════════════════════════════════════════
export const createStudentService = async (data: CreateStudentInput) => {
  // Roll number ya admission number exist karta hai?
  const existing = await prisma.student.findFirst({
    where: {
      OR: [
        { rollNo: data.rollNo },
        { admissionNo: data.admissionNo },
      ],
    },
  });

  if (existing) {
    if (existing.rollNo === data.rollNo) {
      throw new ApiError(409, "Roll number already exists");
    }
    throw new ApiError(409, "Admission number already exists");
  }

  // Class exist karta hai?
  const classExists = await prisma.class.findUnique({
    where: { id: data.classId },
  });
  if (!classExists) {
    throw new ApiError(404, "Class not found");
  }

  const student = await prisma.student.create({
    data: {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      admissionDate: new Date(data.admissionDate),
    },
    include: {
      class: {
        select: { id: true, name: true, section: true },
      },
    },
  });

  return student;
};

// ════════════════════════════════════════════════════════════
// GET ALL STUDENTS — pagination + search + filters
// ════════════════════════════════════════════════════════════
export const getAllStudentsService = async (query: {
  page: number;
  limit: number;
  search?: string;
  classId?: string;
  status?: StudentStatus;
  gender?: string;
}) => {
  const { page, limit, search, classId, status, gender } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(classId && { classId }),
    ...(gender && { gender: gender as any }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { rollNo: { contains: search, mode: "insensitive" as const } },
        { admissionNo: { contains: search, mode: "insensitive" as const } },
        { fatherName: { contains: search, mode: "insensitive" as const } },
        { fatherPhone: { contains: search } },
      ],
    }),
  };

  const [total, students] = await prisma.$transaction([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, name: true, section: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    students,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

// ════════════════════════════════════════════════════════════
// GET SINGLE STUDENT
// ════════════════════════════════════════════════════════════
export const getStudentByIdService = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true, section: true } },
      transferRecord: true,
    },
  });

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return student;
};

// ════════════════════════════════════════════════════════════
// UPDATE STUDENT
// ════════════════════════════════════════════════════════════
export const updateStudentService = async (
  id: string,
  data: UpdateStudentInput
) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Agar classId change ho rahi hai toh class exist karta hai?
  if (data.classId) {
    const classExists = await prisma.class.findUnique({
      where: { id: data.classId },
    });
    if (!classExists) throw new ApiError(404, "Class not found");
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      ...data,
      ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
    },
    include: {
      class: { select: { id: true, name: true, section: true } },
    },
  });

  return updated;
};

// ════════════════════════════════════════════════════════════
// TRANSFER STUDENT
// ════════════════════════════════════════════════════════════
export const transferStudentService = async (
  id: string,
  data: TransferStudentInput
) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new ApiError(404, "Student not found");

  if (student.status === "TRANSFERRED") {
    throw new ApiError(400, "Student is already transferred");
  }

  // Transaction mein dono kaam ek saath
  const [updated] = await prisma.$transaction([
    prisma.student.update({
      where: { id },
      data: { status: "TRANSFERRED" },
    }),
    prisma.transferRecord.create({
      data: {
        studentId: id,
        transferDate: new Date(data.transferDate),
        transferredTo: data.transferredTo,
        reason: data.reason,
        certificateNo: data.certificateNo,
        issuedBy: data.issuedBy,
      },
    }),
  ]);

  return updated;
};

// ════════════════════════════════════════════════════════════
// DELETE STUDENT — soft ya hard?
// Hum status "LEFT" set karein ge — data preserve rahega
// ════════════════════════════════════════════════════════════
export const deleteStudentService = async (id: string) => {
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) throw new ApiError(404, "Student not found");

  // Hard delete nahi — sirf LEFT status
  await prisma.student.update({
    where: { id },
    data: { status: "LEFT" },
  });
};

// ════════════════════════════════════════════════════════════
// GET STATS — dashboard ke liye
// ════════════════════════════════════════════════════════════
export const getStudentStatsService = async () => {
  const [total, active, transferred, boys, girls] = await prisma.$transaction([
    prisma.student.count(),
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.student.count({ where: { status: "TRANSFERRED" } }),
    prisma.student.count({ where: { gender: "MALE", status: "ACTIVE" } }),
    prisma.student.count({ where: { gender: "FEMALE", status: "ACTIVE" } }),
  ]);

  return { total, active, transferred, boys, girls };
};