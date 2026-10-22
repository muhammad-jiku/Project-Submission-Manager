import { Layers } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
      <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Layers className="h-5 w-5" />
      </span>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}
