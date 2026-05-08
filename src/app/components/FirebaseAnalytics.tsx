"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { analytics } from "@/firebase/firebase";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    analytics.then((a) => {
      if (a) logEvent(a, "page_view", { page_path: url });
    });
  }, [pathname, searchParams]);

  return null;
}
