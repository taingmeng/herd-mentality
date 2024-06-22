import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getMarkdownContent } from "../utils/MarkdownUtil";

export default async function Terms() {
  const { content } = await getMarkdownContent("src/data/terms.md");
  return <>
    <Navbar />
    <div className="markdown m-4 lg:mx-64">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
    <Footer />
  </>;
}
