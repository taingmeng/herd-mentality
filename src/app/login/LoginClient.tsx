"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/firebase/AuthContext";
import Navbar from "../components/Navbar";

export default function LoginClient() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirect);
    }
  }, [user, loading, router, redirect]);

  async function handleSignIn() {
    await signInWithGoogle();
  }

  if (loading || user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <Navbar />
      <div className="flex flex-col items-center gap-2">
        <Image src="/icons/party.svg" width={64} height={64} alt="Partyz" />
        <h1 className="text-3xl font-bold">Partyz</h1>
        <p className="text-gray-400 text-sm">Sign in to play</p>
      </div>
      <button
        onClick={handleSignIn}
        className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-gray-800 font-medium shadow-lg hover:shadow-xl transition-shadow"
      >
        <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
        Continue with Google
      </button>
    </div>
  );
}
