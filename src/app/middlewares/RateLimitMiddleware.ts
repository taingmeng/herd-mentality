const rateLimitMap = new Map();

export default function rateLimitMiddleware(req: Request) {
  const ip = (req.headers?.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]; //ignore
  const limit = 5; // Limiting requests to 10 per 10 seconds per IP
  const windowMs = 5 * 1000; // 1 minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    });
  }

  const ipData = rateLimitMap.get(ip);

  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0;
    ipData.lastReset = Date.now();
  }

  if (ipData.count >= limit) {
    return { ip, limit: true };
  }

  ipData.count += 1;
  return {ip, limit: false };
}
