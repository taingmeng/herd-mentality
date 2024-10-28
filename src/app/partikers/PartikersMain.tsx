"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import ActionButton from "./ActionButton";
import NextButton from "@/app/components/NextButton";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import useSound from "@/app/hooks/useSound";
import Button from "../components/Button";
import Modal from "../components/Modal";
import BigButton from "../components/BigButton";
import CircularTimer, {
  CircularTimerRefProps,
} from "@/app/components/CircularTimer";

import wrongSoundFile from "@/assets/wrong.mp3";
import rightSoundFile from "@/assets/right.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";
import newInfoSoundFile from "@/assets/new-info.mp3";

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
  const router = useRouter();

  const [sessionQuestions, setSessionQuestions] = useLocalStorage<
    PartikersQuestion[]
  >("partikers.questions", [...questions]);

  const playRightSound = useSound(rightSoundFile);
  const playWrongSound = useSound(wrongSoundFile);
  const playTimesUpSound = useSound(timesUpSoundFile);
  const playNewInfoSound = useSound(newInfoSoundFile);

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
  const [duration, setDuration] = useLocalStorage("partikers.duration", 90);
  const [firstRoundWordCount, setFirstRoundWordCount] = useLocalStorage(
    "partikers.firstRoundWordCount",
    10
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

  const timerRef = useRef<CircularTimerRefProps>(null);
  const noMoreCards = roundDeck.length === 0 && discardDeck.length === 0;

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
        timerRef.current?.end();
        return;
      }
    } else if (currentRound === 1 || currentRound === 2) {
      if (noMoreCards) {
        setTimeout(() => timerRef.current?.end(), 0);
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
  ]);

  const highestScore = Math.max(
    ...teams.map((team) => sum(team.roundScores.map((rs) => sum(rs))))
  );

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

  const NAV_MENU: NavMenu[] = [
    {
      name: "New Game",
      icon: "/book.svg",
      onClick: reset,
    },
    {
      name: "Rules",
      icon: "/book.svg",
      href: "/poetry/poetry-rules.pdf",
      target: "_blank",
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
      if (
        (incremental < 0 && roundDuration < 30) ||
        (incremental > 0 && roundDuration > 180)
      ) {
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
      if (currentRound === 0 || !isEnded || !noMoreCards)
        setRoundQuestions([
          ...roundQuestions,
          {
            ...currentQuestion!!,
            points,
          },
        ]);
      if (roundState !== "ended" && !isEnded) {
        refreshRouter();
      }
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
    ]
  );

  const startGame = useCallback(() => {
    setTeams(
      [...Array(teamCount).keys()].map(() => ({
        totalScores: 0,
        roundScores: new Array(3).fill([]),
      }))
    );
    setGameState("playing");
  }, [teamCount, setGameState, setTeams]);

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
    addPointsToTeam(0, true);
    playTimesUpSound();
  }, [setIsOpen, setRoundState, addPointsToTeam, playTimesUpSound]);

  function onRoundEndNext() {
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
      if (roundDeck.length === 0 && discardDeckLength === 0) {
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
  }

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

  const actualDeckLength =
    currentRound === 0
      ? deck.length + roundQuestions.filter(({ points }) => points === 1).length
      : deck.length;

  const currentDeckLength =
    currentRound != 0 ? roundDeck.length : roundDeck.length;

  const discardDeckLength =
    currentRound != 0
      ? discardDeck.length +
        roundQuestions.filter(({ points }) => points === 0).length
      : discardDeck.length;

  const currentRoundQuestionScores = sum(
    roundQuestions.map(({ points }) => points!!)
  );

  return (
    <>
      <Navbar title="Partikers" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[80vh] items-center justify-center">
        <Modal
          title={`Round ${currentRound + 1}`}
          visible={modalIsOpen || roundState === "end"}
          onClose={onRoundEndNext}
          confirmButtonText={
            currentRound >= 2 && noMoreCards ? "Final Result" : "Next"
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
                        <div>
                          {`${roundQuestion.category}, ${roundQuestion.word}`}
                        </div>
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
                          <div>
                            {`${roundQuestion.category}, ${roundQuestion.word}`}
                          </div>
                          <div className="flex gap-2 my-1">
                            <div
                              className="border w-10 text-center rounded border-pink-500 bg-pink-500"
                            >
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
                      className={`flex p-2 items-center text-center rounded-xl gap-2`}
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
                            <h2 className="text-3xl font-bold">
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
                  <span>Target Deck</span>
                  <h2 className="text-3xl font-bold">{firstRoundWordCount}</h2>
                </div>
                <div className={`gap-1 text-center p-2 rounded-xl`}>
                  <span>Total Deck</span>
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
          <>
            <h1>New Game</h1>
            <div className="flex flex-col gap-4 mt-20">
              <div className="flex flex-row gap-4 items-center">
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setNumberOfTeams(-1)}
                >
                  -
                </Button>
                <div className="flex flex-col items-center w-20">
                  <h3>Teams</h3>
                  <h2>{teamCount}</h2>
                </div>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setNumberOfTeams(1)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-row gap-4 items-center">
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setRoundDuration(-30)}
                >
                  -
                </Button>
                <div className="flex flex-col items-center w-20">
                  <h3>Time</h3>
                  <h2>{duration}s</h2>
                </div>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setRoundDuration(30)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-row gap-4 items-center">
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setWordCount(-10)}
                >
                  -
                </Button>
                <div className="flex flex-col items-center w-20">
                  <h3>Cards</h3>
                  <h2>{firstRoundWordCount}</h2>
                </div>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setWordCount(10)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="z-10 flex w-full items-center justify-center bottom-5 fixed">
              <ActionButton onClick={startGame}>Start</ActionButton>
            </div>
          </>
        )}

        {gameState === "playing" && (
          <>
            <div className="fixed top-20 w-full grid grid-cols-3 gap-4 p-4">
              <div className="w-full flex flex-col text-center justify-center items-center">
                <h3>Round {currentRound + 1}</h3>
                <div className="flex items-end">
                  <div className="text-2xl font-bold mt-0">
                    {firstRoundWordCount} / {actualDeckLength} /{" "}
                    {roundDeck.length} / {discardDeckLength}
                  </div>
                </div>
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
                      {currentRoundQuestionScores}
                    </div>
                    <div className="w-10">
                      {sum(
                        teams[currentTeamIndex].roundScores.map((rs) => sum(rs))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {roundState === "playing" && currentQuestion != null && (
              <div>
                <h3 className="text-2xl text-center mb-4">
                  {roundName(currentRound)}
                </h3>
                <div className="flip-card partikers text-center w-80">
                  <div className="flip-card-front flex">
                    <h3 className="flex-2 flex flex-col rounded m-4 justify-center text-white">
                      {currentQuestion.category}
                    </h3>
                    <h1 className="flex-1 flex rounded rounded-2xl bg-pink-950 m-4 items-center justify-center text-white">
                      {currentQuestion.word}
                    </h1>
                  </div>
                </div>
              </div>
            )}

            {roundState === "ready" && (
              <div className="flex flex-col gap-4 items-center">
                <h1>Ready?</h1>
                <h1>{roundName(currentRound)}</h1>
              </div>
            )}

            <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
              <div className="fixed flex h-24 bottom-0 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                {roundState === "ready" && (
                  <ActionButton onClick={onRoundStart}>Start</ActionButton>
                )}
                {roundState === "playing" && (
                  <>
                    <BigButton
                      className="text-xl !text-red-300"
                      onClick={() => addPointsToTeam(0)}
                    >
                      Skip
                    </BigButton>

                    <BigButton
                      className="text-3xl  !text-yellow-300"
                      onClick={() => addPointsToTeam(1)}
                    >
                      +1
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
                    className={`flex justify-center items-center gap-8 text-center p-2 rounded-xl ${totalTeamScores === highestScore ? "border-2" : ""} border-pink-500`}
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
            <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
              <div className="fixed grid grid-cols-3 gap-4  h-24 bottom-0 pb-4 mb-4 left-0 right-0 p-4 items-end justify-center">
                <div className="col-span-3">
                  {" "}
                  <NextButton onClick={reset}>New Game</NextButton>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
