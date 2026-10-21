"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
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
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (existing) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{existing.projectName}</CardTitle>
              <StatusBadge status={existing.status} />
            </div>
            <CardDescription>You have already submitted a project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="font-medium">Repo URL: </span>
              <a href={existing.repoUrl} target="_blank" className="underline" rel="noreferrer">
                {existing.repoUrl}
              </a>
            </div>
            <div>
              <span className="font-medium">Live link: </span>
              <a href={existing.liveLink} target="_blank" className="underline" rel="noreferrer">
                {existing.liveLink}
              </a>
            </div>
            <div>
              <span className="font-medium">Description: </span>
              <p className="text-muted-foreground">{existing.description}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Submit your project</CardTitle>
          <CardDescription>You can only submit one project</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name</Label>
              <Input id="projectName" {...register("projectName")} />
              {errors.projectName && (
                <p className="text-sm text-destructive">{errors.projectName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="repoUrl">Repo URL</Label>
              <Input id="repoUrl" {...register("repoUrl")} />
              {errors.repoUrl && (
                <p className="text-sm text-destructive">{errors.repoUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="liveLink">Live link</Label>
              <Input id="liveLink" {...register("liveLink")} />
              {errors.liveLink && (
                <p className="text-sm text-destructive">{errors.liveLink.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...register("description")} />
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
      <SubmitPageContent />
    </RouteGuard>
  );
}
