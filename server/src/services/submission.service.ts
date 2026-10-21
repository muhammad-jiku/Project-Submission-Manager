import { Prisma } from "@prisma/client";

import { AppError } from "../middleware/error-handler";
import { prisma } from "../lib/prisma";
import type { CreateSubmissionInput } from "../validators/submission";

export async function createSubmission(studentId: string, input: CreateSubmissionInput) {
  const existing = await prisma.submission.findUnique({ where: { studentId } });

  if (existing) {
    throw new AppError(409, "You have already submitted a project");
  }

  try {
    return await prisma.submission.create({
      data: {
        ...input,
        studentId,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new AppError(409, "You have already submitted a project");
    }
    throw err;
  }
}
