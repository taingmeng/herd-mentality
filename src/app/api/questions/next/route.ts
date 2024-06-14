import csv from "csvtojson";
import { headers } from "next/headers";

interface Question {
  category: string;
  question: string;
  options: string[] | undefined;
}

let questions: Question[] = [];

csv()
  .fromFile("src/data/questions.csv")
  .then((jsonObj) => {
    questions = jsonObj;
  });

export const dynamic = "force-dynamic";
export const revalidate = 1;
export const fetchCache = "default-no-store";

export async function GET(request: Request) {
  const headersList = headers();
  const referer = headersList.get("referer");
  const randomIndex = Math.floor(Math.random() * questions.length);
  const data = questions[randomIndex];
  return new Response(data.question, {
    status: 200,
    headers: { referer: referer || "none" },
  })
}
