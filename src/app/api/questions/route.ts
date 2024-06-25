import csv from "csvtojson";

interface Question {
  category: string;
  question: string;
  options: string[] | undefined;
}

export async function GET() {
  const data: Question[] = await csv().fromFile("src/data/herd-mentality/questions.csv");
  return Response.json({ data });
}
