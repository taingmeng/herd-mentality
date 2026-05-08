"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/firebase/AuthContext";
import FirebaseAnalytics from "./FirebaseAnalytics";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Suspense>
        <FirebaseAnalytics />
      </Suspense>
      {children}
    </AuthProvider>
  );
}
