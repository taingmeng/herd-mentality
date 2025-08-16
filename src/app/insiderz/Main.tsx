"use client";

import { useCallback, useRef, useState, ChangeEvent, useEffect } from "react";
import useSound from "use-sound";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import Navbar, { NavMenu } from "@/app/components/Navbar";
import BigButton from "../components/BigButton";
import { MainProps, Question } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import Rules from "../components/Rules";
import { shuffle, usePopRandomQuestion } from "../global/Utils";
import useLocalStorage from "../hooks/useLocalStorage";
import CircularTimer, {
  CircularTimerRefProps,
} from "../components/CircularTimer";
import timesUpSoundFile from "@/assets/times-up.mp3";
import Button from "../components/Button";
import IncrementalInput from "../components/IncrementalInput";

interface Player {
  name: string;
  role: "Master" | "Insider" | "Common";
  flipped: boolean;
}

interface GameState {
  players: Player[];
  gameState: string;
  playerNames: string;
  passIndex: number;
  answerFlipped: boolean;
  gameDuration: number;
  guessResult: boolean | null; // null means not guessed, true means guessed correctly, false means guessed incorrectly
  moreSecretWords: Question[];
}

const defaultGameState = {
  gameState: "new",
  players: [],
  playerNames: "",
  passIndex: 0,
  answerFlipped: false,
  gameDuration: 300,
  guessResult: null,
  moreSecretWords: [],
};

export default function Main({ questions }: MainProps) {
  const {
    currentQuestion,
    popRandomQuestion,
    clearSessionQuestions,
    setCurrentQuestion,
  } = usePopRandomQuestion(GAME_PATH, questions);
  const [gameState, setGameState] = useLocalStorage<GameState>(
    `${GAME_PATH}.gameState`,
    defaultGameState
  );

  const [showRules, setShowRules] = useState(false);
  const [playTimesUpSound] = useSound(timesUpSoundFile);
  const fullScreenHandle = useFullScreenHandle();

  function clearCache() {
    clearSessionQuestions();
    setGameState(defaultGameState);
  }
  const timerRef = useRef<CircularTimerRefProps>(null);

  useEffect(() => {
    if (gameState.gameState === "playing" && timerRef.current !== null) {
      timerRef.current.go(); // Safely focus the input if it's rendered
    }
  }, [gameState]);

  const NAV_MENU: NavMenu[] = [
    {
      name: "Full screen",
      icon: "/full-screen.svg",
      onClick: fullScreenHandle.enter,
    },
    {
      name: "Rules",
      icon: "/book.svg",
      onClick: setShowRules.bind(null, true),
    },
    {
      name: "Clear cache",
      icon: "/broom.svg",
      onClick: clearCache,
    },
  ];

  const onNew = useCallback(() => {
    popRandomQuestion();
    setGameState((prevState) => ({
      ...defaultGameState,
      playerNames: prevState.playerNames,
      gameDuration: prevState.gameDuration,
    }));
    timerRef.current?.go();
    timerRef.current?.reset();
  }, []);

  const onStart = useCallback(() => {
    const playerNames = shuffle(
      gameState.playerNames
        .split(/[,;\n]+/)
        .filter((name) => name.trim().length > 0)
    );
    const roles = shuffle([
      "Insider",
      ...new Array(playerNames.length - 2).fill("Common"),
    ]);
    roles.unshift("Master");
    setGameState((prevState) => ({
      ...prevState,
      players: playerNames.map((name, index) => ({
        name: name.trim(),
        role: roles[index],
        flipped: false,
      })),
      gameState: "roles",
      passIndex: 0,
    }));
  }, [gameState, setGameState]);

  const onFlipped = useCallback(
    (name: string) => {
      const indexToUser = gameState.players.findIndex(
        (player) => player.name === name
      );
      const newPlayers = [...gameState.players];
      newPlayers[indexToUser].flipped = !newPlayers[indexToUser].flipped;
      setGameState({
        ...gameState,
        players: newPlayers,
      });
    },
    [gameState, setGameState]
  );

  const onBackToRoles = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gameState: "roles",
    }));
  }, [setGameState]);

  const onBack = useCallback(() => {
    const delay = gameState.players[gameState.passIndex].flipped ? 1000 : 0;
    setGameState((prevState) => ({
      ...prevState,
      players: prevState.players.map((player) => ({
        ...player,
        flipped: false,
      })),
    }));
    setTimeout(() => {
      if (gameState.passIndex === 0) {
        setGameState((prevState) => ({
          ...prevState,
          gameState: "new",
        }));
      } else {
        const nextIndex = Math.max(0, gameState.passIndex - 1);
        setGameState((prevState) => ({
          ...prevState,
          passIndex: nextIndex,
        }));
      }
    }, delay);
  }, [gameState, setGameState]);

  const onNext = useCallback(() => {
    const delay = gameState.players[gameState.passIndex].flipped ? 1000 : 0;
    setGameState((prevState) => {
      return {
        ...prevState,
        players: prevState.players.map((player, index) => ({
          ...player,
          flipped: false,
        })),
      };
    });
    setTimeout(() => {
      if (gameState.passIndex === gameState.players.length - 1) {
        setGameState((prevState) => ({
          ...prevState,
          gameState: "playing",
        }));
        timerRef.current?.go();
      } else {
        const nextIndex = Math.min(
          gameState.players.length - 1,
          gameState.passIndex + 1
        );
        setGameState((prevState) => ({
          ...prevState,
          passIndex: nextIndex,
          gameState: "roles",
        }));
      }
    }, delay);
  }, [gameState, timerRef.current, setGameState]);

  const onTimerEnded = useCallback(() => {
    playTimesUpSound();
    setGameState((prevState) => ({
      ...prevState,
      gameState: "ended",
    }));
    timerRef.current?.reset();
  }, [setGameState]);

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setGameState((prevState) => ({
      ...prevState,
      playerNames: value,
    }));
  }, []);

  const onAnswerFlip = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      answerFlipped: !prevState.answerFlipped,
    }));
  }, [setGameState]);

  const onTimeIncrement = useCallback(() => {
    const roundDuration = gameState.gameDuration + 30;
    if (roundDuration > 600) {
      setGameState((prevState) => ({
        ...prevState,
        gameDuration: 600,
      }));
      return;
    }
    setGameState((prevState) => ({
      ...prevState,
      gameDuration: roundDuration,
    }));
  }, [gameState, setGameState]);

  const onTimeDecrement = useCallback(() => {
    const roundDuration = gameState.gameDuration - 30;
    if (roundDuration < 30) {
      setGameState((prevState) => ({
        ...prevState,
        gameDuration: 30,
      }));
      return;
    }
    setGameState((prevState) => ({
      ...prevState,
      gameDuration: roundDuration,
    }));
  }, [gameState, setGameState]);

  const onChangeSecretWord = useCallback(
    (question: Question) => {
      setCurrentQuestion(question);
    },
    [setCurrentQuestion]
  );

  const onMoreSecretWords = useCallback(() => {
    const randomQuestions: Question[] = [];
    if (currentQuestion) {
      randomQuestions.push(currentQuestion);
    }
    for (let i = 0; i < 4; i++) {
      randomQuestions.push(popRandomQuestion());
    }
    setGameState((prevState) => ({
      ...prevState,
      moreSecretWords: randomQuestions,
    }));
    setCurrentQuestion(randomQuestions[0]); // Set the first question as the current question
  }, [currentQuestion, popRandomQuestion]);

  const onGuess = useCallback(
    (guessed: boolean | null) => {
      setGameState((prevState) => ({
        ...prevState,
        guessResult: guessed,
      }));
    },
    [setGameState]
  );

  const onEnd = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gameState: "ended",
      answerFlipped: false,
      guessResult: null,
    }));
    timerRef.current?.reset();
  }, [setGameState]);

  const onRestart = useCallback(() => {
    setGameState((prevState) => ({
      ...prevState,
      gameState: "playing",
    }));
  }, [setGameState]);

  const playerCount = gameState.playerNames
    .split(/[,;\n]+/)
    .filter((word) => word.trim().length > 0).length;

  return (
    <>
      <Navbar
        title={GAME_NAME}
        menus={NAV_MENU}
        iconFilePath={GAME_ICON_PATH}
      />
      <Rules
        gameName={GAME_NAME}
        gamePath={GAME_PATH}
        visible={showRules}
        onClose={() => setShowRules(false)}
      />
      <FullScreen handle={fullScreenHandle}>
        <main className="mt-12 flex flex-col min-h-[80vh] items-center">
          <div className="max-h-[80vh] flex flex-col items-center w-full max-w-5xl items-center justify-center overflow-y-auto p-4">
            {gameState.gameState === "new" && (
              <div className="w-full mx-auto">
                <h3 className="mb-3 font-semibold text-center">
                  Enter player names:
                </h3>
                <textarea
                  className="w-full p-4 text-center border rounded-lg font-bold text-3xl bg-transparent border-pink-600 placeholder-grey-400 placeholder-opacity-10 text-white"
                  placeholder="Example: Alice, Bob, Charlie"
                  onChange={handleChange}
                  value={gameState.playerNames}
                />
                <label className="block mt-2">
                  Player count: {playerCount} (minimum 4)
                </label>
                <div className="flex justify-center items-center mt-4">
                  <IncrementalInput
                    title="Time"
                    value={`${gameState.gameDuration}s`}
                    onIncrement={() => onTimeIncrement()}
                    onDecrement={() => onTimeDecrement()}
                  />
                </div>
              </div>
            )}
            {gameState.gameState === "roles" && (
              <>
                <h3 className="flex flex-row flex-wrap gap-4">
                  {gameState.players.map((player, index) => {
                    const nextArrow =
                      index === gameState.players.length - 1 ? "" : " -> ";
                    if (index === gameState.passIndex) {
                      return (
                        <span className={`font-bold`} key={index}>
                          {player.name} {nextArrow}
                        </span>
                      );
                    }
                    return (
                      <span className={`text-gray-500`} key={index}>
                        {player.name} {nextArrow}
                      </span>
                    );
                  })}
                </h3>
                <div
                  className={`flip-card cursor-pointer select-none mt-4 ${
                    gameState.players[gameState.passIndex].flipped
                      ? "flipped"
                      : ""
                  }`}
                  onClick={() =>
                    onFlipped(gameState.players[gameState.passIndex].name)
                  }
                >
                  <div
                    className={`flip-card-inner ${
                      gameState.players[gameState.passIndex].flipped
                        ? "flipped"
                        : ""
                    }`}
                  >
                    <div className="flip-card-front">
                      {gameState.players[gameState.passIndex].role ===
                        "Master" && <span className="text-white">Master</span>}
                      <h2 className="text-white">
                        {gameState.players[gameState.passIndex].name}
                      </h2>
                      <label className="text-white">(Tap to reveal)</label>
                    </div>
                    <div className="flip-card-back">
                      <h2 className="text-white">
                        {gameState.players[gameState.passIndex].role}
                      </h2>

                      {(gameState.players[gameState.passIndex].role ===
                        "Insider" ||
                        gameState.players[gameState.passIndex].role ===
                          "Master") && (
                        <h3 className="text-white">
                          {currentQuestion && currentQuestion.word}
                        </h3>
                      )}
                    </div>
                  </div>
                </div>
                {gameState.players[gameState.passIndex].role === "Master" &&
                  gameState.players[gameState.passIndex].flipped && (
                    <>
                      {(!gameState.moreSecretWords ||
                        !gameState.moreSecretWords.length) && (
                        <Button className="mt-4" onClick={onMoreSecretWords}>
                          Change Secret Word
                        </Button>
                      )}
                      {gameState.moreSecretWords &&
                        gameState.moreSecretWords.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {gameState.moreSecretWords.map(
                                (question, index) => (
                                  <Button
                                    key={index}
                                    className="text-pink-300 px-2 py-1 rounded-full border border-pink-300 cursor-pointer"
                                    onClick={() => onChangeSecretWord(question)}
                                  >
                                    {question.word}
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </>
                  )}
              </>
            )}
            {(gameState.gameState === "playing" ||
              gameState.gameState === "ended") && (
              <>
                <div className="p-8 flex justify-between items-center w-full max-w-5xl">
                  <div>
                    <CircularTimer
                      ref={timerRef}
                      duration={gameState.gameDuration}
                      onEnded={onTimerEnded}
                      tickSoundStartAt={10}
                      textSize="text-3xl"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-center">Master</h3>
                    <h1 className="font-bold text-center">
                      {gameState.players.find(
                        (player) => player.role === "Master"
                      )?.name || "No Master"}
                    </h1>
                  </div>
                </div>
                <div className="flex gap-2 w-full flex-wrap justify-center">
                  {gameState.players
                    .filter((player) => player.role !== "Master")
                    .map((player, index) => (
                      <div
                        className={`flip-card fake-artist cursor-pointer select-none mt-4 ${
                          player.flipped ? "flipped" : ""
                        }`}
                        key={player.name + index}
                        onClick={
                          gameState.gameState === "ended"
                            ? () => onFlipped(player.name)
                            : undefined
                        }
                      >
                        <div
                          className={`flip-card-inner ${
                            player.flipped ? "flipped" : ""
                          }`}
                        >
                          <div className="flip-card-front">
                            <h2 className="text-white">{player.name}</h2>
                            {gameState.gameState === "ended" && (
                              <label className="text-white">
                                (Tap to reveal)
                              </label>
                            )}
                          </div>
                          <div className="flip-card-back">
                            <h2 className="text-white">{player.role}</h2>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
            {gameState.gameState === "ended" && (
              <div className="flex flex-col gap-2 w-full mt-8">
                <div>
                  <span>Secret word</span>
                  <div className="flex flex-row justify-start items-start">
                    <div className="flex gap-2 items-center">
                      <Button onClick={() => onAnswerFlip()}>
                        {gameState.answerFlipped ? "Hide" : "Reveal"}
                      </Button>
                      {gameState.answerFlipped && (
                        <h3>{currentQuestion?.word || ""}</h3>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span>Did anyone guess the secret word?</span>
                  <div className="flex gap-2 items-center">
                    <Button onClick={() => onGuess(false)}>No</Button>
                    <Button onClick={() => onGuess(true)}>Yes</Button>
                    {gameState.guessResult !== null && (
                      <h3>{gameState.guessResult ? "Yes" : "No"}</h3>
                    )}
                  </div>
                  {gameState.guessResult === false && (
                    <span>Too bad. Everyone loses!</span>
                  )}
                  {gameState.guessResult === true && (
                    <div>
                      <span>
                        Discuss openly for 1 minute. Everyone except the guesser
                        votes for whether the guesser is the insider.
                      </span>
                      <h3>
                        Tap the name of the player who asked the correct
                        question.
                      </h3>
                    </div>
                  )}
                  {gameState.guessResult === true &&
                    gameState.players.filter(
                      (player) => player.flipped && player.role === "Common"
                    ).length > 0 && (
                      <div>
                        <span>
                          The guesser is a common. Now everyone including the
                          guesser votes for the insider.
                        </span>
                        <h3>
                          Tap the name of the player who got the majority vote.
                        </h3>
                      </div>
                    )}
                  {gameState.guessResult === true &&
                    gameState.players.filter(
                      (player) => player.flipped && player.role === "Insider"
                    ).length > 0 && (
                      <div>
                        <span>
                          Congrats to the master and the commons. You have found
                          the insider!
                        </span>
                      </div>
                    )}
                  {gameState.guessResult === true &&
                    gameState.players.filter(
                      (player) => player.flipped && player.role === "Common"
                    ).length >= 2 && (
                      <div>
                        <span>
                          Congrats to the insider! You have guided everyone to
                          the correct answer without being detected!
                        </span>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
            <div className="fixed flex h-24 bottom-4 pb-4 gap-4 mb-4 left-0 right-0 p-4 justify-center">
              {gameState.gameState === "new" && (
                <>
                  <BigButton
                    disabled={playerCount < 4}
                    onClick={() => onStart()}
                  >
                    Start
                  </BigButton>
                </>
              )}
              {gameState.gameState === "roles" && (
                <>
                  <BigButton onClick={() => onBack()}>Back</BigButton>
                  <BigButton onClick={() => onNext()}>Next</BigButton>
                </>
              )}
              {gameState.gameState === "playing" && (
                <>
                  <BigButton onClick={() => onBackToRoles()}>Back</BigButton>
                  <BigButton onClick={() => onEnd()}>End</BigButton>
                </>
              )}
              {gameState.gameState === "ended" && (
                <>
                  <BigButton onClick={() => onNew()}>New Game</BigButton>
                  <BigButton onClick={() => onRestart()}>Restart</BigButton>
                </>
              )}
            </div>
          </div>
        </main>
      </FullScreen>
    </>
  );
}
