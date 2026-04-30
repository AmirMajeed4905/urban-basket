import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });

export const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString("en-PK")}`;

export const getMonthName = (month: number) =>
  new Date(2024, month - 1).toLocaleString("en", { month: "long" });

export const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2024, i).toLocaleString("en", { month: "long" }),
}));
