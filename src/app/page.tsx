import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { games } from "./global/Data";

export default async function Home() {
  return <>
    <Navbar title="Partyz" />
    <main className="min-h-screen overflow-hidden">
      {/* Hero */}
      <div className="relative flex flex-col md:flex-row items-center min-h-[80vh]">
        {/* Left: Text content */}
        <div className="relative z-10 flex-shrink-0 w-full md:w-[45%] px-10 pt-24 pb-8 md:py-24 flex flex-col justify-center">
          {/* Orange blob */}
          <div
            className="absolute -left-16 top-1/2 -translate-y-1/2 w-72 h-56 rounded-full -z-10"
            style={{ backgroundColor: "#F5A623", opacity: 0.85 }}
          />
          <h1 className="text-7xl md:text-8xl font-black leading-none text-white mb-6">
            PARTY<br />GAMES
          </h1>
          <p className="text-white text-base leading-relaxed max-w-sm">
            Tired of running out of cards in your favourite party games? Fed up with hauling boxes of board games to every
            gathering? Partyz brings your favourite party games to any device — so you can play anytime, anywhere, with
            family, friends, or colleagues. With thousands of words and questions across a growing library of games,
            you&apos;ll never run dry.
          </p>
        </div>

        {/* Right: Banner image */}
        <div className="relative w-full md:w-[55%] h-72 md:h-[80vh] flex-shrink-0">
          <Image
            src="/about/banner.png"
            alt="People playing party games"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>

      {/* Games list */}
      <div className="w-full py-8">
        <h2 className="text-white font-bold text-2xl mb-8 px-10">Latest Games</h2>
        <div className="flex flex-row items-stretch gap-6 overflow-x-auto pb-2 px-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {games.slice(0, 10).map((game) => (
            <Link
              key={game.playPath}
              href={game.playPath}
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/30 bg-white/10 p-5 min-w-[140px] hover:bg-white/20 transition-colors"
            >
              <div className="relative w-20 h-20">
                <Image src={game.imagePath} alt={game.title} fill className="object-contain" />
              </div>
              <span className="text-white text-sm font-semibold text-center">{game.title}</span>
            </Link>
          ))}
          <Link
            href="/games"
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-6 py-5 min-w-[140px] hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-2xl">→</span>
            <span className="text-white text-sm font-semibold">See all</span>
          </Link>
        </div>
      </div>

      {/* Features grid */}
      <div className="w-full px-10 py-8">
        <h2 className="text-white font-bold text-2xl mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-6 py-8">
            <span className="text-5xl">📚</span>
            <h3 className="text-white font-bold text-lg">Thousands of Words & Questions</h3>
            <p className="text-white/70 text-sm leading-relaxed">A constantly growing library means you&apos;ll never repeat the same question twice.</p>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-6 py-8">
            <span className="text-5xl">📱</span>
            <h3 className="text-white font-bold text-lg">Play Anywhere, Anytime</h3>
            <p className="text-white/70 text-sm leading-relaxed">All you need is a device. No boxes, no setup — just gather and play.</p>
          </div>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/30 bg-white/10 px-6 py-8">
            <span className="text-5xl">🎉</span>
            <h3 className="text-white font-bold text-lg">Unforgettable Laughter</h3>
            <p className="text-white/70 text-sm leading-relaxed">Create memories with family and friends over games that bring everyone together.</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
