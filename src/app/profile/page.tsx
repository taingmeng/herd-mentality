"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/firebase/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ProfilePage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  async function handleSignOut() {
    await signOutUser();
    router.replace("/");
  }

  const joinedDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      <Navbar title="Profile" />
      <main className="pt-32 flex flex-col items-center px-4 gap-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          {user.photoURL && (
            <Image
              src={user.photoURL}
              alt={user.displayName || "Profile photo"}
              width={96}
              height={96}
              className="rounded-full ring-4 ring-white/20"
            />
          )}

          <div className="text-center">
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            {joinedDate && (
              <p className="text-gray-500 text-xs mt-1">Joined {joinedDate}</p>
            )}
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-2.5 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Sign out
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
