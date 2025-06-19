import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getMarkdownContent } from "../../utils/MarkdownUtil";

const NAV_MENU = [
  {
    name: "Back to Game",
    icon: "/arrow-circle-left.svg",
    href: "/herd-party",
  },
];

export default async function Rules() {
  const { content } = await getMarkdownContent("src/data/herd-mentality/rules.md");
  return <>
    <Navbar title="Herd Party Rules" menus={NAV_MENU} />
    <div className="markdown pt-32 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
