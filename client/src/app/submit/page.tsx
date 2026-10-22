"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, GitBranch, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { StatusBadge } from "@/components/status-badge";
import { api, ApiError } from "@/lib/api";
import type { Submission } from "@/lib/types";

const submissionSchema = z.object({
  projectName: z.string().trim().min(2, "Project name must be at least 2 characters").max(150),
  repoUrl: z.string().trim().url("Repo URL must be a valid URL"),
  liveLink: z.string().trim().url("Live link must be a valid URL"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
});

type SubmissionInput = z.infer<typeof submissionSchema>;

function SubmitPageContent() {
  const [existing, setExisting] = useState<Submission | null | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionInput>({ resolver: zodResolver(submissionSchema) });

  useEffect(() => {
    api
      .get<Submission | null>("/submissions/me")
      .then(setExisting)
      .catch(() => setExisting(null));
  }, []);

  async function onSubmit(data: SubmissionInput) {
    try {
      const submission = await api.post<Submission>("/submissions", data);
      toast.success("Project submitted successfully");
      setExisting(submission);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error(err.message);
        const mine = await api.get<Submission | null>("/submissions/me");
        setExisting(mine);
        return;
      }
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  if (existing === undefined) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="w-full max-w-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="mt-3 h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (existing) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card className="w-full max-w-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-xl">{existing.projectName}</CardTitle>
              <StatusBadge status={existing.status} />
            </div>
            <CardDescription>You have already submitted a project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={existing.repoUrl} target="_blank" rel="noreferrer">
                  <GitBranch className="h-4 w-4" />
                  Repository
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={existing.liveLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Live demo
                </a>
              </Button>
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Description</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {existing.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="w-full max-w-lg shadow-sm transition-shadow duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="h-5 w-5" />
          </div>
          <CardTitle className="mt-3 text-xl">Submit your project</CardTitle>
          <CardDescription>You can only submit one project, so make it count</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input id="projectName" placeholder="My awesome project" {...register("projectName")} />
              {errors.projectName && (
                <p className="text-sm text-destructive">{errors.projectName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repo URL</Label>
              <Input id="repoUrl" placeholder="https://github.com/you/project" {...register("repoUrl")} />
              {errors.repoUrl && (
                <p className="text-sm text-destructive">{errors.repoUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveLink">Live link</Label>
              <Input id="liveLink" placeholder="https://project.example.com" {...register("liveLink")} />
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
        </CardContent>
      </Card>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <RouteGuard role="STUDENT">
      <AppShell>
        <SubmitPageContent />
      </AppShell>
    </RouteGuard>
  );
}
