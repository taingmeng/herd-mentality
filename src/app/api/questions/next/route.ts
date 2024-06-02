import csv from "csvtojson";

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
export const fetchCache = "force-no-store";
// 'auto' | 'default-cache' | 'only-cache'
// 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export async function GET(request: Request) {
  const randomIndex = Math.floor(Math.random() * questions.length);
  const data = questions[randomIndex];
  return Response.json({ data });
}
