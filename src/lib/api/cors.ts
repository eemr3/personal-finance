const allowedOrigins = ['https://seuapp.vercel.app', 'capacitor://localhost'];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';

  const isLocalhost =
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1');

  const allowed = allowedOrigins.includes(origin) || isLocalhost;

  return {
    'Access-Control-Allow-Origin': allowed
      ? origin
      : 'https://seuapp.vercel.app',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export function corsOptionsResponse(req: Request) {
  return new Response(null, {
    headers: getCorsHeaders(req),
  });
}
