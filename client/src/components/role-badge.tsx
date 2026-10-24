import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const TONE: Record<Role, string> = {
  STUDENT: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  ADMIN: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return <Badge className={cn(TONE[role], className)}>{role}</Badge>;
}
