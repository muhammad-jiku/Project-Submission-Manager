"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <BrandMark />
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right text-sm sm:block">
                <div className="font-medium leading-tight">{user.name}</div>
                <div className="text-xs text-muted-foreground leading-tight">{user.email}</div>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <Badge variant="secondary">{user.role}</Badge>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
