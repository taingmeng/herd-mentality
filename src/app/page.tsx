import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GameSearch from "./components/GameSearch";
import GameSearchControls from "./components/GameSearchControls";
import { games } from "./global/Data";

export const metadata: Metadata = {
  description:
    "Partyz — free digital party games for groups. Play Herd Mentality, Wavelength, Just One, Fake Artist, and more right in your browser.",
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
