"use client";

import { useAuth } from "@/firebase/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) return null;
  return <>{children}</>;
}
