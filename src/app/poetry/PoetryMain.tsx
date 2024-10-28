"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import NextButton from "@/app/components/NextButton";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import useSessionStorage from "@/app/hooks/useSessionStorage";
import useSound from "@/app/hooks/useSound";
import Button from "../components/Button";
import Modal from "../components/Modal";
import BigButton from "../components/BigButton";
import CircularTimer, { CircularTimerRefProps } from "./CircularTimer";

import wrongSoundFile from "@/assets/wrong.mp3";
import rightSoundFile from "@/assets/right.mp3";
import bonusSoundFile from "@/assets/bonus.mp3";
import timesUpSoundFile from "@/assets/times-up.mp3";
import newInfoSoundFile from "@/assets/new-info.mp3";

export const dynamic = "force-dynamic";

interface PoetryMainProps {
  questions: PoetryQuestion[];
}

export interface PoetryQuestion {
  word: string;
  long: string;
  points?: number;
}

interface Team {
  name?: string;
  score: number;
  roundScore: number;
  roundScores: number[];
}

const popRandomItem = (items: PoetryQuestion[]): PoetryQuestion => {
  const randomIndex = Math.floor(Math.random() * items.length); // Get a random index
  const item = items[randomIndex]; // Get the item at that index
  items.splice(randomIndex, 1); // Remove the item from the array
  return item; // Return the popped item
};

const sum = (nums: number[]): number => (nums || []).reduce((a, b) => a + b, 0);

export default function PoetryMain({ questions }: PoetryMainProps) {
  const router = useRouter();

  const [sessionQuestions, setSessionQuestions] = useLocalStorage<
    PoetryQuestion[]
  >("poetry.questions", [...questions]);

  const playRightSound = useSound(rightSoundFile);
  const playWrongSound = useSound(wrongSoundFile);
  const playBonusSound = useSound(bonusSoundFile);
  const playTimesUpSound = useSound(timesUpSoundFile);
  const playNewInfoSound = useSound(newInfoSoundFile);

  const [currentQuestion, setCurrentQuestion] = useState<PoetryQuestion>();

  const [gameState, setGameState] = useLocalStorage("poetry.gameState", "new");
  const [roundState, setRoundState] = useLocalStorage(
    "poetry.roundState",
    "ready"
  );
  const [teams, setTeams] = useLocalStorage<Team[]>("poetry.teams", []);
  const [currentTeamIndex, setCurrentTeamIndex] = useLocalStorage(
    "poetry.currentTeamIndex",
    0
  );
  const [teamCount, setTeamCount] = useLocalStorage("poetry.teamCount", 2);
  const [duration, setDuration] = useLocalStorage("poetry.duration", 90);
  const [rounds, setRounds] = useLocalStorage("poetry.rounds", 3);
  const [currentRound, setCurrentRound] = useLocalStorage(
    "poetry.currentRound",
    1
  );
  const [roundQuestions, setRoundQuestions] = useLocalStorage<PoetryQuestion[]>(
    "poetry.roundQuestions",
    []
  );

  const refreshRouter = useCallback(() => {
    let poppedQuestion = popRandomItem(sessionQuestions);
    if (
      currentQuestion &&
      poppedQuestion.word === currentQuestion.word &&
      poppedQuestion.long === currentQuestion.long
    ) {
      poppedQuestion = popRandomItem(sessionQuestions);
    }
    setCurrentQuestion(poppedQuestion);
    setSessionQuestions([...sessionQuestions]);
    if (sessionQuestions.length <= 0) {
      setSessionQuestions([...questions]);
    }
  }, [
    questions,
    sessionQuestions,
    currentQuestion,
    setSessionQuestions,
    setCurrentQuestion,
  ]);

  const highestScore = Math.max(...teams.map((team) => sum(team.roundScores)));

  const timerRef = useRef<CircularTimerRefProps>(null);

  function reset() {
    setGameState("new");
    setRoundState("ready");
    setRoundQuestions([]);
    setCurrentTeamIndex(0);
    setCurrentRound(1);
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

  const setGameRounds = useCallback(
    (incremental: number) => {
      const roundCount = rounds + incremental;
      if (
        (incremental < 0 && roundCount < 1) ||
        (incremental > 0 && roundCount > 10)
      ) {
        return;
      }
      setRounds(roundCount);
    },
    [rounds, setRounds]
  );

  const addPointsToTeam = useCallback(
    (points: number, isEnded?: boolean) => {
      if (points === -1) {
        playWrongSound();
      } else if (points === 1) {
        playRightSound();
      } else if (points === 3) {
        playBonusSound();
      }
      setRoundQuestions([
        ...roundQuestions,
        {
          ...currentQuestion!,
          points,
        },
      ]);
      setTeams(
        teams.map((team, i) => {
          if (currentTeamIndex === i) {
            return {
              ...team,
              roundScore: team.roundScore + points,
              roundScores: team.roundScores.map((score, ri) => {
                if (ri === currentRound - 1) {
                  return score + points;
                }
                return score;
              }),
            };
          }
          return team;
        })
      );
      if (!isEnded) {
        refreshRouter();
      }
    },
    [
      teams,
      setTeams,
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
        score: 0,
        roundScore: 0,
        roundScores: new Array(rounds).fill(0),
      }))
    );
    setGameState("playing");
  }, [teamCount, setGameState, setTeams, rounds]);

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
      setCurrentRound(currentRound + 1);
    } else {
      setCurrentTeamIndex(currentTeamIndex + 1);
    }
    setRoundState("ready");
    timerRef.current?.reset();
    if (currentRound >= rounds && currentTeamIndex === teams.length - 1) {
      setGameState("end");
    }
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
      const updatedScore = sum(
        updatedRoundQuestions.map(({ points }) => points!)
      );
      setTeams(
        teams.map((team, i) => {
          if (currentTeamIndex === i) {
            return {
              ...team,
              roundScore: updatedScore,
              roundScores: team.roundScores.map((score, ri) => {
                if (ri === currentRound - 1) {
                  return updatedScore;
                }
                return score;
              }),
            };
          }
          return team;
        })
      );
    },
    [teams, setTeams, roundQuestions, setRoundQuestions, currentTeamIndex]
  );

  return (
    <>
      <Navbar title="Party for Neanderthals" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[80vh] items-center justify-center">
        <Modal
          title={`Round ${currentRound} of ${rounds}`}
          visible={modalIsOpen || roundState === "end"}
          onClose={onRoundEndNext}
          confirmButtonText={
            currentRound >= rounds && currentTeamIndex === teams.length - 1
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
                  {(roundQuestions || [])
                    .map((q) => q.points || 0)
                    .reduce((a, b) => a + b, 0)}{" "}
                  pts
                </h2>
              </div>
              <ul>
                {roundQuestions.map((roundQuestion, index) => (
                  <li
                    key={
                      roundQuestion.word +
                      ":" +
                      roundQuestion.long +
                      ":" +
                      index
                    }
                  >
                    <div className="flex justify-between">
                      <div>
                        {`${roundQuestion.word}, ${roundQuestion.long}`}
                      </div>
                      <div className="flex gap-2 my-1">
                        {[0, -1, 1, 3].map((point) => (
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
              <div className="gap-2">
                {teams.map((team, index) => {
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
                          {sum(team.roundScores)}
                        </h2>
                      </div>
                      {team.roundScores &&
                        team.roundScores.map((roundScore, ri) => (
                          <div
                            key={ri}
                            className={`flex flex-col justify-center items-center gap-1 text-center p-2 rounded-xl ${index === currentTeamIndex && ri === currentRound - 1 ? "border-2" : ""} border-pink-500`}
                          >
                            <span>Round {ri + 1}</span>
                            <h2 className="text-3xl font-bold">{roundScore}</h2>
                          </div>
                        ))}
                    </div>
                  );
                })}
              </div>
            </>
          }
        </Modal>
        {gameState === "new" && (
          <>
            <h1>New Game</h1>
            <div className="flex flex-col gap-4 mt-20">
              <div className="flex flex-row gap-4 items-center">
                <h2 className="w-20">Teams</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setNumberOfTeams(-1)}
                >
                  -
                </Button>
                <h2 className="w-12 text-center">{teamCount}</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setNumberOfTeams(1)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-row gap-4  items-center">
                <h2 className="w-20">Time</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setRoundDuration(-30)}
                >
                  -
                </Button>
                <h2 className="w-12 text-left">{duration}s</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setRoundDuration(30)}
                >
                  +
                </Button>
              </div>
              <div className="flex flex-row gap-4  items-center">
                <h2 className="w-20">Rounds</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setGameRounds(-1)}
                >
                  -
                </Button>
                <h2 className="w-12 text-center">{rounds}</h2>
                <Button
                  className="w-20 text-5xl"
                  onClick={() => setGameRounds(1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
              <div className="grid grid-cols-3 gap-4 fixed h-24 bottom-0 left-0 right-0 p-4 items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
                <NextButton className="col-span-3" onClick={startGame}>
                  Start
                </NextButton>
              </div>
            </div>
          </>
        )}

        {gameState === "playing" && (
          <>
            <div className="fixed top-20 w-full grid grid-cols-3 gap-4 p-4">
              <div className="w-full flex flex-col text-center justify-center items-center">
                <h3>Round</h3>
                <div className="flex items-end">
                  <div className="w-10"></div>
                  <div className="text-5xl font-bold mt-0">{currentRound}</div>
                  <div className="w-10">/{rounds}</div>
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
                    <div className="text-5xl font-bold mt-0">
                      {teams[currentTeamIndex].roundScores[currentRound-1]}
                    </div>
                    <div className="w-10">
                      {sum(teams[currentTeamIndex].roundScores.filter((s, index) => index !== currentRound - 1))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {roundState === "playing" && currentQuestion != null && (
              <div className="flip-card poetry text-center">
                <div className="flip-card-front flex">
                  <h2 className="flex-1 flex flex-col rounded rounded-2xl bg-pink-950 m-4 justify-center text-white">
                    {currentQuestion.word}
                  </h2>
                  <h2 className="flex-1 flex-col rounded  m-4  text-white">
                    {currentQuestion.long}
                  </h2>
                </div>
              </div>
            )}

            {roundState === "ready" && <h1>Ready?</h1>}

            <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex  bg-gradient-to-t from-white via-white dark:from-black dark:via-black">
              <div className="fixed grid grid-cols-3 gap-4  h-24 bottom-0 pb-4 mb-4 left-0 right-0 p-4 items-end justify-center">
                {roundState === "ready" && (
                  <div className="col-span-3">
                    {" "}
                    <NextButton onClick={onRoundStart}>Start</NextButton>
                  </div>
                )}
                {roundState === "playing" && (
                  <>
                    <BigButton
                      className="text-xl !text-red-300"
                      onClick={() => addPointsToTeam(-1)}
                    >
                      -1
                    </BigButton>
                    <BigButton
                      className="text-5xl !text-green-500"
                      onClick={() => addPointsToTeam(3)}
                    >
                      +3
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
              {teams
                .map((team, index) => {
                  return (
                    <div
                      key={index}
                      className={`flex justify-center items-center gap-8 text-center p-2 rounded-xl ${sum(team.roundScores) === highestScore ? "border-2" : ""} border-pink-500`}
                    >
                      {sum(team.roundScores) === highestScore ? (
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
                      <h2 className="w-24">{sum(team.roundScores)} pts</h2>
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
