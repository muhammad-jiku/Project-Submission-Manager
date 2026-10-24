import { GitBranch } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
        <BrandMark className="text-sm text-foreground" />
        <div className="flex items-center gap-4">
          <span>© {YEAR} Submission Manager</span>
          <a
            href="https://github.com/muhammad-jiku/Project-Submission-Manager"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <GitBranch className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
