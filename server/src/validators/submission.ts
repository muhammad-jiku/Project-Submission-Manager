import { z } from "zod";

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hostname = url.hostname.toLowerCase();
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return value;
  }
}

export const createSubmissionSchema = z.object({
  projectName: z.string().trim().min(2, "Project name must be at least 2 characters").max(150),
  repoUrl: z.string().trim().url("Repo URL must be a valid URL").transform(normalizeUrl),
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
  search: z.string().trim().min(1).max(150).optional(),
});

export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;

export const listMySubmissionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: submissionStatusEnum.optional(),
  search: z.string().trim().min(1).max(150).optional(),
});

export type ListMySubmissionsQuery = z.infer<typeof listMySubmissionsQuerySchema>;
