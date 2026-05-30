import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getMarkdownContent } from "../../utils/MarkdownUtil";

const NAV_MENU = [
  {
    name: "Back to Game",
    icon: "/icons/arrow-circle-left.svg",
    href: "/dice-pool-partyz",
  },
];

export default async function Rules() {
  const { content } = await getMarkdownContent("public/dice-pool-partyz/rules.md");
  return <>
    <Navbar title="Dice Pool Partyz Rules" menus={NAV_MENU} />
    <div className="markdown pt-32 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
