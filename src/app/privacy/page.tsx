


import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMarkdownContent } from "../utils/MarkdownUtil";

export default async function Privacy() {
  const { content } = await getMarkdownContent("src/data/privacy.md");
  return <>
    <Navbar />
    <div className="markdown m-4 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
