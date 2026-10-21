import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/lib/types";

const VARIANT: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
