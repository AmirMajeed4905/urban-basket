import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/ApiError";
import { CreateExamInput, EnterMarksInput } from "../validators/exam.validator";
import { calculateGrade } from "../utils/gradeCalculator";

export const createExamService = async (data: CreateExamInput) => {
  const yearExists = await prisma.academicYear.findUnique({ where: { id: data.academicYearId } });
  if (!yearExists) throw new ApiError(404, "Academic year not found");

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  if (start > end) throw new ApiError(400, "Start date cannot be after end date");

  return prisma.exam.create({
    data: { ...data, startDate: start, endDate: end },
    include: { academicYear: { select: { id: true, name: true } } },
  });
};

export const getAllExamsService = async (academicYearId?: string) => {
  return prisma.exam.findMany({
    where: { ...(academicYearId && { academicYearId }) },
    include: {
      academicYear: { select: { id: true, name: true } },
      _count: { select: { marks: true } },
    },
    orderBy: { startDate: "desc" },
  });
};

export const enterMarksService = async (data: EnterMarksInput) => {
  const exam = await prisma.exam.findUnique({ where: { id: data.examId } });
  if (!exam) throw new ApiError(404, "Exam not found");

  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) throw new ApiError(404, "Subject not found");

  // Validate — koi student ke marks total se zyada na hon
  for (const m of data.marks) {
    if (m.obtainedMarks > subject.totalMarks) {
      throw new ApiError(400, `Obtained marks cannot exceed total marks (${subject.totalMarks})`);
    }
  }

  const operations = data.marks.map((m) =>
    prisma.mark.upsert({
      where: {
        studentId_subjectId_examId: {
          studentId: m.studentId,
          subjectId: data.subjectId,
          examId: data.examId,
        },
      },
      update: {
        obtainedMarks: m.obtainedMarks,
        grade: calculateGrade(m.obtainedMarks, subject.totalMarks),
        remarks: m.remarks,
      },
      create: {
        studentId: m.studentId,
        subjectId: data.subjectId,
        examId: data.examId,
        obtainedMarks: m.obtainedMarks,
        totalMarks: subject.totalMarks,
        grade: calculateGrade(m.obtainedMarks, subject.totalMarks),
        remarks: m.remarks,
      },
    })
  );

  await prisma.$transaction(operations);
  return { saved: data.marks.length };
};

export const getResultsByExamService = async (examId: string, classId: string) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new ApiError(404, "Exam not found");

  const students = await prisma.student.findMany({
    where: { classId, status: "ACTIVE" },
    include: {
      marks: {
        where: { examId },
        include: { subject: { select: { id: true, name: true, totalMarks: true } } },
      },
    },
    orderBy: { rollNo: "asc" },
  });

  // Har student ka total aur percentage calculate karo + rank
  const results = students.map((student) => {
    const totalObtained = student.marks.reduce((sum, m) => sum + Number(m.obtainedMarks), 0);
    const totalPossible = student.marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const percentage = totalPossible > 0
      ? Math.round((totalObtained / totalPossible) * 100 * 100) / 100
      : 0;
    const overallGrade = totalPossible > 0
      ? calculateGrade(totalObtained, totalPossible)
      : "N/A";

    return {
      student: { id: student.id, name: student.name, rollNo: student.rollNo },
      marks: student.marks,
      totalObtained,
      totalPossible,
      percentage,
      overallGrade,
    };
  });

  // Percentage ke basis pe rank assign karo
  const sorted = [...results].sort((a, b) => b.percentage - a.percentage);
  sorted.forEach((r, i) => {
    (r as any).rank = i + 1;
  });

  return { exam, results: sorted };
};