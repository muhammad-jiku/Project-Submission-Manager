"use client";

import {
  CheckCircle2,
  Clock,
  FolderGit2,
  Inbox,
  ListChecks,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { StatusBadge } from "@/components/status-badge";
import { api, ApiError } from "@/lib/api";
import type {
  PaginatedSubmissions,
  SubmissionStats,
  SubmissionStatus,
  SubmissionWithStudent,
} from "@/lib/types";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: (SubmissionStatus | "ALL")[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function DashboardContent() {
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [data, setData] = useState<PaginatedSubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">("ALL");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== "ALL") query.set("status", statusFilter);

      const [list, statsResult] = await Promise.all([
        api.get<PaginatedSubmissions>(`/review/submissions?${query.toString()}`),
        api.get<SubmissionStats>("/review/stats"),
      ]);
      setData(list);
      setStats(statsResult);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDecision(submission: SubmissionWithStudent, decision: "approve" | "reject") {
    setActioningId(submission.id);
    try {
      await api.patch(`/review/submissions/${submission.id}/${decision}`);
      toast.success(`Submission ${decision === "approve" ? "approved" : "rejected"}`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 animate-in fade-in slide-in-from-bottom-2 space-y-6 p-6 duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Review Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject student project submissions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats?.total} icon={ListChecks} tone="default" />
        <StatCard label="Pending" value={stats?.PENDING} icon={Clock} tone="amber" />
        <StatCard label="Approved" value={stats?.APPROVED} icon={CheckCircle2} tone="green" />
        <StatCard label="Rejected" value={stats?.REJECTED} icon={XCircle} tone="red" />
      </div>

      <div className="flex items-center justify-between">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as SubmissionStatus | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "ALL" ? "All statuses" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1 h-3 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-8 w-32" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-8 w-8" />
                    <p className="text-sm">No submissions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((submission) => (
                <TableRow key={submission.id} className="transition-colors hover:bg-muted/50">
                  <TableCell>
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 font-medium hover:text-primary"
                    >
                      <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                      {submission.projectName}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div>{submission.student.name}</div>
                    <div className="text-sm text-muted-foreground">{submission.student.email}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <DecisionDialog
                      submission={submission}
                      decision="approve"
                      disabled={submission.status === "APPROVED" || actioningId === submission.id}
                      onConfirm={() => handleDecision(submission, "approve")}
                    />
                    <DecisionDialog
                      submission={submission}
                      decision="reject"
                      disabled={submission.status === "REJECTED" || actioningId === submission.id}
                      onConfirm={() => handleDecision(submission, "reject")}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </main>
  );
}

const TONE_STYLES = {
  default: "bg-primary/10 text-primary",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  red: "bg-red-500/10 text-red-600 dark:text-red-400",
} as const;

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value?: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_STYLES;
}) {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-md">
      <CardContent className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONE_STYLES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          {value === undefined ? (
            <Skeleton className="h-7 w-10" />
          ) : (
            <div className="text-2xl font-semibold leading-none">{value}</div>
          )}
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionDialog({
  submission,
  decision,
  disabled,
  onConfirm,
}: {
  submission: SubmissionWithStudent;
  decision: "approve" | "reject";
  disabled: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant={decision === "approve" ? "default" : "destructive"}
          disabled={disabled}
        >
          {decision === "approve" ? "Approve" : "Reject"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {decision === "approve" ? "Approve" : "Reject"} &quot;{submission.projectName}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the submission by {submission.student.name} as {decision === "approve" ? "approved" : "rejected"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function DashboardPage() {
  return (
    <RouteGuard role="ADMIN">
      <AppShell>
        <DashboardContent />
      </AppShell>
    </RouteGuard>
  );
}
