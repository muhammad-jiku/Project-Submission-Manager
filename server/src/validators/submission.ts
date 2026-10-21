import { z } from "zod";

export const createSubmissionSchema = z.object({
  projectName: z.string().trim().min(2, "Project name must be at least 2 characters").max(150),
  repoUrl: z.string().trim().url("Repo URL must be a valid URL"),
  liveLink: z.string().trim().url("Live link must be a valid URL"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const submissionStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const listSubmissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: submissionStatusEnum.optional(),
});

export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
