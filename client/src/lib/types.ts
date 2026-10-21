export type Role = "STUDENT" | "ADMIN";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Submission = {
  id: string;
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
};

export type SubmissionWithStudent = Submission & {
  student: Pick<User, "id" | "name" | "email">;
};

export type PaginatedSubmissions = {
  items: SubmissionWithStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type SubmissionStats = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  total: number;
};
