import csv from "csvtojson";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const questions = await csv().fromFile("src/data/herd-mentality/questions.csv");
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  return Response.json({ data: question });
}
