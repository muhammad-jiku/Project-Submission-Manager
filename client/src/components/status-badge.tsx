import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/lib/types";

const TONE: Record<SubmissionStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  APPROVED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  REJECTED: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  return <Badge className={cn(TONE[status], className)}>{status}</Badge>;
}
