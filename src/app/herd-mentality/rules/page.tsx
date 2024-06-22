import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getMarkdownContent } from "../../utils/MarkdownUtil";

const NAV_MENU = [
  {
    name: "Back to Game",
    icon: "/arrow-circle-left.svg",
    href: "/herd-mentality",
  },
];

export default async function Rules() {
  const { content } = await getMarkdownContent("src/data/herd-mentality/rules.md");
  return <>
    <Navbar title="Herd Mentality" menus={NAV_MENU} />
    <div className="markdown m-4 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
