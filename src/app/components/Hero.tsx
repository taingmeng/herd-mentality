import Image from "next/image";
import Link from "next/link"

function Hero() {
  return (
    <header className="mt-12 px-8">
      <div className="container mx-auto grid min-h-[70vh] w-full grid-cols-1 place-items-center gap-y-10 lg:grid-cols-2">
        <div className="row-start-2 lg:row-auto lg:-mt-20">
          <h1
            color="blue-gray"
            className="mb-2 max-w-sm text-3xl font-bold !leading-snug lg:mb-3 lg:text-5xl"
          >
            Herd Mentality
          </h1>
          <div className="flex flex-row gap-8 text-gray-500 mt-8">
            <div className="flex flex-row gap-2">
              <Image src="/users.svg" width="24" height="24" alt="Player count" className="tint-grey" />
              <span>4-20 Players</span>
            </div>
            <div className="flex flex-row gap-2">
              <Image src="/time.svg" width="24" height="24" alt="Player count" className="tint-grey" />
              <span>20-30 Min</span>
            </div>
            <div className="flex flex-row gap-2">
              <Image src="/boy.svg" width="24" height="24" alt="Player count" className="tint-grey" />
              <span>Age: 10+</span>
            </div>
          </div>
          <p
            className="mb-6 text-xl font-normal"
          >
            This is a party game for families, friends and cow rustlers. The aim of the game is simple: think like the herd and write down the same answers as your friends.
            </p>
            <p
            className="mb-6 text-xl font-normal"
          >
            If your answer is part of the majority, you all win cows. Yeehaw! If everyone else writes an answer that is matched by at least one other person, but yours is the odd one out, then you land the angry Pink Cow, and your herd of cows is worthless until you can offload it onto someone else.

            The first player to collect eight cows wins.
          </p>
          <Link href="/herd-mentality">
            <div className="font-bold py-4 px-8 rounded rounded-lg border transition-colors cursor-pointer text-center
            bg-pink-200 border-transparent
            hover:border-pink-500 hover:bg-pink-200
            active:border-pink-500 active:bg-pink-500
            dark:bg-neutral-800 dark:border-pink-200
            hover:dark:border-pink-700 hover:dark:bg-neutral-800/30
            active:dark:border-pink-400 active:dark:bg-pink-800/30">
              Play
            </div>
          </Link>
        </div>
        <div className="grid gap-6 lg:mt-0">
          <Image
            width={384}
            height={384}
            src="/herd_mentality.png"
            alt="Herd Mentality"
          />
        </div>
      </div>
    </header>
  );
}
export default Hero;
