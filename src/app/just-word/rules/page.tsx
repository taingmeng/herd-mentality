import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getMarkdownContent } from "../../utils/MarkdownUtil";

const NAV_MENU = [
  {
    name: "Back to Game",
    icon: "/arrow-circle-left.svg",
    href: "/just-one",
  },
];

export default async function Rules() {
  const { content } = await getMarkdownContent("src/data/just-one/rules.md");
  return <>
    <Navbar title="Just Word Rules" menus={NAV_MENU} />
    <div className="markdown m-4 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
