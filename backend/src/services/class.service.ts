import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateClassInput, UpdateClassInput } from "../validators/class.validator";

// ════════════════════════════════════════════════════════════
// CREATE CLASS
// ════════════════════════════════════════════════════════════
export const createClassService = async (data: CreateClassInput) => {
  // Same name + section + academicYear already exist?
  const existing = await prisma.class.findFirst({
    where: {
      name: data.name,
      section: data.section,
      academicYearId: data.academicYearId,
    },
  });

  if (existing) {
    throw new ApiError(409, `Class ${data.name}-${data.section} already exists for this year`);
  }

  // Academic year exist karta hai?
  const year = await prisma.academicYear.findUnique({
    where: { id: data.academicYearId },
  });
  if (!year) throw new ApiError(404, "Academic year not found");

  const newClass = await prisma.class.create({
    data,
    include: {
      academicYear: { select: { id: true, name: true } },
      _count: { select: { students: true } },
    },
  });

  return newClass;
};

// ════════════════════════════════════════════════════════════
// GET ALL CLASSES
// ════════════════════════════════════════════════════════════
export const getAllClassesService = async (academicYearId?: string) => {
  const classes = await prisma.class.findMany({
    where: {
      ...(academicYearId && { academicYearId }),
    },
    include: {
      academicYear: { select: { id: true, name: true } },
      _count: { select: { students: true } },
    },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });

  return classes;
};

// ════════════════════════════════════════════════════════════
// GET SINGLE CLASS with students
// ════════════════════════════════════════════════════════════
export const getClassByIdService = async (id: string) => {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      academicYear: { select: { id: true, name: true } },
      students: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          rollNo: true,
          gender: true,
          photo: true,
        },
        orderBy: { rollNo: "asc" },
      },
      subjects: {
        select: { id: true, name: true, code: true },
      },
      _count: { select: { students: true } },
    },
  });

  if (!cls) throw new ApiError(404, "Class not found");

  return cls;
};

// ════════════════════════════════════════════════════════════
// UPDATE CLASS
// ════════════════════════════════════════════════════════════


// class.service.ts — updateClassService
export const updateClassService = async (id: string, data: UpdateClassInput) => {
  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls) throw new ApiError(404, "Class not found");

  // ✅ Sirf allowed fields extract karo
  const { name, section, capacity } = data as any;

  const updated = await prisma.class.update({
    where: { id },
    data: { name, section, capacity },  // clean object
    include: {
      academicYear: { select: { id: true, name: true } },
      _count: { select: { students: true } },
    },
  });

  return updated;
};

// ════════════════════════════════════════════════════════════
// DELETE CLASS — sirf tab jab koi student na ho
// ════════════════════════════════════════════════════════════
export const deleteClassService = async (id: string) => {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: { _count: { select: { students: true } } },
  });

  if (!cls) throw new ApiError(404, "Class not found");

  if (cls._count.students > 0) {
    throw new ApiError(
      400,
      `Cannot delete class — ${cls._count.students} student(s) are enrolled. Move or remove them first.`
    );
  }

  await prisma.class.delete({ where: { id } });
};

// ════════════════════════════════════════════════════════════
// GET ACADEMIC YEARS — dropdown ke liye
// ════════════════════════════════════════════════════════════
export const getAcademicYearsService = async () => {
  return prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
  });
};