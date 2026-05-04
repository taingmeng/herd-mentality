"use client";

import Image from "next/image";
import { useAuth } from "@/firebase/AuthContext";

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="fixed z-40 top-3 right-4 flex items-center gap-2">
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt={user.displayName || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <button
          onClick={signOutUser}
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="fixed z-40 top-3 right-4">
      <button
        onClick={signInWithGoogle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-gray-800 text-sm font-medium shadow hover:shadow-md transition-shadow"
      >
        <Image src="/icons/google.svg" alt="Google" width={16} height={16} />
        Sign in
      </button>
    </div>
  );
}
