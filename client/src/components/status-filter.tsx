import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubmissionStatus } from "@/lib/types";

const STATUS_OPTIONS: (SubmissionStatus | "ALL")[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

export function StatusFilter({
  value,
  onChange,
  className,
}: {
  value: SubmissionStatus | "ALL";
  onChange: (value: SubmissionStatus | "ALL") => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SubmissionStatus | "ALL")}>
      <SelectTrigger className={className ?? "w-40"}>
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
  );
}
