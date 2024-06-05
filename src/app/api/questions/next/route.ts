import csv from "csvtojson";
import { revalidateTag, unstable_noStore } from "next/cache";
import { cookies, headers } from "next/headers";

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

// export const revalidate = 1;
// export const fetchCache = "default-no-store";
// 'auto' | 'default-cache' | 'only-cache'
// 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'

export async function GET() {
  cookies();
  unstable_noStore();
  const randomIndex = Math.floor(Math.random() * questions.length);
  const data = questions[randomIndex];
  revalidateTag("next");
  return Response.json({ data });
}
