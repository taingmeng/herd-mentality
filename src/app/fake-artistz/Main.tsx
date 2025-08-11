"use client";

import { ChangeEvent, useState } from "react";
import Image from "next/image";
import useLocalStorage from "@/app/hooks/useLocalStorage";
import Modal from "../components/Modal";
import { MainProps } from "../global/Types";
import { GAME_ICON_PATH, GAME_NAME, GAME_PATH } from "./Constants";
import { shuffle, usePopRandomQuestion } from "../global/Utils";
import BigButton from "../components/BigButton";
import Navbar from "../components/Navbar";
import Rules from "../components/Rules";

interface Player {
  name: string;
  question?: string;
  isFake?: boolean;
  flipped?: boolean;
}

export default function Main({ questions }: MainProps) {
  const [showRules, setShowRules] = useState(false);

  const { popRandomQuestion } = usePopRandomQuestion(
    GAME_PATH,
    questions
  );
  const [players, setPlayers] = useLocalStorage<Player[]>(
    `${GAME_PATH}.players`,
    []
  );
  const [playerNames, setPlayerNames] = useLocalStorage<string>(
    `${GAME_PATH}.playerNames`,
    ""
  );
  const [gameState, setGameState] = useLocalStorage(
    `${GAME_PATH}.gameState`,
    "new"
  );
  const [passIndex, setPassIndex] = useLocalStorage(
    `${GAME_PATH}.passIndex`,
    0
  );
  const [revealedFake, setRevealedFake] = useLocalStorage(
    `${GAME_PATH}.revealedFake`,
    false
  );
  const [revealedWord, setRevealedWord] = useLocalStorage(
    `${GAME_PATH}.revealedWord`,
    false
  );
  const [showPlayHint, setShowPlayHint] = useState(false);

  const isLastPassIndex = passIndex === players.length - 1;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setPlayerNames(value);
    setPlayers(
      value
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name.length)
        .map((name) => ({ name }))
    );
  };

  const startGame = async () => {
    const { category, word } = popRandomQuestion();
    const question = `${category}, ${word}`;
    const fakeArtistQuestion = `${category}, ???`;
    const fakeArtistIndex = Math.floor(Math.random() * players.length);
    setGameState("passing");
    setPlayers(
      shuffle(
        players.map((player, index) => ({
          ...player,
          question: index === fakeArtistIndex ? fakeArtistQuestion : question,
          isFake: index === fakeArtistIndex,
          flipped: false,
        }))
      )
    );
  };

  const passNext = () => {
    if (isLastPassIndex) {
      setGameState("playing");
    } else {
      if (players[passIndex].flipped) {
        setTimeout(() => setPassIndex(passIndex + 1), 800);
      } else {
        setPassIndex(passIndex + 1);
      }
    }
    setUnflipped(passIndex);
  };

  const passPrevious = () => {
    if (passIndex === 0) {
      setGameState("new");
    } else {
      if (players[passIndex].flipped) {
        setTimeout(() => setPassIndex(passIndex - 1), 800);
      } else {
        setPassIndex(passIndex - 1);
      }
    }
    setUnflipped(passIndex);
  };

  const setFlipped = (index: number) => {
    setPlayers(
      players.map((player, i) => {
        if (i === index) {
          return {
            ...player,
            flipped: !(player.flipped || false),
          };
        }
        return player;
      })
    );
  };

  const setUnflipped = (index: number) => {
    setPlayers(
      players.map((player, i) => {
        if (i === index) {
          return {
            ...player,
            flipped: false,
          };
        }
        return player;
      })
    );
  };

  const newGame = () => {
    setGameState("new");
    setPassIndex(0);
    setPlayers(
      players.map((player) => {
        return {
          ...player,
          flipped: false,
        };
      })
    );
    setRevealedFake(false);
    setRevealedWord(false);
  };

  const backToPassing = () => {
    setGameState("passing");
    setPassIndex(players.length - 1);
    setPlayers(
      players.map((player) => ({
        ...player,
        flipped: false,
      }))
    );
    setRevealedFake(false);
    setRevealedWord(false);
  };

  const revealFakeArtist = () => {
    setPlayers(
      players.map((player) => ({
        ...player,
        flipped: player.isFake,
      }))
    );
    setRevealedFake(true);
  };

  const revealTheWord = () => {
    setPlayers(
      players.map((player) => ({
        ...player,
        flipped: true,
      }))
    );
    setRevealedWord(true);
  };

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
      <main className="flex flex-col min-h-[75vh] items-center justify-center">
        {gameState === "new" && (
          <>
            <h3 className="mb-3 font-semibold text-center">
              Enter player names:
            </h3>
            <textarea
              className="min-w-[75vw] min-h-[50vh] lg:min-h-[25vh] resize p-4 text-center border rounded-lg font-bold text-3xl bg-transparent border-pink-600 placeholder-grey-400 placeholder-opacity-10 text-white"
              placeholder="Example: Alice, Bob, Charlie"
              onChange={handleChange}
              value={playerNames}
            />
            <label className="block mt-2">Player count: {players.length}</label>
            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton disabled={!players.length} onClick={startGame}>
                  Start Game
                </BigButton>
              </div>
            </div>
          </>
        )}

        {gameState === "passing" && (
          <>
            <div className="flex flex-col justify-between items-center gap-4">
              <div className="flex flex-row flex-wrap gap-4">
                {players.map((player, index) => {
                  const nextArrow = index === players.length - 1 ? "" : " -> ";
                  if (index === passIndex) {
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
              </div>
              <div
                className={`flip-card ${
                  players[passIndex].flipped ? "flipped" : ""
                }`}
                onClick={() => setFlipped(passIndex)}
              >
                <div
                  className={`flip-card-inner ${
                    players[passIndex].flipped ? "flipped" : ""
                  }`}
                >
                  <div className="flip-card-front">
                    <h2 className="text-white">{players[passIndex].name}</h2>
                    <label className="text-white">(Tap to reveal)</label>
                  </div>
                  <div className="flip-card-back">
                    <h2 className="text-white">
                      {players[passIndex].question}
                    </h2>
                    {players[passIndex].isFake && (
                      <label className="text-white">
                        (You are the fake artist!)
                      </label>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {!isLastPassIndex && (
                  <div className="text-center">
                    <label className="block text-gray-500">
                      Tap again to hide the card.
                      <br />
                      Pass to the next player.
                    </label>
                    <h2>{players[passIndex + 1].name}</h2>
                  </div>
                )}
                {isLastPassIndex && (
                  <div className="text-center">
                    <label className="block text-gray-500">
                      Press Next to start drawing.
                      <br />
                      Start from {players[0].name} and go clock-wise.
                    </label>
                    <h2>Ready?</h2>
                  </div>
                )}

                <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
                  <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                    <BigButton onClick={passPrevious}>Previous</BigButton>
                    <BigButton onClick={passNext}>Next</BigButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {gameState === "playing" && (
          <>
            <div className="flex gap-2 w-full flex-wrap justify-center mt-12">
              {players.map((player, index) => {
                return (
                  <div
                    key={index}
                    className={`flip-card ${
                      player.flipped ? "flipped" : ""
                    } fake-artist`}
                  >
                    <div
                      className={`flip-card-inner ${
                        player.flipped ? "flipped" : ""
                      }`}
                    >
                      <div className="flip-card-front">
                        <h2 className="text-white">{player.name}</h2>
                      </div>
                      <div className="flip-card-back">
                        <h3
                          className={`text-white font-bold ${
                            player.isFake ? "text-pink-700" : ""
                          }`}
                        >
                          {player.name}
                        </h3>
                        <h2
                          className={`text-white text-xl mt-2 ${
                            player.isFake ? "text-pink-700" : ""
                          }`}
                        >
                          {player.question}
                        </h2>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              className="text-center mt-4"
              onClick={() => setShowPlayHint(!showPlayHint)}
            >
              <Image
                src="/info.svg"
                width="48"
                height="48"
                alt="Info"
                className="tint"
              />
            </div>
            <Modal
              title="How to Play"
              visible={showPlayHint}
              onClose={() => setShowPlayHint(false)}
              confirmButtonText="Okay"
            >
              <div>
                <p className="block mt-4">
                  Each player takes turn to draw only 1 stroke on the paper
                  using different color pens, crayons, or markers.
                </p>
                <p className="block mt-4">
                  Continue for 2 rounds until everyone has drawn 2 strokes.
                </p>
                <p className="block mt-4">Discuss and analyse the drawing.</p>
                <p className="block mt-4">
                  Count down 3, 2, 1 and vote for the fake artist by pointing to
                  who you believe is the fake artist simultaneously.
                </p>
                <p className="block mt-4">
                  If there is no clear majority pointing to fake artist (not
                  pointed to the most or has received the same number of votes
                  as other artists), the fake artist win.
                </p>
                <p className="block mt-4">
                  If the fake artist is caught, they have one chance to guess
                  the actual word. If the fake artist&apos;s answer is correct,
                  the fake artist wins. Otherwise, other players win.
                </p>
              </div>
            </Modal>

            <div className="z-10 w-full max-w-5xl items-center justify-between lg:flex">
              <div className="fixed flex h-24 bottom-4 pb-4 gap-2 mb-4 left-0 right-0 p-4 justify-center">
                <BigButton onClick={backToPassing} className="col-span-1">
                  Back
                </BigButton>
                {!revealedFake && (
                  <BigButton onClick={revealFakeArtist} className="col-span-2">
                    Reveal Fake Artist
                  </BigButton>
                )}
                {revealedFake && !revealedWord && (
                  <BigButton onClick={revealTheWord} className="col-span-2">
                    Reveal The Word
                  </BigButton>
                )}
                {revealedFake && revealedWord && (
                  <BigButton onClick={newGame} className="col-span-2">
                    New Game
                  </BigButton>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
