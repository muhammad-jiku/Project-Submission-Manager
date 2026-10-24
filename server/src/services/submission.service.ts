import { Prisma } from "@prisma/client";

import { AppError } from "../middleware/error-handler";
import { prisma } from "../lib/prisma";
import type { CreateSubmissionInput, ListMySubmissionsQuery } from "../validators/submission";

export async function getMySubmissions(
  studentId: string,
  { page, limit, search }: ListMySubmissionsQuery
) {
  const where: Prisma.SubmissionWhereInput = {
    studentId,
    ...(search ? { projectName: { contains: search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createSubmission(studentId: string, input: CreateSubmissionInput) {
  const existing = await prisma.submission.findFirst({
    where: { studentId, repoUrl: input.repoUrl },
  });

  if (existing) {
    throw new AppError(409, "You've already submitted this repository");
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
      throw new AppError(409, "You've already submitted this repository");
    }
    throw err;
  }
}
