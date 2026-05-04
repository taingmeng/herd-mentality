"use client";

import { AuthProvider } from "@/firebase/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
