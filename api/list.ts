export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const page = searchParams.get("page");

  if (!page) {
    return new Response(JSON.stringify({ error: "No page provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch(`https://jumboboxd.soylemez.net/api/list?page=${page}`);
  const movies = await res.json();

  return new Response(JSON.stringify(movies), {
    headers: { "Content-Type": "application/json" },
  });
}