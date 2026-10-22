"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PageLoader } from "@/components/page-loader";
import { useAuth } from "@/providers/auth-provider";
import type { Role } from "@/lib/types";

export function RouteGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== role) {
      router.replace(user.role === "ADMIN" ? "/dashboard" : "/submit");
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || user.role !== role) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
