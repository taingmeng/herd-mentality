import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

interface MarkdownContent {
  content: string;
  data: {
    [key: string]: any;
  };
}

export async function getMarkdownContentReact(
  fileContents: string
): Promise<MarkdownContent> {

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const content = processedContent.toString()
    .replace(/<ol>/g, '<ol style="list-style-type: decimal;">') // Ensure ordered lists have decimal style
    .replace(/<ul>/g, '<ul style="list-style-type: disc;">') // Ensure unordered lists have disc style
    .replace(/<li>/g, '<li>'); // Ensure list items have bottom margin

  // Combine the data with the id and contentHtml
  return {
    content,
    data: matterResult.data,
  };
}
