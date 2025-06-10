/////////////////////////////// GET ///////////////////////////////

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "No ID provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(`https://jumboboxd.soylemez.net/api/movie?id=${id}`);
  const movie = await res.json();

  return new Response(JSON.stringify(movie), {
    headers: { "Content-Type": "application/json" },
  });
}