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
}

export default function NewGame({
  teamCount,
  duration,
  firstRoundWordCount,
  onTeamChanged,
  onTimeChanged,
  onWordCountChanged,
  onStart,
}: NewGameProps) {
  return (
    <>
      <h1>New Game</h1>
      <div className="flex flex-col gap-4 mt-20">
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
      <div className="z-10 flex w-full items-center justify-center bottom-5 fixed">
        <ActionButton onClick={onStart}>Start</ActionButton>
      </div>
    </>
  );
}
