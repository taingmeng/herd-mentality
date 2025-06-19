import Image from "next/image";
import LinkButton from "./LinkButton";

interface HeroCardProps {
  title?: string;
  playerCount?: string;
  duration?: string;
  age?: string;
  paragraphs?: string[];
  playPath?: string;
  imagePath?: string;
  horizontal?: boolean;
}

export default async function HeroCard({
  title,
  playerCount,
  duration,
  age,
  paragraphs,
  playPath,
  imagePath,
  horizontal,
}: HeroCardProps) {
  return (
    <div className={`container flex flex-col md:flex-row mx-auto min-h-[40vh] w-full  place-items-center`}>
      <Image width={horizontal ? 300 : 160} height={200} src={imagePath || ""} alt={title || ""} className="m-4 rounded-2xl " />
      <div className={`${horizontal ? "col-span-1" : "col-span-2"} row-start-2 lg:row-auto`}>
        <h1
          className="mb-2 max-w-sm text-2xl font-bold !leading-snug lg:mb-3 lg:text-3xl"
        >
          {title || "???"}
        </h1>
        <div className="flex flex-row gap-4 text-gray-500 mt-4 mb-2">
          <div className="flex flex-row">
            <Image
              src="/users.svg"
              width="24"
              height="24"
              alt="Player count"
              className="tint-grey"
            />
            <span>{playerCount}</span>
          </div>
          <div className="flex flex-row">
            <Image
              src="/time.svg"
              width="24"
              height="24"
              alt="Player count"
              className="tint-grey"
            />
            <span>{duration}</span>
          </div>
          <div className="flex flex-row">
            <Image
              src="/boy.svg"
              width="24"
              height="24"
              alt="Player count"
              className="tint-grey"
            />
            <span>{age}</span>
          </div>
        </div>
        {paragraphs?.map((p, index) => (
          <p key={index} className="mb-2 font-normal">{p}</p>
        ))}

        <LinkButton href={playPath}>Play</LinkButton>
      </div>
      
    </div>
  );
}
