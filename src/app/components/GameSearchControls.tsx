"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10" y1="10" x2="14" y2="14" />
    </svg>
  );
}

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

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="6" width="10" height="2" rx="1" />
      <rect x="1" y="10" width="6" height="2" rx="1" />
    </svg>
  );
}

function ControlsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="3" width="2" height="2" rx="1" />
      <circle cx="5" cy="4" r="2" />
      <rect x="7" y="3" width="8" height="2" rx="1" />
      <rect x="1" y="7" width="8" height="2" rx="1" />
      <circle cx="11" cy="8" r="2" />
      <rect x="13" y="7" width="2" height="2" rx="1" />
      <rect x="1" y="11" width="4" height="2" rx="1" />
      <circle cx="7" cy="12" r="2" />
      <rect x="9" y="11" width="6" height="2" rx="1" />
    </svg>
  );
}

function FilterIcon({ count }: { count: number }) {
  return (
    <span className="relative flex items-center justify-center">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 2h14l-5 6v5l-4-2V8L1 2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold leading-none">
          {count}
        </span>
      )}
    </span>
  );
}

const PLAYER_COUNT_OPTIONS = [2, 3, 4, 6, 8, 10];

const dropdownBase =
  "absolute right-0 mt-1 rounded-lg border border-gray-600 bg-neutral-900 shadow-lg z-10";

const controlBtn = (active: boolean) =>
  `px-4 py-3 transition-colors ${
    active ? "text-pink-400" : "text-gray-300 hover:text-white"
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const mobileControlsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mobileSearchOpen) {
      mobileInputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setShowSort(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilter(false);
      if (mobileControlsRef.current && !mobileControlsRef.current.contains(e.target as Node))
        setShowMobileControls(false);
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
  const activeControlCount = (sort !== "added" ? 1 : 0) + activeFilterCount + (view !== "grid" ? 1 : 0);

  return (
    <div className="flex gap-2 items-center justify-end">
      {mobileSearchOpen && (
        <div className="fixed z-50 top-0 left-0 right-0 bg-neutral-900 flex items-center px-4 gap-2 h-[60px]">
          <input
            ref={mobileInputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search games..."
            onBlur={() => setMobileSearchOpen(false)}
            className="flex-1 p-3 rounded-lg border bg-transparent border-pink-600 text-white placeholder-gray-500 text-sm"
          />
          {inputValue && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { handleQueryChange(""); mobileInputRef.current?.focus(); }}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Clear"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
          )}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setMobileSearchOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            title="Close"
          >
            Cancel
          </button>
        </div>
      )}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search games..."
        className="hidden sm:block flex-1 p-3 rounded-lg border bg-transparent border-pink-600 text-white placeholder-gray-500 text-sm"
      />

      <button
        className="sm:hidden p-3 rounded-lg border border-pink-600 text-gray-300 hover:text-white transition-colors"
        onClick={() => setMobileSearchOpen(true)}
        title="Search"
      >
        <SearchIcon />
      </button>

      {/* Mobile controls button */}
      <div ref={mobileControlsRef} className="relative sm:hidden">
        <button
          onClick={() => setShowMobileControls((v) => !v)}
          title="Controls"
          className={`relative p-3 rounded-lg border transition-colors ${activeControlCount > 0 ? "border-pink-600 text-pink-400" : "border-gray-600 text-gray-300 hover:text-white"}`}
        >
          <ControlsIcon />
          {activeControlCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-pink-500 text-white text-[9px] font-bold leading-none">
              {activeControlCount}
            </span>
          )}
        </button>
        {showMobileControls && (
          <div className="absolute right-0 mt-1 w-72 rounded-lg border border-gray-600 bg-neutral-900 shadow-lg z-10 p-4 max-h-[80vh] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Sort</p>
            <div className="flex gap-2 mb-4">
              {([{ value: "added", label: "Added Date" }, { value: "name", label: "Name (A–Z)" }] as { value: SortOption; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateParam("sort", value === "added" ? null : value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs border transition-colors ${sort === value ? "border-pink-500 text-pink-400 bg-pink-950" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">View</p>
            <div className="flex gap-2 mb-4">
              {([{ value: "grid", label: "Grid", Icon: GridIcon }, { value: "list", label: "List", Icon: ListIcon }] as { value: ViewOption; label: string; Icon: () => React.JSX.Element }[]).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => updateParam("view", value === "grid" ? null : value)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs border transition-colors ${view === value ? "border-pink-500 text-pink-400 bg-pink-950" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
                >
                  <Icon /> {label}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Tags</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${selectedTags.has(tag) ? "border-pink-500 text-pink-400 bg-pink-950" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Player Count</p>
            <div className="flex flex-wrap gap-2">
              {PLAYER_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => toggleCount(count)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedCounts.has(count) ? "border-pink-500 text-pink-400 bg-pink-950" : "border-gray-600 text-gray-300 hover:border-gray-400"}`}
                >
                  {count} players
                </button>
              ))}
            </div>

            {activeControlCount > 0 && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("tags");
                  params.delete("counts");
                  params.delete("sort");
                  params.delete("view");
                  router.replace(`${pathname}?${params.toString()}`);
                }}
                className="mt-4 w-full text-xs text-gray-400 hover:text-white transition-colors text-center"
              >
                Reset all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls group */}
      <div className="hidden sm:flex border border-gray-600 rounded-lg overflow-visible">
        {/* Sort */}
        <div ref={sortRef} className="relative">
          <button
            onClick={() => { setShowSort((v) => !v); setShowFilter(false); }}
            title="Sort"
            className={`px-4 py-3 transition-colors ${sort !== "added" ? "text-pink-400" : "text-gray-300 hover:text-white"}`}
          >
            <SortIcon />
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

        <div className="w-px bg-gray-600" />

        {/* Filter */}
        <div ref={filterRef} className="relative">
          <button
            onClick={() => { setShowFilter((v) => !v); setShowSort(false); }}
            title="Filter"
            className={`px-4 py-3 transition-colors ${activeFilterCount > 0 ? "text-pink-400" : "text-gray-300 hover:text-white"}`}
          >
            <FilterIcon count={activeFilterCount} />
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

        <div className="w-px bg-gray-600" />

        {/* View toggle */}
        <button
          onClick={() => updateParam("view", "grid")}
          title="Grid view"
          className={`px-4 py-3 transition-colors ${view === "grid" ? "text-pink-400" : "text-gray-300 hover:text-white"}`}
        >
          <GridIcon />
        </button>

        <div className="w-px bg-gray-600" />

        <button
          onClick={() => updateParam("view", "list")}
          title="List view"
          className={`px-4 py-3 transition-colors ${view === "list" ? "text-pink-400" : "text-gray-300 hover:text-white"}`}
        >
          <ListIcon />
        </button>
      </div>
    </div>
  );
}
