import Image from "next/image";
import Link from "next/link";
import HeroCard from "./HeroCard";

interface Game {
  title: string;
  playerCount: string;
  duration: string;
  age: string;
  playPath: string;
  imagePath: string;
  paragraphs: string[];
  tags: string[];
}

type SortOption = "added" | "name";

function parsePlayerRange(playerCount: string): { min: number; max: number } {
  const nums = playerCount.match(/\d+/g)?.map(Number) ?? [];
  return { min: nums[0] ?? 0, max: nums[1] ?? nums[0] ?? 0 };
}

function GameListRow({ title, playerCount, duration, age, paragraphs, playPath, imagePath }: Game) {
  return (
    <Link
      href={playPath}
      className="flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors bg-neutral-900 hover:bg-neutral-800"
    >
      <Image
        src={imagePath}
        alt={title}
        width={48}
        height={48}
        className="rounded-lg flex-shrink-0 object-cover"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-white">{title}</span>
          <span className="text-xs text-gray-500">{playerCount} · {duration} · {age}</span>
        </div>
        {paragraphs?.[0] && (
          <p className="text-sm text-gray-400 truncate mt-0.5">{paragraphs[0]}</p>
        )}
      </div>
      <span className="text-sm text-pink-400 font-medium flex-shrink-0">
        Play →
      </span>
    </Link>
  );
}

interface Props {
  games: Game[];
  query?: string;
  sort?: SortOption;
  tags?: string[];
  counts?: number[];
  view?: "grid" | "list";
}

export default function GameSearch({
  games,
  query = "",
  sort = "added",
  tags = [],
  counts = [],
  view = "grid",
}: Props) {
  let result = [...games];

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.paragraphs.some((p) => p.toLowerCase().includes(q)) ||
        g.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (tags.length > 0) {
    result = result.filter((g) => g.tags.some((t) => tags.includes(t)));
  }

  if (counts.length > 0) {
    result = result.filter((g) => {
      const { min, max } = parsePlayerRange(g.playerCount);
      return counts.some((n) => min <= n && n <= max);
    });
  }

  if (sort === "name") {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  }


  return (
    <>
      {view === "list" ? (
        <div className="flex flex-col w-full gap-2">
          {result.map((game) => (
            <GameListRow key={game.title} {...game} />
          ))}
        </div>
      ) : (
        <div className="grid w-full grid-cols-1 place-items-center gap-4 xl:grid-cols-2">
          {result.map((game) => (
            <HeroCard key={game.title} {...game} />
          ))}
        </div>
      )}
      {result.length === 0 && (
        <p className="text-center text-gray-500 mt-16">
          No games match your search.
        </p>
      )}
    </>
  );
}
