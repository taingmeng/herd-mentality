"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import useSound from "use-sound";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import ActionButton from "./ActionButton";
import NextButton from "@/app/components/NextButton";
import useLocalStorage from "@/app/hooks/useLocalStorage";
// import useSound from "@/app/hooks/useSound";
import Modal from "../components/Modal";
import BigButton from "../components/BigButton";
import CircularTimer, {
  CircularTimerRefProps,
} from "@/app/components/CircularTimer";

import wrongSoundFile from "@/assets/wrong.mp3";
import rightSoundFile from "@/assets/right.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";
import newInfoSoundFile from "@/assets/new-info.mp3";

import NewGame from "./NewGame";

export const dynamic = "force-dynamic";

interface PoetryMainProps {
  questions: PartikersQuestion[];
}

export interface PartikersQuestion {
  category: string;
  word: string;
  points?: number;
}

interface Team {
  name?: string;
  roundScores: number[][];
  totalScores: number;
}

const popRandomItem = (items: PartikersQuestion[]): PartikersQuestion => {
  const randomIndex = Math.floor(Math.random() * items.length); // Get a random index
  const item = items[randomIndex]; // Get the item at that index
  items.splice(randomIndex, 1); // Remove the item from the array
  return item; // Return the popped item
};

const sum = (nums: number[]): number => (nums || []).reduce((a, b) => a + b, 0);

const roundName = (currentRound: number): string => {
  if (currentRound === 0) return "Say Anything";
  if (currentRound === 1) return "One Word";
  if (currentRound === 2) return "Act It Out";
  return "";
};

export default function PoetryMain({ questions }: PoetryMainProps) {
  const [sessionQuestions, setSessionQuestions, clearSessionQuestions] =
    useLocalStorage<PartikersQuestion[]>("partikers.questions", questions);

  const [playRightSound] = useSound(rightSoundFile);
  const [playWrongSound] = useSound(wrongSoundFile);
  const [playTimesUpSound] = useSound(timesUpSoundFile);
  const [playNewInfoSound] = useSound(newInfoSoundFile);

  const [currentQuestion, setCurrentQuestion] = useState<PartikersQuestion>();

  const [gameState, setGameState] = useLocalStorage(
    "partikers.gameState",
    "new"
  );
  const [roundState, setRoundState] = useLocalStorage(
    "partikers.roundState",
    "ready"
  );
  const [teams, setTeams] = useLocalStorage<Team[]>("partikers.teams", []);
  const [currentTeamIndex, setCurrentTeamIndex] = useLocalStorage(
    "partikers.currentTeamIndex",
    0
  );
  const [teamCount, setTeamCount] = useLocalStorage("partikers.teamCount", 2);
  const [duration, setDuration] = useLocalStorage("partikers.duration", 60);
  const [firstRoundWordCount, setFirstRoundWordCount] = useLocalStorage(
    "partikers.firstRoundWordCount",
    50
  );
  const [currentRound, setCurrentRound] = useLocalStorage(
    "partikers.currentRound",
    1
  );
  const [roundQuestions, setRoundQuestions] = useLocalStorage<
    PartikersQuestion[]
  >("partikers.roundQuestions", []);
  const [deck, setDeck] = useLocalStorage<PartikersQuestion[]>(
    "partikers.deck",
    []
  );
  const [roundDeck, setRoundDeck] = useLocalStorage<PartikersQuestion[]>(
    "partikers.roundDeck",
    []
  );
  const [discardDeck, setDiscardDeck] = useLocalStorage<PartikersQuestion[]>(
    "partikers.discardDeck",
    []
  );
  const [shouldRefreshRouter, setShouldRefreshRouter] = useState(false);

  const timerRef = useRef<CircularTimerRefProps>(null);
  const noMoreCards = roundDeck.length === 0 && discardDeck.length === 0;

  const actualDeckLength =
    currentRound === 0
      ? deck.length + roundQuestions.filter(({ points }) => points === 1).length
      : deck.length;

  const currentDeckLength = roundDeck.length;

  const discardDeckLength =
    currentRound != 0
      ? discardDeck.length +
        roundQuestions.filter(({ points }) => points === 0).length
      : discardDeck.length;

  const currentRoundQuestionScores = sum(
    roundQuestions.map(({ points }) => points!!)
  );

  const highestScore = Math.max(
    ...teams.map((team) => sum(team.roundScores.map((rs) => sum(rs))))
  );

  const refreshRouter = useCallback(() => {
    if (currentRound === 0) {
      let poppedQuestion = popRandomItem(sessionQuestions);
      if (currentQuestion && poppedQuestion.word === currentQuestion.word) {
        poppedQuestion = popRandomItem(sessionQuestions);
      }
      setCurrentQuestion(poppedQuestion);
      setSessionQuestions([...sessionQuestions]);
      if (sessionQuestions.length <= 0) {
        setSessionQuestions([...questions]);
      }
      if (
        deck.length +
          roundQuestions.filter(({ points }) => points!! > 0).length >=
        firstRoundWordCount
      ) {
        timerRef.current?.pause();
        setRoundState("end");
        playTimesUpSound();
        return;
      }
    } else if (currentRound === 1 || currentRound === 2) {
      if (noMoreCards) {
        timerRef.current?.pause();
        setRoundState("end");
        playTimesUpSound();
        return;
      }
      let poppedQuestion;
      if (roundDeck.length === 0 && discardDeck.length !== 0) {
        poppedQuestion = popRandomItem(discardDeck);
        setRoundDeck([...discardDeck]);
        setDiscardDeck([]);
      } else {
        poppedQuestion = popRandomItem(roundDeck);
        setRoundDeck([...roundDeck]);
      }
      setCurrentQuestion(poppedQuestion);
    }
  }, [
    questions,
    sessionQuestions,
    currentQuestion,
    setSessionQuestions,
    setCurrentQuestion,
    roundDeck,
    setRoundDeck,
    discardDeck,
    setDiscardDeck,
    timerRef,
    deck,
    roundQuestions,
    firstRoundWordCount,
  ]);

  useEffect(() => {
    if (shouldRefreshRouter) {
      refreshRouter();
      setShouldRefreshRouter(false);
    }
  }, [shouldRefreshRouter, refreshRouter]);

  function reset() {
    setGameState("new");
    setRoundState("ready");
    setTeams(
      [...Array(teamCount).keys()].map(() => ({
        totalScores: 0,
        roundScores: new Array(3).fill([]),
      }))
    );
    setRoundQuestions([]);
    setCurrentTeamIndex(0);
    setCurrentRound(0);
    setDeck([]);
    setRoundDeck([]);
    setDiscardDeck([]);
  }

  function clearCache() {
    clearSessionQuestions;
  }

  const NAV_MENU: NavMenu[] = [
    {
      name: "Home",
      icon: "/icons/home.svg",
      href: "/"
    },
    {
      name: "New Game",
      icon: "/icons/new.svg",
      onClick: reset,
    },
    {
      name: "Rules",
      icon: "/icons/rules.svg",
      href: "/monikerz/rules",
      target: "_blank",
    },
    {
      name: "Clear cache",
      icon: "/icons/clear.svg",
      onClick: clearCache,
    },
  ];

  const setNumberOfTeams = useCallback(
    (incremental: number) => {
      const count = teamCount + incremental;
      if ((incremental < 0 && count < 1) || (incremental > 0 && count > 10)) {
        return;
      }
      setTeamCount(count);
    },
    [teamCount, setTeamCount]
  );

  const setRoundDuration = useCallback(
    (incremental: number) => {
      const roundDuration = duration + incremental;
      if (incremental < 0 && roundDuration < 30) {
        setDuration(30);
        return;
      }
      if (incremental > 0 && roundDuration > 180) {
        setDuration(180);
        return;
      }
      setDuration(roundDuration);
    },
    [duration, setDuration]
  );

  const setWordCount = useCallback(
    (incremental: number) => {
      const limit = firstRoundWordCount + incremental;
      if ((incremental < 0 && limit < 10) || (incremental > 0 && limit > 100)) {
        return;
      }
      setFirstRoundWordCount(limit);
    },
    [firstRoundWordCount, setFirstRoundWordCount]
  );

  const addPointsToTeam = useCallback(
    (points: number, isEnded?: boolean) => {
      if (points === 0) {
        playWrongSound();
      } else if (points === 1) {
        playRightSound();
      }
      const updatedRoundQuestions = [
        ...roundQuestions,
        {
          category: "",
          word: currentQuestion?.word || "",
          points: points,
        },
      ];
      setRoundQuestions(updatedRoundQuestions);
      setShouldRefreshRouter(true);
    },
    [
      roundDeck,
      discardDeck,
      currentRound,
      currentQuestion,
      currentTeamIndex,
      roundQuestions,
      setRoundQuestions,
      refreshRouter,
      firstRoundWordCount,
    ]
  );

  const startGame = useCallback(() => {
    reset();
    setGameState("playing");
  }, [reset, setGameState]);

  useEffect(() => {
    if (roundState === "playing") {
      timerRef.current?.go();
    }
  }, [roundState]);

  useEffect(() => {
    if (!currentQuestion) {
      refreshRouter();
    }
  }, [currentQuestion]);

  const [modalIsOpen, setIsOpen] = useState(roundState === "end");

  const onTimerEnded = useCallback(() => {
    setIsOpen(true);
    setRoundState("end");
    const updatedRoundQuestions = [
      ...roundQuestions,
      {
        category: currentQuestion?.category || "",
        word: currentQuestion?.word || "",
        points: 0,
      },
    ];
    setRoundQuestions(updatedRoundQuestions);
    playTimesUpSound();
  }, [
    setIsOpen,
    setRoundState,
    setRoundQuestions,
    roundQuestions,
    currentQuestion,
    playTimesUpSound,
  ]);

  const onRoundEndNext = useCallback(() => {
    setIsOpen(false);
    if (currentTeamIndex >= teams.length - 1) {
      setCurrentTeamIndex(0);
    } else {
      setCurrentTeamIndex(currentTeamIndex + 1);
    }
    setRoundState("ready");
    timerRef.current?.reset();

    const correctRoundQuestions = roundQuestions.filter(
      ({ points }) => points!! > 0
    );
    const wrongRoundQuestions = roundQuestions.filter(
      ({ points }) => points!! <= 0
    );
    const totalDeck = [...deck, ...correctRoundQuestions];

    if (currentRound === 0) {
      setDeck(totalDeck);
      if (totalDeck.length >= firstRoundWordCount) {
        setCurrentRound(currentRound + 1);
        setRoundDeck([...totalDeck]);
        setDiscardDeck([]);
      }
    } else {
      const totalDiscardDeck = [...discardDeck, ...wrongRoundQuestions];
      setDiscardDeck(totalDiscardDeck);
      if (roundDeck.length === 0 && totalDiscardDeck.length === 0) {
        if (currentRound === 2) {
          setGameState("end");
        } else {
          setCurrentRound(currentRound + 1);
          setRoundDeck([...deck]);
        }
      }
    }
    setTeams(
      teams.map((team, i) => {
        if (currentTeamIndex === i) {
          return {
            ...team,
            roundScores: team.roundScores.map((rs, ri) => {
              if (ri === currentRound) {
                return [...rs, currentRoundQuestionScores];
              }
              return rs;
            }),
          };
        }
        return team;
      })
    );
    setRoundQuestions([]);
  }, [
    roundDeck,
    discardDeck,
    currentRound,
    currentTeamIndex,
    teams,
    roundQuestions,
    setRoundQuestions,
    setCurrentRound,
    setGameState,
    setDeck,
    setDiscardDeck,
    setRoundDeck,
    firstRoundWordCount,
    currentRoundQuestionScores,
  ]);

  function onRoundStart() {
    refreshRouter();
    setRoundState("playing");
    setRoundQuestions([]);
    timerRef.current?.go();
    playNewInfoSound();
  }

  const adjustPoints = useCallback(
    (index: number, points: number) => {
      const updatedRoundQuestions = roundQuestions.map((roundQuestion, i) => {
        if (i === index) {
          return {
            ...roundQuestion,
            points,
          };
        }
        return roundQuestion;
      });
      setRoundQuestions(updatedRoundQuestions);
    },
    [roundQuestions, setRoundQuestions, currentTeamIndex]
  );

  return (
    <>
      <Navbar title="Monikerz" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[80vh] items-center justify-center">
        <Modal
          title={`Round ${currentRound + 1}`}
          visible={modalIsOpen || (gameState !== "new" && roundState === "end")}
          onClose={onRoundEndNext}
          confirmButtonText={
            roundQuestions.filter(({ points }) => !points).length === 0 &&
            roundDeck.length === 0 &&
            discardDeckLength === 0 &&
            currentRound >= 2
              ? "Final Result"
              : "Next"
          }
          onConfirm={onRoundEndNext}
        >
          {
            <>
              <div className="flex justify-between">
                <h2>Team {currentTeamIndex + 1}</h2>
                <h2>
                  {roundQuestions
                    .map((q) => q.points || 0)
                    .reduce((a, b) => a + b, 0)}{" "}
                  pts
                </h2>
              </div>
              {currentRound === 0 && (
                <ul>
                  {roundQuestions.map((roundQuestion, index) => (
                    <li key={roundQuestion.word + ":" + index}>
                      <div className="flex justify-between">
                        <div>{roundQuestion.word}</div>
                        <div className="flex gap-2 my-1">
                          {[0, 1].map((point) => (
                            <div
                              key={point}
                              className={`cursor-pointer border w-10 text-center rounded ${point === roundQuestion.points ? "border-pink-500 bg-pink-500" : ""}`}
                              onClick={() => adjustPoints(index, point)}
                            >
                              {point > 0 ? "+" + point : point}
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {currentRound !== 0 && (
                <ul>
                  {roundQuestions
                    .filter(({ points }) => points === 1)
                    .map((roundQuestion, index) => (
                      <li key={roundQuestion.word + ":" + index}>
                        <div className="flex justify-between">
                          <div>{roundQuestion.word}</div>
                          <div className="flex gap-2 my-1">
                            <div className="border w-10 text-center rounded border-pink-500 bg-pink-500">
                              +1
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
              <div className="gap-2">
                {teams.map((team, index) => {
                  const currentRoundQuestionScores =
                    index === currentTeamIndex
                      ? sum(roundQuestions.map(({ points }) => points!!))
                      : 0;
                  return (
                    <div
                      key={index}
                      className={`flex p-2 m-2 items-center text-center rounded-xl gap-2 dark:bg-gray-800`}
                    >
                      <div
                        className={`flex flex-col justify-center items-center gap-1 text-center p-2`}
                      >
                        <span>Team {index + 1}</span>
                        <h2 className="text-3xl font-bold">
                          {team.totalScores +
                            sum(team.roundScores.map((rs) => sum(rs))) +
                            currentRoundQuestionScores}
                        </h2>
                      </div>
                      {team.roundScores &&
                        team.roundScores.map((roundScore, ri) => (
                          <div
                            key={ri}
                            className={`flex flex-col justify-center items-center gap-1 text-center p-2 rounded-xl ${index === currentTeamIndex && ri === currentRound ? "border-2" : ""} border-pink-500`}
                          >
                            <span>{roundName(ri)}</span>
                            <h2 className="text-xl font-bold">
                              {sum(roundScore) +
                                (currentRound === ri
                                  ? currentRoundQuestionScores
                                  : 0)}
                            </h2>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
              <div className="flex">
                <div className={`gap-1 text-center p-2 rounded-xl`}>
                  <span>Total Deck</span>
                  <h2 className="text-3xl font-bold">{firstRoundWordCount}</h2>
                </div>
                <div className={`gap-1 text-center p-2 rounded-xl`}>
                  <span>Current Deck</span>
                  <h2 className="text-3xl font-bold">{actualDeckLength}</h2>
                </div>
                <div className={`gap-1 text-center p-2 rounded-xl`}>
                  <span>Remaining</span>
                  <h2 className="text-3xl font-bold">{currentDeckLength}</h2>
                </div>
                <div className={`gap-1 text-center p-2 rounded-xl`}>
                  <span>Discarded</span>
                  <h2 className="text-3xl font-bold">{discardDeckLength}</h2>
                </div>
              </div>
            </>
          }
        </Modal>
        {gameState === "new" && (
          <NewGame
            teamCount={teamCount}
            duration={duration}
            firstRoundWordCount={firstRoundWordCount}
            onTeamChanged={setNumberOfTeams}
            onTimeChanged={setRoundDuration}
            onWordCountChanged={setWordCount}
            onStart={startGame}
          />
        )}

        {gameState === "playing" && (
          <>
            <div className="fixed top-20 w-full grid grid-cols-3 gap-4 p-4">
              <div className="w-full flex  text-center justify-center items-center">
                {currentRound === 0 && (
                  <div className="flex flex-col item-centers justify-center">
                    <h3>Total / Current</h3>
                    <div className="text-2xl font-bold mt-0">
                      {firstRoundWordCount} /{" "}
                      {deck.length +
                        roundQuestions.filter(
                          (question) => question.points!! > 0
                        ).length}
                    </div>
                  </div>
                )}
                {currentRound != 0 && (
                  <div className="flex flex-col item-centers justify-center">
                    <h3>Current / Discarded</h3>
                    <div className="text-2xl font-bold mt-0">
                      {roundDeck.length} / {discardDeckLength}
                    </div>
                  </div>
                )}
              </div>
              <CircularTimer
                ref={timerRef}
                duration={duration}
                onEnded={onTimerEnded}
              />
              {teams[currentTeamIndex] && (
                <div className="flex flex-col justify-center items-center gap-1 text-center">
                  <h3>Team {currentTeamIndex + 1}</h3>
                  <div className="flex items-end">
                    <div className="w-10"></div>
                    <div className="text-5xl font-bold mt-0 mx-2">
                      {sum(
                        teams[currentTeamIndex].roundScores.map((rs) => sum(rs))
                      )}
                    </div>
                    <div className="text-2xl font-bold w-10">
                      {currentRoundQuestionScores}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {roundState === "playing" && currentQuestion != null && (
              <div className="pt-32">
                <h3 className="text-2xl text-center mb-4">
                  Round {currentRound + 1} - {roundName(currentRound)}
                </h3>
                <div className="flip-card partikers text-center w-160">
                  <div className="flip-card-front flex">
                    <h3 className="flex-2 flex flex-col rounded m-4 justify-center text-white">
                      {currentQuestion.category}
                    </h3>
                    <h1 className="flex-1 flex rounded rounded-2xl bg-pink-950 m-4 items-center justify-center text-white select-none">
                      {currentQuestion.word}
                    </h1>
                  </div>
                </div>
              </div>
            )}

            {roundState === "ready" && (
              <div className="pt-32 flex flex-col gap-4 items-center">
                <h1>Team {currentTeamIndex + 1}</h1>
                <h3>Round {currentRound + 1}</h3>
                <h1 className="text-7xl text-center italic uppercase">
                  {roundName(currentRound)}
                </h1>
              </div>
            )}

            <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                {roundState === "ready" && (
                  <ActionButton onClick={onRoundStart}>GO</ActionButton>
                )}
                {roundState === "playing" && (
                  <>
                    <BigButton onClick={() => addPointsToTeam(0)}>
                      Skip
                    </BigButton>

                    <BigButton onClick={() => addPointsToTeam(1)}>
                      Correct
                    </BigButton>
                  </>
                )}
              </div>
            </div>
          </>
        )}
        {gameState === "end" && (
          <>
            <h2 className="mb-4">Final Result</h2>
            <div className="flex flex-col gap-2">
              {teams.map((team, index) => {
                const totalTeamScores = sum(
                  team.roundScores.map((rs) => sum(rs))
                );
                return (
                  <div
                    key={index}
                    className={`flex justify-center items-center gap-8 text-center p-2 rounded-xl ${totalTeamScores === highestScore ? "border-2" : ""} border-pink-500 dark:bg-gray-900 dark:bg-opacity-80`}
                  >
                    {totalTeamScores === highestScore ? (
                      <Image
                        className="w-24"
                        src="/crown.svg"
                        width="48"
                        height="48"
                        alt="Winner"
                      />
                    ) : (
                      <Image
                        className="w-24"
                        src="/pile-of-poo.svg"
                        width="48"
                        height="48"
                        alt="Loser"
                      />
                    )}
                    <h1 className="w-64 text-center">Team {index + 1}</h1>
                    <h2 className="w-24">{totalTeamScores} pts</h2>
                  </div>
                );
              })}
            </div>
            <div className="z-10 flex w-full items-center justify-center bottom-8 fixed">
              <ActionButton onClick={reset}>NEW GAME</ActionButton>
            </div>
          </>
        )}
      </main>
    </>
  );
}
