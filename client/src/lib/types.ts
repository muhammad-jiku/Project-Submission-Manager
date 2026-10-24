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

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type PaginatedSubmissions = Paginated<SubmissionWithStudent>;
export type PaginatedMySubmissions = Paginated<Submission>;

export type SubmissionStats = {
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
  total: number;
};
