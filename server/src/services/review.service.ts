import { AppError } from "../middleware/error-handler";
import { prisma } from "../lib/prisma";
import type { ListSubmissionsQuery } from "../validators/submission";

export async function listSubmissions({ page, limit, status }: ListSubmissionsQuery) {
  const where = status ? { status } : {};

  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
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

export async function getSubmissionStats() {
  const grouped = await prisma.submission.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const stats = { PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const row of grouped) {
    stats[row.status] = row._count.status;
  }

  return {
    ...stats,
    total: stats.PENDING + stats.APPROVED + stats.REJECTED,
  };
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: "APPROVED" | "REJECTED"
) {
  const submission = await prisma.submission.findUnique({ where: { id: submissionId } });

  if (!submission) {
    throw new AppError(404, "Submission not found");
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: { status },
  });
}
