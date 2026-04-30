// Percentage se grade calculate karo
export const calculateGrade = (obtained: number, total: number): string => {
  const percent = (obtained / total) * 100;
  if (percent >= 90) return "A+";
  if (percent >= 80) return "A";
  if (percent >= 70) return "B";
  if (percent >= 60) return "C";
  if (percent >= 50) return "D";
  return "F";
};

export const calculatePercentage = (obtained: number, total: number): number => {
  return Math.round((obtained / total) * 100 * 100) / 100;
};