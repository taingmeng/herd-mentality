import csv from "csvtojson";

interface Question {
  category: string;
  question: string;
  options: string[] | undefined;
}

export async function GET(request: Request) {
  const data: Question[] = await csv().fromFile("src/data/questions.csv");
  return Response.json({ data });
}
