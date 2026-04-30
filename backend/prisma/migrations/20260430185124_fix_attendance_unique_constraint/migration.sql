/*
  Warnings:

  - A unique constraint covering the columns `[studentId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "attendances_studentId_date_subjectId_key";

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_date_key" ON "attendances"("studentId", "date");
