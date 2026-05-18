import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default async function About() {

  return <>
    <Navbar title="About" />
    <main className="max-w-2xl mx-auto px-6 py-12 text-gray-800">
      <p className="text-lg leading-relaxed">
        Tired of running out of cards in your favourite party games? Fed up with hauling boxes of board games to every
        gathering? Partyz brings your favourite party games to any device — so you can play anytime, anywhere, with
        family, friends, or colleagues. With thousands of words and questions across a growing library of games,
        you&apos;ll never run dry. Some games call for pens and paper or erasable boards; others need nothing at all —
        just people ready to play.
      </p>
    </main>
    <Footer />
  </>;
}
