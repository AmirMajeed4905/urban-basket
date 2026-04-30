import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateSubjectInput, UpdateSubjectInput } from "../validators/subject.validator";

export const createSubjectService = async (data: CreateSubjectInput) => {
  const classExists = await prisma.class.findUnique({ where: { id: data.classId } });
  if (!classExists) throw new ApiError(404, "Class not found");

  if (data.passingMarks > data.totalMarks) {
    throw new ApiError(400, "Passing marks cannot exceed total marks");
  }

  return prisma.subject.create({
    data,
    include: { class: { select: { id: true, name: true, section: true } } },
  });
};

export const getSubjectsByClassService = async (classId: string) => {
  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) throw new ApiError(404, "Class not found");

  return prisma.subject.findMany({
    where: { classId },
    orderBy: { name: "asc" },
  });
};

export const getAllSubjectsService = async () => {
  return prisma.subject.findMany({
    include: { class: { select: { id: true, name: true, section: true } } },
    orderBy: { name: "asc" },
  });
};

export const updateSubjectService = async (id: string, data: UpdateSubjectInput) => {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) throw new ApiError(404, "Subject not found");

  const total = data.totalMarks ?? subject.totalMarks;
  const passing = data.passingMarks ?? subject.passingMarks;
  if (passing > total) throw new ApiError(400, "Passing marks cannot exceed total marks");

  return prisma.subject.update({ where: { id }, data });
};

export const deleteSubjectService = async (id: string) => {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { _count: { select: { marks: true } } },
  });
  if (!subject) throw new ApiError(404, "Subject not found");
  if (subject._count.marks > 0) {
    throw new ApiError(400, "Cannot delete subject — marks exist for this subject");
  }
  await prisma.subject.delete({ where: { id } });
};