import { ExternalLink, GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { Submission, SubmissionWithStudent } from "@/lib/types";

const BORDER_TONE: Record<Submission["status"], string> = {
  PENDING: "border-l-amber-500",
  APPROVED: "border-l-emerald-500",
  REJECTED: "border-l-red-500",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubmissionCard({
  submission,
  actions,
}: {
  submission: Submission | SubmissionWithStudent;
  actions?: React.ReactNode;
}) {
  const student = "student" in submission ? submission.student : undefined;

  return (
    <Card className={`border-l-4 ${BORDER_TONE[submission.status]} transition-shadow duration-300 hover:shadow-md`}>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{submission.projectName}</h3>
          <StatusBadge status={submission.status} />
        </div>
        {student && (
          <div className="text-sm">
            <div className="font-medium leading-tight">{student.name}</div>
            <div className="text-xs text-muted-foreground leading-tight">{student.email}</div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-2 text-sm text-muted-foreground">{submission.description}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={submission.repoUrl} target="_blank" rel="noreferrer">
              <GitBranch className="h-4 w-4" />
              Repository
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={submission.liveLink} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Live demo
            </a>
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {submission.status === "PENDING"
              ? `Submitted ${formatDate(submission.createdAt)}`
              : `Updated ${formatDate(submission.updatedAt)}`}
          </span>
          {actions}
        </div>
      </CardContent>
    </Card>
  );
}
