
// where path of this file should be: app/api/search/route.js
// So you will need to create an 'api' folder in 'app' if it does not exist, and then put this file inside that
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "*:*";       // falling back to all

  // So that results are also filtered ALPHABETICALLY by author, we add &sort=author___str asc
  const solrURL = `http://localhost:8983/solr/jcgArticles/select?indent=true&q.op=OR&q=${encodeURIComponent(query)}&sort=author___str asc`;

  try {
    const res = await fetch(solrURL);
    const data = await res.json();
    return Response.json(data.response.docs);
  }
  
  catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}