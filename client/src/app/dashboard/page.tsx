"use client";

import { CheckCircle2, Clock, ListChecks, XCircle } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { SearchInput } from "@/components/search-input";
import { StatusFilter } from "@/components/status-filter";
import { SubmissionCard } from "@/components/submission-card";
import { SubmissionGrid } from "@/components/submission-grid";
import { api, ApiError } from "@/lib/api";
import type {
  PaginatedSubmissions,
  SubmissionStats,
  SubmissionStatus,
  SubmissionWithStudent,
} from "@/lib/types";

const PAGE_SIZE = 6;

function DashboardContent() {
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [data, setData] = useState<PaginatedSubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (search) query.set("search", search);

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
  }, [page, statusFilter, search]);

  useEffect(() => {
    // Fetch-on-mount/filter-change: load() only sets state inside async
    // callbacks after awaiting the API, never synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search by project or student..."
          className="max-w-sm flex-1"
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <StatusFilter
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        />
      </div>

      <SubmissionGrid
        items={data?.items ?? []}
        pagination={data?.pagination ?? null}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        emptyMessage="No submissions match your filters"
        renderCard={(submission) => (
          <SubmissionCard
            submission={submission}
            actions={
              <div className="flex gap-2">
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
              </div>
            }
          />
        )}
      />
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
            This will mark the submission by {submission.student.name} as{" "}
            {decision === "approve" ? "approved" : "rejected"}.
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
