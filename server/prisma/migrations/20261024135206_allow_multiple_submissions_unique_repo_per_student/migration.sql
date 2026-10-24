-- DropIndex
DROP INDEX "Submission_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Submission_studentId_repoUrl_key" ON "Submission"("studentId", "repoUrl");
