import path from "path";
import fs from "fs";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

interface MarkdownContent {
  content: string;
  data: {
    [key: string]: any;
  };
}

export async function getMarkdownContent(
  filePath: string
): Promise<MarkdownContent> {
  const abosolutPath = path.join(process.cwd(), filePath);
  const fileContents = fs.readFileSync(abosolutPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const content = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    content,
    data: matterResult.data,
  };
}
