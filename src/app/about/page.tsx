import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default async function About() {
  return <>
    <Navbar title="About" />
    <main className="min-h-screen overflow-hidden">
      <div className="relative flex flex-col md:flex-row items-center min-h-[80vh]">
        {/* Left: Text content */}
        <div className="relative z-10 flex-shrink-0 w-full md:w-[45%] px-10 py-16 md:py-24 flex flex-col justify-center">
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
            src="/about/illustration.png"
            alt="People playing party games"
            fill
            className="object-contain object-center"
            priority
          />
        </div>
      </div>
    </main>
    <Footer />
  </>;
}
