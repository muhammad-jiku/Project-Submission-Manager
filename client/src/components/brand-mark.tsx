import { Layers } from "lucide-react";

export function BrandMark({
  className,
  iconClassName,
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-2 font-semibold tracking-tight ${className ?? ""}`}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Layers className={`h-4 w-4 ${iconClassName ?? ""}`} />
      </span>
      Submission Manager
    </div>
  );
}
