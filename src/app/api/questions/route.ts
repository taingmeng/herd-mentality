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
export async function GET() {
  const data = questions;
  return Response.json({ data });
}
