import path from "path";
import csv from "csvtojson";
import Navbar from "@/app/components/Navbar";
import FakeArtistLocalMain from "@/app/fake-artist/local/FakeArtistLocalMain";

interface Question {
  category: string;
  word: string;
}

export const dynamic = "force-dynamic";

export default async function FakeArtistLocal() {
  const NAV_MENU = [
    {
      name: "Rules",
      icon: "/book.svg",
      href: "/fake-artist/fake-artist-rules.pdf",
      target: "_blank",
    },
  ];

  const questionPath = path.join(
    process.cwd(),
    "src/data/fake-artist/questions.csv"
  );
  const questions: Question[] = await csv().fromFile(questionPath);
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];

  return (
    <>
      <Navbar title="A Fake Artist Goes to New York" menus={NAV_MENU} />
      <main className="flex flex-col min-h-[75vh] items-center justify-center px-4">
        <FakeArtistLocalMain question={question} />
      </main>
    </>
  );
}
