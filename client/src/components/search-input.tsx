"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchInput({
  placeholder,
  onSearch,
  className,
}: {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
}) {
  const [draft, setDraft] = useState("");

  function submit() {
    onSearch(draft.trim());
  }

  function clear() {
    setDraft("");
    onSearch("");
  }

  return (
    <div className={`flex gap-2 ${className ?? ""}`}>
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pr-9 pl-9"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        {draft && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="button" onClick={submit}>
        Search
      </Button>
    </div>
  );
}
