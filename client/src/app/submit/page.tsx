"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Rocket, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { SubmissionCard } from "@/components/submission-card";
import { SubmissionGrid } from "@/components/submission-grid";
import { api, ApiError } from "@/lib/api";
import type { PaginatedMySubmissions, Submission } from "@/lib/types";

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
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");

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
      if (search) query.set("search", search);
      const result = await api.get<PaginatedMySubmissions>(`/submissions/me?${query.toString()}`);
      setData(result);
      if (result.pagination.total === 0) setShowForm(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // Fetch-on-mount/filter-change: load() only sets state inside async
    // callbacks after awaiting the API, never synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function onSubmit(formData: SubmissionInput) {
    try {
      await api.post<Submission>("/submissions", formData);
      toast.success("Project submitted successfully");
      reset();
      setShowForm(false);
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
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Rocket className="h-4 w-4" />
            New submission
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="shadow-sm transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Rocket className="h-5 w-5" />
            </div>
            <CardTitle className="mt-3 text-xl">Submit a project</CardTitle>
            <CardDescription>
              You can submit as many projects as you like, but not the same repo twice
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="flex gap-2">
                {data && data.pagination.total > 0 && (
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit project"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(!showForm || (data && data.pagination.total > 0)) && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your submissions..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
            emptyMessage="No submissions match your search"
          />
        </div>
      )}
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
