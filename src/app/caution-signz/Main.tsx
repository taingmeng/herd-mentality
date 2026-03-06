"use client";

import { ChangeEvent, useState } from "react";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { shuffle } from "../global/Utils";
import BigButton from "../components/BigButton";
import Navbar from "../components/Navbar";
import Rules from "../components/Rules";
import IncrementalInput from "../components/IncrementalInput";

interface MainProps {
  descriptors: string[];
  subjects: string[];
}

interface Assignment {
  player: string;
  descriptor: string;
  subject: string;
}

type GameState = "setup" | "passing" | "guesser" | "scoring" | "round-results" | "results";

export default function Main({ descriptors, subjects }: MainProps) {
  const [showRules, setShowRules] = useState(false);

  // Setup state
  const [playerNames, setPlayerNames] = useLocalStorage<string>(
    `${GAME_PATH}.playerNames`,
    ""
  );
  const [players, setPlayers] = useLocalStorage<string[]>(
    `${GAME_PATH}.players`,
    []
  );
  const [numRounds, setNumRounds] = useLocalStorage<number>(
    `${GAME_PATH}.numRounds`,
    1
  );

  // Game state
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    "setup"
  );
  const [currentRoundIndex, setCurrentRoundIndex] = useLocalStorage<number>(
    `${GAME_PATH}.currentRoundIndex`,
    0
  );
  const [scores, setScores] = useLocalStorage<Record<string, number>>(
    `${GAME_PATH}.scores`,
    {}
  );

  // Round state
  const [assignments, setAssignments] = useLocalStorage<Assignment[]>(
    `${GAME_PATH}.assignments`,
    []
  );
  const [decoyDescriptors, setDecoyDescriptors] = useLocalStorage<string[]>(
    `${GAME_PATH}.decoyDescriptors`,
    []
  );
  const [decoySubjects, setDecoySubjects] = useLocalStorage<string[]>(
    `${GAME_PATH}.decoySubjects`,
    []
  );
  const [passIndex, setPassIndex] = useLocalStorage<number>(
    `${GAME_PATH}.passIndex`,
    0
  );
  const [flipped, setFlipped] = useLocalStorage<boolean>(
    `${GAME_PATH}.flipped`,
    false
  );

  // Scoring state
  const [roundScores, setRoundScores] = useLocalStorage<Record<string, number>>(
    `${GAME_PATH}.roundScores`,
    {}
  );
  const [prevScores, setPrevScores] = useLocalStorage<Record<string, number>>(
    `${GAME_PATH}.prevScores`,
    {}
  );
  const [roundPointsEarned, setRoundPointsEarned] = useLocalStorage<Record<string, number>>(
    `${GAME_PATH}.roundPointsEarned`,
    {}
  );

  const playerCount = players.length;
  const totalRounds = numRounds * playerCount;
  const guesserIndex = currentRoundIndex % playerCount;
  const guesser = players[guesserIndex] || "";
  const sketchers = players.filter((_, i) => i !== guesserIndex);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setPlayerNames(value);
    setPlayers(
      value
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length)
    );
  };

  const startGame = () => {
    const initialScores: Record<string, number> = {};
    players.forEach((p) => (initialScores[p] = 0));
    setScores(initialScores);
    setCurrentRoundIndex(0);
    startRound(0);
  };

  const startRound = (roundIndex: number) => {
    const gi = roundIndex % playerCount;
    const currentSketchers = players.filter((_, i) => i !== gi);
    const n = currentSketchers.length;

    // Pick n unique descriptors + 2 decoys
    const shuffledDescriptors = shuffle([...descriptors]);
    const assignedDescriptors = shuffledDescriptors.slice(0, n);
    const decoyDesc = shuffledDescriptors.slice(n, n + 2);

    // Pick n unique subjects + 2 decoys
    const shuffledSubjects = shuffle([...subjects]);
    const assignedSubjects = shuffledSubjects.slice(0, n);
    const decoySub = shuffledSubjects.slice(n, n + 2);

    // Create assignments
    const newAssignments: Assignment[] = currentSketchers.map((player, i) => ({
      player,
      descriptor: assignedDescriptors[i],
      subject: assignedSubjects[i],
    }));

    setAssignments(newAssignments);
    setDecoyDescriptors(decoyDesc);
    setDecoySubjects(decoySub);
    setPassIndex(0);
    setFlipped(false);
    setRoundScores({});
    setGameState("passing");
  };

  const passNext = () => {
    if (passIndex === sketchers.length - 1) {
      setGameState("guesser");
    } else {
      setPassIndex(passIndex + 1);
    }
    setFlipped(false);
  };

  const passPrevious = () => {
    if (passIndex === 0) {
      setGameState("setup");
    } else {
      setPassIndex(passIndex - 1);
    }
    setFlipped(false);
  };

  const allSketchersScored =
    sketchers.length > 0 && sketchers.every((s) => roundScores[s] !== undefined);

  const submitScores = () => {
    setPrevScores({ ...scores });

    const earned: Record<string, number> = {};
    players.forEach((p) => (earned[p] = 0));

    const newScores = { ...scores };
    sketchers.forEach((sketcher) => {
      const score = roundScores[sketcher];
      if (score === 1) {
        earned[sketcher] = (earned[sketcher] || 0) + 1;
        newScores[sketcher] = (newScores[sketcher] || 0) + 1;
      } else if (score === 2) {
        earned[sketcher] = (earned[sketcher] || 0) + 3;
        earned[guesser] = (earned[guesser] || 0) + 2;
        newScores[sketcher] = (newScores[sketcher] || 0) + 3;
        newScores[guesser] = (newScores[guesser] || 0) + 2;
      }
    });

    setRoundPointsEarned(earned);
    setScores(newScores);
    setGameState("round-results");
  };

  const advanceFromRoundResults = () => {
    const nextRound = currentRoundIndex + 1;
    if (nextRound >= totalRounds) {
      setGameState("results");
    } else {
      setCurrentRoundIndex(nextRound);
      startRound(nextRound);
    }
  };

  const newGame = () => {
    setGameState("setup");
    setCurrentRoundIndex(0);
    setScores({});
    setAssignments([]);
    setDecoyDescriptors([]);
    setDecoySubjects([]);
    setPassIndex(0);
    setFlipped(false);
    setRoundScores({});
    setPrevScores({});
    setRoundPointsEarned({});
  };

  // Guesser view: all assigned + decoy words, shuffled
  const allDescriptorsForGuesser = shuffle([
    ...assignments.map((a) => a.descriptor),
    ...decoyDescriptors,
  ]);
  const allSubjectsForGuesser = shuffle([
    ...assignments.map((a) => a.subject),
    ...decoySubjects,
  ]);

  // Results: sorted leaderboard
  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

  const currentRoundDisplay = currentRoundIndex + 1;
  const currentPassSketcher = assignments[passIndex];

  const NAV_MENU = [
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
  ];

  return (
    <>
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
      />
      <Rules
        gamePath={GAME_PATH}
        gameName={GAME_NAME}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <main className="flex flex-col min-h-[75vh] items-center justify-center px-4">
        {/* SETUP */}
        {gameState === "setup" && (
          <>
            <h3 className="mb-3 font-semibold text-center">
              Enter player names:
            </h3>
            <textarea
              className="min-w-[75vw] min-h-[30vh] lg:min-h-[20vh] resize p-4 text-center border rounded-lg font-bold text-3xl bg-transparent border-pink-600 placeholder-grey-400 placeholder-opacity-10 text-white"
              placeholder="Example: Alice, Bob, Charlie"
              onChange={handleChange}
              value={playerNames}
            />
            <label className="block mt-2">Player count: {playerCount}</label>

            <div className="mt-4">
              <IncrementalInput
                title="Rounds"
                value={String(numRounds)}
                onIncrement={() => setNumRounds(Math.min(numRounds + 1, 10))}
                onDecrement={() => setNumRounds(Math.max(numRounds - 1, 1))}
              />
            </div>

            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton disabled={playerCount < 2} onClick={startGame}>
                  Start Game
                </BigButton>
              </div>
            </div>
          </>
        )}

        {/* PASSING */}
        {gameState === "passing" && currentPassSketcher && (
          <>
            <div className="flex flex-col justify-between items-center gap-4 w-full">
              {/* Round info */}
              <div className="text-center">
                <label className="text-gray-400">
                  Round {currentRoundDisplay} of {totalRounds} &mdash; Guesser:{" "}
                  <span className="text-white font-bold">{guesser}</span>
                </label>
              </div>

              {/* Player indicator */}
              <div className="flex flex-row flex-wrap gap-2 justify-center">
                {sketchers.map((name, index) => {
                  const isActive = index === passIndex;
                  return (
                    <span
                      className={isActive ? "font-bold" : "text-gray-500"}
                      key={index}
                    >
                      {name}
                      {index < sketchers.length - 1 ? " \u2192 " : ""}
                    </span>
                  );
                })}
              </div>

              {/* Tap to reveal */}
              {!flipped ? (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer border-2 border-pink-600 rounded-xl p-8 min-h-[300px] w-full max-w-md"
                  onClick={() => setFlipped(true)}
                >
                  <h2 className="text-white text-2xl font-bold">
                    {currentPassSketcher.player}
                  </h2>
                  <label className="text-gray-400 mt-2">(Tap to reveal)</label>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-pink-600 rounded-xl p-8 min-h-[300px] w-full max-w-md gap-4">
                  <h2 className="text-white text-xl font-bold">
                    {currentPassSketcher.player}
                  </h2>
                  <div className="text-center">
                    <label className="text-gray-400 text-sm">Descriptor</label>
                    <h3 className="text-pink-400 text-3xl font-bold">
                      {currentPassSketcher.descriptor}
                    </h3>
                  </div>
                  <div className="text-center">
                    <label className="text-gray-400 text-sm">Subject</label>
                    <h3 className="text-pink-400 text-3xl font-bold">
                      {currentPassSketcher.subject}
                    </h3>
                  </div>
                </div>
              )}

              {/* Pass instructions */}
              <div className="text-center">
                {passIndex < sketchers.length - 1 ? (
                  <label className="block text-gray-500">
                    Press Next. Pass to the next player.
                    <br />
                    <span className="text-white font-bold">
                      {sketchers[passIndex + 1]}
                    </span>
                  </label>
                ) : (
                  <label className="block text-gray-500">
                    Press Next when ready.
                    <br />
                    <span className="text-white font-bold">
                      {guesser}&apos;s turn to guess!
                    </span>
                  </label>
                )}
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton onClick={passPrevious}>Previous</BigButton>
                  <BigButton onClick={passNext}>Next</BigButton>
                </div>
              </div>
            </div>
          </>
        )}

        {/* GUESSER VIEW */}
        {gameState === "guesser" && (
          <>
            <div className="flex flex-col items-center gap-6 w-full mt-4">
              <div className="text-center">
                <label className="text-gray-400">
                  Round {currentRoundDisplay} of {totalRounds}
                </label>
                <h2 className="text-2xl font-bold mt-1">
                  Guesser: {guesser}
                </h2>
              </div>

              {/* Descriptors */}
              <div className="w-full max-w-md">
                <h3 className="text-center text-gray-400 mb-2 font-semibold">
                  Descriptors
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allDescriptorsForGuesser.map((word, i) => (
                    <span
                      key={i}
                      className="border border-pink-600 rounded-lg px-3 py-2 text-lg font-semibold text-white"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Subjects */}
              <div className="w-full max-w-md">
                <h3 className="text-center text-gray-400 mb-2 font-semibold">
                  Subjects
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allSubjectsForGuesser.map((word, i) => (
                    <span
                      key={i}
                      className="border border-pink-600 rounded-lg px-3 py-2 text-lg font-semibold text-white"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton onClick={() => setGameState("scoring")}>
                    Ready to Score
                  </BigButton>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SCORING */}
        {gameState === "scoring" && (
          <>
            <div className="flex flex-col items-center gap-4 w-full mt-4">
              <div className="text-center">
                <label className="text-gray-400">
                  Round {currentRoundDisplay} of {totalRounds}
                </label>
                <h2 className="text-xl font-bold mt-1">Score Sketchers</h2>
              </div>

              <div className="w-full max-w-md flex flex-col gap-4">
                {sketchers.map((sketcher) => {
                  const selected = roundScores[sketcher];
                  return (
                    <div
                      key={sketcher}
                      className="flex flex-row items-center justify-between border border-pink-600 rounded-lg p-3"
                    >
                      <span className="text-white font-bold text-lg flex-1">
                        {sketcher}
                      </span>
                      <div className="flex gap-2">
                        {[0, 1, 2].map((val) => (
                          <button
                            key={val}
                            className={`w-12 h-12 rounded-lg font-bold text-xl transition-colors ${
                              selected === val
                                ? "bg-pink-700 text-white border-2 border-pink-400"
                                : "bg-transparent text-white border border-pink-600"
                            }`}
                            onClick={() =>
                              setRoundScores({ ...roundScores, [sketcher]: val })
                            }
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm text-gray-500 max-w-md">
                <p>0 = no match (0 pts each)</p>
                <p>1 = partial (sketcher 1 pt)</p>
                <p>2 = perfect (sketcher 3 pts, guesser 2 pts)</p>
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton
                    disabled={!allSketchersScored}
                    onClick={submitScores}
                  >
                    Submit Scores
                  </BigButton>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ROUND RESULTS */}
        {gameState === "round-results" && (
          <>
            <div className="flex flex-col items-center gap-4 w-full mt-4">
              <div className="text-center">
                <label className="text-gray-400">
                  Round {currentRoundDisplay} of {totalRounds}
                </label>
                <h2 className="text-xl font-bold mt-1">Round Scores</h2>
              </div>

              <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex flex-row items-center px-4 py-2 text-gray-400 text-sm font-semibold">
                  <span className="flex-1">Player</span>
                  <span className="w-16 text-center">Prev</span>
                  <span className="w-16 text-center">Round</span>
                  <span className="w-16 text-center">Total</span>
                </div>

                <div className="flex flex-col gap-2">
                  {Object.entries(scores)
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, total]) => {
                      const prev = prevScores[name] || 0;
                      const earned = roundPointsEarned[name] || 0;
                      return (
                        <div
                          key={name}
                          className={`flex flex-row items-center rounded-lg p-4 border ${
                            earned > 0
                              ? "border-pink-400 bg-pink-950/50"
                              : "border-pink-600"
                          }`}
                        >
                          <span className="text-white font-bold text-lg flex-1">
                            {name}
                          </span>
                          <span className="w-16 text-center text-gray-400">
                            {prev}
                          </span>
                          <span className={`w-16 text-center font-bold ${
                            earned > 0 ? "text-green-400" : "text-gray-500"
                          }`}>
                            {earned > 0 ? `+${earned}` : "0"}
                          </span>
                          <span className="w-16 text-center text-pink-400 font-bold">
                            {total}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton onClick={advanceFromRoundResults}>
                    {currentRoundIndex + 1 >= totalRounds
                      ? "Final Results"
                      : "Next Round"}
                  </BigButton>
                </div>
              </div>
            </div>
          </>
        )}

        {/* RESULTS */}
        {gameState === "results" && (
          <>
            <div className="flex flex-col items-center gap-6 w-full mt-4">
              <h2 className="text-3xl font-bold">Final Scores</h2>

              <div className="w-full max-w-md flex flex-col gap-3">
                {sortedScores.map(([name, score], index) => (
                  <div
                    key={name}
                    className={`flex flex-row items-center justify-between rounded-lg p-4 ${
                      index === 0
                        ? "border-2 border-pink-400 bg-pink-950"
                        : "border border-pink-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 font-bold text-lg">
                        #{index + 1}
                      </span>
                      <span className="text-white font-bold text-xl">
                        {name}
                      </span>
                    </div>
                    <span className="text-pink-400 font-bold text-2xl">
                      {score} pts
                    </span>
                  </div>
                ))}
              </div>

              <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                  <BigButton onClick={newGame}>New Game</BigButton>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
