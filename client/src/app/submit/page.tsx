"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { SearchInput } from "@/components/search-input";
import { StatusFilter } from "@/components/status-filter";
import { SubmissionCard } from "@/components/submission-card";
import { SubmissionGrid } from "@/components/submission-grid";
import { api, ApiError } from "@/lib/api";
import type { PaginatedMySubmissions, Submission, SubmissionStatus } from "@/lib/types";

const submissionSchema = z.object({
  projectName: z.string().trim().min(2, "Project name must be at least 2 characters").max(150),
  repoUrl: z.string().trim().url("Repo URL must be a valid URL"),
  liveLink: z.string().trim().url("Live link must be a valid URL"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
});

type SubmissionInput = z.infer<typeof submissionSchema>;

const PAGE_SIZE = 6;

function SubmitPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PaginatedMySubmissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(searchParams.get("new") === "1");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionInput>({ resolver: zodResolver(submissionSchema) });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (search) query.set("search", search);
      const result = await api.get<PaginatedMySubmissions>(`/submissions/me?${query.toString()}`);
      setData(result);
      if (result.pagination.total === 0 && !search && statusFilter === "ALL") setDialogOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load submissions");
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

  useEffect(() => {
    // Reacts to the header's "New submission" link (?new=1) even when it's a
    // client-side navigation to a page that's already mounted, not just on
    // first load.
    if (searchParams.get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(true);
    }
  }, [searchParams]);

  async function onSubmit(formData: SubmissionInput) {
    try {
      await api.post<Submission>("/submissions", formData);
      toast.success("Project submitted successfully");
      reset();
      setDialogOpen(false);
      setPage(1);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 animate-in fade-in slide-in-from-bottom-2 space-y-6 p-6 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Submissions</h1>
          <p className="text-sm text-muted-foreground">Submit and track your projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Rocket className="h-4 w-4" />
              New submission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket className="h-5 w-5" />
              </div>
              <DialogTitle className="mt-3">Submit a project</DialogTitle>
              <DialogDescription>
                You can submit as many projects as you like, but not the same repo twice
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project name</Label>
                <Input
                  id="projectName"
                  placeholder="My awesome project"
                  {...register("projectName")}
                />
                {errors.projectName && (
                  <p className="text-sm text-destructive">{errors.projectName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repo URL</Label>
                <Input
                  id="repoUrl"
                  placeholder="https://github.com/you/project"
                  {...register("repoUrl")}
                />
                {errors.repoUrl && (
                  <p className="text-sm text-destructive">{errors.repoUrl.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="liveLink">Live link</Label>
                <Input
                  id="liveLink"
                  placeholder="https://project.example.com"
                  {...register("liveLink")}
                />
                {errors.liveLink && (
                  <p className="text-sm text-destructive">{errors.liveLink.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="What does it do, what did you build it with, and why?"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search your submissions..."
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
          renderCard={(submission) => <SubmissionCard submission={submission} />}
          emptyMessage="No submissions match your filters"
        />
      </div>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <RouteGuard role="STUDENT">
      <AppShell>
        <Suspense>
          <SubmitPageContent />
        </Suspense>
      </AppShell>
    </RouteGuard>
  );
}
