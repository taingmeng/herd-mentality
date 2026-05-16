"use client";

import ActionButton from "./ActionButton";
import Button from "../components/Button";

export const dynamic = "force-dynamic";

interface NewGameProps {
  teamCount: number;
  duration: number;
  firstRoundWordCount: number;
  onTeamChanged: (increment: number) => void;
  onTimeChanged: (increment: number) => void;
  onWordCountChanged: (increment: number) => void;
  onStart: () => void;
  categories: string[];
  selectedCategories: string[];
  categoryCount: (category: string) => number;
  onToggleCategory: (category: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function NewGame({
  teamCount,
  duration,
  firstRoundWordCount,
  onTeamChanged,
  onTimeChanged,
  onWordCountChanged,
  onStart,
  categories,
  selectedCategories,
  categoryCount,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
}: NewGameProps) {
  return (
    <>
      <div className="flex flex-col items-center mt-8 w-full max-w-md px-4">
        <h2 className="text-xl font-bold text-white mb-2">Select Categories</h2>
        <p className="text-gray-400 mb-3 text-sm">
          {selectedCategories.length} of {categories.length} selected
        </p>
        <div className="flex gap-2 mb-3">
          <button
            className="px-4 py-1.5 text-sm rounded-lg bg-gray-700 text-gray-300 cursor-pointer select-none hover:bg-gray-600"
            onClick={onSelectAll}
          >
            Select All
          </button>
          <button
            className="px-4 py-1.5 text-sm rounded-lg bg-gray-700 text-gray-300 cursor-pointer select-none hover:bg-gray-600"
            onClick={onDeselectAll}
          >
            Deselect All
          </button>
        </div>
        <div className="w-full grid grid-cols-4 gap-2 mb-6">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                className={`w-full flex flex-col items-center justify-center px-2 py-3 rounded-lg font-medium text-center transition-colors cursor-pointer select-none ${
                  isSelected
                    ? "bg-pink-900 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
                onClick={() => onToggleCategory(category)}
              >
                <span className="text-sm leading-tight">{category}</span>
                <span className="text-xs opacity-70">{categoryCount(category)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 items-center">
          <Button className="w-20 text-5xl" onClick={() => onTeamChanged(-1)}>
            -
          </Button>
          <div className="flex flex-col items-center w-20">
            <h3>Teams</h3>
            <h2>{teamCount}</h2>
          </div>
          <Button className="w-20 text-5xl" onClick={() => onTeamChanged(1)}>
            +
          </Button>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <Button className="w-20 text-5xl" onClick={() => onTimeChanged(-30)}>
            -
          </Button>
          <div className="flex flex-col items-center w-20">
            <h3>Time</h3>
            <h2>{duration}s</h2>
          </div>
          <Button className="w-20 text-5xl" onClick={() => onTimeChanged(30)}>
            +
          </Button>
        </div>
        <div className="flex flex-row gap-4 items-center">
          <Button
            className="w-20 text-5xl"
            onClick={() => onWordCountChanged(-10)}
          >
            -
          </Button>
          <div className="flex flex-col items-center w-20">
            <h3>Cards</h3>
            <h2>{firstRoundWordCount}</h2>
          </div>
          <Button
            className="w-20 text-5xl"
            onClick={() => onWordCountChanged(10)}
          >
            +
          </Button>
        </div>
      </div>
      <div className="z-10 flex w-full items-center justify-center bottom-8 fixed">
        <ActionButton onClick={onStart} disabled={selectedCategories.length === 0}>START</ActionButton>
      </div>
    </>
  );
}
