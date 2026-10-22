"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { PageLoader } from "@/components/page-loader";
import { useAuth } from "@/providers/auth-provider";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    router.replace(user.role === "ADMIN" ? "/dashboard" : "/submit");
  }, [user, isLoading, router]);

  return <PageLoader />;
}
