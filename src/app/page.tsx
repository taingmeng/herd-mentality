import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GameSearch from "./components/GameSearch";
import GameSearchControls from "./components/GameSearchControls";
import { games } from "./global/Data";

export const metadata: Metadata = {
  title: "Partyz — Digital Party Games for Family and Friends",
  description:
    "Play free digital party games with friends and family — no app needed. Herd Mentalityz, Wavelengthz, Just Onez, Fake Artistz, Poetryz, Monikerz, and more. Works on any device, right in your browser.",
  keywords: [
    "party games",
    "free party games",
    "digital party games",
    "herd mentalityz",
    "wavelengthz",
    "just onez",
    "fake artistz",
    "poetryz",
    "monikerz",
    "group games",
    "browser party games",
    "party game online",
  ],
  openGraph: {
    title: "Partyz — Online Party Board Games for Groups",
    description:
      "Play free digital party games with friends and family — no app needed. Herd Mentalityz, Wavelengthz, Just Onez, Fake Artistz, Poetryz, Monikerz, and more. Works on any device.",
    url: "https://partyz.vercel.app",
    siteName: "Partyz",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Partyz — Online Party Board Games",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Partyz — Online Party Board Games for Groups",
    description:
      "Play free digital party games with friends and family — no app needed. Herd Mentalityz, Wavelengthz, Just Onez, Fake Artistz, Poetryz, Monikerz, and more.",
    images: ["/thumbnail.png"],
  },
};

type SearchParams = {
  q?: string;
  sort?: string;
  tags?: string;
  counts?: string;
  view?: string;
};

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  const query = searchParams.q ?? "";
  const sort = (searchParams.sort ?? "added") as "added" | "name";
  const tags = searchParams.tags?.split(",").filter(Boolean) ?? [];
  const counts = searchParams.counts?.split(",").map(Number).filter(Boolean) ?? [];
  const view = (searchParams.view === "list" ? "list" : "grid") as "grid" | "list";
  const allTags = [...new Set(games.flatMap((g) => g.tags))].sort();

  return (
    <>
      <Navbar title="Partyz" />
      <div className="pt-32 px-8 pb-16 container mx-auto">
        <Suspense fallback={<div className="h-14 mb-8" />}>
          <GameSearchControls allTags={allTags} />
        </Suspense>
        <GameSearch
          games={games}
          query={query}
          sort={sort}
          tags={tags}
          counts={counts}
          view={view}
        />
      </div>
      <Footer />
    </>
  );
}
