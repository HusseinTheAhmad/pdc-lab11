// Where this file is located at app/api/suggest/route.js
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || ''; 
  
    console.log(`Received query: ${query}`);  // Logging the received query
  
    // Splitting the query into prefix and value
    const [prefix, value] = query.split(":", 2);
    
    // If no prefix is provided, returning an empty response
    if (!prefix) {
      console.error('No prefix detected in query');
      return Response.json([]);
    }
  
    // Logging the detected prefix and value for debugging
    console.log(`Detected prefix: ${prefix}`);
    console.log(`Detected value: ${value}`);
  
    // Building the Solr query URL
    const solrURL = `http://localhost:8983/solr/jcgArticles/select?indent=true&q.op=OR&q=${prefix}:%22${encodeURIComponent(value)}*%22&facet=true&facet.field=${prefix}&rows=0`;
  
    try {
      // Fetching from Solr
      const res = await fetch(solrURL);
      const data = await res.json();
  
      // Checking if Solr returned facet data
      if (!data.facet_counts || !data.facet_counts.facet_fields[prefix]) {
        console.error(`No facet data found for prefix: ${prefix}`);
        return Response.json([]);  // Returning empty if no facet data
      }
  
      const suggestions = data.facet_counts.facet_fields[prefix] || [];
      console.log(`Suggestions: ${suggestions}`);
  
      return Response.json(suggestions.slice(0, 10)); // return top 10 suggestions
    } 
    
    catch (err) {
      // Logging the error message
      console.error('Error during Solr fetch:', err.message);
      return Response.json({ error: err.message }, { status: 500 });
    }
  }
  