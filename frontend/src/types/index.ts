export type Role = "SUPER_ADMIN" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type StudentStatus = "ACTIVE" | "TRANSFERRED" | "LEFT" | "GRADUATED";
export type FeeStatus = "UNPAID" | "PAID" | "PARTIAL" | "WAIVED";
export type StaffType = "TEACHER" | "CLERK" | "PEON" | "ACCOUNTANT" | "OTHER";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "LEAVE";

export interface User {
  id: string; name: string; email: string; role: Role;
  phone?: string; avatar?: string; isActive: boolean; createdAt: string;
}
export interface AcademicYear {
  id: string; name: string; startDate: string; endDate: string; isCurrent: boolean;
}
export interface Class {
  id: string; name: string; section: string; capacity: number;
  academicYear: AcademicYear; _count?: { students: number };
}
export interface Student {
  id: string; rollNo: string; admissionNo: string; name: string;
  gender: Gender; dateOfBirth: string; status: StudentStatus;
  admissionDate: string; classId: string; class?: Class;
  fatherName: string; fatherPhone: string; photo?: string;
}
export interface Staff {
  email: string;
  id: string; employeeNo: string; name: string; gender: Gender;
  phone: string; staffType: StaffType; designation?: string;
  joinDate: string; salary: number; isActive: boolean;
}
export interface Subject {
  id: string; name: string; code?: string; classId: string;
  totalMarks: number; passingMarks: number;
}
export interface FeeStructure {
  id: string; name: string; amount: number; dueDay: number;
  lateFine: number; class: Class; academicYear: AcademicYear;
}
export interface FeePayment {
  id: string; receiptNo: string; month: number; year: number;
  amountDue: number; amountPaid: number; status: FeeStatus;
  student?: Student; feeStructure?: FeeStructure; paidAt?: string;
}
export interface Pagination {
  total: number; page: number; limit: number;
  totalPages: number; hasNext: boolean; hasPrev: boolean;
}
export interface ApiResponse<T> {
  success: boolean; message: string; data: T;
}
