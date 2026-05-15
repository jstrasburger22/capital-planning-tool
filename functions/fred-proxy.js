export async function onRequest(context) {
  const url = new URL(context.request.url);
  const seriesId = url.searchParams.get('id');

  if (!seriesId || !/^[A-Z0-9]+$/i.test(seriesId)) {
    return new Response('Invalid series id', { status: 400 });
  }

  const fredUrl = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;

  try {
    const fredResponse = await fetch(fredUrl, {
      headers: { 'User-Agent': 'CapitalPlanning-RegimeMonitor/1.0' }
    });

    if (!fredResponse.ok) {
      return new Response(`FRED returned ${fredResponse.status}`, { status: 502 });
    }

    const csv = await fredResponse.text();

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    return new Response(`Proxy error: ${err.message}`, { status: 500 });
  }
}
