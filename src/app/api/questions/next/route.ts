import csv from "csvtojson";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // const { ip, limit } = await rateLimitMiddleware(request);
  // if (limit) {
  //   return Response.json(
  //     { error: `Rate limit exceeded for IP ${ip}. Please try again later.` },
  //     {
  //       status: 429,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }
  //   );
  // }
  const questions = await csv().fromFile("src/data/questions.csv");
  const randomIndex = Math.floor(Math.random() * questions.length);
  const data = questions[randomIndex];
  return Response.json(data);
}
