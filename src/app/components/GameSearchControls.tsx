"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type SortOption = "added" | "name";
type ViewOption = "grid" | "list";

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="4" height="4" rx="1" />
      <rect x="7" y="3" width="8" height="2" rx="1" />
      <rect x="1" y="7" width="4" height="4" rx="1" />
      <rect x="7" y="8" width="8" height="2" rx="1" />
      <rect x="1" y="12" width="4" height="2" rx="1" />
      <rect x="7" y="12" width="8" height="2" rx="1" />
    </svg>
  );
}

const PLAYER_COUNT_OPTIONS = [2, 3, 4, 6, 8, 10];

const dropdownBase =
  "absolute right-0 mt-1 rounded-lg border border-gray-600 bg-neutral-900 shadow-lg z-10";

const controlBtn = (active: boolean) =>
  `px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
    active
      ? "border-pink-500 text-pink-400"
      : "border-gray-600 text-gray-300 hover:border-gray-400"
  }`;

export default function GameSearchControls({ allTags }: { allTags: string[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sort = (searchParams.get("sort") ?? "added") as SortOption;
  const view = (searchParams.get("view") ?? "grid") as ViewOption;
  const selectedTags = new Set(
    searchParams.get("tags")?.split(",").filter(Boolean) ?? []
  );
  const selectedCounts = new Set(
    searchParams.get("counts")
      ?.split(",")
      .map(Number)
      .filter(Boolean) ?? []
  );

  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setShowSort(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilter(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleQueryChange(value: string) {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => updateParam("q", value || null),
      300
    );
  }

  function toggleTag(tag: string) {
    const next = new Set(selectedTags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    updateParam("tags", next.size > 0 ? [...next].join(",") : null);
  }

  function toggleCount(count: number) {
    const next = new Set(selectedCounts);
    next.has(count) ? next.delete(count) : next.add(count);
    updateParam("counts", next.size > 0 ? [...next].join(",") : null);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    params.delete("counts");
    router.replace(`${pathname}?${params.toString()}`);
  }

  const activeFilterCount = selectedTags.size + selectedCounts.size;

  return (
    <div className="flex gap-2 mb-8 items-center">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search games..."
        className="flex-1 p-3 rounded-lg border bg-transparent border-pink-600 text-white placeholder-gray-500 text-sm"
      />

      {/* Sort */}
      <div ref={sortRef} className="relative">
        <button
          onClick={() => { setShowSort((v) => !v); setShowFilter(false); }}
          className={controlBtn(sort !== "added")}
        >
          Sort
        </button>
        {showSort && (
          <div className={`${dropdownBase} w-44 overflow-hidden`}>
            {(
              [
                { value: "added", label: "Added Date" },
                { value: "name", label: "Name (A–Z)" },
              ] as { value: SortOption; label: string }[]
            ).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => {
                  updateParam("sort", value === "added" ? null : value);
                  setShowSort(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-700 transition-colors ${
                  sort === value ? "text-pink-400 font-semibold" : "text-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter */}
      <div ref={filterRef} className="relative">
        <button
          onClick={() => { setShowFilter((v) => !v); setShowSort(false); }}
          className={controlBtn(activeFilterCount > 0)}
        >
          Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        {showFilter && (
          <div className={`${dropdownBase} w-64 p-4`}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Tags
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    selectedTags.has(tag)
                      ? "border-pink-500 text-pink-400 bg-pink-950"
                      : "border-gray-600 text-gray-300 hover:border-gray-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Player Count
            </p>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => toggleCount(count)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    selectedCounts.has(count)
                      ? "border-pink-500 text-pink-400 bg-pink-950"
                      : "border-gray-600 text-gray-300 hover:border-gray-400"
                  }`}
                >
                  {count} players
                </button>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 w-full text-xs text-gray-400 hover:text-white transition-colors text-center"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div className="flex border border-gray-600 rounded-lg overflow-hidden">
        <button
          onClick={() => updateParam("view", "grid")}
          title="Grid view"
          className={`px-4 py-3 transition-colors ${view === "grid" ? "text-pink-400 bg-neutral-800" : "text-gray-300 hover:bg-neutral-800"}`}
        >
          <GridIcon />
        </button>
        <button
          onClick={() => updateParam("view", "list")}
          title="List view"
          className={`px-4 py-3 transition-colors border-l border-gray-600 ${view === "list" ? "text-pink-400 bg-neutral-800" : "text-gray-300 hover:bg-neutral-800"}`}
        >
          <ListIcon />
        </button>
      </div>
    </div>
  );
}
